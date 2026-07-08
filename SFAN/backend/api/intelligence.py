from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import query_vectors, query_vectors_multi_namespace
from backend.services.embedding_service import get_embedding, get_embedding_uncached
from backend.services.groq_service import analyze_policy, analyze_vision
import json
import logging
import re
from sqlalchemy.orm import Session
from backend.database.config import SessionLocal
from backend.models.document import Namespace

logger = logging.getLogger(__name__)

def increment_namespace_usage(namespaces: list[str]):
    try:
        db = SessionLocal()
        for ns in namespaces:
            ns_obj = db.query(Namespace).filter(Namespace.name == ns).first()
            if ns_obj:
                ns_obj.usage_count = (ns_obj.usage_count or 0) + 1
        db.commit()
    except Exception as e:
        logger.error(f"Failed to increment namespace usage: {e}")
    finally:
        db.close()

def extract_json(text: str) -> dict:
    if "Insufficient evidence" in text or "Information not found" in text:
        raise ValueError("Information not found in the provided policy documents.")
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        clean = match.group(0)
    else:
        clean = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

def sanitize_response(data):
    if isinstance(data, dict):
        return {k: sanitize_response(v) for k, v in data.items() if not is_invalid_value(v)}
    elif isinstance(data, list):
        return [sanitize_response(v) for v in data if not is_invalid_value(v)]
    return data

def is_invalid_value(val):
    if val is None:
        return True
    if isinstance(val, str):
        v = val.strip().lower()
        if v in ["unknown", "null", "undefined", "n/a", "placeholder", "dummy"]:
            return True
        if "placeholder" in v or "dummy" in v:
            return True
    return False


router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

class UserProfile(BaseModel):
    age: int | None = None
    family_size: int | None = None
    budget: float | None = None
    insurance_type: str | None = None
    coverage_preferences: str | None = None

class RecommendationRequest(BaseModel):
    namespaces: list[str]
    user_profile: UserProfile | None = None

class QueryRequest(BaseModel):
    query: str
    namespace: str = ""  # Making it optional/default empty since router overrides it

def get_context_from_pinecone(query: str, namespace: str, top_k: int = 5) -> str:
    # Track usage
    increment_namespace_usage([namespace])
    
    # 1. Embed query
    query_vec = get_embedding(query)
    
    # 2. Query pinecone
    results = query_vectors(query_vec, namespace, top_k=top_k)
    
    # 3. Extract text from metadata
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
                
    return "\n\n---\n\n".join(contexts)

def get_multi_context_from_pinecone(query: str, namespaces: list[str], top_k: int = 5) -> str:
    # Track usage
    increment_namespace_usage(namespaces)
    
    query_vec = get_embedding(query)
    results = query_vectors_multi_namespace(query_vec, namespaces, top_k_per_namespace=top_k)
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
    return "\n\n---\n\n".join(contexts)

class ClaimScenarioRequest(BaseModel):
    policy_type: str
    claim_type: str
    insurance_provider: str
    claim_amount: str | None = None
    claim_scenario: str

@router.post("/claim-outcome")
def evaluate_claim_outcome(req: ClaimScenarioRequest, current_user = Depends(get_current_active_user)):
    try:
        logger.info("Request received for evaluate_claim_outcome")
        query_str = f"Coverage conditions, exclusions, claim requirements. Scenario: {req.claim_scenario}. Provider: {req.insurance_provider}. Claim Type: {req.claim_type}. Amount: {req.claim_amount}."
        
        namespace = req.policy_type if req.policy_type else "regulatory_governance"
        
        logger.info(f"Querying Pinecone for namespace: {namespace} with top_k=10")
        context = get_context_from_pinecone(query_str, namespace, top_k=10)
        logger.info("Pinecone documents retrieved successfully for claim outcome.")
    except Exception as e:
        logger.error(f"Failed to retrieve context from Pinecone/HuggingFace: {e}")
        return {"error": f"Failed to retrieve policy documents (Network or API Error): {e}"}
        
    prompt = f"""
    You are an expert Insurance Policy Claim Analyzer.
    
    CRITICAL RULE:
    - ONLY use the retrieved policy evidence in the context below.
    - NEVER generate placeholder text, generic insurance responses, or dummy data.
    - NEVER assume the policy is active, the premium is paid, or that the claim is approved without explicit evidence.
    - If Pinecone returns no evidence or evidence is completely unrelated to the claim, output default "Insufficient policy evidence found" structures.
    
    User Inputs:
    - Policy Type: {req.policy_type}
    - Claim Type: {req.claim_type}
    - Insurance Provider: {req.insurance_provider}
    - Claim Amount: {req.claim_amount}
    - Claim Scenario: {req.claim_scenario}
    
    Return EXACTLY a raw JSON object (NO Markdown, NO code blocks) matching this precise schema:
    
    {{
      "card1_eligibility": {{
        "overall_assessment": "Summary of eligibility based on evidence, or 'No matching policy evidence found.'",
        "approval_probability": "Score out of 100 as an integer, or 0",
        "confidence_score": "Score out of 100 as an integer, or 0",
        "recommendation": "Concise AI recommendation, or 'Insufficient evidence.'"
      }},
      "card2_evidence": {{
        "coverage_sections": ["Section 1", "Section 2"],
        "supporting_evidence": "Explanation of how the scenario matches the evidence.",
        "exact_clauses": ["Clause 4.1.a text", "Clause 4.2 text"]
      }},
      "card3_risks": {{
        "exclusions": ["Exclusion 1", "Exclusion 2"],
        "limitations": ["Limitation 1"],
        "waiting_periods": ["Waiting period details"],
        "missing_documents": ["List of missing documents"]
      }},
      "card4_actions": {{
        "required_documents": ["Doc 1", "Doc 2"],
        "claim_filing_steps": ["Step 1", "Step 2"],
        "strategic_actions": ["Strategic advice 1"]
      }}
    }}
    
    Context:
    {context}
    """
    
    logger.info("Calling Groq LLM for claim outcome analysis...")
    response = analyze_policy(prompt, context, model="llama-3.1-8b-instant")
    logger.info("Analysis generated successfully")
    try:
        return extract_json(response)
    except Exception as e:
        logger.error(f"Claim Outcome JSON parse error: {e}")
        # Return strict fallback matching the schema
        return {
            "card1_eligibility": {
                "overall_assessment": "Information Not Available",
                "approval_probability": 0,
                "confidence_score": 0,
                "recommendation": "Insufficient policy evidence found."
            },
            "card2_evidence": {
                "coverage_sections": [],
                "supporting_evidence": "Insufficient policy evidence found.",
                "exact_clauses": []
            },
            "card3_risks": {
                "exclusions": [],
                "limitations": [],
                "waiting_periods": [],
                "missing_documents": []
            },
            "card4_actions": {
                "required_documents": [],
                "claim_filing_steps": [],
                "strategic_actions": []
            }
        }


