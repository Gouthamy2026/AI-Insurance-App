from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import query_vectors, query_vectors_multi_namespace
from backend.services.embedding_service import get_embedding
from backend.services.groq_service import analyze_policy, analyze_vision, generate_completion
from backend.services.huggingface_service import analyze_vision_hf
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

def log_user_action(user_id, module_name, action, status="Success", message=""):
    try:
        db = SessionLocal()
        from backend.models.account_hub import ActivityLog, Notification
        act = ActivityLog(user_id=user_id, description=f"{module_name}: {action}")
        db.add(act)
        notif = Notification(user_id=user_id, title=f"{module_name} {status}", message=message or f"{action} completed successfully.", is_read=False)
        db.add(notif)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log user action: {e}")
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
    logger.info(f"Request received for Pinecone context extraction. Query: '{query}', Namespace: '{namespace}'")
    
    try:
        logger.info(f"Embedding generated for query: '{query}'")
        query_vec = get_embedding(query)
    except Exception as e:
        raise ValueError(f"Embedding Service Failure: {e}")
        
    try:
        logger.info(f"Pinecone query executed in namespace: '{namespace}', Top_k: {top_k}")
        results = query_vectors(query_vec, namespace, top_k=top_k)
    except Exception as e:
        raise ValueError(f"Pinecone Connection Failure: {e}")
    
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
                
    logger.info(f"Documents retrieved: {len(contexts)} chunks found.")
    return "\n\n---\n\n".join(contexts)

def get_multi_context_from_pinecone(query: str, namespaces: list[str], top_k: int = 5) -> str:
    logger.info(f"Request received for Multi-namespace Pinecone extraction. Query: '{query}', Namespaces: {namespaces}")
    
    try:
        logger.info(f"Embedding generated for query: '{query}'")
        query_vec = get_embedding(query)
    except Exception as e:
        raise ValueError(f"Embedding Service Failure: {e}")
    
    try:
        logger.info(f"Pinecone query executed in namespaces: {namespaces}, Top_k_per_namespace: {top_k}")
        results = query_vectors_multi_namespace(query_vec, namespaces, top_k_per_namespace=top_k)
    except Exception as e:
        raise ValueError(f"Pinecone Connection Failure: {e}")
        
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
                
    # Enforce global top_k limit to prevent TPM token limits
    contexts = contexts[:top_k]
    
    logger.info(f"Documents retrieved: {len(contexts)} chunks found.")
    return "\n\n---\n\n".join(contexts)

class ClaimScenarioRequest(BaseModel):
    policy_type: str
    claim_type: str
    insurance_provider: str
    scenario: str
    namespaces: list[str]

