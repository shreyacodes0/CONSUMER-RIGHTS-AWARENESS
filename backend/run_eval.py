#!/usr/bin/env python3
"""
NyayaDesk Automated Evaluation & Test Suite
Consumer Legal Awareness Platform
"""

import sys
import json
import time
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app.config import settings
from backend.app.services.safety_service import SafetyService
from backend.app.services.retrieval_service import RetrievalService
from backend.app.services.document_service import DocumentService
from backend.tests.test_nyayadesk import (
    test_predefined_problems_loaded_and_verified,
    test_ongoing_dispute_refusal,
    test_out_of_scope_criminal_refusal,
    test_prompt_injection_sanitization,
    test_knowledge_base_retrieval_pecuniary,
    test_unsupported_query_fallback,
    test_citation_integrity_verification,
    test_document_ingestion_domain_validation,
    test_document_ingestion_official_domain_allowed,
    test_scanned_pdf_ocr_flag
)

def run_unit_tests():
    print("=" * 70)
    print("NYAYADESK UNIT & COMPONENT TESTS")
    print("=" * 70)
    tests = [
        ("Predefined Problems Verification", test_predefined_problems_loaded_and_verified),
        ("Safety Guardrail: Ongoing Dispute Refusal", test_ongoing_dispute_refusal),
        ("Safety Guardrail: Out of Scope Law", test_out_of_scope_criminal_refusal),
        ("Prompt Injection Neutralization", test_prompt_injection_sanitization),
        ("Retrieval: Pecuniary Jurisdiction", test_knowledge_base_retrieval_pecuniary),
        ("RAG Fallback: Unsupported Query", test_unsupported_query_fallback),
        ("Citation Integrity & Anti-Hallucination", test_citation_integrity_verification),
        ("Ingestion: Domain Validation Failure", test_document_ingestion_domain_validation),
        ("Ingestion: Official Government Domain Success", test_document_ingestion_official_domain_allowed),
        ("Document Service: Scanned PDF OCR Flag", test_scanned_pdf_ocr_flag),
    ]
    
    passed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"  [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            
    print(f"\nUnit Tests Summary: {passed}/{len(tests)} passed ({(passed/len(tests))*100:.1f}%)")
    return passed == len(tests)

def run_evaluation_benchmark():
    print("\n" + "=" * 70)
    print("NYAYADESK 25-QUESTION BENCHMARK EVALUATION")
    print("=" * 70)
    
    eval_file = ROOT_DIR / "data" / "eval_dataset.json"
    if not eval_file.exists():
        print(f"Evaluation dataset not found at {eval_file}")
        return
        
    with open(eval_file, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    retriever = RetrievalService()
    
    metrics = {
        "total": len(questions),
        "correct_safety_refusals": 0,
        "expected_safety_refusals": 0,
        "correct_fallbacks": 0,
        "expected_fallbacks": 0,
        "relevant_retrievals": 0,
        "expected_retrievals": 0,
        "citation_valid": 0,
        "total_latency_ms": 0.0
    }
    
    print(f"Loaded {len(questions)} test items across 6 categories.\n")
    print(f"{'ID':<9} | {'Category':<22} | {'Safety/Refusal':<16} | {'Retrieval Status':<20} | {'Latency':<8}")
    print("-" * 84)
    
    for item in questions:
        q_id = item["id"]
        cat = item["category"]
        query = item["question"]
        should_refuse = item.get("should_refuse", False)
        
        t0 = time.time()
        
        # 1. Safety check
        safety_res = SafetyService.evaluate_request(query)
        is_refused = safety_res.get("should_refuse", False)
        
        # 2. Retrieval
        passages, has_evidence = retriever.retrieve(query)
        
        t1 = time.time()
        latency_ms = (t1 - t0) * 1000
        metrics["total_latency_ms"] += latency_ms
        
        # Score metrics
        if should_refuse:
            metrics["expected_safety_refusals"] += 1
            if is_refused:
                metrics["correct_safety_refusals"] += 1
                refusal_status = "Refused [OK]"
            else:
                refusal_status = "Failed to Refuse [ERR]"
        else:
            if is_refused:
                refusal_status = "False Refusal [ERR]"
            else:
                refusal_status = "Allowed [OK]"
                
        if cat == "Unsupported_Query":
            metrics["expected_fallbacks"] += 1
            if not has_evidence:
                metrics["correct_fallbacks"] += 1
                retrieval_status = "Fallback Triggered [OK]"
            else:
                retrieval_status = "False Match [WARN]"
        elif not should_refuse:
            metrics["expected_retrievals"] += 1
            if has_evidence and len(passages) > 0:
                metrics["relevant_retrievals"] += 1
                retrieval_status = f"{len(passages)} passages found [OK]"
            else:
                retrieval_status = "No passages found [WARN]"
        else:
            retrieval_status = "N/A (Refused query)"
            
        print(f"{q_id:<9} | {cat:<22} | {refusal_status:<16} | {retrieval_status:<20} | {latency_ms:.1f}ms")
        
    print("-" * 84)
    print("\nBENCHMARK PERFORMANCE SUMMARY:")
    
    refusal_acc = (metrics["correct_safety_refusals"] / max(1, metrics["expected_safety_refusals"])) * 100
    retrieval_rec = (metrics["relevant_retrievals"] / max(1, metrics["expected_retrievals"])) * 100
    fallback_acc = (metrics["correct_fallbacks"] / max(1, metrics["expected_fallbacks"])) * 100
    avg_latency = metrics["total_latency_ms"] / metrics["total"]
    
    print(f"  • Refusal Accuracy (Ongoing disputes & Out of scope): {refusal_acc:.1f}% ({metrics['correct_safety_refusals']}/{metrics['expected_safety_refusals']})")
    print(f"  • Retrieval Recall (Valid Consumer Queries):        {retrieval_rec:.1f}% ({metrics['relevant_retrievals']}/{metrics['expected_retrievals']})")
    print(f"  • Unsupported Query Fallback Accuracy:              {fallback_acc:.1f}% ({metrics['correct_fallbacks']}/{metrics['expected_fallbacks']})")
    print(f"  • Average Retrieval Latency:                        {avg_latency:.2f} ms")
    print("=" * 70)

if __name__ == "__main__":
    tests_ok = run_unit_tests()
    run_evaluation_benchmark()
