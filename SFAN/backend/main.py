from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(namespaces.router)
app.include_router(intelligence.router)
from backend.api import dashboard
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SFAN API"}
