from functools import lru_cache
from pinecone import Pinecone
from fastapi import HTTPException
from backend.core.config import settings

def get_embedding_client():
    if not settings.PINECONE_API_KEY:
        raise HTTPException(status_code=500, detail="Missing configuration: PINECONE_API_KEY is not set in the environment variables.")
    return Pinecone(api_key=settings.PINECONE_API_KEY)

def get_embeddings(texts: list[str], input_type: str = "passage"):
    pc = get_embedding_client()
    response = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=texts,
        parameters={"input_type": input_type}
    )
    return [item.values for item in response]

@lru_cache(maxsize=100)
def get_embedding(text: str):
    return get_embeddings([text], input_type="query")[0]
