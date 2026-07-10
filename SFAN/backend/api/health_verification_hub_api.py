import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

from backend.services.embedding_service import get_embedding
from backend.services.pinecone_service import query_vectors_multi_namespace
from backend.services.groq_service import generate_completion

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health-verification-hub", tags=["Health Verification Hub"])

class HealthHubVerificationRequest(BaseModel):
    policy_type: str = Field(..., min_length=1, max_length=100)
    insurance_provider: str = Field(..., min_length=1, max_length=100)
    medical_condition: str = Field(..., min_length=1, max_length=150)
    treatment_procedure: str = Field(..., min_length=1, max_length=150)
    scenario_description: str = Field(..., min_length=1, max_length=2000)

    @validator('*', pre=True)
    def check_not_empty(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Field cannot be null, empty, or whitespace-only')
        return str(v).strip()

@router.post("/verify")
def verify_health_coverage_hub(request: HealthHubVerificationRequest):
    # Step 1: Collect Inputs (handled by Pydantic)
    # Step 2: Validate Inputs (handled by Pydantic validator)
    
    # Step 3: Sanitize Inputs
    policy_type = request.policy_type
    provider = request.insurance_provider
    condition = request.medical_condition
    treatment = request.treatment_procedure
    scenario = request.scenario_description

    logger.info(f"Health Verification Hub Request - Provider: {provider}, Policy Type: {policy_type}, Condition: {condition}")

    # Create a highly targeted search query to maximize Pinecone retrieval precision
    search_query = f"{condition} {treatment} coverage exclusions waiting period {provider}"

    # We keep the full text for the LLM to understand the context
    full_scenario_text = f"Provider: {provider}\nPolicy Type: {policy_type}\nMedical Condition: {condition}\nTreatment: {treatment}\nScenario: {scenario}"

    # Step 4: Generate Embeddings
    logger.info("Generating embedding for Health Verification Hub query...")
    try:
        # Use the targeted search query for embeddings, not the noisy full text
        embedding = get_embedding(search_query)
    except Exception as e:
        logger.error(f"Embedding Failure: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding for the input scenario.")

    # Search Pinecone - Focus strictly on health_policy with top_k=7 as requested
    search_namespaces = ["health_policy"]
    logger.info(f"Searching Pinecone namespaces: {search_namespaces} with top_k=7")
    try:
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=7)
        matches = search_results.get("matches", [])
        logger.info(f"Retrieved {len(matches)} documents from Pinecone.")
    except Exception as e:
        logger.error(f"Pinecone Timeout/Error: {e}")
        raise HTTPException(status_code=503, detail="Pinecone retrieval timeout or service unavailable.")

    # Step 6: Validate Retrieved Context
    if not matches:
        raise HTTPException(status_code=404, detail="No relevant policy documents found in the knowledge base. Cannot generate health verification.")

    valid_matches = [m for m in matches if m.get("score", 0) > 0.65] # Using reasonable threshold
    if not valid_matches:
        raise HTTPException(status_code=404, detail="Retrieved documents are of low relevance. Cannot generate reliable health verification.")

    context_parts = []
    for match in valid_matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if text:
            context_parts.append(text)
    
    context_string = "\n\n".join(context_parts)
    
    if not context_string.strip():
         raise HTTPException(status_code=404, detail="No readable text context found in the knowledge base.")

    # Step 7: Build Groq Prompt
    system_prompt = """You are a highly definitive Health Coverage Verification Engine.

IMPORTANT RULES:
1. Provide a DEFINITIVE, DIRECT ANSWER. Do not repeat generic insurance jargon.
2. Start "Coverage Status" with a clear "YES", "NO", or "PARTIAL/CONDITIONAL", followed by a brief, definitive explanation of whether the coverage is possible or not.
3. First identify:
   - Medical Condition
   - Treatment
4. Search retrieved context specifically for:
   - Coverage clauses
   - Exclusions
   - Waiting periods
   - Sub-limits
   - Special conditions
5. If no condition-specific evidence exists in the provided context, you MUST explicitly state: "Condition-specific coverage information could not be located in the policy documents." Do NOT hallucinate or guess.
6. Use ONLY retrieved policy evidence.
7. Ensure each JSON section provides unique value. Do not repeat the exact same information across multiple keys.

You MUST return a valid JSON object matching exactly this structure:
{
  "Coverage Status": "string",
  "Relevant Evidence": "string",
  "Waiting Period Analysis": "string",
  "Exclusions": "string",
  "Final Eligibility Assessment": "string"
}

Do not include any Markdown code block delimiters (e.g., ```json) in your overall output. Output strictly the JSON.
"""

    user_prompt = f"<context>\n{context_string}\n</context>\n\n<scenario>\n{full_scenario_text}\n</scenario>"

    # Step 8: Generate Structured JSON
    logger.info("Initiating Groq reasoning for Health Verification Hub.")
    try:
        completion = generate_completion(prompt=user_prompt, system_prompt=system_prompt, model="llama-3.3-70b-versatile")
        logger.info("Groq reasoning completed.")
    except Exception as e:
        logger.error(f"Groq Timeout/Error: {e}")
        raise HTTPException(status_code=502, detail="Groq reasoning engine timeout or failure.")

    # Step 9: Validate JSON
    try:
        cleaned_completion = completion.strip()
        if cleaned_completion.startswith("```json"):
            cleaned_completion = cleaned_completion[7:]
        if cleaned_completion.startswith("```"):
            cleaned_completion = cleaned_completion[3:]
        if cleaned_completion.endswith("```"):
            cleaned_completion = cleaned_completion[:-3]
        
        report_data = json.loads(cleaned_completion.strip())
        
        required_keys = ["Coverage Status", "Relevant Evidence", "Waiting Period Analysis", "Exclusions", "Final Eligibility Assessment"]
        for key in required_keys:
            if key not in report_data:
                logger.error(f"Missing '{key}' key in Groq output.")
                raise HTTPException(status_code=500, detail=f"Malformed JSON: Missing required key '{key}'")
                
    except json.JSONDecodeError as e:
        logger.error(f"JSON Validation Error: {e} - Content: {completion}")
        raise HTTPException(status_code=500, detail="Malformed JSON returned by the reasoning engine.")

    # Step 12: Store Audit Log
    logger.info(f"Audit Log: Health Verification Hub successfully generated report for {provider} - {condition}")

    # Step 10: Generate Verification Report (Return structured JSON)
    return report_data
