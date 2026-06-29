from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.config import get_db
from backend.models.document import Namespace
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import get_namespaces

router = APIRouter(prefix="/namespaces", tags=["namespaces"])

@router.get("/")
def list_namespaces(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    # Sync with Pinecone to see if there are new ones
    pinecone_ns = get_namespaces()
    
    db_namespaces = db.query(Namespace).all()
    db_ns_names = set(ns.name for ns in db_namespaces)
    
    # Namespaces from Pinecone
    all_incoming_ns = set(pinecone_ns.keys())
    
    # Pre-defined Namespaces from .env
    from backend.core.config import settings
    import json
    if settings.PINECONE_NAMESPACE:
        try:
            env_namespaces = json.loads(settings.PINECONE_NAMESPACE)
            if isinstance(env_namespaces, list):
                all_incoming_ns.update(env_namespaces)
        except:
            pass

    for ns_name in all_incoming_ns:
        if ns_name not in db_ns_names:
            new_ns = Namespace(name=ns_name, description=f"Auto-imported namespace: {ns_name}")
            db.add(new_ns)
    
    db.commit()
    
    return db.query(Namespace).all()

@router.get("/sync")
def sync_pinecone_namespaces(current_user = Depends(get_current_active_user)):
    return get_namespaces()
