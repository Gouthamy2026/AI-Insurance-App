from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, constr
from backend.api.deps import get_current_active_user
from backend.services.pinecone_service import query_vectors
from backend.services.embedding_service import get_embedding
from backend.services.groq_service import analyze_policy
import json
import logging
import re
from sqlalchemy.orm import Session
from backend.database.config import SessionLocal, get_db
from backend.models.document import Namespace
from backend.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/claim-assessment", tags=["claim-assessment"])

def extract_json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        clean = match.group(0)
    else:
        clean = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

def increment_namespace_usage(namespaces: list[str]):
    try:
        db = SessionLocal()
        for ns in namespaces:
            ns_obj = db.query(Namespace).filter(Namespace.name == ns).first()
            if ns_obj:
                ns_obj.usage_count = (ns_obj.usage_count or 0) + 1
        db.commit()
    except Exception as e:
        logger.error(f"Failed to increment namespace usage: {e}")
    finally:
        db.close()

@router.get("/config")
def get_config(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Fetch dynamic configuration for namespaces and providers."""
    
    # 1. Fetch namespaces from DB (already synced via namespaces route)
    # We will format them to be user-friendly if possible, or frontend can handle it
    db_namespaces = db.query(Namespace).all()
    ns_list = [{"id": ns.name, "label": ns.name.replace("_", " ").title() + (" Policies" if "policy" not in ns.name else "")} for ns in db_namespaces]
    
    # If DB is empty, fallback to basic list
    if not ns_list:
        ns_list = [
            {"id": "health_policy", "label": "Health Insurance Policies"},
            {"id": "vehicle_policy", "label": "Vehicle Insurance Policies"},
            {"id": "travel_policy", "label": "Travel Insurance Policies"},
            {"id": "life_wealth_policy", "label": "Life & Wealth Policies"},
            {"id": "banking_governance", "label": "Banking Governance"},
            {"id": "regulatory_governance", "label": "IRDAI Regulatory Governance"},
            {"id": "home_folder", "label": "Property Insurance Policies"}
        ]
        
    # Override specific labels to match prompt requirements exactly if they exist
    for ns in ns_list:
        if ns["id"] == "regulatory_governance":
            ns["label"] = "IRDAI Regulatory Governance"
        elif ns["id"] == "home_folder":
            ns["label"] = "Property Insurance Policies"
        elif ns["id"] == "banking_governance":
            ns["label"] = "Banking Governance"
        elif ns["id"] == "life_wealth_policy":
            ns["label"] = "Life & Wealth Policies"
            
    # 2. Hardcode provider list as requested in prompt (or fetch from DB if existed)
    providers = [
        "SBI General",
        "HDFC ERGO",
        "ICICI Lombard",
        "Kotak Mahindra",
        "IndusInd General",
        "Reliance General",
        "Star Health",
        "IndiaFirst Life",
        "IndusInd Nippon Life",
        "HDFC Life",
        "Apollo Munich Health",
        "Canara HSBC Life",
        "Tata AIG",
        "Zurich Kotak",
        "IRDAI Regulatory Knowledge Base"
    ]
    
    return {
        "namespaces": ns_list,
        "providers": providers
    }


class ClaimAssessmentRequest(BaseModel):
    policy_type: str = Field(..., min_length=1, strip_whitespace=True)
    claim_type: str = Field(..., min_length=1, strip_whitespace=True)
    insurance_provider: str = Field(..., min_length=1, strip_whitespace=True)
    scenario_description: str = Field(..., min_length=10, strip_whitespace=True)

@router.post("/report")
def generate_assessment_report(req: ClaimAssessmentRequest, current_user = Depends(get_current_active_user)):
    try:
        # Step 1-3: Input Collection, Validation, Sanitization (handled by Pydantic)
        logger.info(f"Generating Claim Assessment Report for: {req.insurance_provider} - {req.policy_type}")
        
        # Override namespace if IRDAI provider is selected
        namespace = req.policy_type
        if req.insurance_provider == "IRDAI Regulatory Knowledge Base":
            namespace = "regulatory_governance"
            logger.info("Auto-routed namespace to regulatory_governance due to IRDAI provider selection.")
        
        query_str = f"Coverage rules, conditions, exclusions, waiting periods, claim process. Provider: {req.insurance_provider}. Policy: {req.policy_type}. Claim Type: {req.claim_type}. Scenario: {req.scenario_description}"
        
        # Step 4: Generate embedding
        try:
            query_vec = get_embedding(query_str)
        except Exception as e:
            logger.error(f"Embedding failure: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate embedding for the claim scenario.")
            
        # Step 5 & 6: Search Pinecone & Apply filtering
        try:
            increment_namespace_usage([namespace])
            results = query_vectors(query_vec, namespace, top_k=10)
        except Exception as e:
            logger.error(f"Pinecone Timeout or Failure: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Knowledge retrieval system timeout or unavailable.")
            
        # Step 7: Validate retrieved context
        contexts = []
        if results and "matches" in results:
            for match in results["matches"]:
                if "metadata" in match and "text" in match["metadata"]:
                    contexts.append(match["metadata"]["text"])
                    
        context = "\n\n---\n\n".join(contexts)
        
        if not context.strip():
            logger.warning("No context found in Pinecone.")
            # Explicit failure as requested: "No matching policy evidence was found in the knowledge base. Assessment report cannot be generated."
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No matching policy evidence was found in the knowledge base. Assessment report cannot be generated."
            )
            
        # Step 8: Construct Groq prompt
        prompt = f"""
        You are an Elite Enterprise Insurance Claim Assessor. 
        You MUST generate a structured insurance assessment report using ONLY the retrieved Pinecone documents below.
        The AI must NEVER answer from prior knowledge. Every insurance conclusion must originate from retrieved documents.
        If evidence is unavailable for a specific section, display a specific explanation (do NOT use Unknown, Null, Undefined, N/A, Placeholder text, or Dummy values).
        Never hallucinate. Never fabricate policy clauses. Never generate approval recommendations without retrieved evidence.
        
        User Inputs:
        - Claim Type: {req.claim_type}
        - Policy Type: {req.policy_type}
        - Insurance Provider: {req.insurance_provider}
        - Scenario Description: {req.scenario_description}
        
        Return EXACTLY a raw JSON object (NO Markdown, NO code blocks) matching this precise schema:
        {{
            "executive_summary": "Detailed summary of the scenario based on the user's description and context.",
            "claim_eligibility_review": "Assessment of whether this type of claim is eligible under the specific policy conditions.",
            "approval_assessment": "Analysis of the likelihood of approval based on the rules found in the context.",
            "risk_analysis": "Identification of any risks, waiting periods, or potential reasons for denial.",
            "coverage_review": "Detailed breakdown of the exact coverage clauses and sub-limits that apply.",
            "policy_clause_interpretation": "Direct interpretation of specific clauses from the context.",
            "compliance_review": "Review of regulatory and compliance conditions required for this claim.",
            "documentation_checklist": ["List of precise documents", "required for filing based on context", "or 'No specific documents mentioned in context.'"],
            "ai_recommendations": "Strategic recommendations for the user to maximize their claim success based on the policy context.",
            "final_assessment": "The definitive concluding assessment of the entire claim."
        }}
        
        Context:
        {context}
        """
        
        # Step 9: Generate structured JSON
        try:
            response = analyze_policy(prompt, context, model="llama-3.1-8b-instant")
        except Exception as e:
            logger.error(f"Groq Timeout or Failure: {e}")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI Inference system timeout or unavailable.")
            
        # Step 10: Validate response
        try:
            report_data = extract_json(response)
            
            # Basic validation to ensure required keys exist
            required_keys = [
                "executive_summary", "claim_eligibility_review", "approval_assessment", 
                "risk_analysis", "coverage_review", "policy_clause_interpretation",
                "compliance_review", "documentation_checklist", "ai_recommendations", "final_assessment"
            ]
            for key in required_keys:
                if key not in report_data:
                    report_data[key] = "Information could not be structured correctly based on retrieved context."
                    
            logger.info("Claim assessment generated successfully. Audit logged.")
            
            return report_data
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}. Raw response: {response}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected JSON format received from AI.")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during processing.")
