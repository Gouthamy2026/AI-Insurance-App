from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.config import engine, Base
from backend.api import auth, documents, namespaces, intelligence, account_hub
from backend.models import account_hub as _account_hub_models
from backend.models import user as _user_models
from backend.models import document as _document_models
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
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(namespaces.router)
app.include_router(intelligence.router)
app.include_router(account_hub.router)
from backend.api import dashboard
app.include_router(dashboard.router)
from backend.api import assessment
app.include_router(assessment.router)
from backend.api import health_verification
app.include_router(health_verification.router)
from backend.api import health_verification_hub_api
app.include_router(health_verification_hub_api.router)

from fastapi.staticfiles import StaticFiles
import os

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

import time
from backend.services.pinecone_service import get_pinecone_client, get_namespaces
from backend.services.groq_service import generate_completion
from backend.services.embedding_service import get_embedding

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "response_time": "0ms",
        "error_details": None,
        "connection_state": "connected"
    }

@app.get("/health/pinecone")
def health_pinecone():
    start_time = time.time()
    try:
        get_namespaces()
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "ok",
            "response_time": f"{elapsed}ms",
            "error_details": None,
            "connection_state": "connected"
        }
    except Exception as e:
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "error",
            "response_time": f"{elapsed}ms",
            "error_details": str(e),
            "connection_state": "disconnected"
        }

@app.get("/health/groq")
def health_groq():
    start_time = time.time()
    try:
        # A tiny prompt to test connectivity
        generate_completion("Hello", model="llama-3.1-8b-instant")
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "ok",
            "response_time": f"{elapsed}ms",
            "error_details": None,
            "connection_state": "connected"
        }
    except Exception as e:
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "error",
            "response_time": f"{elapsed}ms",
            "error_details": str(e),
            "connection_state": "disconnected"
        }

@app.get("/health/embeddings")
def health_embeddings():
    start_time = time.time()
    try:
        get_embedding("test")
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "ok",
            "response_time": f"{elapsed}ms",
            "error_details": None,
            "connection_state": "connected"
        }
    except Exception as e:
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "status": "error",
            "response_time": f"{elapsed}ms",
            "error_details": str(e),
            "connection_state": "disconnected"
        }
