from pydantic import BaseModel, Field
from typing import List

class ClaimAssessmentRequest(BaseModel):
    policy_type: str = Field(..., description="The namespace or category of the policy.", min_length=1)
    claim_type: str = Field(..., description="The category of the claim (e.g., Health, Vehicle).", min_length=1)
    insurance_provider: str = Field(..., description="The insurance provider handling the claim.", min_length=1)
    scenario_description: str = Field(..., description="Detailed description of the claim scenario.", min_length=10, max_length=2000)

class ClaimAssessmentResponse(BaseModel):
    claim_summary: str = Field(..., description="Claim summary including Type, Provider, Status, Timeline, Ref ID.")
    claim_eligibility_review: str = Field(..., description="Score, Policy-Based Justification, Referenced Clauses.")
    approval_probability: str = Field(..., description="Likelihood %, Reasoning, Supporting Evidence.")
    risk_analysis: str = Field(..., description="Risk Level, Fraud Indicators, Financial/Operational Risk.")
    policy_coverage_review: str = Field(..., description="Direct quotes/data from Pinecone: Coverage Limits, Exclusions, Clause References.")
    compliance_review: str = Field(..., description="Regulatory notes, IRDAI observations.")
    documentation_checklist: List[str] = Field(..., description="Required vs. Missing documents checklist.")
    ai_recommendations: str = Field(..., description="Next steps, risk reduction.")
    final_assessment: str = Field(..., description="Approve/Review/Reject, Confidence Score.")
