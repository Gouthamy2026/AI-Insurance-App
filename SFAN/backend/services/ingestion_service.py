import fitz  # PyMuPDF
import logging
import time
from backend.services.embedding_service import get_embeddings
from backend.services.pinecone_service import get_pinecone_index
from backend.database.config import SessionLocal
from backend.models.document import Document

logger = logging.getLogger(__name__)

def process_document(doc_id: int, file_path: str, namespace: str):
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        db.close()
        return

    try:
        # 1. Read PDF & Extract Text
        doc_pdf = fitz.open(file_path)
        full_text = ""
        for page in doc_pdf:
            full_text += page.get_text("text") + "\n"
        
        # 2. Chunking
        words = full_text.split()
        chunk_size = 200
        overlap = 50
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunks.append(" ".join(chunk_words))
            
        if not chunks:
            raise ValueError("No text extracted from document.")

        # 3. Generating Embeddings
        # Since the inference API might have a limit per call, let's batch it
        batch_size = 10
        index = get_pinecone_index()
        
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i + batch_size]
            embeddings = get_embeddings(batch_chunks, input_type="passage")
            
            # 4. Upserting to Pinecone
            vectors = []
            for j, embedding in enumerate(embeddings):
                vector_id = f"doc_{doc_id}_chunk_{i+j}"
                metadata = {"text": batch_chunks[j], "filename": doc.filename, "document_id": doc_id}
                vectors.append((vector_id, embedding, metadata))
                
            index.upsert(vectors=vectors, namespace=namespace)
            time.sleep(3)  # Respect Pinecone API limits
            
        doc.status = "already_indexed"
        logger.info(f"Successfully processed and indexed document {doc_id}")
        
    except Exception as e:
        logger.error(f"Error processing document {doc_id}: {e}")
        doc.status = "failed_processing"
        
    finally:
        db.commit()
        db.close()
