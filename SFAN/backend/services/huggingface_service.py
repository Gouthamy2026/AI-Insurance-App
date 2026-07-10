import requests
import logging
import base64
from backend.services.groq_service import analyze_policy
from backend.core.config import settings

logger = logging.getLogger(__name__)

def analyze_vision_hf(prompt: str, image_base64: str) -> str:
    """
    Sends an image to Hugging Face Vision Models.
    Uses Qwen2-VL-7B-Instruct. If unavailable, falls back to BLIP.
    """
    hf_key = settings.HUGGINGFACE_API_KEY
    if not hf_key:
        logger.error("HUGGINGFACE_API_KEY is not set.")
        raise ValueError("Missing Hugging Face API Key")

    logger.info("Attempting Hugging Face Vision Analysis via Qwen2-VL...")
    
    # Try Qwen2-VL
    API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2-VL-7B-Instruct/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {hf_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "Qwen/Qwen2-VL-7B-Instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_base64
                        }
                    }
                ]
            }
        ],
        "max_tokens": 500
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            logger.info("Hugging Face Qwen2-VL successfully analyzed the image.")
            return content
        else:
            logger.warning(f"Qwen2-VL failed: {response.status_code} - {response.text}")
    except Exception as e:
        logger.warning(f"Qwen2-VL exception: {e}")

    # Fallback to BLIP
    logger.info("Falling back to Hugging Face BLIP...")
    
    # Strip base64 header for BLIP
    if "base64," in image_base64:
        _, encoded = image_base64.split("base64,", 1)
    else:
        encoded = image_base64
        
    try:
        image_bytes = base64.b64decode(encoded)
    except Exception as e:
        raise ValueError("Invalid image encoding")
        
    BLIP_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    blip_headers = {"Authorization": f"Bearer {hf_key}"}
    
    response = requests.post(BLIP_URL, headers=blip_headers, data=image_bytes, timeout=15)
    
    if response.status_code == 200:
        result = response.json()
        caption = result[0].get("generated_text", "")
        logger.info(f"Hugging Face BLIP generated caption: {caption}")
        
        # Use LLM to structure the BLIP caption into JSON
        struct_prompt = f"{prompt}\n\nBased on the visual observation: '{caption}', construct the final JSON."
        logger.info("Structuring BLIP output with text LLM...")
        return analyze_policy(struct_prompt, context="")
    else:
        logger.error(f"BLIP failed: {response.status_code} - {response.text}")
        raise ValueError(f"Hugging Face Vision models failed. Status {response.status_code}")
