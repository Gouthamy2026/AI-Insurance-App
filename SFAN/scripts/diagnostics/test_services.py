import os
import sys
from dotenv import load_dotenv
import traceback

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

try:
    from backend.services.embedding_service import get_embeddings
    print('Calling get_embeddings...')
    res = get_embeddings(['hello world'])
    print('Success! Vector length: {}'.format(len(res[0])))
except Exception as e:
    traceback.print_exc()

try:
    from backend.services.groq_service import analyze_policy
    print('Calling groq analyze_policy...')
    res = analyze_policy('What is this?', 'This is a test.')
    print('Success! Groq response: {}'.format(res))
except Exception as e:
    traceback.print_exc()