class CareEligibilityRequest(BaseModel):
    bank_name: str
    insurance_type: str
    namespace: str
    patient_profile: str
    condition: str
    severity: str
    condition_type: str
    treatment_type: str
    admission_type: str
    department: str
    sum_insured: str
    policy_type: str
    policy_age: str

@router.post("/care-eligibility")
def evaluate_care_eligibility(req: CareEligibilityRequest, current_user = Depends(get_current_active_user)):
    try:
        logger.info("Request received for evaluate_care_eligibility")
        # Build retrieval query using all user inputs
        query_str = f"Bank: {req.bank_name}, {req.patient_profile}, {req.condition} treatment, {req.department}, {req.admission_type} admission, {req.insurance_type}, {req.policy_age} policy duration"
        # Query Pinecone, top_k=1
        logger.info("Generating embedding / Querying Pinecone for care eligibility...")
        context = get_context_from_pinecone(query_str, req.namespace, top_k=1)
        logger.info("Pinecone documents retrieved successfully for care eligibility.")
    except Exception as e:
        logger.error(f"Failed to retrieve context for Care Eligibility: {e}")
        return {"error": f"Failed to retrieve policy documents: {e}"}

    if not context.strip():
        return {
            "patient_information": {
                "age_and_gender": req.patient_profile,
                "medical_condition": req.condition,
                "treatment_type": req.treatment_type,
                "selected_policy": req.namespace,
                "insurance_provider": req.bank_name,
                "sum_insured": req.sum_insured
            },
            "eligibility_decision": {
                "status": "Requires Review",
                "confidence_level": "Low Confidence",
                "ai_summary": "No relevant policy clauses were found in the vector database."
            },
            "coverage_analysis": {
                "covered_benefits": "Coverage information unavailable.",
                "hospitalization_coverage": "Coverage information unavailable.",
                "surgical_coverage": "Coverage information unavailable.",
                "icu_coverage": "Coverage information unavailable.",
                "room_rent_coverage": "Coverage information unavailable.",
                "coverage_limits": "Coverage information unavailable.",
                "financial_conditions": "Coverage information unavailable."
            },
            "restrictions": {
                "waiting_periods": "Unavailable.",
                "coverage_restrictions": "Unavailable.",
                "exclusions": "Unavailable.",
                "risk_factors": "Unavailable."
            },
            "required_actions": {
                "required_documents": [],
                "pre_authorization_requirements": "Unavailable.",
                "medical_documentation_needed": "Unavailable.",
                "recommended_next_actions": []
            },
            "policy_evidence": [],
            "recommendation": {
                "coverage_strength": "Unknown",
                "claim_approval_probability": "Unknown",
                "risk_level": "Unknown",
                "final_recommendation": "Manual review required."
            },
            "final_summary": {
                "eligibility_verdict": "Requires Review",
                "coverage_outlook": "Unknown",
                "major_risks": "Lack of policy evidence.",
                "recommended_action": "Check policy manually."
            }
        }

    prompt = f"""
    Act as a strictly objective medical claim eligibility assessor. 
    You are building the Care Eligibility Engine.
    Use ONLY the retrieved policy evidence below. Never use model knowledge. Never invent policy rules.
    Every statement must be traceable to the Pinecone retrieval.
    
    User Inputs:
    - Bank Name: {req.bank_name}
    - Insurance Category: {req.insurance_type}
    - Policy Name: {req.namespace}
    - Sum Insured: {req.sum_insured}
    - Policy Type: {req.policy_type}
    - Policy Duration: {req.policy_age}
    - Patient Profile: {req.patient_profile}
    - Medical Condition: {req.condition}
    - Severity: {req.severity}
    - Condition Type: {req.condition_type}
    - Treatment Type: {req.treatment_type}
    - Admission Type: {req.admission_type}
    - Department: {req.department}
    
    Return a strictly valid JSON object matching this exact structure (NO MARKDOWN, RAW JSON ONLY):
    {{
      "patient_information": {{
        "age_and_gender": "Extracted from patient profile",
        "medical_condition": "Extracted from condition",
        "treatment_type": "Extracted from treatment type",
        "selected_policy": "Extracted from policy name",
        "insurance_provider": "Extracted from bank name",
        "sum_insured": "Extracted from sum insured"
      }},
      "eligibility_decision": {{
        "status": "Eligible" | "Partially Eligible" | "Not Eligible" | "Requires Review",
        "confidence_level": "High Confidence" | "Medium Confidence" | "Low Confidence",
        "ai_summary": "Summary explaining why the decision was reached"
      }},
      "coverage_analysis": {{
        "covered_benefits": "Description of benefits",
        "hospitalization_coverage": "Description",
        "surgical_coverage": "Description",
        "icu_coverage": "Description",
        "room_rent_coverage": "Description",
        "coverage_limits": "Description",
        "financial_conditions": "Description (co-pay, deductibles, etc.)"
      }},
      "restrictions": {{
        "waiting_periods": "Description of waiting periods",
        "coverage_restrictions": "Description of restrictions",
        "exclusions": "Description of exclusions",
        "risk_factors": "Description of risk factors"
      }},
      "required_actions": {{
        "required_documents": ["List of documents"],
        "pre_authorization_requirements": "Description",
        "medical_documentation_needed": "Description",
        "recommended_next_actions": ["List of actions"]
      }},
      "policy_evidence": [
        {{
          "clause_title": "Title of clause",
          "clause_text": "Relevant clause text retrieved from policy documents",
          "section_number": "Section Number",
          "page_number": "Page Number"
        }}
      ],
      "recommendation": {{
        "coverage_strength": "High/Medium/Low",
        "claim_approval_probability": "High/Medium/Low",
        "risk_level": "High/Medium/Low",
        "final_recommendation": "Detailed professional recommendation"
      }},
      "final_summary": {{
        "eligibility_verdict": "Verdict",
        "coverage_outlook": "Outlook",
        "major_risks": "Risks",
        "recommended_action": "Action"
      }}
    }}
    
    Context:
    {context}
    """

    logger.info("Calling Groq LLM for care eligibility analysis...")
    response = analyze_policy(prompt, context, model="llama-3.1-8b-instant")
    logger.info("Analysis generated successfully")
    try:
        return extract_json(response)
    except Exception as e:
        logger.error(f"Care Eligibility JSON parse error: {e}")
        return {"error": "Failed to generate structured analysis.", "raw": response}


