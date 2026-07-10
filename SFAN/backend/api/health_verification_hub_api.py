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

    query_text = f"Provider: {provider}, Policy Type: {policy_type}, Medical Condition: {condition}, Treatment: {treatment}, Scenario: {scenario}"

    # Step 4: Generate Embeddings
    logger.info("Generating embedding for Health Verification Hub query...")
    try:
        embedding = get_embedding(query_text)
    except Exception as e:
        logger.error(f"Embedding Failure: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding for the input scenario.")

    # Step 5: Search Pinecone
    search_namespaces = ["health_policy", "regulatory_governance"]
    logger.info(f"Searching Pinecone namespaces: {search_namespaces}")
    try:
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=5)
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
    system_prompt = """You are an Elite Senior Enterprise Health Insurance Verification Architect.
Your objective is to evaluate the medical scenario strictly based on the retrieved insurance policy context.
Never generate answers from your prior model memory. If the provided context does not contain the answer, you must state that information is missing.
Never hallucinate.

You must generate a single, professional Health Verification Report in Markdown format.
CRITICAL RULES:
1. No duplicated information. A policy clause may appear only once.
2. Do not force fixed sections if evidence is insufficient.
3. If retrieval is small (1-2 clauses), return a short direct answer, the supporting clause, and a brief conclusion.
4. If retrieval is rich, generate a detailed dynamic evidence-based analysis, the relevant policy evidence as bullet points, and a conclusion answering the user's query.
5. If evidence is missing, simply state: "Relevant policy evidence could not be located in the retrieved documents. A verification decision cannot be made from the available policy information."

You MUST return a valid JSON object matching exactly this structure:
{
  "report": "string containing the full markdown formatted report"
}

Do not include any Markdown code block delimiters (e.g., ```json) in your overall output. Output strictly the JSON.
"""

    user_prompt = f"<context>\n{context_string}\n</context>\n\n<scenario>\n{query_text}\n</scenario>"

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
        
        if "report" not in report_data:
            logger.error("Missing 'report' key in Groq output.")
            raise HTTPException(status_code=500, detail="Malformed JSON: Missing required key 'report'")
                
    except json.JSONDecodeError as e:
        logger.error(f"JSON Validation Error: {e} - Content: {completion}")
        raise HTTPException(status_code=500, detail="Malformed JSON returned by the reasoning engine.")

    # Step 12: Store Audit Log
    logger.info(f"Audit Log: Health Verification Hub successfully generated report for {provider} - {condition}")

    # Step 10: Generate Verification Report (Return structured JSON)
    return report_data
