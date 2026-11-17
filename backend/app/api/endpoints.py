import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Header, status
from backend.app.config import settings
from backend.app.models.schemas import (
    PredefinedProblem,
    LegalResource,
    ChatRequest,
    ChatResponse,
    Citation,
    IngestDocumentRequest,
    IngestDocumentResponse,
    HealthStatus
)
from backend.app.services.safety_service import SafetyService
from backend.app.services.retrieval_service import retrieval_service
from backend.app.services.gemini_service import gemini_service
from backend.app.services.document_service import document_service

router = APIRouter(prefix="/api")

def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Validates administrative API key for protected document management endpoints."""
    if not x_admin_key or x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Administrative access requires valid X-Admin-Key header."
        )
    return True

@router.get("/health", response_model=HealthStatus)
def health_check():
    """System health check and diagnostic status."""
    problems_count = 0
    if settings.PROBLEMS_FILE.exists():
        with open(settings.PROBLEMS_FILE, "r", encoding="utf-8") as f:
            problems_count = len(json.load(f))
            
    passages_count = len(retrieval_service.passages)
    
    return HealthStatus(
        status="healthy",
        project="NyayaDesk",
        version=settings.VERSION,
        gemini_configured=gemini_service.is_configured(),
        gemini_model=gemini_service.model_name,
        indexed_passages_count=passages_count,
        predefined_problems_count=problems_count,
        group_attribution=settings.GROUP
    )

@router.get("/problems", response_model=List[PredefinedProblem])
def get_predefined_problems():
    """Returns all verified predefined consumer problems with instant reviewed answers."""
    if not settings.PROBLEMS_FILE.exists():
        return []
    with open(settings.PROBLEMS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/problems/{problem_id}", response_model=PredefinedProblem)
def get_problem_by_id(problem_id: str):
    """Returns a specific predefined problem by its unique identifier."""
    problems = get_predefined_problems()
    for p in problems:
        if p["id"] == problem_id:
            return p
    raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")

@router.get("/resources", response_model=List[LegalResource])
def get_legal_resources():
    """Returns official verified legal resources and statute registries."""
    if not settings.RESOURCES_FILE.exists():
        return []
    with open(settings.RESOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.post("/chat", response_model=ChatResponse)
def handle_chat(request: ChatRequest):
    """
    RAG-powered conversational endpoint for Indian consumer protection rights.
    Enforces legal scope checks, ongoing dispute refusal, semantic retrieval,
    strict citation validation, and Gemini generation.
    """
    query = request.message.strip()
    
    # 1. Safety & Legal Guardrails Check
    safety_check = SafetyService.evaluate_request(query)
    if safety_check.get("should_refuse"):
        return ChatResponse(
            answer=safety_check["refusal_reason"],
            legal_provision="Guardrail: Educational Scope Policy",
            procedure=[],
            citations=[],
            limitations="NyayaDesk strictly provides general legal information, not litigation advice.",
            is_grounded=True,
            refusal=True,
            refusal_reason=safety_check.get("refusal_type"),
            disclaimer=settings.MANDATORY_DISCLAIMER,
            model_used="NyayaDesk Safety Policy Engine",
            sources_count=0
        )
        
    sanitized_query = safety_check.get("sanitized_query", query)
    
    # 2. Vector / Semantic Retrieval from Verified Knowledge Base
    retrieved_passages, has_sufficient_evidence = retrieval_service.retrieve(sanitized_query)
    
    # 3. Grounded Generation
    rag_result = gemini_service.generate_rag_response(
        sanitized_query,
        retrieved_passages,
        has_sufficient_evidence
    )
    
    # 4. Strict Citation Validation (Ensures generated citations match actual passages)
    raw_citations = rag_result.get("citations", [])
    valid_citations = SafetyService.validate_citations(raw_citations, retrieved_passages)
    
    return ChatResponse(
        answer=rag_result["answer"],
        legal_provision=rag_result.get("legal_provision"),
        procedure=rag_result.get("procedure", []),
        citations=[Citation(**c) for c in valid_citations],
        limitations=rag_result.get("limitations"),
        is_grounded=rag_result.get("is_grounded", True),
        refusal=False,
        disclaimer=settings.MANDATORY_DISCLAIMER,
        model_used=rag_result.get("model_used"),
        sources_count=len(valid_citations)
    )

@router.get("/admin/documents")
def get_admin_documents(authorized: bool = Depends(verify_admin_key)):
    """Administrative inspection of indexed passages and source documents."""
    return {
        "total_passages": len(retrieval_service.passages),
        "passages": retrieval_service.passages
    }

@router.post("/admin/documents/ingest", response_model=IngestDocumentResponse)
def ingest_document(req: IngestDocumentRequest, authorized: bool = Depends(verify_admin_key)):
    """
    Ingests an official PDF or text from verified government domains.
    Validates domain, checks for scanned non-OCR files, chunks, and appends to index.
    """
    res = document_service.ingest_document(
        title=req.title,
        issuing_authority=req.issuing_authority,
        official_url=req.official_url,
        raw_text=req.raw_text,
        is_scanned=req.is_scanned,
        version_date=req.version_date
    )
    
    if not res["success"]:
        return IngestDocumentResponse(
            success=False,
            message=res.get("error", "Ingestion failed."),
            document_id="",
            chunks_created=0,
            validation_status="Rejected",
            is_scanned_ocr_required=res.get("is_scanned_ocr_required", False)
        )
        
    # Reload retrieval service
    retrieval_service.load_passages()
    
    return IngestDocumentResponse(
        success=True,
        message=res["message"],
        document_id=res["document_id"],
        chunks_created=res["chunks_count"],
        validation_status="Verified and Indexed",
        is_scanned_ocr_required=False
    )

@router.delete("/admin/documents/{document_id}")
def delete_document(document_id: str, authorized: bool = Depends(verify_admin_key)):
    """Deletes all indexed passages belonging to a document ID."""
    original_count = len(retrieval_service.passages)
    filtered = [p for p in retrieval_service.passages if p.get("document_id") != document_id and p.get("id") != document_id]
    
    if len(filtered) == original_count:
        raise HTTPException(status_code=404, detail=f"No document chunks found matching '{document_id}'.")
        
    with open(settings.KNOWLEDGE_BASE_FILE, "w", encoding="utf-8") as f:
        json.dump(filtered, f, indent=2)
        
    retrieval_service.load_passages()
    return {"success": True, "removed_count": original_count - len(filtered)}

@router.get("/eval/dataset")
def get_evaluation_dataset():
    """Returns the 25-question benchmark evaluation dataset."""
    if not settings.EVAL_DATASET_FILE.exists():
        return []
    with open(settings.EVAL_DATASET_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
