import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GROQ_API_KEY: Optional[str] = None
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_INDEX: str = "compliance-rag-index"
    PINECONE_NAMESPACE: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    SECRET_KEY: str = "supersecret"
    DATABASE_URL: str = "sqlite:///./sfan.db"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
