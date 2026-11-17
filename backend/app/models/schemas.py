from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredefinedProblem(BaseModel):
    id: str
    title: str
    short_description: str
    reviewed_answer: str
    legal_provision: str
    source_citation: str
    official_url: str
    procedure: List[str]
    is_verified: bool
    verification_status: str
    suggested_questions: List[str] = Field(default_factory=list)

class LegalResource(BaseModel):
    id: str
    title: str
    issuing_authority: str
    document_type: str
    date_or_version: str
    official_url: str
    domain: str
    description: str
    key_sections: List[str] = Field(default_factory=list)
    verified: bool = True

class Citation(BaseModel):
    document_title: str
    issuing_authority: str
    section_number: str
    page_number: Optional[str] = None
    official_url: str
    excerpt: Optional[str] = None

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=1000)
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    answer: str
    legal_provision: Optional[str] = None
    procedure: Optional[List[str]] = None
    citations: List[Citation] = Field(default_factory=list)
    limitations: Optional[str] = None
    is_grounded: bool = True
    refusal: bool = False
    refusal_reason: Optional[str] = None
    disclaimer: str
    model_used: Optional[str] = None
    sources_count: int = 0

class IngestDocumentRequest(BaseModel):
    title: str
    issuing_authority: str
    official_url: str
    document_type: str = "Official Circular / Act"
    version_date: str = "2024"
    raw_text: Optional[str] = None
    is_scanned: bool = False

class IngestDocumentResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    chunks_created: int
    validation_status: str
    is_scanned_ocr_required: bool = False

class KnowledgePassage(BaseModel):
    id: str
    document_id: str
    document_title: str
    issuing_authority: str
    section_number: str
    page_number: Optional[str] = None
    official_url: str
    version_date: str
    keywords: List[str] = Field(default_factory=list)
    content: str

class HealthStatus(BaseModel):
    status: str
    project: str
    version: str
    gemini_configured: bool
    gemini_model: str
    indexed_passages_count: int
    predefined_problems_count: int
    group_attribution: str
