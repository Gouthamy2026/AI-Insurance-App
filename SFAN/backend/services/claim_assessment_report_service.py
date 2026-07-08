import json
from fastapi import HTTPException
from pydantic import ValidationError
from backend.services.pinecone_service import get_pinecone_index
from backend.services.embedding_service import get_embedding
from backend.services.groq_service import generate_completion
from backend.schemas.claim_assessment_report import ClaimAssessmentRequest, ClaimAssessmentResponse

class PineconeRetrievalError(Exception):
    pass

class GroqInferenceError(Exception):
    pass

def generate_claim_assessment_report(request: ClaimAssessmentRequest) -> ClaimAssessmentResponse:
    # 1. Generating Embeddings
    try:
        query_vector = get_embedding(request.scenario_description)
    except Exception as e:
        raise PineconeRetrievalError("AI embedding service unavailable.")
        
    # 2. Vector Retrieval with Metadata Filtering
    index = get_pinecone_index()
    if not index:
        raise PineconeRetrievalError("Database Unreachable.")
        
    try:
        # Note: the user asked to filter by provider and policy_type (namespace)
        query_response = index.query(
            namespace=request.policy_type,
            vector=query_vector,
            filter={"provider": request.insurance_provider},
            top_k=5,
            include_metadata=True
        )
    except Exception as e:
        raise PineconeRetrievalError(f"Pinecone query failed: {e}")
        
    matches = query_response.get("matches", [])
    
    # 3. Context Validation
    if not matches:
        raise ValueError("No applicable policy clauses found for this scenario.")
        
    context_text = "\n\n".join([f"Clause (Score: {m.get('score', 0):.2f}): {m['metadata'].get('text', '')}" for m in matches])
    
    # 4. Prompt Construction
    system_prompt = """You are an elite Enterprise Claim Assessment Intelligence AI. 
Your objective is to generate a professional, structured insurance claim assessment report using ONLY the provided Pinecone clauses.
Do NOT hallucinate data. Do NOT use placeholders (e.g., N/A, Unknown). If data is missing, display a graceful, specific explanation (e.g., 'Information not available in the provided clauses').
Output your response STRICTLY as valid JSON matching this schema:
{
    "claim_summary": "string",
    "claim_eligibility_review": "string",
    "approval_probability": "string",
    "risk_analysis": "string",
    "policy_coverage_review": "string (MUST BE DIRECT QUOTES/DATA FROM PINECONE)",
    "compliance_review": "string",
    "documentation_checklist": ["string", "string"],
    "ai_recommendations": "string",
    "final_assessment": "string"
}"""

    user_prompt = f"""
## User Claim Input
Claim Type: {request.claim_type}
Policy Category: {request.policy_type}
Provider: {request.insurance_provider}
Scenario: {request.scenario_description}

## Retrieved Policy Context
{context_text}

Analyze the claim against the context and generate the JSON report.
"""

    # 5. Groq Inference
    try:
        response_text = generate_completion(
            prompt=user_prompt, 
            system_prompt=system_prompt, 
            model="llama-3.1-8b-instant"
        )
    except Exception as e:
        raise GroqInferenceError("AI Analysis Failed. Please try again.")

    # 6. Parse JSON and Validate output using Pydantic model
    try:
        # Extract JSON if the model wrapped it in markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(response_text)
        return ClaimAssessmentResponse(**data)
    except (json.JSONDecodeError, ValidationError) as e:
        raise GroqInferenceError("AI Analysis Failed. Invalid output format received.")
