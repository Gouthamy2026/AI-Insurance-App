import sys
import os
sys.path.append(os.path.dirname(__file__))

from backend.api.intelligence import generate_recommendation, RecommendationRequest, UserProfile
import traceback

req = RecommendationRequest(
    namespaces=["policy1", "policy2"],
    user_profile=UserProfile(age=30, budget=1000)
)
try:
    print("Testing generate_recommendation...")
    res = generate_recommendation(req)
    print("Success:", res)
except Exception as e:
    traceback.print_exc()

from backend.api.intelligence import evaluate_claim_outcome, ClaimScenarioRequest
req2 = ClaimScenarioRequest(scenario="test", namespace="test")
try:
    print("\nTesting evaluate_claim_outcome...")
    res2 = evaluate_claim_outcome(req2)
    print("Success:", res2)
except Exception as e:
    traceback.print_exc()
