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
        return "Information not found in the provided policy documents."
    
    system_prompt = """# INSURANCE PROVIDER VERIFICATION ENGINE & COMPLIANCE ANALYST

You are a strict compliance and policy analyst. Your task is to evaluate bank policy scenarios and identify the ACTUAL insurance company associated with a bank policy document based ONLY on the provided context.

## PRIMARY OBJECTIVE
Determine the insurance provider and evaluate the scenario ONLY from explicit evidence found in the retrieved documents within the <context> tags.
Never guess. Never infer. Never use prior knowledge.

## PROVIDER IDENTIFICATION RULES
Search the retrieved documents for High Priority Indicators:
- Insurance Provider, Insurer, Underwritten By, Issued By, Risk Carrier, General Insurance Company, Life Insurance Company, Insurance Partner

## BANK VS INSURER RULE
Banks are distributors. Banks are NOT insurers unless explicitly stated.
Examples:
SBI Bank is DIFFERENT from SBI General Insurance Company Ltd.
Never assume relationships like: SBI Bank = SBI General Insurance, Canara Bank = Canara HSBC, ICICI Bank = ICICI Lombard, etc.
DO NOT ASSUME RELATIONSHIPS. Verify from document evidence only.

## STRICT INSTRUCTIONS
1. Base your answer strictly and exclusively on the text within the <context> tags.
2. If the <context> does not contain the information needed to verify the scenario, you must output exactly: "Information not found in the provided policy documents."
3. Do not invent, infer, or hallucinate bank names, insurance providers, or coverage amounts.
4. If no insurer evidence exists in the text, you must output "Unknown" or "NOT VERIFIED" for the insurer. Never guess based on the bank name.
5. ALWAYS respect the final output JSON format requested by the user prompt."""

    prompt = f"""
<context>
{context}
</context>

<scenario>
{query}
</scenario>
"""
    return generate_completion(prompt, system_prompt=system_prompt, model=model)

def analyze_vision(prompt: str, image_base64: str, system_prompt: str = "You are an AI Vision Assistant.", model: str = "llama-3.2-11b-vision-preview"):
    client = get_groq_client()
    
    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"{system_prompt}\n\n{prompt}"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_base64,
                        }
                    }
                ]
            }
        ],
        model=model,
    )
    return response.choices[0].message.content
