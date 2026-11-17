import React from 'react';
import { Scale, ShieldCheck, BookOpen, Layers, ExternalLink, AlertTriangle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="border-b border-[#D6C8B5] pb-8 dark:border-[#171614]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
          <span>PLATFORM OVERVIEW</span>
          <span aria-hidden="true">·</span>
          <span>CONSUMER PROTECTION & LEGAL AWARENESS</span>
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-bold text-[#352820] sm:text-5xl dark:text-[#E8E0D6]">
          About NyayaDesk
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
          NyayaDesk is a dedicated legal awareness and information retrieval platform for Indian Consumer Protection Law. It bridges the gap between dense statutory text and everyday consumer questions in India.
        </p>
      </div>

      {/* Core Objectives */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border border-[#D6C8B5] bg-[#FFFCF7] p-6 dark:border-[#171614] dark:bg-[#382D25]">
          <h2 className="font-editorial text-xl font-bold text-[#352820] dark:text-[#E8E0D6]">
            Core Mission & Objectives
          </h2>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#5B3A29] dark:text-[#DC957D]">•</span>
              <span>
                <strong>Democratise Legal Awareness:</strong> Enable consumers across India to easily understand their rights regarding defective goods, deficient services, misleading ads, and unfair e-commerce practices.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#5B3A29] dark:text-[#DC957D]">•</span>
              <span>
                <strong>Zero-Hallucination Legal Retrieval:</strong> Mandate that every AI response be strictly grounded in verified statutory passages from the Consumer Protection Act, 2019 and related rules.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#5B3A29] dark:text-[#DC957D]">•</span>
              <span>
                <strong>Transparent Citations:</strong> Provide exact section numbers, issuing authorities, and official gazette hyperlinks so users can verify primary legal provisions independently.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#5B3A29] dark:text-[#DC957D]">•</span>
              <span>
                <strong>Strict Safety Guardrails:</strong> Protect users by explicitly refusing to provide personal litigation strategies, predict winning odds, or draft bespoke court pleadings.
              </span>
            </li>
          </ul>
        </div>

        <div className="border border-[#D6C8B5] bg-[#FFFCF7] p-6 dark:border-[#171614] dark:bg-[#382D25]">
          <h2 className="font-editorial text-xl font-bold text-[#352820] dark:text-[#E8E0D6]">
            Technical Stack & Architecture
          </h2>
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
            <div>
              <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">Frontend:</span> React 19, TypeScript, Vite, Tailwind CSS with custom editorial legal theme tokens, Lucide icons, responsive accessible design.
            </div>
            <div>
              <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">Backend & Full-Stack Server:</span> Express / FastAPI with Pydantic schemas, modular retrieval service, document validation, and safety policy engine.
            </div>
            <div>
              <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">AI Engine:</span> Official Google Gen AI SDK utilizing Gemini 2.5 Flash for concise, grounded plain-language explanations.
            </div>
            <div>
              <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">Knowledge Ingestion:</span> Section-aware chunking preserving statutory hierarchy, PyMuPDF extraction, domain validation, and OCR detection for scanned PDFs.
            </div>
          </div>
        </div>
      </section>

      {/* RAG Pipeline Breakdown */}
      <section className="border border-[#D6C8B5] bg-[#FFFCF7] p-8 dark:border-[#171614] dark:bg-[#382D25]">
        <h2 className="font-editorial text-2xl font-bold text-[#352820] dark:text-[#E8E0D6]">
          RAG Pipeline & Safety Guardrails
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
          NyayaDesk incorporates a five-stage verification pipeline to uphold legal integrity:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/40 p-4 dark:border-[#171614] dark:bg-[#252421]/60">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">STAGE 1</div>
            <div className="mt-1 font-semibold text-xs text-[#352820] dark:text-[#E8E0D6]">Scope & Safety</div>
            <p className="mt-1 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              Disarms prompt injections, intercepts ongoing dispute strategy requests, and redirects non-consumer legal queries.
            </p>
          </div>

          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/40 p-4 dark:border-[#171614] dark:bg-[#252421]/60">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">STAGE 2</div>
            <div className="mt-1 font-semibold text-xs text-[#352820] dark:text-[#E8E0D6]">Passage Retrieval</div>
            <p className="mt-1 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              Performs high-precision semantic matching across indexed statutes with token stemming and synonym expansion.
            </p>
          </div>

          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/40 p-4 dark:border-[#171614] dark:bg-[#252421]/60">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">STAGE 3</div>
            <div className="mt-1 font-semibold text-xs text-[#352820] dark:text-[#E8E0D6]">Evidence Verification</div>
            <p className="mt-1 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              Applies similarity thresholds. If evidence is insufficient, triggers safe fallback instead of guessing.
            </p>
          </div>

          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/40 p-4 dark:border-[#171614] dark:bg-[#252421]/60">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">STAGE 4</div>
            <div className="mt-1 font-semibold text-xs text-[#352820] dark:text-[#E8E0D6]">Grounded Synthesis</div>
            <p className="mt-1 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              Passes query and retrieved passages to Gemini with strict instructions to rely solely on provided text.
            </p>
          </div>

          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/40 p-4 dark:border-[#171614] dark:bg-[#252421]/60">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">STAGE 5</div>
            <div className="mt-1 font-semibold text-xs text-[#352820] dark:text-[#E8E0D6]">Citation Integrity</div>
            <p className="mt-1 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              Validates that returned citations correspond exactly to verified source passages before display.
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Box */}
      <section className="border border-[#DC957D] bg-[#F4EBDD] p-6 dark:border-[#DC957D]/60 dark:bg-[#252421]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#DC957D]" />
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#352820] dark:text-[#E8E0D6]">
              Legal Awareness Disclaimer
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              NyayaDesk provides general legal information for educational and awareness purposes only. It does not provide legal advice or analyse individual ongoing cases or disputes. Users facing actual legal controversies should consult an advocate or contact the National Consumer Helpline at 1915 (consumerhelpline.gov.in).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
