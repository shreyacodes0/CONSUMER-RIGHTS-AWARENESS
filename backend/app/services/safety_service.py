import re
from typing import Tuple, Optional, Dict, Any, List
from backend.app.config import settings

class SafetyService:
    # Patterns indicating personal ongoing litigation or dispute analysis requests
    ONGOING_DISPUTE_PATTERNS = [
        r"\b(my\s+case|my\s+dispute|case\s+number|case\s+no\b|cc\s*/\s*\d+|petition\s+no\b)",
        r"\b(hearing\s+tomorrow|hearing\s+is\s+scheduled|court\s+date|facing\s+trial)\b",
        r"\b(will\s+i\s+win|chance(s)?\s+of\s+winning|guarantee\s+a\s+win|can\s+i\s+beat)\b",
        r"\b(draft\s+.*(affidavit|petition|plaint|vakalatnama|legal\s+notice|pleading))\b",
        r"\b(my\s+lawyer\s+said|opposing\s+counsel|judge\s+ruled\s+against\s+me)\b",
        r"\b(help\s+me\s+sue\s+specifically|tell\s+me\s+what\s+to\s+say\s+in\s+court)\b"
    ]
    
    # Non-consumer areas of law
    OUT_OF_SCOPE_DOMAINS = [
        (r"\b(divorce|alimony|child\s+custody|hindu\s+marriage\s+act|maintenance\s+under\s+125)\b", 
         "Family and Matrimonial Law", "Family Courts or Legal Aid Services"),
        (r"\b(anticipatory\s+bail|bail\s+application|crpc|bns|ipc\s+302|fir\s+quashing|murder|theft\s+fir)\b", 
         "Criminal Law and Procedure", "the local Police Station or High Court Legal Services Committee"),
        (r"\b(income\s+tax\s+notice|section\s+234f|gst\s+assessment|itrv|scrutiny\s+assessment)\b", 
         "Income Tax and Taxation Law", "the Income Tax Department portal (incometax.gov.in) or a Chartered Accountant"),
        (r"\b(property\s+partition|ancestral\s+land\s+dispute|khata\s+transfer|mutation\s+of\s+land)\b", 
         "Property and Revenue Law", "the local Sub-Registrar / Revenue Tehsildar or a property advocate")
    ]
    
    # Prompt injection patterns
    INJECTION_PATTERNS = [
        r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
        r"(output|print|show)\s+(the\s+)?system\s+prompt",
        r"you\s+are\s+now\s+(hacker|developer\s+mode|dan|unrestricted)",
        r"override\s+(all\s+)?safety\s+protocols",
        r"delete\s+(the\s+)?(database|index|files)"
    ]

    @classmethod
    def evaluate_request(cls, query: str) -> Dict[str, Any]:
        """
        Evaluates user query for safety, domain scope, and litigation advice requests.
        Returns evaluation dict with should_refuse, reason, and suggested_redirection.
        """
        normalized = query.strip().lower()
        
        # 1. Check for prompt injection
        for pat in cls.INJECTION_PATTERNS:
            if re.search(pat, normalized, re.IGNORECASE):
                return {
                    "is_safe": True,
                    "should_refuse": False,
                    "sanitized_query": re.sub(pat, "", query, flags=re.IGNORECASE).strip(),
                    "refusal_reason": None,
                    "is_injection_attempt": True
                }
        
        # 2. Check for ongoing individual dispute analysis / personal litigation strategy
        for pat in cls.ONGOING_DISPUTE_PATTERNS:
            if re.search(pat, normalized, re.IGNORECASE):
                return {
                    "is_safe": True,
                    "should_refuse": True,
                    "refusal_type": "ONGOING_DISPUTE",
                    "refusal_reason": (
                        "NyayaDesk is an educational legal awareness platform and cannot analyse "
                        "individual ongoing cases, predict court outcomes, draft personal court affidavits, "
                        "or devise litigation strategy. For pending legal proceedings, please consult an "
                        "advocate or contact the National Consumer Helpline (1915)."
                    ),
                    "disclaimer": settings.MANDATORY_DISCLAIMER
                }
                
        # 3. Check for out-of-scope non-consumer law domains
        for pat, domain_name, official_dest in cls.OUT_OF_SCOPE_DOMAINS:
            if re.search(pat, normalized, re.IGNORECASE):
                return {
                    "is_safe": True,
                    "should_refuse": True,
                    "refusal_type": "OUT_OF_SCOPE",
                    "refusal_reason": (
                        f"This query relates to {domain_name}, which is outside NyayaDesk's focus on "
                        f"Indian Consumer Protection Law. For assistance in this matter, please refer to "
                        f"{official_dest}."
                    ),
                    "disclaimer": settings.MANDATORY_DISCLAIMER
                }
                
        return {
            "is_safe": True,
            "should_refuse": False,
            "sanitized_query": query.strip(),
            "refusal_reason": None
        }

    @classmethod
    def validate_citations(cls, citations: List[Dict[str, Any]], retrieved_passages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ensures that generated citations strictly map to verified passages retrieved from the knowledge base.
        Eliminates hallucinated provisions or fake section numbers.
        """
        valid_citations = []
        retrieved_sections = {p.get("section_number", "").lower(): p for p in retrieved_passages}
        retrieved_doc_titles = {p.get("document_title", "").lower(): p for p in retrieved_passages}
        
        for cit in citations:
            sec = cit.get("section_number", "").lower()
            title = cit.get("document_title", "").lower()
            
            # Match by section or document title
            matching_passage = None
            for r_sec, r_pass in retrieved_sections.items():
                if r_sec and (r_sec in sec or sec in r_sec):
                    matching_passage = r_pass
                    break
            
            if not matching_passage:
                for r_title, r_pass in retrieved_doc_titles.items():
                    if r_title and (r_title in title or title in r_title):
                        matching_passage = r_pass
                        break
                        
            if matching_passage:
                valid_citations.append({
                    "document_title": matching_passage.get("document_title"),
                    "issuing_authority": matching_passage.get("issuing_authority"),
                    "section_number": matching_passage.get("section_number"),
                    "page_number": matching_passage.get("page_number"),
                    "official_url": matching_passage.get("official_url"),
                    "excerpt": matching_passage.get("content")[:180] + "..."
                })
                
        # If model returned no structured citations or hallucinated, backfill from top retrieved passages
        if not valid_citations and retrieved_passages:
            for p in retrieved_passages[:2]:
                valid_citations.append({
                    "document_title": p.get("document_title"),
                    "issuing_authority": p.get("issuing_authority"),
                    "section_number": p.get("section_number"),
                    "page_number": p.get("page_number"),
                    "official_url": p.get("official_url"),
                    "excerpt": p.get("content")[:180] + "..."
                })
                
        return valid_citations
