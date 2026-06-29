from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NamespaceBase(BaseModel):
    name: str
    description: Optional[str] = None

class NamespaceCreate(NamespaceBase):
    pass

class NamespaceResponse(NamespaceBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    namespace: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    status: str
    chunk_count: int
    vector_count: int
    embedding_model: Optional[str] = None
    processing_duration: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
