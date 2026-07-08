from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from backend.database.config import engine, Base
from backend.api import auth, documents, namespaces, intelligence
from backend.seed_admin import seed_admin

# Create all database tables
Base.metadata.create_all(bind=engine)

# Ensure default admin user is seeded on startup
seed_admin()

app = FastAPI(
    title="SFAN - Smart Financial Analysis Network",
    description="AI-Powered Insurance Intelligence & Policy Audit Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import logging
from backend.core.config import settings
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing environment validation...")
    missing_vars = []
    if not settings.PINECONE_API_KEY:
        missing_vars.append("PINECONE_API_KEY")
    if not settings.PINECONE_INDEX:
        missing_vars.append("PINECONE_INDEX_NAME")
    
    if not settings.GROQ_API_KEY:
        missing_vars.append("GROQ_API_KEY")

    if missing_vars:
        logger.error(f"CRITICAL ERROR: Missing environment variables: {', '.join(missing_vars)}")
        raise RuntimeError(f"Missing environment variables: {', '.join(missing_vars)}")
    
    logger.info("ENVIRONMENT VALIDATION PASSED: PINECONE_API_KEY, PINECONE_INDEX_NAME, and GROQ_API_KEY are loaded successfully.")

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(namespaces.router)
app.include_router(intelligence.router)

from backend.api import dashboard
app.include_router(dashboard.router)

import os
from fastapi.staticfiles import StaticFiles

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