class CoverageLifeRequest(BaseModel):
    namespaces: list[str]

@router.post("/coverage-life")
def track_coverage_life(req: CoverageLifeRequest, current_user = Depends(get_current_active_user)):
    if not req.namespaces:
        return {"error": "Please select a policy to track."}
        
    namespace = req.namespaces[0]
    context = get_context_from_pinecone("Policy Overview, Coverage Limits, Waiting Periods, Exclusions, Deductibles, Pre-authorization Rules, Renewal Terms", namespace)
    
    prompt = f"""
    Act as an expert AI Policy Intelligence Engine. Analyze the following insurance policy context and extract deep structural intelligence to populate a Coverage Life Tracker.
    
    Return a strictly valid JSON object matching the exact structure below. Do not use markdown blocks, just raw JSON.
    
    {{
      "policy_name": "Name of Policy",
      "policy_type": "e.g., Family Floater Health",
      "status": "Active",
      "insurer": "Name of Insurer",
      "base_coverage": "e.g., ₹10L Base",
      "members_covered": ["Self (34)", "Spouse (32)"],
      "coverage_integrity": [
        {{"type": "missing", "label": "Missing Coverage", "value": "e.g., No Maternity Cover"}},
        {{"type": "warning", "label": "Underinsured Warning", "value": "e.g., ₹10L inadequate for tier-1"}},
        {{"type": "success", "label": "Missing Riders", "value": "e.g., Consumables rider present"}}
      ],
      "protection_score": {{
        "overall": 72,
        "label": "Strong",
        "financial": 90,
        "coverage": 60,
        "family": 85
      }},
      "renewal_risk": {{
        "expiry_date": "14 Aug 2026",
        "days_remaining": 18,
        "urgency_status": "Action Required: High Urgency",
        "message": "Portability window closes in 3 days."
      }},
      "claim_execution": {{
        "ease_score": 8.5,
        "cashless": "Available",
        "complexity": "Moderate",
        "preauth_rule": "48 Hrs Notice",
        "doc_readiness": "100% Ready"
      }},
      "hidden_risks": [
        {{"title": "10% Co-pay", "description": "Applies to all claims due to entry age > 60."}}
      ],
      "ai_recommendations": [
        {{"type": "info", "title": "Increase base coverage", "description": "Boost sum insured to combat inflation."}},
        {{"type": "fix", "title": "Fix missing nominee DOB", "description": "Update missing nominee Date of Birth."}}
      ]
    }}
    
    Context:
    {context}
    """
    
    response = analyze_policy(prompt, context)
    try:
        return extract_json(response)
    except ValueError as ve:
        return {"error": str(ve), "raw": response}
    except Exception as e:
        logger.error(f"Coverage Life JSON parse error: {e}")
        return {"error": "Failed to generate structured coverage life analysis.", "raw": response}

