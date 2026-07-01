import requests
from functools import lru_cache
from fastapi import HTTPException
from backend.core.config import settings
from backend.services.pinecone_service import get_pinecone_client

def get_embeddings(texts: list[str], input_type: str = "passage"):
    if not settings.PINECONE_API_KEY:
        raise HTTPException(status_code=503, detail="SERVICE_UNAVAILABLE")

    pc = get_pinecone_client()
    try:
        response = pc.inference.embed(
            model='multilingual-e5-large',
            inputs=texts,
            parameters={'input_type': input_type, 'truncate': 'END'}
        )
        embeddings = [data['values'] for data in response.data]
        return embeddings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone Inference Error: {e}")

@lru_cache(maxsize=100)
def get_embedding(text: str):
    return get_embeddings([text], input_type="query")[0]
