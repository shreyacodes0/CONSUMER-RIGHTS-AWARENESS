import React, { useState } from 'react';
import { PredefinedProblem } from '../types';
import { Search, CheckCircle2, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

interface ProblemsPageProps {
  problems: PredefinedProblem[];
  onSelectProblem: (problem: PredefinedProblem) => void;
  onAskInChat: (question: string) => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({
  problems,
  onSelectProblem,
  onAskInChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.legal_provision.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-[#D6C8B5] pb-6 dark:border-[#171614]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
          <span>VERIFIED PREDEFINED REPOSITORY</span>
          <span aria-hidden="true">·</span>
          <span>NO LIVE AI CALL REQUIRED</span>
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-bold text-[#352820] sm:text-4xl dark:text-[#E8E0D6]">
          Common Consumer Problems
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
          Each predefined problem below contains an expert-reviewed legal answer extracted from the Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020. These answers load instantly from structured local data.
        </p>

        {/* Filter Input */}
        <div className="mt-6 max-w-md">
          <div className="flex items-center gap-2 border border-[#D6C8B5] bg-[#FFFCF7] px-3 py-2 dark:border-[#171614] dark:bg-[#382D25]">
            <Search className="h-4 w-4 text-[#75685E] dark:text-[#B9ADA0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by keyword (e.g. warranty, refund, defect)..."
              className="w-full bg-transparent text-xs text-[#352820] placeholder-[#75685E] focus:outline-none dark:text-[#E8E0D6] dark:placeholder-[#B9ADA0]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Problems */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((problem) => (
          <div
            key={problem.id}
            className="flex flex-col justify-between border border-[#D6C8B5] bg-[#FFFCF7] p-6 dark:border-[#171614] dark:bg-[#382D25]"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#75685E] dark:text-[#B9ADA0]">
                <span className="font-mono font-semibold text-[#5B3A29] dark:text-[#DC957D]">
                  {problem.id}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {problem.verification_status}
                </span>
              </div>

              <h2 className="mt-3 font-editorial text-xl font-bold text-[#352820] dark:text-[#E8E0D6]">
                {problem.title}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
                {problem.short_description}
              </p>

              {/* Reviewed Answer Summary */}
              <div className="mt-4 border-l-2 border-[#5B3A29] pl-3 text-xs leading-relaxed text-[#352820] dark:border-[#DC957D] dark:text-[#E8E0D6]">
                {problem.reviewed_answer}
              </div>

              {/* Statutory Provision */}
              <div className="mt-4 border-t border-[#D6C8B5]/60 pt-3 text-xs dark:border-[#171614]">
                <span className="font-semibold text-[#5B3A29] dark:text-[#DC957D]">Statutory Provision: </span>
                <span className="font-mono text-[11px] text-[#352820] dark:text-[#E8E0D6]">{problem.legal_provision}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#D6C8B5]/60 pt-4 dark:border-[#171614]">
              <button
                onClick={() => onSelectProblem(problem)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3A29] hover:underline dark:text-[#DC957D]"
              >
                <span>Read Full Procedural Steps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => onAskInChat(`Can you explain the rules for ${problem.title.toLowerCase()} in consumer law?`)}
                className="border border-[#D6C8B5] bg-[#F4EBDD] px-3 py-1 text-xs font-medium text-[#352820] transition-colors hover:bg-[#D6C8B5] dark:border-[#171614] dark:bg-[#252421] dark:text-[#E8E0D6]"
              >
                Ask Related Question
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