class PremiumBenefitRequest(BaseModel):
    annual_premium: float
    years: int
    namespace: str

@router.post("/premium-benefit")
def calculate_premium_benefit(req: PremiumBenefitRequest, current_user = Depends(get_current_active_user)):
    context = get_context_from_pinecone("Maximum Lifetime Benefit, Sub-limits, Room Rent Caps, Sum Insured", req.namespace)
    
    total_premium = req.annual_premium * req.years
    
    prompt = f"""
    Analyze the financial value of the policy. The user has paid or will pay {total_premium} over {req.years} years.
    Based on the context, what is the maximum coverage or lifetime benefit they can extract? 
    Compare the total premiums paid against the real-world value of the coverage, taking into account any sub-limits or caps mentioned in the context.
    Return an analytical summary.
    """
    
    response = analyze_policy(prompt, context)
    return {
        "total_premium": total_premium,
        "analysis": response
    }

@router.post("/simplify")
def simplify_clause(req: QueryRequest, current_user = Depends(get_current_active_user)):
    context = get_context_from_pinecone(req.query, req.namespace)
    
    prompt = f"""
    Simplify the following insurance clause using the provided policy context if helpful. 
    Output valid JSON with the following keys:
    "original_clause", "simplified_meaning", "real_world_interpretation", "impact_on_customer", "risk_level".
    Risk level must be one of: Low, Medium, High, Critical.
    
    Clause: {req.query}
    """
    response = analyze_policy(prompt, context)
    try:
        return extract_json(response)
    except ValueError as ve:
        return {"error": str(ve), "raw": response}
    except Exception:
        return {"error": "Failed to parse JSON response", "raw": response}

@router.post("/risk-detector")
def risk_detector(req: QueryRequest, current_user = Depends(get_current_active_user)):
    context = get_context_from_pinecone("Find Coverage Gaps, Coverage Weaknesses, Missing Riders, Policy Limitations, Medical Inflation Risk, Future Coverage Deficiency", req.namespace)
    
    prompt = "Analyze the policy for hidden Coverage Gaps, Coverage Weaknesses, Missing Riders, Policy Limitations, Medical Inflation Risk, and Future Coverage Deficiency. Provide a severity rating (Low, Medium, High, Critical) and explanations."
    
    response = analyze_policy(prompt, context)
    return {"analysis": response}


@router.post("/recommendation")
def generate_recommendation(req: RecommendationRequest, current_user = Depends(get_current_active_user)):
    if not req.namespaces or len(req.namespaces) < 2:
        return {"error": "Please select at least two policies to compare."}

    contexts = []
    # Extract context focusing on coverage, benefits, limitations, and value for each policy
    for ns in req.namespaces:
        ctx = get_context_from_pinecone("Coverage Benefits, Waiting Periods, Exclusions, Sub-limits, Claim Limits, Special Conditions, Premiums, Suitability", ns)
        contexts.append(f"--- Policy: {ns} ---\n{ctx}")

    combined_context = "\n\n".join(contexts)

    user_profile_str = ""
    if req.user_profile:
        up = req.user_profile
        user_profile_str = f"""
        User Profile:
        - Age: {up.age if up.age else 'Not specified'}
        - Family Size: {up.family_size if up.family_size else 'Not specified'}
        - Budget: {up.budget if up.budget else 'Not specified'}
        - Insurance Type: {up.insurance_type if up.insurance_type else 'Not specified'}
        - Coverage Preferences: {up.coverage_preferences if up.coverage_preferences else 'Not specified'}
        """

    prompt = f"""
    Act as an expert AI Policy Intelligence Engine. Compare the following insurance policies and generate a detailed recommendation based on their strengths, weaknesses, and suitability for the user (if a profile is provided).
    
    {user_profile_str}

    Return a strictly valid JSON object matching the exact structure below. Do not use markdown blocks, just raw JSON.

    {{
      "best_policy_match": {{
        "policy_name": "Name of the best policy",
        "reason": "1-2 sentence explanation of why it is the best match overall."
      }},
      "coverage_advantage_matrix": [
        {{
          "category": "e.g., Room Rent Limit, Maternity, Outpatient (OPD)",
          "policy_1_name": "Policy 1 Value/Status",
          "policy_2_name": "Policy 2 Value/Status",
          "winner": "Name of winning policy or 'Tie'"
        }}
      ],
      "value_efficiency_score": [
        {{
          "policy_name": "Policy 1",
          "score": "8.5/10",
          "explanation": "Brief explanation of value vs cost"
        }},
        {{
          "policy_name": "Policy 2",
          "score": "7.0/10",
          "explanation": "Brief explanation of value vs cost"
        }}
      ],
      "policy_limitation_insights": [
        {{
          "policy_name": "Policy 1",
          "limitations": ["2 year waiting period for pre-existing diseases", "No maternity coverage"]
        }},
        {{
          "policy_name": "Policy 2",
          "limitations": ["10% co-pay on all claims", "Room rent capped at 1% of Sum Insured"]
        }}
      ],
      "user_suitability_analysis": [
        {{
          "policy_name": "Policy 1",
          "alignment": "High",
          "reason": "Perfectly aligns with requested maternity benefits."
        }},
        {{
          "policy_name": "Policy 2",
          "alignment": "Medium",
          "reason": "Good coverage but exceeds stated budget."
        }}
      ],
      "ai_recommendation_summary": "Overall summary text explaining the final AI verdict on which policy to choose and why."
    }}

    Contexts:
    {combined_context}
    """

    logger.info("Calling Groq LLM for recommendation analysis...")
    response = analyze_policy(prompt, combined_context, model="llama-3.1-8b-instant")
    logger.info("Analysis generated successfully")
    try:
        return extract_json(response)
    except ValueError as ve:
        return {"error": str(ve), "raw": response}
    except Exception as e:
        logger.error(f"Recommendation Engine JSON parse error: {e}")
        return {"error": "Failed to generate structured recommendation analysis.", "raw": response}


