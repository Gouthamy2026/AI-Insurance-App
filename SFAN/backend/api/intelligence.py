from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import query_vectors, query_vectors_multi_namespace
from backend.services.embedding_service import get_embedding
from backend.services.groq_service import analyze_policy
import json
import logging
import re

logger = logging.getLogger(__name__)

def extract_json(text: str) -> dict:
    if "Insufficient evidence" in text:
        raise ValueError("Insufficient evidence found in the insurance knowledge base.")
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

def get_context_from_pinecone(query: str, namespace: str) -> str:
    # 1. Embed query
    query_vec = get_embedding(query)
    
    # 2. Query pinecone
    results = query_vectors(query_vec, namespace, top_k=5)
    
    # 3. Extract text from metadata
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
                
    return "\n\n---\n\n".join(contexts)

def get_multi_context_from_pinecone(query: str, namespaces: list[str]) -> str:
    query_vec = get_embedding(query)
    results = query_vectors_multi_namespace(query_vec, namespaces, top_k_per_namespace=5)
    contexts = []
    if results and "matches" in results:
        for match in results["matches"]:
            if "metadata" in match and "text" in match["metadata"]:
                contexts.append(match["metadata"]["text"])
    return "\n\n---\n\n".join(contexts)

class ClaimScenarioRequest(BaseModel):
    scenario: str
    namespaces: list[str]

@router.post("/claim-outcome")
def evaluate_claim_outcome(req: ClaimScenarioRequest, current_user = Depends(get_current_active_user)):
    context = get_multi_context_from_pinecone("Claim Conditions, Exclusions, Waiting Periods, Deductibles, Co-payment", req.namespaces)
    
    prompt = f"""
    Evaluate the following claim scenario against the policy wording context provided.
    Act as an AI-powered pre-claim assessment engine predicting if the claim will be approved.
    Return a strictly valid JSON object matching the exact structure below. Do not use markdown blocks, just raw JSON.
    
    {{
      "predicted_outcome": "Likely Approved" | "Requires Verification" | "Likely Rejected",
      "predicted_outcome_reason": "A direct 1-2 sentence explanation of exactly why this specific outcome was predicted.",
      "approval_probability": 62,
      "approval_probability_reason": "Moderate chance of approval based on policy terms.",
      "missing_requirements": ["Medical certificate", "Cancellation proof", "Non-refundable ticket invoice"],
      "confidence_score": 85,
      "confidence_factors": ["Accident coverage found", "Policy active", "No exclusion matched", "Required coverage section detected"],
      "risk_level": "Low Risk" | "Medium Risk" | "High Risk",
      "risk_evaluation": ["No major exclusion detected", "Covered event identified", "Standard claim scenario"],
      "policy_clause_used": {{
        "clause_text": "\"Damage to Own Vehicle caused by accidental collision is covered.\"",
        "source": "Section 4.2 – Own Damage Coverage"
      }},
      "hidden_clause": [
        "Deductible Amount Applies",
        "Claim must be reported within 48 hours",
        "Repair must be done at authorized garage"
      ],
      "recommended_actions": [
        "Capture vehicle damage photos",
        "Inform insurer immediately",
        "Obtain repair estimate",
        "Keep claim documents ready"
      ],
      "claim_analysis_summary": "Your claim may be approved if the illness is proven to be sudden and not related to any pre-existing condition. Please provide the required documents for further evaluation.",
      "granular_coverage_breakdown": {{
        "fully_covered": ["Accident Damage", "Third Party Liability"],
        "subject_to_sub_limits": ["Deductible Applies", "Towing Charges Limit"],
        "out_of_scope_excluded": ["Driving Under Influence", "Mechanical Breakdown"]
      }},
      "strategic_enhancements": [
        {{
          "action": "Report the accident within 48 hours.",
          "expected_impact": "Reduces claim rejection risk."
        }},
        {{
          "action": "Upload damage photographs and repair estimate.",
          "expected_impact": "Improves claim processing speed."
        }}
      ]
    }}
    
    Claim Scenario:
    {req.scenario}
    """
    
    response = analyze_policy(prompt, context)
    try:
        return extract_json(response)
    except ValueError as ve:
        return {"error": str(ve), "raw": response}
    except Exception as e:
        logger.error(f"Claim Outcome JSON parse error: {e}")
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
