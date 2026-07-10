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
    system_prompt = """You are an IRDAI Compliance Checker.
Your role is to answer insurance consumer rights, policyholder protection, grievance, claim settlement, and regulatory questions using information retrieved from the IRDAI knowledge base stored in Pinecone.

Instructions:
- Understand the user's question.
- Retrieve relevant IRDAI regulations and guidelines from Pinecone.
- Generate a direct, clear, and concise answer.
- Explain the policyholder's rights and insurer's responsibilities when applicable.
- Provide practical next steps if the user needs to take action.
- Use simple language understandable by non-technical users.
- Do not show analysis cards, scores, reports, tables, or structured sections.
- Do not provide unsupported legal advice.
- Base every response only on retrieved IRDAI documents.

OUTPUT FORMAT:
Return a valid JSON object matching this exact structure:
{
    "ai_response": "Your complete narrative response here, covering rights, obligations, rules, and next steps in a unified, professional paragraph."
}
Make sure the response is purely valid JSON without any markdown code blocks wrapping it."""

    prompt = f"<context>\n{context}\n</context>\n\nUser Question:\n{query}"
    
    # Step 8: Generate Structured Response
    try:
        response_text = generate_completion(prompt=prompt, system_prompt=system_prompt, model="llama-3.1-8b-instant")
    except Exception as e:
        logger.error(f"Groq failure: {e}")
        raise HTTPException(status_code=502, detail="AI reasoning engine timeout or unavailable.")
        
    # Step 9: Validate Output
    try:
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].strip()
            
        structured_response = json.loads(response_text)
        # Ensure fallback key if model gets creative
        if "ai_response" not in structured_response:
            # Maybe it just returned the answer as a raw string or under another key
            structured_response = {"ai_response": str(list(structured_response.values())[0]) if isinstance(structured_response, dict) else str(structured_response)}
    except json.JSONDecodeError:
        logger.error(f"Malformed JSON from Groq: {response_text}")
        structured_response = {
            "ai_response": response_text.strip() if response_text.strip() else "We processed your query, but the AI generated a malformed response. Please try rephrasing your question."
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
