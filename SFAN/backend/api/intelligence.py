from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import query_vectors, query_vectors_multi_namespace
from backend.services.embedding_service import get_embedding
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


router = APIRouter(prefix="/intelligence", tags=["intelligence"])

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
    scenario: str
    namespaces: list[str]
    bank_name: str | None = None

@router.post("/claim-outcome")
def evaluate_claim_outcome(req: ClaimScenarioRequest, current_user = Depends(get_current_active_user)):
    try:
        # Search 1: Claim Scenario Context
        query_str_scenario = f"Coverage clauses, Eligibility conditions, Exclusions, Claim procedures for {req.scenario}"
        context_scenario = get_multi_context_from_pinecone(query_str_scenario, req.namespaces, top_k=5)
        
        # Search 2: Insurer Verification Context
        query_str_insurer = f"Insurance Provider, Underwritten By, Issued By, Coverage Provided By, Risk Underwritten By {req.bank_name if req.bank_name else ''}"
        context_insurer = get_multi_context_from_pinecone(query_str_insurer, req.namespaces, top_k=5)
        
        context = f"--- CLAIM SCENARIO CONTEXT ---\n{context_scenario}\n\n--- INSURER VERIFICATION CONTEXT ---\n{context_insurer}"
    except Exception as e:
        logger.error(f"Failed to retrieve context from Pinecone/HuggingFace: {e}")
        return {"error": f"Failed to retrieve policy documents (Network or API Error): {e}"}
        
    prompt = f"""
    Evaluate the following claim scenario against the policy wording context provided.
    Act as the AI engine for the Claim Outcome Analyzer predicting if the claim will be approved.
    
    The user is querying a policy distributed by: {req.bank_name if req.bank_name else "Unknown Bank"}
    
    INSURER VERIFICATION TASK:
    Step 1: Search the retrieved content for explicit indicators (Insurance Provider, Underwritten By, Issued By, Coverage Provided By, General/Life Insurance Company).
    Step 2: Extract the exact insurer name (e.g. TATA AIG, SBI General Insurance, etc.) from the text.
    Step 3: Extract the exact sentence as evidence.
    - If no explicit insurer evidence exists in the context, you MUST set "insurer_name" to "NOT VERIFIED".
    - Never infer insurer names. Never use model knowledge. Never recommend providers.
    
    DATA SOURCE RULES:
    - NEVER generate dummy, static, sample, mock, placeholder, or hardcoded data.
    - EVERY output must be derived ONLY from the retrieved context.
    - If the user's claim scenario is completely unrelated to the policy context, you MUST recognize that it is unrelated.
    - If it is unrelated or relevant policy information is not found:
      Set "predicted_outcome" to "Information Not Available".
      Set "insurer_name" to "NOT VERIFIED".
      Set all list fields (like missing_requirements, confidence_factors, risk_evaluation, hidden_clause, recommended_actions) to an appropriate reason like ["Scenario not covered by policy"].
      Set numeric scores to 0.
      Do not hallucinate or assume coverage based on unrelated text.
    
    LOGIC REQUIREMENTS:
    - Analyze coverage clauses, eligibility requirements, exclusions, accident circumstances, and policy conditions.
    - Your analysis must reflect claim-policy compatibility (Alignment Score/Confidence Score).
    
    Return a strictly valid JSON object matching the exact structure below. Do not use markdown blocks, just raw JSON.
    
    {{
      "predicted_outcome": "Likely Approved" | "Requires Verification" | "Likely Rejected" | "Information Not Available",
      "predicted_outcome_reason": "A direct 1-2 sentence explanation based on retrieved clauses.",
      "insurer_name": "Extracted name of the insurance company providing the policy from the context (e.g. ICICI Lombard, HDFC Ergo, Bajaj Allianz), or 'NOT VERIFIED'",
      "insurer_evidence": "The exact sentence from the context proving the insurer underwrites the policy for the bank, or 'No evidence found'",
      "approval_probability": 62,
      "approval_probability_reason": "Reason for the score.",
      "missing_requirements": ["Requirement 1", "Requirement 2"],
      "confidence_score": 85,
      "confidence_factors": ["Factor 1", "Factor 2"],
      "risk_level": "Low Risk" | "Medium Risk" | "High Risk",
      "risk_evaluation": ["Risk 1", "Risk 2"],
      "policy_clause_used": {{
        "clause_text": "Exact retrieved text or None",
        "source": "Exact retrieved section name or None"
      }},
      "hidden_clause": [
        "Retrieved hidden condition 1"
      ],
      "recommended_actions": [
        "Retrieved action 1"
      ],
      "claim_analysis_summary": "Concise summary of relevant policy clauses and risks.",
      "granular_coverage_breakdown": {{
        "fully_covered": [],
        "subject_to_sub_limits": [],
        "out_of_scope_excluded": []
      }},
      "strategic_enhancements": [
        {{
          "action": "Action",
          "expected_impact": "Impact"
        }}
      ]
    }}
    
    Claim Scenario:
    {req.scenario}
    """
    
    response = analyze_policy(prompt, context, model="llama-3.3-70b-versatile")
    try:
        return extract_json(response)
    except ValueError as ve:
        return {
            "predicted_outcome": "Information Not Available",
            "predicted_outcome_reason": "Your scenario does not appear to be covered or mentioned in the selected policy documents.",
            "insurer_name": "NOT VERIFIED",
            "insurer_evidence": "No evidence found",
            "approval_probability": 0,
            "approval_probability_reason": "No relevant coverage clauses were found in the context.",
            "missing_requirements": ["Provide a scenario relevant to the policy"],
            "confidence_score": 0,
            "confidence_factors": ["No matching clauses found"],
            "risk_level": "High Risk",
            "risk_evaluation": ["Unrelated claim scenario"],
            "policy_clause_used": {
                "clause_text": "None",
                "source": "None"
            },
            "hidden_clause": [],
            "recommended_actions": ["Review your policy type and ensure you are filing under the correct insurance plan."],
            "claim_analysis_summary": "We could not find any evidence in the selected policy that covers this scenario.",
            "granular_coverage_breakdown": {
                "fully_covered": [],
                "subject_to_sub_limits": [],
                "out_of_scope_excluded": ["The entire scenario appears out of scope."]
            },
            "strategic_enhancements": []
        }
    except Exception as e:
        logger.error(f"Claim Outcome JSON parse error: {e}")
        return {"error": "Failed to generate structured analysis.", "raw": response}


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
        # Build retrieval query using all user inputs
        query_str = f"Bank: {req.bank_name}, {req.patient_profile}, {req.condition} treatment, {req.department}, {req.admission_type} admission, {req.insurance_type}, {req.policy_age} policy duration"
        # Query Pinecone, top_k=1
        context = get_context_from_pinecone(query_str, req.namespace, top_k=1)
    except Exception as e:
        logger.error(f"Failed to retrieve context for Care Eligibility: {e}")
        return {"error": f"Failed to retrieve policy documents: {e}"}

    if not context.strip():
        return {
            "eligibility_status": "Requires Review",
            "confidence": "Low Confidence",
            "evidence": "No relevant policy clauses were found in the vector database.",
            "sum_insured": "Coverage amount unavailable in retrieved documents.",
            "coverage_limits": "Coverage amount unavailable in retrieved documents.",
            "sub_limits": "Coverage amount unavailable in retrieved documents.",
            "co_pay": "Coverage amount unavailable in retrieved documents.",
            "coverage_gaps": [],
            "action_plan": [],
            "policy_rules_applied": []
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
      "eligibility_status": "Eligible" | "Not Eligible" | "Requires Review",
      "confidence": "High Confidence" | "Medium Confidence" | "Low Confidence",
      "evidence": "Exact text from the document proving eligibility, or 'Eligibility cannot be determined from retrieved policy documents.'",
      "sum_insured": "Extracted sum insured, or 'Coverage amount unavailable in retrieved documents.'",
      "coverage_limits": "Extracted limits, or 'Coverage amount unavailable in retrieved documents.'",
      "sub_limits": "Extracted sub-limits, or 'Coverage amount unavailable in retrieved documents.'",
      "co_pay": "Extracted co-pay rules, or 'Coverage amount unavailable in retrieved documents.'",
      "coverage_gaps": ["List of extracted exclusions like 'Waiting period applicable'"],
      "action_plan": ["List of next steps like 'Collect discharge summary' based on document rules"],
      "policy_rules_applied": [
        {{
          "rule": "Summary of rule",
          "clause": "Exact clause text",
          "source": "Document name or section",
          "page": "Page number or 'Unknown'"
        }}
      ]
    }}
    
    Context:
    {context}
    """

    response = analyze_policy(prompt, context)
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

    response = analyze_policy(prompt, combined_context, model="llama-3.3-70b-versatile")
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
        # Build retrieval query
        query_str = f"IRDAI regulations, guidelines, compliance, rules: {req.query}"
        # Query Pinecone in regulatory_governance namespace
        context = get_context_from_pinecone(query_str, "regulatory_governance", top_k=2)
    except Exception as e:
        logger.error(f"Failed to retrieve context for IRDAI Compliance: {e}")
        return {"error": f"Failed to retrieve policy documents: {e}"}
        
    prompt = f"""
    You are an expert IRDAI (Insurance Regulatory and Development Authority of India) compliance officer.
    Analyze the user's situation strictly based on the provided IRDAI regulatory evidence.
    
    User Query: {req.query}
    
    You must output a JSON object with exactly these 6 keys. For each key, provide a clear, concise, actionable paragraph (description) tailored to the user's query. Do not hallucinate; use only the retrieved context. If no relevant info is found, state that based on the context, no specific guideline was found.
    
    Schema:
    {{
        "violations": "Description of any compliance violations detected (e.g. claim rejection, TAT delays).",
        "insights": "Description of regulatory protection insights and policyholder rights.",
        "escalation": "Step-by-step guide on how to escalate this specific complaint.",
        "responsibility": "Description of the insurer's obligations and whether they were met.",
        "riskAlerts": "Any potential consumer risks (lapsing, underinsurance, etc.) identified.",
        "aiAnalysis": "Overall AI conclusion and actionable recommendation based on IRDAI norms."
    }}
    
    POLICY EVIDENCE:
    {context}
    """
    
    response = analyze_policy(prompt, context)
    
    try:
        data = extract_json(response)
        data["sourceContext"] = context
        return data
    except Exception as e:
        logger.error(f"Failed to parse JSON from groq: {e}, Raw: {response}")
        return {"error": "Failed to parse analysis results"}

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
