from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

from backend.services.ingestion_service import process_document
from backend.database.config import get_db
from backend.models.document import Document
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/documents", tags=["documents"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
PENDING_DIR = os.path.join(DATA_DIR, "pending_ingestion")

@router.post("/upload")
async def upload_document(
    namespace: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Save file to pending_ingestion
    os.makedirs(PENDING_DIR, exist_ok=True)
    file_path = os.path.join(PENDING_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create db record
    doc = Document(
        filename=file.filename,
        file_type=file.content_type or "application/pdf",
        namespace=namespace,
        status="pending_ingestion"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    background_tasks.add_task(process_document, doc.id, file_path, namespace)
    return {"message": "Document uploaded successfully", "id": doc.id}

@router.get("/")
def list_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return db.query(Document).offset(skip).limit(limit).all()

@router.get("/stats")
def document_stats(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    total = db.query(Document).count()
    indexed = db.query(Document).filter(Document.status == "already_indexed").count()
    pending = db.query(Document).filter(Document.status == "pending_ingestion").count()
    failed = db.query(Document).filter(Document.status == "failed_processing").count()
    
    return {
        "total": total,
        "indexed": indexed,
        "pending": pending,
        "failed": failed
    }