@router.post("/scam-detector")
def scam_detector(req: QueryRequest, current_user = Depends(get_current_active_user)):
    context = get_context_from_pinecone("Mis-selling indicators, Hidden exclusions, Unrealistic promises, Agent red flags, suspicious terms", req.namespace)
    prompt = "Detect Mis-selling indicators, Hidden exclusions, Unrealistic promises, Policy mismatch risks, and Agent red flags in the context provided. Do not hallucinate."
    response = analyze_policy(prompt, context)
    return {"scam_analysis": response}


@router.post("/chat")
def chat_assistant(req: QueryRequest, current_user = Depends(get_current_active_user)):
    # 1. Intent Classification & Domain Detection
    routing_prompt = f"""
    Analyze the following user query to determine the intent and the relevant insurance domains (namespaces).
    
    Modules/Intents:
    - "claim_outcome": ONLY if the user is asking whether a specific hypothetical claim will be approved/rejected.
    - "simplify_clause": ONLY if the user provides a complex clause and asks you to simplify or explain it.
    - "risk_detector": ONLY if the user asks to scan a policy for hidden risks or coverage gaps.
    - "scam_detector": ONLY if the user asks about mis-selling or red flags.
    - "chat": Default intent. Use this for general insurance doubts, what to check before buying, terminology, or general policy explanations.
    
    Namespaces: "regulatory_governance", "vehicle_policy", "health_policy", "home_folder", "banking_governance", "travel_policy", "life_wealth_policy".
    
    Return a JSON object: {{"intent": "module_name_or_chat", "namespaces": ["ns1", "ns2"], "confidence": 0.95}}
    
    Query: "{req.query}"
    """
    
    router_response = analyze_policy(routing_prompt, "You are a routing classification engine. Only return valid JSON.")
    
    try:
        classification = extract_json(router_response)
    except Exception as e:
        logger.error(f"Router failed to parse JSON: {e}")
        classification = {"intent": "chat", "namespaces": ["home_folder"], "confidence": 0.5}

    intent = classification.get("intent", "chat")
    
    # 2. Module-Aware Routing
    if intent != "chat":
        module_mapping = {
            "claim_outcome": "Claim Outcome Analyzer",
            "simplify_clause": "Policy Simplifier",
            "risk_detector": "Risk Detector",
            "scam_detector": "Scam Detector"
        }
        module_name = module_mapping.get(intent, "a specialized module")
        return {
            "action": "redirect",
            "module": module_name,
            "message": f"Your request is best handled by the {module_name} module.",
            "intent": intent
        }
        
    # 3. Multi-Domain Hybrid Retrieval
    namespaces = classification.get("namespaces", [])
    if not namespaces:
        namespaces = ["home_folder"]
        
    query_vec = get_embedding(req.query)
    results = query_vectors_multi_namespace(query_vec, namespaces, top_k_per_namespace=10)
    
    contexts = []
    source_namespaces = set()
    
    if results and "matches" in results:
        # Take top 2 to avoid Groq free tier 6000 TPM token limits
        top_matches = results["matches"][:2]
        for match in top_matches:
            if "metadata" in match and "text" in match["metadata"]:
                ns = match.get("namespace", "Unknown")
                source_namespaces.add(ns)
                contexts.append(f"[Source: {ns}]\n{match['metadata']['text']}")
                
    if not contexts:
        return {
            "reply": "No relevant information was found in the SFAN knowledge repository.",
            "section": "None",
            "confidence": 0.0,
            "namespace": "None"
        }
        
    combined_context = "\n\n---\n\n".join(contexts)
    
    # 4. Final Answer Generation
    generation_prompt = f"""
    You are the SFAN Insurance Domain Expert. Answer the user's question ONLY based on the provided policy context.
    If the answer is not in the context, explicitly say "No relevant information was found in the SFAN knowledge repository." Do not hallucinate.
    
    Return a JSON object with the following structure:
    {{
        "answer": "Your detailed answer",
        "relevant_policy_section": "Quote or summarize the exact section name/number used",
        "confidence_score": 0.95,
        "source_namespace": "The namespace from the context used",
        "recommended_module": "Name of an SFAN module to recommend if they want deeper analysis, or null"
    }}
    
    User Question: {req.query}
    """
    
    final_res = analyze_policy(generation_prompt, combined_context)
    try:
        data = extract_json(final_res)
        return {
            "reply": data.get("answer", ""),
            "section": data.get("relevant_policy_section", "None"),
            "confidence": data.get("confidence_score", classification.get("confidence", 0.0)),
            "namespace": data.get("source_namespace", ", ".join(source_namespaces)),
            "recommended_module": data.get("recommended_module", None)
        }
    except Exception as e:
        logger.error(f"Failed to parse generation JSON: {e}")
        return {
            "reply": final_res,
            "section": "Unknown",
            "confidence": classification.get("confidence", 0.0),
            "namespace": ", ".join(source_namespaces)
        }