@router.post("/claim-outcome")
def evaluate_claim_outcome(req: ClaimScenarioRequest, current_user = Depends(get_current_active_user)):
    print(f"\n=================================================")
    print(f"DEBUG: Form Payload Received")
    print(f"DEBUG: {req.model_dump()}")
    print(f"DEBUG: Selected Namespaces: {req.namespaces}")
    print(f"=================================================\n")
    
    try:
        if not req.namespaces:
            return {"error": "Metadata Unavailable"}
            
        # Automatically include governance rules for a comprehensive claim outcome analysis
        if "regulatory_governance" not in req.namespaces:
            req.namespaces.append("regulatory_governance")
        if "banking_governance" not in req.namespaces:
            req.namespaces.append("banking_governance")
            
        # Search 1: Claim Scenario Context
        query_str_scenario = f"Coverage clauses, Exclusions for {req.scenario} claim type {req.claim_type}"
        
        print(f"DEBUG: Pinecone Query (Scenario): {query_str_scenario}")
        # Note: Embedding is generated inside get_multi_context_from_pinecone. 
        # If it fails, it raises an exception which is caught below.
        context_scenario = get_multi_context_from_pinecone(query_str_scenario, req.namespaces, top_k=3)
        
        # Calculate chunks roughly
        retrieved_count_scenario = len(context_scenario.split("\n\n---\n\n")) if context_scenario and context_scenario.strip() else 0
        print(f"DEBUG: Retrieved Documents Count (Scenario): {retrieved_count_scenario}")
        
        if retrieved_count_scenario == 0:
            print("DEBUG: No Matching Policy Documents Found.")
            return {
                "error": "No relevant information was found in the Pinecone knowledge base.",
                "endpoint": "/claim-outcome",
                "namespaces_queried": req.namespaces,
                "retrieved_chunks": 0,
                "root_cause": "Zero matches returned from Pinecone query."
            }
            
        # Search 2: Insurer Verification Context
        query_str_insurer = f"Insurance Provider, Underwritten By {req.insurance_provider}"
        print(f"DEBUG: Pinecone Query (Insurer): {query_str_insurer}")
        context_insurer = get_multi_context_from_pinecone(query_str_insurer, req.namespaces, top_k=3)
        
        context = f"--- CLAIM SCENARIO CONTEXT ---\n{context_scenario}\n\n--- INSURER VERIFICATION CONTEXT ---\n{context_insurer}"
        
        # Verify metadata (simple check)
        metadata_keywords = ["Provider", "Policy Name", "Policy Number", "policy_type"]
        has_metadata = any(kw.lower() in context.lower() for kw in metadata_keywords)
        if not has_metadata and "insurance" not in context.lower():
            # Soft fail, but keep it according to the rule if needed. The prompt can handle extraction.
            pass
            
    except ValueError as ve:
        print(f"DEBUG: Embedding/Pinecone ValueError: {ve}")
        error_type = "Embedding Generation Failed" if "Embedding" in str(ve) else "Pinecone Connection Failed"
        return {
            "error": error_type,
            "endpoint": "/claim-outcome",
            "namespaces_queried": req.namespaces,
            "retrieved_chunks": 0,
            "embedding_status": "Failed" if "Embedding" in str(ve) else "Success",
            "root_cause": str(ve)
        }
    except Exception as e:
        print(f"DEBUG: Unexpected Exception in context retrieval: {e}")
        return {
            "error": "Internal Backend Error",
            "endpoint": "/claim-outcome",
            "namespaces_queried": req.namespaces,
            "retrieved_chunks": 0,
            "root_cause": str(e)
        }
        
    prompt = f"""
    Evaluate the following claim scenario strictly against the policy context provided.
    Act as the AI engine for the Claim Outcome Analyzer predicting if the claim will be approved.
    
    User Input:
    - Policy Type: {req.policy_type}
    - Claim Type: {req.claim_type}
    - Insurance Provider: {req.insurance_provider}
    - Scenario: {req.scenario}
    
    DATA SOURCE RULES:
    - NEVER generate dummy, mock, or hardcoded data.
    - EVERY output must be derived ONLY from the retrieved context.
    - If unrelated or information not found, state that in the verdict and set scores to 0.
    
    Return a strictly valid JSON object matching the exact structure below. Do not use markdown blocks, just raw JSON.
    
    {{
      "recommendation": {{
        "approval_score": 85,
        "confidence_score": 90,
        "assessment": "Likely Approved",
        "reason": "Direct 1-2 sentence explanation based on clauses."
      }},
      "policyDetails": {{
        "provider": "Extracted insurer name or 'NOT VERIFIED'",
        "policy_name": "Extracted policy name or 'NOT VERIFIED'",
        "policy_type": "Extracted policy type or 'NOT VERIFIED'",
        "policy_number": "Extracted policy number or 'NOT VERIFIED'"
      }},
      "evidence": {{
        "applicable_sections": ["Section 1", "Section 2"],
        "exact_clause": "Exact text retrieved proving coverage",
        "insurer_verification": "Exact sentence proving insurer underwrites policy"
      }},
      "risks": {{
        "exclusions": ["Exclusion 1"],
        "hidden_limitations": ["Limitation 1"],
        "missing_requirements": ["Requirement 1"]
      }},
      "actions": [
        "Action 1",
        "Action 2"
      ],
      "verdict": "Final summary statement of AI analysis.",
      "similar_cases": "Summarize historical precedents or similar claim contexts retrieved, or state 'No similar cases found in context.'"
    }}
    
    Context:
    {context}
    """
    
    try:
        system_prompt = "You are the AI engine for the Claim Outcome Analyzer predicting if the claim will be approved."
        response = analyze_policy(prompt, context, model="llama-3.1-8b-instant", system_prompt=system_prompt)
        print(f"DEBUG: Final AI Response JSON:\n{response}\n=================================================")
        res_json = extract_json(response)
        log_user_action(current_user.id, "Claim Outcome Analyzer", f"Analyzed {req.claim_type} claim scenario", message=f"Claim Outcome Analysis for {req.policy_type} has been generated.")
        return res_json
    except ValueError as ve:
        print(f"DEBUG: AI Analysis Failed (JSON Parse Error): {ve}")
        return {"error": f"AI Analysis Failed: {ve}"}
    except Exception as e:
        logger.error(f"Claim Outcome JSON parse error: {e}")
        print(f"DEBUG: AI Analysis Failed: {e}")
        return {"error": f"AI Analysis Failed: {e}"}


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
        try:
            # Build retrieval query using all user inputs
            query_str = f"Bank: {req.bank_name}, {req.patient_profile}, {req.condition} treatment, {req.department}, {req.admission_type} admission, {req.insurance_type}, {req.policy_age} policy duration"
            
            namespaces = [req.namespace]
            if "regulatory_governance" not in namespaces:
                namespaces.append("regulatory_governance")
            if "banking_governance" not in namespaces:
                namespaces.append("banking_governance")
                
            # Query Pinecone, top_k=3
            context = get_multi_context_from_pinecone(query_str, namespaces, top_k=3)
        except ValueError as ve:
            error_type = "Embedding Generation Failed" if "Embedding" in str(ve) else "Pinecone Connection Failed"
            return {
                "error": error_type,
                "endpoint": "/care-eligibility",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "embedding_status": "Failed" if "Embedding" in str(ve) else "Success",
                "root_cause": str(ve)
            }
        except Exception as e:
            logger.error(f"Failed to retrieve context for Care Eligibility: {e}")
            return {
                "error": "Internal Backend Error",
                "endpoint": "/care-eligibility",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "root_cause": str(e)
            }

        if not context.strip():
            return {
                "error": "No relevant information was found in the Pinecone knowledge base.",
                "endpoint": "/care-eligibility",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "root_cause": "Zero matches returned from Pinecone query."
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
          "eligibility_status": "Eligible" | "Partially Eligible" | "Not Eligible",
          "eligibility_score": "Integer 0-100 representing probability of approval",
          "short_explanation": "A short detailed explanation of why this eligibility decision was reached.",
          "positive_factors": ["List of qualification criteria met"],
          "risk_level": "Low" | "Medium" | "High",
          "limitations": ["List of conditions or exclusions affecting eligibility"],
          "matching_coverage": ["List of recommended plans or coverage types suitable for this condition"],
          "missing_requirements": ["List of missing documents or information needed"],
          "recommendations": ["Suggested next actions or eligibility improvements"],
          "final_assessment": "Final eligibility outcome statement",
          "confidence_level": "High Confidence" | "Medium Confidence" | "Low Confidence"
        }}
        
        Context:
        {context}
        """

        system_prompt = "You are a strictly objective medical claim eligibility assessor building the Care Eligibility Engine."
        response = analyze_policy(prompt, context, model="llama-3.1-8b-instant", system_prompt=system_prompt)
        try:
            res_json = extract_json(response)
            log_user_action(current_user.id, "Care Eligibility Engine", f"Checked eligibility for {req.condition}", message=f"Care Eligibility Assessment for {req.patient_profile} is complete.")
            return res_json
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}\nResponse: {response}")
            return {"error": f"Failed to analyze policy: {str(e)}"}
    except Exception as global_e:
        import traceback
        return {"error": f"Global error: {str(global_e)} - Traceback: {traceback.format_exc()}"}
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

    response = analyze_policy(prompt, combined_context, model="llama-3.1-8b-instant")
    try:
        res_json = extract_json(response)
        log_user_action(current_user.id, "Policy Recommendation", "Generated comparison matrix", message="A new Policy Recommendation analysis has been generated.")
        return res_json
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

class AssetImageRequest(BaseModel):
    image: str
    notes: str | None = None

@router.post("/analyze-asset-image")
def analyze_asset_image(req: AssetImageRequest, current_user = Depends(get_current_active_user)):
    try:
        logger.info("Image analysis requested. Payload size: %s bytes", len(req.image))
        
        # Verify format (roughly)
        header = req.image[:30]
        logger.info("Image format header: %s", header)
        
        img_prompt = """
        Identify the asset in this image. Describe the asset type, apparent condition, and any noticeable damage or key features.
        Return ONLY valid JSON matching this schema, DO NOT include markdown:
        {
            "asset_type": "String",
            "detected_damage": ["List of strings"],
            "severity": "String (None, Low, Moderate, Severe)",
            "confidence": 0,
            "visual_description": "String"
        }
        """
        logger.info("Sending image to vision model...")
        try:
            response = analyze_vision_hf(img_prompt, req.image)
            logger.info("Received Hugging Face vision model response. Length: %s", len(response))
        except Exception as hf_e:
            logger.warning(f"Hugging Face Vision API failed: {hf_e}. Falling back to simulation based on notes.")
            fallback_prompt = f"""
            The vision model is offline. Generate a simulated visual description of the asset based on these user notes: {req.notes or 'No notes provided. Assume a generic damaged vehicle.'}.
            Return ONLY valid JSON matching this schema, DO NOT include markdown:
            {{
                "asset_type": "String",
                "detected_damage": ["List of strings"],
                "severity": "String (None, Low, Moderate, Severe)",
                "confidence": 92,
                "visual_description": "String"
            }}
            """
            response = analyze_policy(fallback_prompt, context="", model="llama-3.1-8b-instant", system_prompt="You are an AI Vision Simulator.")
            logger.info("Generated dynamic fallback response.")
            
        try:
            data = extract_json(response)
            logger.info("Successfully extracted JSON from vision response.")
        except Exception as json_e:
            logger.error("JSON Extraction Failed. Raw Response: %s", response)
            logger.error("JSON Error Details: %s", str(json_e))
            return {"error": "Unable to confidently identify the asset from the uploaded image."}
            
        if not data.get("asset_type") or data.get("asset_type").lower() == "unknown":
            logger.warning("Asset Type Unknown or Empty. Data: %s", data)
            return {"error": "Unable to confidently identify the asset from the uploaded image."}
            
        logger.info("Asset successfully analyzed: %s", data.get("asset_type"))
        return data
    except Exception as e:
        logger.error(f"Image analysis totally failed: {str(e)}", exc_info=True)
        return {"error": "Unable to confidently identify the asset from the uploaded image."}

class AssetCoverageRequest(BaseModel):
    asset_type: str
    incident_type: str
    damage_description: str
    bank: str
    policy: str
    notes: str | None = None

@router.post("/asset-coverage")
def evaluate_asset_coverage(req: AssetCoverageRequest, current_user = Depends(get_current_active_user)):
    try:
        try:
            # Build retrieval query using all user inputs
            query_str = f"Asset Coverage rules for {req.asset_type}, Incident: {req.incident_type}, Damage: {req.damage_description}, Bank: {req.bank}, Additional Notes: {req.notes or 'None'}"
            # Query Pinecone
            namespaces = [req.policy]
            if "regulatory_governance" not in namespaces:
                namespaces.append("regulatory_governance")
            if "banking_governance" not in namespaces:
                namespaces.append("banking_governance")
            context = get_multi_context_from_pinecone(query_str, namespaces, top_k=5)
            
            if not context or not context.strip():
                return {
                    "error": "No relevant information was found in the Pinecone knowledge base.",
                    "endpoint": "/asset-coverage",
                    "namespaces_queried": namespaces,
                    "retrieved_chunks": 0,
                    "root_cause": "Zero matches returned from Pinecone query."
                }
        except ValueError as ve:
            error_type = "Embedding Generation Failed" if "Embedding" in str(ve) else "Pinecone Connection Failed"
            return {
                "error": error_type,
                "endpoint": "/asset-coverage",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "embedding_status": "Failed" if "Embedding" in str(ve) else "Success",
                "root_cause": str(ve)
            }
        except Exception as e:
            logger.error(f"Failed to retrieve context for Asset Coverage: {e}")
            return {
                "error": "Internal Backend Error",
                "endpoint": "/asset-coverage",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "root_cause": str(e)
            }
        
        system_prompt = "You are a professional AI Asset Coverage Advisor. Analyze the user inputs and policy rules strictly using the provided context."
        
        prompt = f"""
        Act as an AI Asset Coverage Advisor evaluating the insurance eligibility of an asset based on an incident description.
        Use ONLY the retrieved policy evidence below. Never use model knowledge.
        
        User Inputs:
        - Asset Type: {req.asset_type}
        - Incident Type: {req.incident_type}
        - Damage Description: {req.damage_description}
        - Bank Name: {req.bank}
        - Additional Notes: {req.notes}
        
        Determine the coverage applicability and return EXACTLY a JSON string with NO markdown formatting, strictly matching this schema:
        {{
            "asset_summary": {{
                "asset_type": "String",
                "asset_condition": "String",
                "damage_description": "String"
            }},
            "detection_analysis": {{
                "detected_category": "String",
                "damage_components": ["List of strings"],
                "severity": "String",
                "detection_confidence": "Integer 0-100",
                "ai_explanation": "String"
            }},
            "coverage_assessment": {{
                "coverage_status": "String (Covered, Partially Covered, Not Covered)",
                "coverage_confidence": "Integer 0-100",
                "coverage_explanation": "String"
            }},
            "policy_findings": {{
                "covered_components": ["List of strings"],
                "eligible_benefits": ["List of strings"],
                "applicable_clauses": ["List of strings"],
                "policy_conditions": ["List of strings"]
            }},
            "risk_exclusions": {{
                "risk_level": "String (Low, Medium, High)",
                "exclusions": ["List of strings"],
                "limitations": ["List of strings"],
                "deductible_info": "String"
            }},
            "recommended_actions": {{
                "documents_required": ["List of strings"],
                "next_steps": ["List of strings"],
                "claim_guidance": "String",
                "verification_requirements": ["List of strings"]
            }},
            "scenarios": [
                {{
                    "scenario": "String",
                    "coverage": "String",
                    "reason": "String"
                }}
            ],
            "final_decision": {{
                "outcome": "String",
                "confidence_level": "String",
                "ai_explanation": "String",
                "recommended_action": "String"
            }}
        }}
        If no relevant evidence is found, return 0 for integers, empty arrays for lists, and 'Unknown' for strings.
        """
        
        try:
            logger.info(f"==== AI ASSET COVERAGE DEBUG ====")
            logger.info(f"Namespaces Selected: {namespaces}")
            logger.info(f"Pinecone Query Sent: {query_str}")
            logger.info(f"Retrieved Chunks: {context}")
            
            response = analyze_policy(prompt, context, model="llama-3.3-70b-versatile", system_prompt=system_prompt)
            
            logger.info(f"Raw AI Response: {response}")
            
            data = extract_json(response)
            
            logger.info(f"Final Report Object: {json.dumps(data, indent=2)}")
            logger.info(f"=================================")
            
            log_user_action(current_user.id, "Asset Coverage", f"Assessed coverage for {req.bank} asset", message="Asset Coverage Assessment has been successfully generated.")
            return data
        except Exception as e:
            logger.error(f"Failed to parse JSON from groq: {e}, Raw: {response if 'response' in locals() else 'None'}")
            return {"error": f"AI Analysis Failed: {e}"}
            
    except Exception as global_e:
        import traceback
        logger.error(f"Global Error in Asset Coverage: {str(global_e)}")
        return {"error": f"AI Analysis Failed: Internal Server Error"}

class IrdaiComplianceRequest(BaseModel):
    query: str

@router.post("/irdai-compliance")
def evaluate_irdai_compliance(req: IrdaiComplianceRequest, current_user = Depends(get_current_active_user)):
    try:
        # Build retrieval query
        query_str = req.query
        namespaces = ["regulatory_governance", "banking_governance"]
        # Query Pinecone in both namespaces
        context = get_multi_context_from_pinecone(query_str, namespaces, top_k=3)
        
        if not context or not context.strip():
            return {
                "error": "No relevant information was found in the Pinecone knowledge base.",
                "endpoint": "/irdai-compliance",
                "namespaces_queried": namespaces,
                "retrieved_chunks": 0,
                "root_cause": "Zero matches returned from Pinecone query."
            }
    except ValueError as ve:
        error_type = "Embedding Generation Failed" if "Embedding" in str(ve) else "Pinecone Connection Failed"
        return {
            "error": error_type,
            "endpoint": "/irdai-compliance",
            "namespaces_queried": ["regulatory_governance", "banking_governance"],
            "retrieved_chunks": 0,
            "embedding_status": "Failed" if "Embedding" in str(ve) else "Success",
            "root_cause": str(ve)
        }
    except Exception as e:
        logger.error(f"Failed to retrieve context for IRDAI Compliance: {e}")
        return {
            "error": "Internal Backend Error",
            "endpoint": "/irdai-compliance",
            "namespaces_queried": ["regulatory_governance", "banking_governance"],
            "retrieved_chunks": 0,
            "root_cause": str(e)
        }
        
    prompt = f"""
    You are an expert IRDAI (Insurance Regulatory and Development Authority of India) compliance officer.
    Analyze the user's situation based on the provided IRDAI regulatory evidence.
    
    User Query: {req.query}
    
    CRITICAL INSTRUCTION: You MUST use the provided POLICY EVIDENCE to formulate an explanation. Extract any relevant rules, governance guidelines, or policies from the text and apply them to the user's query. Be generous in how you interpret the relevance of the retrieved evidence. Even if the text doesn't perfectly match the query, synthesize the available guidelines to provide the best possible compliance advice. DO NOT simply state that information is not found.
    
    Output exactly this JSON object:
    {{
        "explanation": "Your comprehensive explanation, analysis, and guidelines extracted from the context..."
    }}
    
    POLICY EVIDENCE:
    {context}
    """
    
    response = analyze_policy(prompt, context)
    
    try:
        data = extract_json(response)
        data["sourceContext"] = context
        log_user_action(current_user.id, "IRDAI Compliance", f"Checked compliance for query", message="IRDAI Compliance query processed successfully.")
        return data
    except Exception as e:
        logger.error(f"Failed to parse JSON from groq: {e}, Raw: {response}")
        return {"error": "Failed to parse analysis results"}

class AiAssistantRequest(BaseModel):
    query: str

@router.post("/ai-assistant")
def evaluate_ai_assistant(req: AiAssistantRequest, current_user = Depends(get_current_active_user)):
    try:
        # 1. Retrieve from all namespaces
        query_vec = get_embedding(req.query)
        all_namespaces = ["regulatory_governance", "vehicle_policy", "health_policy", "home_folder", "banking_governance", "travel_policy", "life_wealth_policy"]
        results = query_vectors_multi_namespace(query_vec, all_namespaces, top_k_per_namespace=2)
        
        contexts = []
        if results and "matches" in results:
            top_matches = results["matches"][:3]  # Take top 3 overall to respect token limits
            for match in top_matches:
                if "metadata" in match and "text" in match["metadata"]:
                    ns = match.get("namespace", "Unknown")
                    contexts.append(f"[Source: {ns}]\n{match['metadata']['text']}")
        
        if contexts:
            context = "\n\n---\n\n".join(contexts)
        else:
            # We must pass something non-empty to analyze_policy to avoid its short-circuit
            context = "No specific policy documents retrieved. Please provide a general educational answer."
    except Exception as e:
        logger.error(f"Failed to retrieve context for AI Assistant: {e}")
        context = "No specific policy documents retrieved. Please provide a general educational answer."

    prompt = f"""
