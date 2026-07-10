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
    scenario_description: str = Field("", max_length=2000)

    @validator('*', pre=True)
    def check_not_empty(cls, v, field):
        if field.name != 'scenario_description' and (not v or not str(v).strip()):
            raise ValueError(f'{field.name} cannot be null, empty, or whitespace-only')
        return str(v).strip() if v else ""

def expand_condition(condition: str) -> str:
    """Condition Expansion Engine mapping to insurance search keywords."""
    c = condition.lower()
    if "heart" in c or "cardiac" in c or "angioplasty" in c:
        return f"{condition} cardiac treatment angioplasty coronary artery disease stent implantation cardiac surgery cardiovascular procedure"
    elif "pregnan" in c or "matern" in c or "delivery" in c:
        return f"{condition} maternity delivery cesarean newborn cover maternity benefit"
    elif "cancer" in c or "oncol" in c or "tumor" in c:
        return f"{condition} cancer treatment chemotherapy oncology radiation therapy"
    elif "diabet" in c or "insulin" in c:
        return f"{condition} diabetes insulin diabetic complications"
    else:
        return condition

@router.post("/verify")
def verify_health_coverage_hub(request: HealthHubVerificationRequest):
    # Step 1, 2, 3: Collect, Validate, and Sanitize Inputs
    policy_type = request.policy_type
    provider = request.insurance_provider
    condition = request.medical_condition
    treatment = request.treatment_procedure
    scenario = request.scenario_description

    logger.info(f"Health Verification Hub Request - Provider: {provider}, Policy Type: {policy_type}, Condition: {condition}")

    # Step 4: Extract Coverage Keywords (Condition Expansion Engine)
    expanded_keywords = expand_condition(condition)
    query_text = f"Provider: {provider}, Policy Type: {policy_type}, Medical Condition: {expanded_keywords}, Treatment: {treatment}, Scenario: {scenario}"

    # Step 5: Generate Embeddings
    logger.info("Generating embedding for Health Verification Hub query...")
    try:
        embedding = get_embedding(query_text)
    except Exception as e:
        logger.error(f"Embedding Failure: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding for the input scenario.")

    # Step 6: Search Pinecone Namespace
    search_namespaces = ["health_policy"] # Restricting strictly to health_policy
    logger.info(f"Searching Pinecone namespaces: {search_namespaces}")
    try:
        # Step 7 & 8: Retrieve Relevant Policy Clauses
        # Retrieve 40 chunks total
        search_results = query_vectors_multi_namespace(embedding, namespaces=search_namespaces, top_k_per_namespace=40)
        matches = search_results.get("matches", [])
        logger.info(f"Retrieved {len(matches)} documents from Pinecone.")
    except Exception as e:
        logger.error(f"Pinecone Timeout/Error: {e}")
        raise HTTPException(status_code=503, detail="Pinecone retrieval timeout or service unavailable.")

    # Step 9: Validate Retrieved Evidence and Rerank
    if not matches:
        # Failsafe Policy
        return generate_failsafe_report()

    # Reranking by selecting top 10 with highest score
    valid_matches = sorted(matches, key=lambda x: x.get("score", 0), reverse=True)
    
    # Filter low-relevance chunks and limit to top 10
    high_relevance_matches = [m for m in valid_matches if m.get("score", 0) > 0.65][:10]

    if not high_relevance_matches:
        # Failsafe Policy
        logger.warning("No matches passed the relevance threshold.")
        return generate_failsafe_report()

    # Remove duplicates based on text content
    context_parts = []
    seen_texts = set()
    for match in high_relevance_matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "").strip()
        if text and text not in seen_texts:
            seen_texts.add(text)
            context_parts.append(text)
    
    context_string = "\n\n".join(context_parts)
    
    if not context_string.strip():
        # Failsafe Policy
        return generate_failsafe_report()

    # Step 10: Construct Groq Prompt
    system_prompt = """You are an Elite Senior Enterprise Health Insurance Verification Architect.

IMPORTANT RULES:
1. Never provide generic hospitalization answers if disease-specific evidence exists.
2. First identify:
   - Medical Condition
   - Treatment
3. Search retrieved context for:
   - Coverage clauses
   - Exclusions
   - Waiting periods
   - Sub-limits
   - Special conditions
4. If no condition-specific evidence exists, return: "Condition-specific coverage information could not be located in the policy documents."
5. Do not assume coverage.
6. Use only retrieved policy evidence.
7. You must generate a structured JSON output with the exact keys below.

You MUST return a valid JSON object matching exactly this structure:
{
  "Health Scenario Summary": "string",
  "Coverage Assessment": "string (Likely Covered | Partially Covered | Coverage Unclear | Likely Not Covered)",
  "Relevant Policy Evidence": "string (bullet points)",
  "Waiting Period Analysis": "string",
  "Coverage Exclusions & Limitations": "string",
  "Coverage Risk Factors": "string",
  "Documentation Requirements": "string",
  "Coverage Recommendations": "string",
  "Final Eligibility Assessment": "string (High Eligibility | Moderate Eligibility | Low Eligibility | Insufficient Evidence)"
}

Do not include any Markdown code block delimiters (e.g., ```json) in your overall output. Output strictly the JSON.
"""

    user_prompt = f"<context>\n{context_string}\n</context>\n\n<scenario>\n{query_text}\n</scenario>"

    # Step 11: Generate Structured JSON Report
    logger.info("Initiating Groq reasoning for Health Verification Hub.")
    try:
        completion = generate_completion(prompt=user_prompt, system_prompt=system_prompt, model="llama-3.3-70b-versatile")
        logger.info("Groq reasoning completed.")
    except Exception as e:
        logger.error(f"Groq Timeout/Error: {e}")
        raise HTTPException(status_code=502, detail="Groq reasoning engine timeout or failure.")

    # Step 12: Validate JSON
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
            "Health Scenario Summary",
            "Coverage Assessment",
            "Relevant Policy Evidence",
            "Waiting Period Analysis",
            "Coverage Exclusions & Limitations",
            "Coverage Risk Factors",
            "Documentation Requirements",
            "Coverage Recommendations",
            "Final Eligibility Assessment"
        ]
        
        for key in required_keys:
            if key not in report_data:
                logger.error(f"Missing '{key}' key in Groq output.")
                raise HTTPException(status_code=500, detail=f"Malformed JSON: Missing required key '{key}'")
                
    except json.JSONDecodeError as e:
        logger.error(f"JSON Validation Error: {e} - Content: {completion}")
        raise HTTPException(status_code=500, detail="Malformed JSON returned by the reasoning engine.")

    # Step 14: Store Audit Log
    logger.info(f"Audit Log: Health Verification Hub successfully generated report for {provider} - {condition}")

    # Step 13: Render Report (Return structured JSON)
    return report_data

def generate_failsafe_report():
    logger.info("Failsafe Policy Triggered: INSUFFICIENT POLICY EVIDENCE")
    return {
        "Health Scenario Summary": "Relevant policy clauses for the selected condition and treatment could not be located.",
        "Coverage Assessment": "Coverage Unclear",
        "Relevant Policy Evidence": "No evidence retrieved.",
        "Waiting Period Analysis": "No evidence retrieved.",
        "Coverage Exclusions & Limitations": "No evidence retrieved.",
        "Coverage Risk Factors": "No evidence retrieved.",
        "Documentation Requirements": "No evidence retrieved.",
        "Coverage Recommendations": "Review complete policy wording or contact insurer.",
        "Final Eligibility Assessment": "INSUFFICIENT POLICY EVIDENCE"
    }