class AssetCoverageRequest(BaseModel):
    bank: str
    policy: str
    notes: str
    image: str | None = None

@router.post("/asset-coverage")
def evaluate_asset_coverage(req: AssetCoverageRequest, current_user = Depends(get_current_active_user)):
    try:
        # Extract metadata from image if available
        image_metadata = "No image provided"
        if req.image:
            try:
                img_prompt = "Identify the asset in this image. Describe the asset type, apparent condition, and any noticeable damage or key features (e.g., brand, model, construction material)."
                image_metadata = analyze_vision(img_prompt, req.image)
            except Exception as e:
                logger.error(f"Vision API failed: {e}")
                image_metadata = "Image analysis failed."
                
        # Build retrieval query using all user inputs
        query_str = f"Asset Coverage rules, exclusions, Bank: {req.bank}, details: {req.notes}, Image Details: {image_metadata}"
        # Query Pinecone
        context = get_context_from_pinecone(query_str, req.policy, top_k=1)
    except Exception as e:
        logger.error(f"Failed to retrieve context for Asset Coverage: {e}")
        return {"error": f"Failed to retrieve policy documents: {e}"}
        
    prompt = f"""
    Act as an AI Asset Coverage Advisor evaluating the insurance eligibility of a described asset.
    Use ONLY the retrieved policy evidence below. Never use model knowledge.
    
    User Inputs:
    - Bank Name: {req.bank}
    - Notes: {req.notes}
    - AI Image Analysis: {image_metadata}
    
    Determine the coverage applicability and return EXACTLY a JSON string with NO markdown formatting, strictly matching this schema:
    {{
        "assetType": "String (e.g., Commercial Building, Private Car, etc.)",
        "constructionType": "String",
        "usageType": "String",
        "location": "String",
        "confidenceScore": Integer (0-100),
        "matchScore": Integer (0-100),
        "eligibleCovers": ["List of strings of applicable covers based on context"],
        "exclusionHotspots": ["List of strings of exclusions found in context"],
        "scenarios": [
            {{
                "name": "Scenario name (e.g. Fire Incident, Water Damage, Theft)",
                "status": "Status string (e.g. Covered, Partial Cover, Additional Cover Required, Not Covered)"
            }}
        ],
        "coverageAlignment": Integer (0-100),
        "sumInsuredMatch": Integer (0-100),
        "policyBenefits": Integer (0-100),
        "premiumSuitability": Integer (0-100)
    }}
    If no relevant evidence is found, return 0 for integers and 'Unknown' for strings.
    
    POLICY EVIDENCE:
    {context}
    """
    
    response = analyze_policy(prompt, context)
    
    try:
        data = extract_json(response)
        return data
    except Exception as e:
        logger.error(f"Failed to parse JSON from groq: {e}, Raw: {response}")
        return {"error": "Failed to parse analysis results"}

class IrdaiComplianceRequest(BaseModel):
    query: str

