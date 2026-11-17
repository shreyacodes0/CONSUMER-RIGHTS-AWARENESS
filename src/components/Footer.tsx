import React from 'react';
import { Scale, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="border-t border-[#D6C8B5] bg-[#FFFCF7] text-sm text-[#75685E] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#B9ADA0]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-[#5B3A29] dark:text-[#DC957D]">
              <Scale className="h-5 w-5" />
              <span className="font-editorial text-lg font-bold text-[#352820] dark:text-[#E8E0D6]">
                NyayaDesk
              </span>
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
              Clear Information · Cited Rules · Informed Decisions
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              A legal awareness platform for Indian consumer protection. NyayaDesk couples verified statutory provisions with a transparent retrieval-augmented architecture, eliminating hallucinations through grounded evidence.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#5B3A29] dark:text-[#DC957D]">
              <ShieldCheck className="h-4 w-4" />
              <span>Grounded Legal Intelligence · Verified Statutory Retrieval</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-editorial text-sm font-semibold text-[#352820] dark:text-[#E8E0D6]">
              Platform Index
            </h2>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('problems')}
                  className="hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  6 Common Problems
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  Legal Resources & Statutes
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('chat')}
                  className="hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  NyayaDesk AI Chatbot
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('about')}
                  className="hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  About NyayaDesk
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h2 className="font-editorial text-sm font-semibold text-[#352820] dark:text-[#E8E0D6]">
              Official Portals
            </h2>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  National Consumer Helpline (1915)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://edaakhil.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  e-Daakhil Filing Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.indiacode.nic.in/handle/123456789/15256"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  Consumer Protection Act, 2019
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#352820] hover:underline dark:hover:text-[#E8E0D6]"
                >
                  Dept. of Consumer Affairs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="mt-10 border-t border-[#D6C8B5] pt-6 dark:border-[#171614]">
          <p className="text-center text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
            <strong>Disclaimer:</strong> NyayaDesk provides general legal information for educational and awareness purposes only. It does not provide legal advice or analyse individual ongoing cases or disputes. No government endorsement, certification, or client-advocate relationship is created.
          </p>
          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-[#75685E] sm:flex-row dark:text-[#B9ADA0]">
            <span>© {new Date().getFullYear()} NyayaDesk · Consumer Legal Awareness Platform</span>
            <span>Privacy Notice: No personal telemetry or private case details are stored or transmitted.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
