from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database.config import Base

class Namespace(Base):
    __tablename__ = "namespaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    documents = relationship("Document", back_populates="namespace_rel")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    file_type = Column(String, nullable=False)
    namespace = Column(String, ForeignKey("namespaces.name"), nullable=False)
    status = Column(String, default="pending_ingestion") # pending_ingestion, already_indexed, failed_processing
    chunk_count = Column(Integer, default=0)
    vector_count = Column(Integer, default=0)
    embedding_model = Column(String, nullable=True)
    processing_duration = Column(Integer, default=0) # in seconds
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    namespace_rel = relationship("Namespace", back_populates="documents")
