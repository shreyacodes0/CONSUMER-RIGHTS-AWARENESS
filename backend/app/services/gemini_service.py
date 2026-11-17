import json
import logging
from typing import List, Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-3.8-flash"
        self._client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI client: {e}")
                self._client = None
        else:
            self._client = None

    def is_configured(self) -> bool:
        return bool(self.api_key and self._client)

    def generate_rag_response(
        self,
        query: str,
        retrieved_passages: List[Dict[str, Any]],
        has_sufficient_evidence: bool,
        enable_online_search: bool = True
    ) -> Dict[str, Any]:
        """
        Generates a grounded plain-language explanation using retrieved legal passages and optional Google Search grounding.
        Answers both indexed consumer questions and out-of-context questions briefly.
        """
        # Format evidence passages for the prompt
        evidence_text = ""
        for i, p in enumerate(retrieved_passages, 1):
            evidence_text += (
                f"\n[PASSAGE {i}]\n"
                f"Document: {p.get('document_title')}\n"
                f"Authority: {p.get('issuing_authority')}\n"
                f"Section: {p.get('section_number')}\n"
                f"Page/Rule: {p.get('page_number', 'N/A')}\n"
                f"Official URL: {p.get('official_url')}\n"
                f"Text: {p.get('content')}\n"
            )

        # Base statutory citations
        citations = []
        for p in retrieved_passages:
            citations.append({
                "document_title": p.get("document_title"),
                "issuing_authority": p.get("issuing_authority"),
                "section_number": p.get("section_number"),
                "page_number": p.get("page_number"),
                "official_url": p.get("official_url"),
                "excerpt": p.get("content")[:180] + "...",
                "is_web_source": False
            })

        # If client is configured, call Gemini
        if self._client:
            prompt = f"""You are NyayaDesk, an educational legal awareness and consumer protection assistant for India.
Explain the applicable legal provisions, rights, or procedures for the user question below clearly and concisely (in 2-4 sentences).
If the question is out of context or falls outside core Consumer Protection Law, provide a brief, accurate explanation of the relevant Indian law and indicate the appropriate legal authority or forum.

STRICT INSTRUCTIONS:
Structure your response in clean JSON matching this schema:
{{
  "legal_provision": "Exact legal provision(s), act, or regulatory authority cited",
  "explanation": "Plain language explanation of the law (brief, informative, 2-4 sentences)",
  "procedure": ["Step 1", "Step 2", "Step 3"],
  "limitations": "Key limitations, jurisdiction, or advisory note"
}}

USER QUESTION: {query}

VERIFIED STATUTORY PASSAGES:
{evidence_text if evidence_text else "No local statutory passage matched. Use Indian legal statutory knowledge or web search."}

Provide only valid JSON without markdown wrapping.
"""
            try:
                response = None
                search_grounded = False
                web_sources = []
                web_queries = []

                if enable_online_search:
                    try:
                        from google.genai import types
                        response = self._client.models.generate_content(
                            model="gemini-3.8-flash",
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                tools=[{"google_search": {}}]
                            )
                        )
                        # Extract search metadata
                        if hasattr(response, 'candidates') and response.candidates:
                            candidate = response.candidates[0]
                            meta = getattr(candidate, 'grounding_metadata', None)
                            if meta:
                                chunks = getattr(meta, 'grounding_chunks', []) or []
                                web_queries = getattr(meta, 'web_search_queries', []) or []
                                for chunk in chunks:
                                    web = getattr(chunk, 'web', None)
                                    if web and getattr(web, 'uri', None):
                                        web_sources.append({"title": getattr(web, 'title', 'Web Source'), "url": web.uri})
                                        citations.append({
                                            "document_title": getattr(web, 'title', 'Online Legal Source'),
                                            "issuing_authority": "Online Source (Google Search)",
                                            "section_number": "Live Grounding",
                                            "page_number": "Web",
                                            "official_url": web.uri,
                                            "excerpt": f"Retrieved via Google Search grounding for: {query}",
                                            "is_web_source": True
                                        })
                                search_grounded = len(web_sources) > 0 or len(web_queries) > 0
                    except Exception as search_err:
                        logger.warning(f"Google Search Grounding in Python service failed or rate-limited: {search_err}")

                if not response:
                    response = self._client.models.generate_content(
                        model=self.model_name,
                        contents=prompt
                    )

                if response:
                    raw_text = response.text.strip()
                    # Clean possible markdown block formatting
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:]
                    if raw_text.startswith("```"):
                        raw_text = raw_text[3:]
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]
                    raw_text = raw_text.strip()
                    
                    parsed = json.loads(raw_text)

                    if not citations:
                        citations.append({
                            "document_title": parsed.get("legal_provision", "India Code — Statutory Legal Repository"),
                            "issuing_authority": "Government of India (indiacode.nic.in)",
                            "section_number": "Statutory Reference",
                            "page_number": "Online",
                            "official_url": "https://www.indiacode.nic.in",
                            "excerpt": "General statutory provisions and procedural rules under Indian Law.",
                            "is_web_source": False
                        })

                    return {
                        "answer": parsed.get("explanation", ""),
                        "legal_provision": parsed.get("legal_provision", retrieved_passages[0].get("section_number") if retrieved_passages else "Indian Legal Framework"),
                        "procedure": parsed.get("procedure", []),
                        "citations": citations,
                        "limitations": parsed.get("limitations", "General educational information under Indian Law."),
                        "is_grounded": True,
                        "search_grounded": search_grounded,
                        "search_queries": web_queries,
                        "web_sources": web_sources,
                        "disclaimer": settings.MANDATORY_DISCLAIMER,
                        "model_used": "gemini-3.8-flash (Google Search Grounded)" if search_grounded else self.model_name
                    }
            except Exception as e:
                logger.warning(f"Gemini API call failed or rate-limited: {e}. Falling back to verified local extraction.")

        # Local deterministic synthesis when API key is unconfigured or rate-limited
        if retrieved_passages:
            top = retrieved_passages[0]
            explanation = f"Under {top.get('document_title')}, {top.get('section_number')}: {top.get('content')}"
            return {
                "answer": explanation,
                "legal_provision": f"{top.get('document_title')} — {top.get('section_number')}",
                "procedure": [
                    "Preserve all transaction records including tax invoice, receipts, and communication.",
                    "Lodge a formal pre-litigation grievance via National Consumer Helpline (1915 or consumerhelpline.gov.in).",
                    "If unredressed, submit an electronic complaint on e-Daakhil (edaakhil.nic.in) within 2 years."
                ],
                "citations": citations,
                "limitations": "Information synthesized directly from verified statutory extracts in local knowledge base.",
                "is_grounded": True,
                "disclaimer": settings.MANDATORY_DISCLAIMER,
                "model_used": "Verified Knowledge Base (Local Grounded Synthesis)"
            }

        return {
            "answer": "Under Indian law, rights and procedures for this query are governed by the relevant statutory provisions and regulatory authorities. For authentic statutory texts, visit indiacode.nic.in, or consult an advocate or legal aid clinic.",
            "legal_provision": "General Indian Statutory Framework",
            "procedure": [
                "Preserve all relevant documentary proof and communications.",
                "Identify the competent forum or court having territorial jurisdiction.",
                "Seek legal counsel or approach District Legal Services Authority (DLSA / NALSA)."
            ],
            "citations": [{
                "document_title": "India Code — Digital Repository of Indian Acts",
                "issuing_authority": "Legislative Department, Ministry of Law and Justice",
                "section_number": "Statutory Reference",
                "official_url": "https://www.indiacode.nic.in",
                "excerpt": "Comprehensive official repository of all Central and State statutes in India.",
                "is_web_source": False
            }],
            "limitations": "Brief general legal awareness provided for educational purposes.",
            "is_grounded": True,
            "disclaimer": settings.MANDATORY_DISCLAIMER,
            "model_used": "General Legal Awareness Engine"
        }

gemini_service = GeminiService()
