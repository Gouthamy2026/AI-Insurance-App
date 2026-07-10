import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.services.embedding_service import get_embedding
from backend.services.pinecone_service import query_vectors_multi_namespace
from backend.services.groq_service import generate_completion

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health-verification", tags=["Health Coverage Verification"])

class HealthVerificationRequest(BaseModel):
    insurance_provider: str = Field(..., min_length=2, max_length=100)
    namespace: str = Field(..., min_length=2, max_length=100)
    medical_condition: str = Field(..., min_length=2, max_length=100)
    treatment_procedure: str = Field(..., min_length=2, max_length=100)
    treatment_description: str = Field(..., min_length=10, max_length=2000)

@router.post("/verify")
def verify_health_coverage(request: HealthVerificationRequest):
    # Step 1 & 2: Collect and validate input (handled by Pydantic)
    # Step 3: Sanitize input
    provider = request.insurance_provider.strip()
    namespace = request.namespace.strip()
    condition = request.medical_condition.strip()
    treatment = request.treatment_procedure.strip()
    description = request.treatment_description.strip()

    logger.info(f"Incoming request: health_verification - Provider: {provider}, Namespace: {namespace}, Condition: {condition}, Treatment: {treatment}")

    if not all([provider, namespace, condition, treatment, description]):
        raise HTTPException(status_code=400, detail="Fields cannot be empty or whitespace.")

    query_text = f"Provider: {provider}, Policy: {namespace}, Condition: {condition}, Treatment: {treatment}, Details: {description}"

    # Step 4: Generate embedding
    logger.info("Generating embedding for health verification...")
    try:
        embedding = get_embedding(query_text)
        logger.info("Generated embedding successfully.")
    except Exception as e:
        logger.error(f"Embedding Failure: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding for the query.")

    # Step 5 & 6: Search Pinecone and apply filtering
    try:
        search_namespaces = [namespace]
        if provider.lower() == "irdai regulatory knowledge base":
            if "regulatory_governance" not in search_namespaces:
                search_namespaces.append("regulatory_governance")
                
        logger.info(f"Pinecone query across namespaces: {search_namespaces}")
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=5)
        matches = search_results.get("matches", [])
        logger.info(f"Retrieved documents count: {len(matches)}")
    except Exception as e:
        logger.error(f"Pinecone Timeout: {e}")
        raise HTTPException(status_code=503, detail="Unable to retrieve policy evidence from the knowledge base.")

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
    system_prompt = """You are an Elite Enterprise Health Coverage Verification AI.
Your objective is to review the provided context and the patient's medical scenario, then output a structured JSON response evaluating the health coverage.
Never answer from prior knowledge. Every insurance conclusion must originate from retrieved Pinecone documents.
If evidence is unavailable for a specific field, output a specific explanation like "No evidence found in policy documents." instead of Null, N/A, or Unknown.

Respond strictly with valid JSON matching exactly this structure:
{
  "health_coverage_summary": {
    "insurance_provider": "string",
    "policy_category": "string",
    "medical_condition": "string",
    "treatment_procedure": "string",
    "scenario_overview": "string",
    "summary": "string"
  },
  "treatment_eligibility_review": {
    "is_eligible": "string",
    "eligibility_explanation": "string",
    "policy_clauses_referenced": ["string"]
  },
  "coverage_verification_status": {
    "overall_status": "string (Covered / Partially Covered / Requires Review / Not Covered)",
    "status_explanation": "string"
  },
  "waiting_period_and_conditions": {
    "applicable_waiting_periods": "string",
    "special_conditions": ["string"],
    "eligibility_requirements": ["string"]
  },
  "medical_exclusions_and_risks": {
    "identified_exclusions": ["string"],
    "limitations": ["string"],
    "pre_existing_disease_impact": "string",
    "risk_factors": ["string"]
  },
  "required_medical_documents": {
    "verification_checklist": ["string"],
    "claim_processing_documents": ["string"]
  },
  "final_coverage_assessment": {
    "conclusion": "string",
    "confidence_level": "string",
    "coverage_outlook": "string",
    "ai_recommendations": ["string"]
  }
}

Do not include markdown blocks, only return raw valid JSON. Do not hallucinate."""

    user_prompt = f"<context>\n{context_string}\n</context>\n\n<scenario>\n{query_text}\n</scenario>"

    # Step 9: Generate structured JSON
    logger.info("Groq request initiated for health verification.")
    try:
        completion = generate_completion(prompt=user_prompt, system_prompt=system_prompt, model="llama-3.3-70b-versatile")
        logger.info("Final response generation completed by Groq.")
    except Exception as e:
        logger.error(f"Groq Timeout: {e}")
        raise HTTPException(status_code=502, detail="Unable to generate health verification at this time.")

    # Step 10: Validate response
    try:
        cleaned_completion = completion.strip()
        if cleaned_completion.startswith("```json"):
            cleaned_completion = cleaned_completion[7:]
        if cleaned_completion.startswith("```"):
            cleaned_completion = cleaned_completion[3:]
        if cleaned_completion.endswith("```"):
            cleaned_completion = cleaned_completion[:-3]
        
        report_data = json.loads(cleaned_completion.strip())
        
        required_keys = [
            "health_coverage_summary", "treatment_eligibility_review", "coverage_verification_status", 
            "waiting_period_and_conditions", "medical_exclusions_and_risks", "required_medical_documents", 
            "final_coverage_assessment"
        ]
        
        for key in required_keys:
            if key not in report_data:
                report_data[key] = {}
                
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e} - Content: {completion}")
        raise HTTPException(status_code=500, detail="Unable to parse health verification response.")

    # Step 12: Store audit log
    logger.info(f"Audit Log: Successfully generated health verification for condition={condition}, provider={provider}")

    # Step 11: Return response
    return report_data