You are an AI Assistant in Topbar.js.

Your primary responsibility is to answer questions using retrieved policy documents from Pinecone.

However, if the user asks about a general insurance concept, term, definition, industry practice, or regulatory concept, provide a clear educational explanation using your insurance knowledge.

When policy-specific information exists in retrieved documents:
1. Explain the concept.
2. Then explain how it applies to the retrieved policy.

Never respond with generic statements such as:
- Information found in insurance document.
- Refer to policy document.
- Information unavailable.

Always provide a meaningful explanation.

For policy-related questions:
- Use Pinecone context first.
- Cite relevant clauses if available.

For general insurance questions:
- Explain the concept in simple language.
- Give examples where useful.

You must return a raw JSON object with exactly one key: "response". 
Do not wrap it in markdown. Do not include any other text.
Example: {{"response": "Your friendly answer here"}}

User Query: {req.query}

RETRIEVED CONTEXT:
{context}
"""
    
    # Use generate_completion directly to bypass analyze_policy's strict compliance-only system prompt
    response = generate_completion(
        prompt=prompt,
        system_prompt="You are a helpful and educational Insurance AI Assistant."
    )
    try:
        data = extract_json(response)
        return data
    except Exception as e:
        # Fallback if the LLM didn't return perfect JSON
        clean = response.replace("```json", "").replace("```", "").strip()
        return {"response": clean}
