from fastapi import APIRouter, Depends, HTTPException
from backend.schemas.claim_assessment_report import ClaimAssessmentRequest, ClaimAssessmentResponse
from backend.services.claim_assessment_report_service import generate_claim_assessment_report, PineconeRetrievalError, GroqInferenceError
from backend.services.pinecone_service import get_namespaces
from backend.api.deps import get_current_active_user

router = APIRouter(prefix="/claim-assessment", tags=["claim-assessment"])

@router.get("/config")
def get_config(current_user = Depends(get_current_active_user)):
    """
    Returns available namespaces and providers for the frontend UI.
    """
    try:
        pinecone_ns = get_namespaces()
        namespaces_list = [{"id": ns, "label": ns.replace("_", " ").title()} for ns in pinecone_ns.keys()]
    except Exception:
        # Graceful fallback if Pinecone is unreachable
        namespaces_list = []
        
    providers_list = [
        "SBI General Insurance",
        "ICICI Lombard",
        "HDFC ERGO",
        "Tata AIG",
        "Bajaj Allianz",
        "Star Health",
        "Niva Bupa"
    ]
    
    return {
        "namespaces": namespaces_list,
        "providers": providers_list
    }

@router.post("/report", response_model=ClaimAssessmentResponse)
def create_report(
    request: ClaimAssessmentRequest, 
    current_user = Depends(get_current_active_user)
):
    """
    Generates a Claim Assessment Report via RAG using Groq and Pinecone.
    """
    try:
        return generate_claim_assessment_report(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PineconeRetrievalError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except GroqInferenceError as e:
        raise HTTPException(status_code=502, detail=str(e))
