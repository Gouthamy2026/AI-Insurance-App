import sys
sys.path.append('.')

from backend.api.intelligence import chat_assistant, QueryRequest

req = QueryRequest(query="What should I check before buying a new health insurance policy?", namespace="")
response = chat_assistant(req)

import json
print(json.dumps(response, indent=2))
