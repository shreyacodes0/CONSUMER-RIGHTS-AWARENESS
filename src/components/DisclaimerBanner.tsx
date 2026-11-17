import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Legal Disclaimer"
      className="border-b border-[#D6C8B5] bg-[#FFFCF7] px-4 py-2.5 text-xs text-[#75685E] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#B9ADA0]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#DC957D]" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#352820] dark:text-[#E8E0D6]">Legal Awareness Notice:</strong>{' '}
            NyayaDesk provides general legal information for educational and awareness purposes only. It does not provide legal advice or analyse individual ongoing cases or disputes. Not government affiliated or a substitute for an advocate.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 text-[#75685E] transition-colors hover:text-[#352820] dark:text-[#B9ADA0] dark:hover:text-[#E8E0D6]"
          aria-label="Dismiss disclaimer banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
