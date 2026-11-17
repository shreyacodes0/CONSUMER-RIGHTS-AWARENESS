import React from 'react';
import { PredefinedProblem } from '../types';
import { X, ExternalLink, CheckCircle2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface ProblemModalProps {
  problem: PredefinedProblem | null;
  onClose: () => void;
  onAskInChat: (question: string) => void;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  problem,
  onClose,
  onAskInChat,
}) => {
  if (!problem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#252421]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#D6C8B5] bg-[#FFFCF7] p-6 shadow-xl dark:border-[#171614] dark:bg-[#382D25] sm:p-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#D6C8B5] pb-4 dark:border-[#171614]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#75685E] dark:text-[#B9ADA0]">
              <span className="font-semibold text-[#5B3A29] dark:text-[#DC957D]">PREDEFINED LEGAL PROBLEM</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {problem.verification_status}
              </span>
            </div>
            <h2
              id="problem-modal-title"
              className="mt-1 font-editorial text-2xl font-bold text-[#352820] dark:text-[#E8E0D6]"
            >
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-[#D6C8B5] bg-[#F4EBDD] text-[#352820] hover:bg-[#D6C8B5] dark:border-[#171614] dark:bg-[#252421] dark:text-[#E8E0D6]"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Reviewed Plain-Language Answer */}
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
              Reviewed Legal Explanation (Instant Local Data)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#352820] dark:text-[#E8E0D6]">
              {problem.reviewed_answer}
            </p>
          </div>

          {/* Statutory Provision */}
          <div className="border border-[#D6C8B5] bg-[#F4EBDD]/50 p-4 dark:border-[#171614] dark:bg-[#252421]/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
              Applicable Statutory Provision
            </h3>
            <p className="mt-1 font-mono text-xs font-medium text-[#352820] dark:text-[#E8E0D6]">
              {problem.legal_provision}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#D6C8B5]/60 pt-2 text-xs text-[#75685E] dark:border-[#171614] dark:text-[#B9ADA0]">
              <span>{problem.source_citation}</span>
              <a
                href={problem.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#5B3A29] hover:underline dark:text-[#DC957D]"
              >
                Official Gazette Text
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Step-by-Step Verified Procedure */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
              Recommended Step-by-Step Procedure
            </h3>
            <ol className="mt-3 space-y-2.5">
              {problem.procedure.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-[#352820] dark:text-[#E8E0D6]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[#D6C8B5] bg-[#F4EBDD] font-mono text-[11px] font-bold text-[#5B3A29] dark:border-[#171614] dark:bg-[#252421] dark:text-[#DC957D]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Suggested Chat Questions */}
          {problem.suggested_questions && problem.suggested_questions.length > 0 && (
            <div className="border-t border-[#D6C8B5] pt-4 dark:border-[#171614]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                Ask Related Question in NyayaDesk Chat
              </h3>
              <div className="mt-2 space-y-1.5">
                {problem.suggested_questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAskInChat(q);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between border border-[#D6C8B5] bg-[#FFFCF7] px-3 py-2 text-left text-xs font-medium text-[#352820] transition-colors hover:border-[#5B3A29] hover:bg-[#F4EBDD] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#E8E0D6] dark:hover:border-[#DC957D] dark:hover:bg-[#252421]"
                  >
                    <span>{q}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#DC957D]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
