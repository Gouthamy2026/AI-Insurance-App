import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any

from backend.api.deps import get_current_active_user
from backend.services.embedding_service import get_embedding
from backend.services.pinecone_service import query_vectors
from backend.services.groq_service import generate_completion
from backend.models.account_hub import ActivityLog
from backend.database.config import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/irdai-checker", tags=["irdai_compliance"])
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=10, max_length=1000, description="The compliance query from the user")

@router.post("/analyze")
def analyze_compliance_query(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Step 1 & 2: Collect & Validate Query
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty or whitespace only.")
    
    # Step 3: Sanitize Query (Basic sanitization handled by Pydantic and strip)
    
    # Step 4: Generate Embedding
    try:
        query_vector = get_embedding(query)
    except Exception as e:
        logger.error(f"Embedding failure: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding for the query.")
        
    # Step 5: Search Pinecone
    try:
        search_results = query_vectors(query_vector=query_vector, namespace="regulatory_governance", top_k=5)
    except Exception as e:
        logger.error(f"Pinecone retrieval failure: {e}")
        raise HTTPException(status_code=503, detail="Pinecone service timeout or unavailable.")
        
    # Step 6: Validate Retrieved Context
    matches = search_results.get("matches", [])
    if not matches:
        raise HTTPException(status_code=404, detail="Relevant IRDAI regulatory evidence could not be located for this query.")
        
    # Filter for high relevance if needed, but for now we aggregate text
    context_chunks = []
    for match in matches:
        metadata = match.get("metadata", {})
        text = metadata.get("text", "")
        if text:
            context_chunks.append(text)
            
    if not context_chunks:
        raise HTTPException(status_code=404, detail="Relevant IRDAI regulatory evidence could not be located for this query.")
        
    context = "\n---\n".join(context_chunks)
    
    # Step 7: Construct Groq Prompt
    system_prompt = """You are an elite IRDAI Regulatory Assistant and Consumer Protection Expert. 
Your sole purpose is to answer compliance and policyholder rights questions based STRICTLY on the retrieved IRDAI regulatory context.

STRICT RULES:
1. NEVER hallucinate or use prior knowledge.
2. Every answer MUST be grounded in the provided Pinecone context.
3. If the context does not contain sufficient evidence to answer the user's query, you MUST return a response indicating: "Relevant IRDAI regulatory evidence could not be located for this query."
4. Do not generate report cards, scores, or claim predictions.

OUTPUT FORMAT:
You must return a valid JSON object matching this exact structure:
{
    "compliance_answer": "Direct answer to the user query based on the context.",
    "regulatory_basis": "Relevant IRDAI rules, sections, or regulations cited in the context.",
    "consumer_protection_guidance": "Explanation of available rights and protections.",
    "recommended_next_steps": "Practical, actionable next steps for the user.",
    "important_notes": "Important compliance considerations."
}
Make sure the response is purely valid JSON without any markdown code blocks wrapping it."""

    prompt = f"<context>\n{context}\n</context>\n\n<query>\n{query}\n</query>"
    
    # Step 8: Generate Structured Response
    try:
        response_text = generate_completion(prompt=prompt, system_prompt=system_prompt, model="llama-3.1-8b-instant")
    except Exception as e:
        logger.error(f"Groq failure: {e}")
        raise HTTPException(status_code=502, detail="AI reasoning engine timeout or unavailable.")
        
    # Step 9: Validate Output
    try:
        # Sometimes LLMs wrap JSON in ```json blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].strip()
            
        structured_response = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error(f"Malformed JSON from Groq: {response_text}")
        # Recover gracefully
        structured_response = {
            "compliance_answer": "We processed your query, but the AI generated a malformed response. Please try rephrasing your question.",
            "regulatory_basis": "Error formatting evidence.",
            "consumer_protection_guidance": "N/A",
            "recommended_next_steps": "Please try submitting your query again.",
            "important_notes": "System format error recovered gracefully."
        }
        
    # Step 10 & 11: Store Audit Log
    try:
        log = ActivityLog(user_id=current_user.id, description="IRDAI Compliance Query Executed")
        db.add(log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to save audit log: {e}")
        # Non-fatal error

    return structured_response
