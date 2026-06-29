from pinecone import Pinecone
from fastapi import HTTPException
from backend.core.config import settings

def get_pinecone_client():
    if not settings.PINECONE_API_KEY:
        raise HTTPException(status_code=500, detail="Missing configuration: PINECONE_API_KEY is not set in the environment variables.")
    return Pinecone(api_key=settings.PINECONE_API_KEY)

def get_pinecone_index():
    pc = get_pinecone_client()
    return pc.Index(settings.PINECONE_INDEX)

def get_namespaces():
    index = get_pinecone_index()
    if not index:
        return {}
    stats = index.describe_index_stats()
    return stats.get("namespaces", {})

def query_vectors(query_vector, namespace, top_k=5):
    index = get_pinecone_index()
    if not index:
        return {"matches": []}
    return index.query(
        namespace=namespace,
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )

from concurrent.futures import ThreadPoolExecutor

def query_vectors_multi_namespace(query_vector, namespaces: list[str], top_k_per_namespace=10):
    index = get_pinecone_index()
    if not index:
        return {"matches": []}
    
    def _query(ns):
        return index.query(
            namespace=ns,
            vector=query_vector,
            top_k=top_k_per_namespace,
            include_metadata=True
        )
        
    all_matches = []
    with ThreadPoolExecutor(max_workers=min(len(namespaces) or 1, 10)) as executor:
        results = list(executor.map(_query, namespaces))
        for r in results:
            if "matches" in r:
                all_matches.extend(r["matches"])
                
    # Sort globally by score descending
    all_matches.sort(key=lambda x: x.get("score", 0), reverse=True)
    return {"matches": all_matches}
