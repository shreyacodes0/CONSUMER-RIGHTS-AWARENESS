import React, { useState } from 'react';
import { PredefinedProblem, LegalResource } from '../types';
import {
  Search,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Building2,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  problems: PredefinedProblem[];
  resources: LegalResource[];
  onSelectProblem: (problem: PredefinedProblem) => void;
  onAskQuestion: (query: string) => void;
  setCurrentTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  problems,
  resources,
  onSelectProblem,
  onAskQuestion,
  setCurrentTab,
}) => {
  const [heroInput, setHeroInput] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroInput.trim()) {
      onAskQuestion(heroInput.trim());
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* ---------------- A. HERO SECTION ---------------- */}
      <section className="border-b border-[#D6C8B5] pb-14 dark:border-[#171614]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#5B3A29] dark:text-[#DC957D]">
            <span>INDIAN CONSUMER PROTECTION LAW</span>
            <span aria-hidden="true">·</span>
            <span>CPA 2019 & E-COMMERCE RULES</span>
          </div>

          <h1 className="mt-4 font-editorial text-4xl font-bold tracking-tight text-[#352820] sm:text-5xl dark:text-[#E8E0D6]">
            Understand your consumer rights.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#75685E] sm:text-lg dark:text-[#B9ADA0]">
            Explore common consumer problems, understand relevant legal provisions, and find official resources for the next steps.
          </p>

          {/* Prominent Question Input */}
          <form
            onSubmit={handleHeroSubmit}
            className="mx-auto mt-8 max-w-2xl border border-[#D6C8B5] bg-[#FFFCF7] p-2 shadow-sm transition-all focus-within:border-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:focus-within:border-[#DC957D]"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 shrink-0 text-[#75685E] dark:text-[#B9ADA0]" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Describe a general consumer rights question..."
                  className="w-full bg-transparent py-2 text-sm text-[#352820] placeholder-[#75685E] focus:outline-none dark:text-[#E8E0D6] dark:placeholder-[#B9ADA0]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#5B3A29] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFCF7] transition-colors hover:bg-[#352820] focus:ring-2 focus:ring-[#5B3A29] focus:outline-none dark:bg-[#DC957D] dark:text-[#252421] dark:hover:bg-[#E8E0D6]"
              >
                <span>Ask NyayaDesk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Prompt cues */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#75685E] dark:text-[#B9ADA0]">
            <span className="font-medium">Try asking:</span>
            <button
              onClick={() => onAskQuestion('What is the limitation period for filing a consumer complaint?')}
              className="text-[#5B3A29] hover:underline dark:text-[#DC957D]"
            >
              Limitation period
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onAskQuestion('Can an e-commerce platform charge arbitrary cancellation fees?')}
              className="text-[#5B3A29] hover:underline dark:text-[#DC957D]"
            >
              Order cancellation fees
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onAskQuestion('What are the revised pecuniary limits for District Commission?')}
              className="text-[#5B3A29] hover:underline dark:text-[#DC957D]"
            >
              District Commission jurisdiction
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- B. COMMON PROBLEMS SECTION ---------------- */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
              Verified Statutory Knowledge
            </div>
            <h2 className="font-editorial text-2xl font-bold text-[#352820] sm:text-3xl dark:text-[#E8E0D6]">
              Common Consumer Problems
            </h2>
            <p className="mt-1 text-sm text-[#75685E] dark:text-[#B9ADA0]">
              Instant reviewed answers from verified statutory provisions — loaded directly without AI calls.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('problems')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B3A29] hover:underline dark:text-[#DC957D]"
          >
            View problem matrix
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.slice(0, 6).map((problem, index) => (
            <div
              key={problem.id}
              onClick={() => onSelectProblem(problem)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProblem(problem);
                }
              }}
              role="button"
              tabIndex={0}
              className="group flex flex-col justify-between border border-[#D6C8B5] bg-[#FFFCF7] p-5 text-left transition-all hover:border-[#5B3A29] hover:shadow-sm focus:border-[#5B3A29] focus:outline-none dark:border-[#171614] dark:bg-[#382D25] dark:hover:border-[#DC957D]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#75685E] dark:text-[#B9ADA0]">
                  <span className="font-mono font-semibold text-[#5B3A29] dark:text-[#DC957D]">
                    PROBLEM 0{index + 1}
                  </span>
                  <span>Verified Text</span>
                </div>
                <h3 className="mt-3 font-editorial text-lg font-bold text-[#352820] group-hover:text-[#5B3A29] dark:text-[#E8E0D6] dark:group-hover:text-[#DC957D]">
                  {problem.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
                  {problem.short_description}
                </p>
              </div>

              <div className="mt-4 border-t border-[#D6C8B5]/60 pt-3 text-xs dark:border-[#171614]">
                <div className="truncate font-mono text-[11px] text-[#5B3A29] dark:text-[#DC957D]">
                  {problem.legal_provision.split('—')[1]?.trim() || problem.legal_provision}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#75685E] dark:text-[#B9ADA0]">
                  <span className="group-hover:underline">Inspect verified remedy</span>
                  <ArrowRight className="h-3 w-3 text-[#5B3A29] transition-transform group-hover:translate-x-1 dark:text-[#DC957D]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- C. HOW IT WORKS ---------------- */}
      <section className="border border-[#D6C8B5] bg-[#FFFCF7] p-8 dark:border-[#171614] dark:bg-[#382D25]">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
            Architecture & Transparency
          </span>
          <h2 className="mt-1 font-editorial text-2xl font-bold text-[#352820] dark:text-[#E8E0D6]">
            How NyayaDesk Operates
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#75685E] dark:text-[#B9ADA0]">
            Grounded legal retrieval designed to prevent hallucinations and cite official sources.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-l-2 border-[#5B3A29] pl-4 dark:border-[#DC957D]">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">01</div>
            <h3 className="mt-1 text-sm font-semibold text-[#352820] dark:text-[#E8E0D6]">
              Choose a problem or ask a question
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              Browse reviewed problem categories for instant answers, or submit a custom question regarding consumer protections.
            </p>
          </div>

          <div className="border-l-2 border-[#5B3A29] pl-4 dark:border-[#DC957D]">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">02</div>
            <h3 className="mt-1 text-sm font-semibold text-[#352820] dark:text-[#E8E0D6]">
              Searches verified legal documentation
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              Passages are retrieved from indexed official sources including CPA 2019, E-Commerce Rules, and CCPA guidelines with strict similarity thresholds.
            </p>
          </div>

          <div className="border-l-2 border-[#5B3A29] pl-4 dark:border-[#DC957D]">
            <div className="font-mono text-xs font-bold text-[#5B3A29] dark:text-[#DC957D]">03</div>
            <h3 className="mt-1 text-sm font-semibold text-[#352820] dark:text-[#E8E0D6]">
              Receive an explanation with references
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              Synthesizes plain-language legal context, procedural steps, and clickable citations referencing exact section numbers and official gazette URLs.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- D. LEGAL RESOURCES PREVIEW ---------------- */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
              Statutory Documentation
            </div>
            <h2 className="font-editorial text-2xl font-bold text-[#352820] sm:text-3xl dark:text-[#E8E0D6]">
              Official Legal Resources
            </h2>
            <p className="mt-1 text-sm text-[#75685E] dark:text-[#B9ADA0]">
              Authoritative texts from indiacode.nic.in, consumeraffairs.gov.in, and edaakhil.nic.in.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('resources')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B3A29] hover:underline dark:text-[#DC957D]"
          >
            Explore all {resources.length} official resources
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {resources.slice(0, 3).map((res) => (
            <div
              key={res.id}
              className="flex flex-col justify-between border border-[#D6C8B5] bg-[#FFFCF7] p-5 dark:border-[#171614] dark:bg-[#382D25]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#75685E] dark:text-[#B9ADA0]">
                  <span>{res.document_type}</span>
                  <span>{res.domain}</span>
                </div>
                <h3 className="mt-2 font-editorial text-base font-bold text-[#352820] dark:text-[#E8E0D6]">
                  {res.title}
                </h3>
                <p className="mt-1 text-xs text-[#5B3A29] dark:text-[#DC957D]">
                  Authority: {res.issuing_authority}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
                  {res.description}
                </p>
              </div>

              <div className="mt-4 border-t border-[#D6C8B5]/60 pt-3 dark:border-[#171614]">
                <a
                  href={res.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#5B3A29] hover:underline dark:text-[#DC957D]"
                >
                  Access Primary Document
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