@router.post("/irdai-compliance")
def evaluate_irdai_compliance(req: IrdaiComplianceRequest, current_user = Depends(get_current_active_user)):
    try:
        import datetime
        # Step 1: Collect User Input
        logger.info(f"[Step 1] Request Received. Question: {req.query}")
        
        # Step 2: Validate Input & Step 3: Sanitize Input
        query = req.query.strip()
        if not query:
            logger.error("Input validation failed: empty query")
            raise HTTPException(status_code=400, detail="Please enter a compliance-related question.")
            
        # Step 4: Generate Embedding (Uncached, new every time as per rules)
        try:
            query_vec = get_embedding_uncached(query)
            logger.info("[Step 4] Embedding Generated successfully.")
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate embedding for the query.")
            
        # Step 5: Search Pinecone & Step 6: Apply Metadata Filters
        try:
            namespace = "regulatory_governance"
            logger.info(f"[Step 5] Pinecone Query Executed. Namespace: {namespace}")
            results = query_vectors(query_vec, namespace, top_k=15)
        except Exception as e:
            logger.error(f"Pinecone retrieval failed: {e}")
            raise HTTPException(status_code=500, detail="Unable to retrieve IRDAI compliance documents. Please try again later.")
        
        # Step 7: Validate Retrieved Context
        contexts = []
        scores = []
        
        if results and "matches" in results:
            for match in results["matches"]:
                score = match.get("score", 0)
                # Verify similarity score threshold (e.g. > 0.65 to allow deeper context)
                if score < 0.65:
                    continue
                    
                if "metadata" in match and "text" in match["metadata"]:
                    contexts.append(match["metadata"]["text"])
                    scores.append(score)
                    
        logger.info(f"[Step 7] Context Validated. Top-K Results Retrieved: {len(contexts)} documents. Scores: {scores}")
        
        # Verify documents exist and context length
        context_str = "\n\n---\n\n".join(contexts)
        
        if len(contexts) == 0 or len(context_str.strip()) < 10:
            logger.warning("No relevant IRDAI regulatory evidence was found for the submitted query.")
            # Do not call Groq. Stop processing.
            return {"error": "No relevant IRDAI guidance was found for this question. Please refine your query."}
            
        logger.info(f"[Step 8] Context Constructed. Context Length: {len(context_str)} chars.")
        
        # Step 8: Construct Groq Prompt
        prompt = f"""
You are an expert IRDAI (Insurance Regulatory and Development Authority of India) compliance officer.
Analyze the user's situation strictly based on the provided IRDAI regulatory evidence.
DO NOT hallucinate. DO NOT use prior knowledge.

Focus on identifying and explaining specifics regarding: Policyholder Rights, Waiting Periods, Claims, Grievances, Disclosures, Consumer Protection, Mis-selling, and Policy Servicing.
The AI MUST:
- Explain the regulation clearly.
- Explain insurer obligations.
- Explain policyholder rights.
- Explain available actions.
- Use retrieved evidence.
- Avoid generic fallback text.

NEVER answer with: "No specific information available", "Generic regulatory context", or "Placeholder text" unless Pinecone genuinely returns no relevant evidence.

Original user question: {query}
Regulatory context:
{context_str}

Return EXACTLY a raw JSON object (NO Markdown, NO code blocks) matching this precise schema. Do NOT use Unknown, Null, Undefined, N/A, Dummy Content, or Placeholder Text.
{{
    "compliance_explanation": "...",
    "policyholder_rights": [
        "..."
    ],
    "insurer_responsibilities": [
        "..."
    ],
    "recommended_action": "...",
    "irdai_guidance_summary": "..."
}}
"""
        logger.info("[Step 8] Groq Request Sent.")

        # Step 9: Generate Structured Answer
        try:
            response_text = analyze_policy(prompt, context_str)
            logger.info(f"[Step 9] Groq Response Received. Response Length: {len(response_text)} chars.")
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            raise HTTPException(status_code=500, detail="Unable to generate compliance guidance. Please try again later.")
        
        # Step 10: Validate Output
        try:
            data = extract_json(response_text)
        except Exception as e:
            logger.error(f"Failed to parse JSON from groq: {e}, Raw: {response_text}")
            raise HTTPException(status_code=500, detail="Failed to parse analysis results from LLM.")
            
        sanitized_data = sanitize_response(data)
        
        # Enforce rejection of dummy content by checking the sanitized data explicitly
        if not sanitized_data or is_invalid_value(str(sanitized_data)):
             raise HTTPException(status_code=500, detail="Generated response contained invalid dummy content.")
             
        # Step 12: Store Audit Log
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"
        logger.info(f"""
=================================================
AUDIT LOG
Timestamp: {timestamp}
Question: {query}
Namespace: {namespace}
Retrieved Documents: {len(contexts)}
Similarity Scores: {scores}
Prompt Length: {len(prompt)} chars
Response Length: {len(response_text)} chars
=================================================
""")

        # Step 11: Render Answer (Return to frontend)
        logger.info("[Step 11] Final Response Returned.")
        return sanitized_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in /irdai-compliance pipeline: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

class AiAssistantRequest(BaseModel):
    query: str

@router.post("/ai-assistant")
def evaluate_ai_assistant(req: AiAssistantRequest, current_user = Depends(get_current_active_user)):
    try:
        # For general queries, we can query a general namespace or just use the LLM without context, 
        # but to be safe we can retrieve from a few common ones or just rely on the LLM's knowledge for general concepts,
        # but the user rules specify routing responses. We will pass this directly to the Groq LLM without necessarily doing RAG if it's general,
        # but let's do a light RAG on 'regulatory_governance' just in case.
        context = get_context_from_pinecone(req.query, "regulatory_governance", top_k=2)
    except Exception as e:
        logger.error(f"Failed to retrieve context for AI Assistant: {e}")
        context = "No specific context available."

    prompt = f"""
# INSURANCE AI ASSISTANT

You are the Insurance AI Assistant for the Insurance Intelligence Platform.

Your purpose is to help users understand insurance concepts, terminology, processes, and general doubts in simple, user-friendly language.

## WHAT YOU SHOULD ANSWER

You may answer questions such as:
- What is insurance?
- What is a waiting period?
- What is a deductible?
- What is co-pay?
- What is cashless hospitalization?
- What is a premium?
- What is a sum insured?
- What is a rider?
- What is a network hospital?
- What is a claim settlement ratio?
- What is a grace period?
- Difference between life and health insurance
- Difference between reimbursement and cashless claims
- General insurance education and awareness

Use simple language suitable for non-technical users.

---

## WHAT YOU SHOULD NOT DO

Do not perform:
- Claim outcome analysis
- Care eligibility determination
- Asset coverage analysis
- IRDAI compliance analysis
- Policy-specific coverage decisions
- Claim approval predictions
- Regulatory compliance reviews

These belong to dedicated modules.

---

## ROUTING RULES

If a user asks:

### Claim Outcome Related
Examples: Will my claim be approved?, Is my claim eligible?, What are my chances of approval?, Analyze my claim scenario.
Respond EXACTLY with: "This request is handled by the Claim Outcome Analyzer module. Please open the Claim Outcome Analyzer to receive a policy-based analysis."

### Care Eligibility Related
Examples: Is cancer treatment covered?, Is bypass surgery eligible?, Is dialysis covered?, Is hospitalization covered?
Respond EXACTLY with: "This request is handled by the Care Eligibility Engine. Please use the Care Eligibility Engine for treatment eligibility analysis."

### Asset Coverage Related
Examples: My car was damaged. Is it covered?, My luggage was lost. Is it covered?, Is my asset protected under the policy?
Respond EXACTLY with: "This request is handled by the AI Asset Coverage Advisor. Please use the AI Asset Coverage Advisor for asset coverage analysis."

### IRDAI Compliance Related
Examples: Is this claim rejection compliant?, What are my rights against the insurer?, Is the insurer violating regulations?
Respond EXACTLY with: "This request is handled by the IRDAI Compliance Compass. Please use the IRDAI Compliance Compass for regulatory and compliance analysis."

---

## RESPONSE STYLE
- Friendly, Professional, Educational, Easy to understand
- No legal conclusions, No policy-specific decisions

You must return a raw JSON object with exactly one key: "response". 
Do not wrap it in markdown. Do not include any other text.
Example: {{"response": "Your friendly answer here"}}

User Query: {req.query}
"""
    response = analyze_policy(prompt, context)
    try:
        data = extract_json(response)
        return data
    except Exception as e:
        # Fallback if the LLM didn't return perfect JSON
        # Just wrap it in a JSON object
        clean = response.replace("```json", "").replace("```", "").strip()
        return {"response": clean}

