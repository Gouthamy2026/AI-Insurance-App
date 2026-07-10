import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, constr
from backend.services.embedding_service import get_embedding
from backend.services.pinecone_service import get_namespaces, query_vectors_multi_namespace
from backend.services.groq_service import generate_completion

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assessment", tags=["Claim Assessment"])

@router.get("/config")
def get_assessment_config():
    try:
        namespaces_dict = get_namespaces()
        available_namespaces = list(namespaces_dict.keys())
        
        # Map raw namespaces to user-friendly names
        namespace_mapping = {
            "health_policy": "Health Insurance Policies",
            "vehicle_policy": "Vehicle Insurance Policies",
            "travel_policy": "Travel Insurance Policies",
            "life_wealth_policy": "Life & Wealth Policies",
            "banking_governance": "Banking Governance",
            "regulatory_governance": "IRDAI Regulatory Governance",
            "home_folder": "Property Insurance Policies"
        }
        
        # Format the namespaces for frontend
        formatted_namespaces = []
        for ns in available_namespaces:
            label = namespace_mapping.get(ns, ns.replace('_', ' ').title())
            formatted_namespaces.append({"value": ns, "label": label})
            
        providers = [
            "SBI General",
            "HDFC ERGO",
            "ICICI Lombard",
            "Kotak Mahindra",
            "IndusInd General",
            "Reliance General",
            "Star Health",
            "IndiaFirst Life",
            "IndusInd Nippon Life",
            "HDFC Life",
            "Apollo Munich Health",
            "Canara HSBC Life",
            "Tata AIG",
            "Zurich Kotak",
            "IRDAI Regulatory Knowledge Base"
        ]
        
        return {
            "namespaces": formatted_namespaces,
            "providers": providers
        }
    except Exception as e:
        logger.error(f"Failed to fetch assessment config: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch configuration")


class AssessmentRequest(BaseModel):
    claim_type: str = Field(..., min_length=3, max_length=100)
    namespace: str = Field(..., min_length=3, max_length=100) # Replaces policy_type conceptually, but let's keep both if needed or rename policy_type to namespace
    insurance_provider: str = Field(..., min_length=2, max_length=100)
    scenario_description: str = Field(..., min_length=10, max_length=2000)

class AssessmentResponse(BaseModel):
    # This matches the new JSON structure required by the prompt
    pass # we don't strictly use this model for returning since we just return the raw dict, but let's keep it clean or remove the strict validation keys if we want to be flexible.
    
# We will just return the dict directly in the endpoint.

