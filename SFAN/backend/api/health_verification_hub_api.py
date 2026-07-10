import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

from backend.services.embedding_service import get_embedding
from backend.services.pinecone_service import query_vectors_multi_namespace
from backend.services.groq_service import generate_completion

logger = logging.getLogger(__name__)

def expand_condition(condition: str, treatment: str) -> str:
    combined = f"{condition.lower()} {treatment.lower()}"
    expansion = set()
    
    if any(x in combined for x in ["heart", "cardiac", "angioplasty", "cabg"]):
        expansion.update(["cardiac treatment", "coronary artery disease", "stent implantation", "cardiovascular procedures", "hospitalization benefits", "day-care procedures"])
    
    if any(x in combined for x in ["cancer", "oncology", "chemo", "radiation", "tumor"]):
        expansion.update(["oncology", "chemotherapy", "radiation therapy", "malignant tumor", "hospitalization"])

    if any(x in combined for x in ["kidney", "renal", "dialysis"]):
        expansion.update(["renal failure", "dialysis", "chronic kidney disease", "day-care procedures"])

    if any(x in combined for x in ["eye", "cataract", "vision", "lasik"]):
        expansion.update(["cataract surgery", "day-care procedures", "vision correction", "lens replacement"])

    if not expansion:
        return f"{condition} {treatment}"
        
    return f"{condition} {treatment} " + " ".join(list(expansion))

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

    # Apply intelligent condition expansion to improve retrieval accuracy
    expanded_search_terms = expand_condition(condition, treatment)
    search_query = f"{expanded_search_terms} coverage exclusions waiting period {provider}"

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

    # Search Pinecone - Fetch top 40 and we will filter down
    search_namespaces = ["health_policy"]
    logger.info(f"Searching Pinecone namespaces: {search_namespaces} with top_k=40")
    try:
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=40)
        matches = search_results.get("matches", [])
        logger.info(f"Retrieved {len(matches)} documents from Pinecone.")
    except Exception as e:
        logger.error(f"Pinecone Timeout/Error: {e}")
        raise HTTPException(status_code=503, detail="Pinecone retrieval timeout or service unavailable.")

    # Filter and rank strictly to top 10 chunks
    valid_matches = [m for m in matches if m.get("score", 0) > 0.65]
    valid_matches = sorted(valid_matches, key=lambda x: x.get("score", 0), reverse=True)[:10]
    
    failsafe_response = {
        "Health Scenario Summary": f"Assessment for {treatment} related to {condition} under {provider} ({policy_type}).",
        "Coverage Assessment": "INSUFFICIENT POLICY EVIDENCE",
        "Relevant Policy Evidence": "The Pinecone vector database could not locate sufficient policy clauses matching this specific medical condition or treatment.",
        "Waiting Period Analysis": "Unknown due to lack of retrieved evidence.",
        "Exclusions and Limitations": "Unknown due to lack of retrieved evidence.",
        "Coverage Risk Factors": "High Risk - Coverage rules could not be verified in the retrieved documents.",
        "Documentation Requirements": "Please consult the full policy wording or contact the insurer directly.",
        "Coverage Recommendations": "We recommend escalating this query to an insurance advisor for manual verification.",
        "Final Eligibility Assessment": "NOT VERIFIED"
    }

    if not valid_matches:
        logger.warning("Failsafe triggered: No valid matches above threshold.")
        return failsafe_response

    context_parts = []
    for match in valid_matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if text and text not in context_parts:
            context_parts.append(text)
    
    context_string = "\n\n".join(context_parts)
    
    if not context_string.strip():
         logger.warning("Failsafe triggered: Context string empty.")
         return failsafe_response

    # Step 7: Build Groq Prompt
    system_prompt = """You are an Elite Enterprise Health Coverage Verification Engine.

IMPORTANT RULES:
1. Provide a DEFINITIVE, DIRECT ANSWER based EXCLUSIVELY on retrieved evidence. Do not guess or hallucinate.
2. First identify: Medical Condition and Treatment.
3. Search retrieved context specifically for: Coverage clauses, Exclusions, Waiting periods, Sub-limits, Special conditions.
4. If no condition-specific evidence exists in the provided context, state: "Condition-specific coverage information could not be located in the policy documents."
5. Ensure each JSON section provides unique value.

You MUST return a valid JSON object matching exactly this structure:
{
  "Health Scenario Summary": "string",
  "Coverage Assessment": "string",
  "Relevant Policy Evidence": "string",
  "Waiting Period Analysis": "string",
  "Exclusions and Limitations": "string",
  "Coverage Risk Factors": "string",
  "Documentation Requirements": "string",
  "Coverage Recommendations": "string",
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
        
        required_keys = [
            "Health Scenario Summary", "Coverage Assessment", "Relevant Policy Evidence", 
            "Waiting Period Analysis", "Exclusions and Limitations", "Coverage Risk Factors", 
            "Documentation Requirements", "Coverage Recommendations", "Final Eligibility Assessment"
        ]
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
