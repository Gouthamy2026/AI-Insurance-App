from fastapi import HTTPException
from groq import Groq
from backend.core.config import settings

def get_groq_client():
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Missing configuration: GROQ_API_KEY is not set in the environment variables.")
    return Groq(api_key=settings.GROQ_API_KEY)

def generate_completion(prompt: str, system_prompt: str = "You are an Insurance Intelligence API.", model: str = "llama-3.1-8b-instant"):
    client = get_groq_client()
    
    response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=model,
    )
    return response.choices[0].message.content

def analyze_policy(query: str, context: str, model: str = "llama-3.1-8b-instant"):
    if not context:
        return "Insufficient evidence found in the insurance knowledge base."
    
    prompt = f"""
    Based ONLY on the following context, answer the user query.
    If the context does not contain the information, respond exactly with:
    "Insufficient evidence found in the insurance knowledge base."
    
    Context:
    {context}
    
    Query:
    {query}
    """
    return generate_completion(prompt, model=model)