@router.post("/generate")
def generate_assessment(request: AssessmentRequest):
    # Step 1 & 2: Collect and validate input (handled by Pydantic)
    # Step 3: Sanitize input
    claim_type = request.claim_type.strip()
    namespace = request.namespace.strip()
    insurance_provider = request.insurance_provider.strip()
    scenario = request.scenario_description.strip()

    logger.info("Request received")
    logger.info(f"Incoming request: generate_assessment - Claim Type: {claim_type}, Namespace: {namespace}, Provider: {insurance_provider}")

    if not all([claim_type, namespace, insurance_provider, scenario]):
        raise HTTPException(status_code=400, detail="Fields cannot be just whitespace.")

    logger.info("Payload validated")
    query_text = f"Claim Type: {claim_type}, Provider: {insurance_provider}, Scenario: {scenario}"

    # Step 4: Generate embedding
    try:
        embedding = get_embedding(query_text)
        logger.info("Embedding generated")
    except Exception as e:
        logger.error(f"Embedding Failure: {e}")
        detail_msg = getattr(e, "detail", str(e))
        raise HTTPException(status_code=500, detail=detail_msg)

    # Step 5 & 6: Search Pinecone and apply filtering
    try:
        # Check if provider is IRDAI, automatically add regulatory_governance
        search_namespaces = [namespace]
        if insurance_provider.lower() == "irdai regulatory knowledge base":
            if "regulatory_governance" not in search_namespaces:
                search_namespaces.append("regulatory_governance")
                
        logger.info("Pinecone query started")
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=5)
        matches = search_results.get("matches", [])
        logger.info(f"Pinecone results count: {len(matches)}")
    except Exception as e:
        logger.error(f"Pinecone Timeout: {e}")
        detail_msg = getattr(e, "detail", str(e))
        raise HTTPException(status_code=503, detail=detail_msg)

    # Step 7: Validate retrieved context
    error_msg = "Unable to retrieve policy evidence from the knowledge base."
    if not matches:
        raise HTTPException(status_code=404, detail=error_msg)
    
    # Filter out low relevance
    valid_matches = [m for m in matches if m.get("score", 0) > 0.70]
    if not valid_matches:
        raise HTTPException(status_code=404, detail=error_msg)

    context_parts = []
    for match in valid_matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if text:
            context_parts.append(text)
    
    context_string = "\n\n".join(context_parts)
    
    if not context_string:
         raise HTTPException(status_code=404, detail=error_msg)

    # Step 8: Construct Groq prompt
    system_prompt = """You are an Elite Enterprise Insurance Claim Assessment AI.
Your objective is to review the provided context and the claim scenario, then output a structured JSON response evaluating the claim.
Never answer from prior knowledge. Every insurance conclusion must originate from retrieved Pinecone documents.
If evidence is unavailable for a specific field, output a specific explanation like "No evidence found in policy documents." instead of Null, N/A, or Unknown.

Respond strictly with valid JSON matching exactly this structure:
{
  "claim_summary": {
    "claim_type": "string",
    "policy_type": "string",
    "insurance_provider": "string",
    "scenario_overview": "string",
    "retrieved_policy_reference": "string",
    "summary": "string"
  },
  "approval_probability": {
    "approval_likelihood_percentage": "string",
    "confidence_level": "string",
    "assessment_summary": "string"
  },
  "risk_assessment": {
    "overall_risk_level": "string",
    "key_risk_factors": ["string"],
    "coverage_concerns": ["string"],
    "policy_restrictions": ["string"],
    "risk_explanation": "string"
  },
  "compliance_findings": {
    "policy_compliance_status": "string",
    "coverage_validation_results": "string",
    "irdai_compliance_observations": "string",
    "regulatory_considerations": "string"
  },
  "required_documents": {
    "required_documents_checklist": ["string"],
    "submitted_documents": ["string"],
    "missing_documents": ["string"],
    "verification_status": "string"
  },
  "ai_recommendations": {
    "recommended_next_actions": ["string"],
    "claim_preparation_guidance": ["string"],
    "policyholder_recommendations": ["string"],
    "risk_mitigation_suggestions": ["string"]
  },
  "final_decision": {
    "likely_outcome": "string",
    "decision_explanation": "string",
    "supporting_reasons": ["string"],
    "overall_confidence_score": "string"
  }
}

Do not include markdown blocks, only return raw valid JSON. Do not hallucinate."""

    user_prompt = f"<context>\n{context_string}\n</context>\n\n<scenario>\n{query_text}\n</scenario>"

    # Step 9: Generate structured JSON
    logger.info("Groq request started")
    try:
        completion = generate_completion(prompt=user_prompt, system_prompt=system_prompt, model="llama-3.3-70b-versatile")
        logger.info("Groq response received")
    except Exception as e:
        logger.error(f"Groq Timeout: {e}")
        detail_msg = getattr(e, "detail", str(e))
        raise HTTPException(status_code=502, detail=detail_msg)

    # Step 10: Validate response
    try:
        # Sometimes LLM might add backticks around JSON
        cleaned_completion = completion.strip()
        if cleaned_completion.startswith("```json"):
            cleaned_completion = cleaned_completion[7:]
        if cleaned_completion.startswith("```"):
            cleaned_completion = cleaned_completion[3:]
        if cleaned_completion.endswith("```"):
            cleaned_completion = cleaned_completion[:-3]
        
        report_data = json.loads(cleaned_completion.strip())
        
        # Ensure all required keys exist
        required_keys = [
            "claim_summary", "approval_probability", "risk_assessment", 
            "compliance_findings", "required_documents", "ai_recommendations", 
            "final_decision"
        ]
        
        for key in required_keys:
            if key not in report_data:
                report_data[key] = {}
                
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e} - Content: {completion}")
        # Recover gracefully
        report_data = {
            "error": "Unexpected JSON response from AI. Please try again."
        }
        raise HTTPException(status_code=500, detail=str(e))

    # Step 12: Store audit log
    logger.info("Report generated")
    logger.info(f"Audit Log: Successfully generated assessment for claim_type={claim_type}, provider={insurance_provider}")

    # Step 11: Return response
    return report_data