class IrdaiComplianceRequest(BaseModel):
    query: str

@router.post("/irdai-compliance")
def analyze_irdai_compliance(req: IrdaiComplianceRequest, current_user = Depends(get_current_active_user)):
    try:
        logger.info("Request received for analyze_irdai_compliance")
        # Query multiple namespaces
        namespaces = ["regulatory_governance", "banking_governance", "internal_governance"]
        context = get_multi_context_from_pinecone(req.query, namespaces, top_k=3)

        if not context or context.strip() == "":
            return {
                "query_summary": {
                    "user_question": req.query,
                    "compliance_category": "Unknown",
                    "issue_summary": "No supporting regulatory evidence was found in the compliance knowledge base."
                },
                "compliance_findings": {
                    "compliance_status": "Unknown",
                    "assessment_summary": "No supporting regulatory evidence was found in the compliance knowledge base."
                },
                "policyholder_rights": [
                    {
                        "right": "Information Unavailable",
                        "explanation": "No evidence retrieved."
                    }
                ],
                "evidence_references": [],
                "recommended_action_plan": {
                    "immediate_actions": ["No actions can be recommended without evidence."],
                    "escalation_path": ["Insurance Company", "Grievance Officer", "IRDAI Grievance Mechanism", "Insurance Ombudsman"],
                    "final_recommendation": "Please contact support for manual guidance."
                }
            }

        prompt = f"""
You are an AI-powered IRDAI Compliance Regulatory Assistant.
Your goal is to assess a user's compliance-related query using ONLY the provided regulatory evidence.

Do not use outside knowledge. Do not hallucinate. Do not generate assumptions.
If the retrieved evidence does not contain the answer, state that explicitly.

User Query: {req.query}

Retrieved Pinecone Evidence:
{context}

You must return a raw JSON object matching EXACTLY this structure:
{{
  "query_summary": {{
    "user_question": "The user's original question",
    "compliance_category": "e.g., Claim Settlement Issue, Mis-selling, Policy Servicing, Grievance",
    "issue_summary": "A short summary explaining the user's concern"
  }},
  "compliance_findings": {{
    "compliance_status": "✓ Compliant, ⚠ Potential Concern, or ✗ Non-Compliant",
    "assessment_summary": "Explanation based strictly on retrieved regulatory evidence: what regulations apply, whether a concern exists, and what the user should understand."
  }},
  "policyholder_rights": [
    {{
      "right": "Applicable protection (e.g., Right to transparent disclosure)",
      "explanation": "Clear explanation of this right"
    }}
  ],
  "evidence_references": [
    {{
      "regulation_title": "Title of the regulation or document",
      "retrieved_content": "Exact or heavily summarized text from the evidence",
      "source_namespace": "The namespace this came from, if known, else 'regulatory_governance'",
      "document_name": "Name of the source document",
      "section_number": "Section or Clause number, if available",
      "page_number": "Page number, if available"
    }}
  ],
  "recommended_action_plan": {{
    "immediate_actions": [
      "Action 1",
      "Action 2"
    ],
    "escalation_path": [
      "Insurance Company",
      "Grievance Officer",
      "IRDAI Grievance Mechanism",
      "Insurance Ombudsman"
    ],
    "final_recommendation": "Professional regulatory guidance summary"
  }}
}}

Return ONLY valid JSON. Do not include markdown tags like ```json.
"""
        response = analyze_policy(prompt, context)
        try:
            data = extract_json(response)
            return data
        except Exception as e:
            # Fallback for parsing error
            logger.error(f"Error extracting JSON from LLM: {{e}}")
            logger.error(f"Raw Response: {{response}}")
            raise HTTPException(status_code=500, detail="Failed to parse LLM response into JSON.")
            
    except Exception as e:
        logger.error(f"Error in evaluate_irdai_compliance: {{e}}")
        raise HTTPException(status_code=500, detail=str(e))

