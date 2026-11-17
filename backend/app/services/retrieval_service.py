import json
import math
import re
from typing import List, Dict, Any, Tuple
from pathlib import Path
from backend.app.config import settings

class RetrievalService:
    SYNONYM_MAP = {
        "lawyer": ["advocate", "counsel", "pleader", "representation", "represent"],
        "advocate": ["lawyer", "counsel", "pleader", "representation", "represent"],
        "limitation": ["limit", "period", "delay", "condonation", "years", "time"],
        "cancel": ["cancellation", "cancelled", "cancelling", "refund"],
        "cancellation": ["cancel", "cancelled", "cancelling", "refund"],
        "refund": ["return", "take back", "reimbursement", "withdrawn", "money back"],
        "return": ["refund", "returns", "take back", "exchange"],
        "warranty": ["guarantee", "warranties", "guarantees", "repair", "service deficiency", "job sheet"],
        "guarantee": ["warranty", "guarantees", "warranties", "express warranty"],
        "advertisement": ["advertising", "ads", "advertisements", "endorser", "celebrity", "misleading"],
        "ads": ["advertisement", "advertising", "advertisements", "misleading", "false claims"],
        "court": ["commission", "dcdrc", "scdrc", "ncdrc", "forum", "tribunal", "edaakhil"],
        "online": ["ecommerce", "e-commerce", "marketplace", "platform", "digital", "website"],
        "shopping": ["purchase", "buyer", "order"],
        "medicine": ["drug", "goods", "product", "expired", "defect"],
        "checkbox": ["pre-ticked", "boxes", "consent", "automatic", "flight", "booking"],
        "motherboard": ["laptop", "hardware", "goods", "defect", "warranty", "deficiency"],
        "home": ["reside", "resides", "residence", "territorial", "jurisdiction", "district"],
        "state": ["territory", "jurisdiction", "district", "opposite party"]
    }

    def __init__(self, passages_file: Path = settings.KNOWLEDGE_BASE_FILE):
        self.passages_file = passages_file
        self.passages: List[Dict[str, Any]] = []
        self.load_passages()

    def load_passages(self):
        """Loads verified legal passages from the JSON knowledge base."""
        if self.passages_file.exists():
            with open(self.passages_file, "r", encoding="utf-8") as f:
                self.passages = json.load(f)
        else:
            self.passages = []

    def _stem(self, word: str) -> str:
        """Lightweight English suffix stripper."""
        w = word.lower()
        for suffix in ["tion", "tions", "ing", "ment", "ments", "ies", "ed", "es", "s"]:
            if len(w) > len(suffix) + 3 and w.endswith(suffix):
                return w[:-len(suffix)]
        return w

    def _tokenize(self, text: str) -> List[str]:
        """Simple clean tokenization with stop-word removal and stemming."""
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 2]
        stop_words = {
            "the", "and", "for", "with", "that", "this", "from", "are", "have", "been",
            "was", "under", "shall", "what", "which", "when", "where", "how", "who", "whom",
            "does", "can", "could", "would", "should", "about", "any", "some", "into",
            "rules", "regulations", "policy", "specific", "indian", "india", "provisions",
            "consumer", "protection", "regarding"
        }
        return [t for t in tokens if t not in stop_words]

    def _expand_tokens(self, tokens: List[str]) -> List[str]:
        expanded = list(tokens)
        for t in tokens:
            t_clean = t.lower()
            if t_clean in self.SYNONYM_MAP:
                expanded.extend(self.SYNONYM_MAP[t_clean])
            stemmed = self._stem(t_clean)
            if stemmed != t_clean:
                expanded.append(stemmed)
        return list(set(expanded))

    def _compute_score(self, query_tokens: List[str], passage: Dict[str, Any]) -> Tuple[float, int]:
        """
        Computes relevance score using unique query token coverage to prevent
        spurious matches on unsupported queries.
        """
        raw_content = passage.get("content", "").lower()
        content_tokens = set(self._tokenize(raw_content))
        stemmed_content = {self._stem(t) for t in content_tokens}
        
        keyword_tokens = set()
        for kw in passage.get("keywords", []):
            keyword_tokens.update(self._tokenize(kw))
        stemmed_keywords = {self._stem(t) for t in keyword_tokens}
            
        title_tokens = set(self._tokenize(passage.get("document_title", "")))
        section_tokens = set(self._tokenize(passage.get("section_number", "")))
        
        matched_distinct_tokens = 0
        weight = 0.0
        
        for q in query_tokens:
            q_clean = q.lower()
            q_stem = self._stem(q_clean)
            q_exp = [q_clean, q_stem]
            if q_clean in self.SYNONYM_MAP:
                q_exp.extend(self.SYNONYM_MAP[q_clean])
                
            q_matched = False
            token_weight = 0.0
            
            for candidate in q_exp:
                c_stem = self._stem(candidate)
                if candidate in section_tokens:
                    token_weight = max(token_weight, 5.0)
                    q_matched = True
                elif candidate in keyword_tokens or c_stem in stemmed_keywords:
                    token_weight = max(token_weight, 3.5)
                    q_matched = True
                elif candidate in title_tokens:
                    token_weight = max(token_weight, 2.0)
                    q_matched = True
                elif candidate in content_tokens or c_stem in stemmed_content or candidate in raw_content:
                    token_weight = max(token_weight, 1.2)
                    q_matched = True
                    
            if q_matched:
                matched_distinct_tokens += 1
                weight += token_weight

        if not query_tokens or matched_distinct_tokens == 0:
            return 0.0, 0
            
        # Distinct token coverage ratio
        coverage = matched_distinct_tokens / len(query_tokens)
        
        # Denominator normalizer
        denom = max(1.0, math.sqrt(len(query_tokens)) * 2.8)
        score = (weight / denom) * (0.6 + 0.4 * coverage)
        return min(1.0, score), matched_distinct_tokens

    def retrieve(self, query: str, top_k: int = settings.TOP_K_RETRIEVAL, threshold: float = 0.28) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Retrieves the top-k most relevant passages.
        Returns (passages, has_sufficient_evidence).
        """
        if not self.passages:
            self.load_passages()
            
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return [], False
            
        scored_passages = []
        for passage in self.passages:
            score, distinct_matches = self._compute_score(query_tokens, passage)
            if score > 0.10:
                scored_passages.append((score, distinct_matches, passage))
                
        # Sort descending by score
        scored_passages.sort(key=lambda x: x[0], reverse=True)
        
        top_matches = [p for s, m, p in scored_passages[:top_k]]
        highest_score = scored_passages[0][0] if scored_passages else 0.0
        best_matches = scored_passages[0][1] if scored_passages else 0
        
        min_matches_required = 1 if len(query_tokens) <= 2 else 2
        coverage_ratio = best_matches / len(query_tokens)
        
        has_sufficient_evidence = (
            highest_score >= threshold
            and best_matches >= min_matches_required
            and coverage_ratio >= 0.20
            and len(top_matches) > 0
        )
        return top_matches, has_sufficient_evidence

retrieval_service = RetrievalService()
