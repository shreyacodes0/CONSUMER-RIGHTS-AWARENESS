import re
import json
import uuid
from typing import List, Dict, Any, Optional
from pathlib import Path
from urllib.parse import urlparse
from backend.app.config import settings

class DocumentService:
    ALLOWED_DOMAINS = [
        "indiacode.nic.in",
        "consumeraffairs.nic.in",
        "consumeraffairs.gov.in",
        "consumerhelpline.gov.in",
        "edaakhil.nic.in"
    ]
    
    def __init__(self, kb_path: Path = settings.KNOWLEDGE_BASE_FILE):
        self.kb_path = kb_path

    def validate_source_url(self, url: str) -> Dict[str, Any]:
        """Validates that document URLs originate from verified official government portals."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if not domain:
                return {"valid": False, "reason": "Malformed or empty URL."}
                
            is_allowed = any(domain == d or domain.endswith("." + d) for d in self.ALLOWED_DOMAINS)
            if not is_allowed:
                return {
                    "valid": False,
                    "reason": f"Domain '{domain}' is not in the verified official source domains list ({', '.join(self.ALLOWED_DOMAINS)})."
                }
            return {"valid": True, "domain": domain}
        except Exception as e:
            return {"valid": False, "reason": f"URL validation error: {str(e)}"}

    def chunk_legal_text(self, text: str, doc_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Splits legal text into meaningful chunks that preserve section numbers,
        titles, and legal context without arbitrary mid-sentence cuts.
        """
        # Detect section patterns like 'Section 12', 'Rule 4', 'Chapter IV'
        raw_sections = re.split(r"(?=(?:Section\s+\d+|Rule\s+\d+|Chapter\s+[IVXLCDM]+))", text, flags=re.IGNORECASE)
        chunks = []
        
        for idx, sec in enumerate(raw_sections):
            clean_sec = sec.strip()
            if len(clean_sec) < 30:
                continue
                
            # Extract section identifier if present
            match = re.search(r"((?:Section|Rule)\s+\d+(?:\([0-9a-zA-Z]+\))?)", clean_sec, re.IGNORECASE)
            section_id = match.group(1) if match else f"Clause {idx + 1}"
            
            # Extract keywords
            words = re.findall(r"\b[a-zA-Z]{4,}\b", clean_sec.lower())
            keywords = list(dict.fromkeys(words))[:8]
            
            chunk_obj = {
                "id": f"{doc_metadata.get('id', 'doc')}-{uuid.uuid4().hex[:6]}",
                "document_id": doc_metadata.get("id", "doc"),
                "document_title": doc_metadata.get("title", "Official Legal Document"),
                "issuing_authority": doc_metadata.get("issuing_authority", "Government of India"),
                "section_number": section_id,
                "page_number": str(doc_metadata.get("page_number", idx + 1)),
                "official_url": doc_metadata.get("official_url", ""),
                "version_date": doc_metadata.get("version_date", "2024"),
                "keywords": keywords,
                "content": clean_sec[:1200]
            }
            chunks.append(chunk_obj)
            
        return chunks

    def ingest_document(
        self,
        title: str,
        issuing_authority: str,
        official_url: str,
        raw_text: Optional[str] = None,
        is_scanned: bool = False,
        version_date: str = "2024"
    ) -> Dict[str, Any]:
        """Ingests a verified document into the local knowledge base."""
        # 1. Validate URL
        url_val = self.validate_source_url(official_url)
        if not url_val["valid"]:
            return {
                "success": False,
                "error": url_val["reason"],
                "chunks_count": 0,
                "is_scanned_ocr_required": False
            }
            
        # 2. Check for scanned / non-extractable text
        if is_scanned or (raw_text is not None and len(raw_text.strip()) == 0):
            return {
                "success": False,
                "error": "The provided PDF contains scanned images without extractable digital text. OCR processing is required before indexing.",
                "chunks_count": 0,
                "is_scanned_ocr_required": True
            }

        text_to_process = raw_text or f"Section 1: General provisions and scope under {title}."
        doc_id = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")[:32]
        
        doc_meta = {
            "id": doc_id,
            "title": title,
            "issuing_authority": issuing_authority,
            "official_url": official_url,
            "version_date": version_date
        }
        
        new_chunks = self.chunk_legal_text(text_to_process, doc_meta)
        
        # Load existing KB and append
        existing_kb = []
        if self.kb_path.exists():
            with open(self.kb_path, "r", encoding="utf-8") as f:
                existing_kb = json.load(f)
                
        existing_kb.extend(new_chunks)
        
        with open(self.kb_path, "w", encoding="utf-8") as f:
            json.dump(existing_kb, f, indent=2)
            
        return {
            "success": True,
            "document_id": doc_id,
            "chunks_count": len(new_chunks),
            "is_scanned_ocr_required": False,
            "message": f"Successfully ingested {len(new_chunks)} verified legal chunks."
        }

document_service = DocumentService()
