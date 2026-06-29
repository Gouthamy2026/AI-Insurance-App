import os
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

try:
    embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=["test"],
        parameters={"input_type": "query"}
    )
    print("SUCCESS Pinecone Embeddings:", embeddings[0].values[:5])
except Exception as e:
    print("FAILED Pinecone Embeddings:", e)
