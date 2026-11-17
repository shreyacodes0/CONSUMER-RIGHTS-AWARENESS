import React, { useState, useMemo } from 'react';
import { LegalResource } from '../types';
import { BookOpen, ExternalLink, Search, Building2, X, SlidersHorizontal, AlertCircle, RotateCcw } from 'lucide-react';

interface ResourcesPageProps {
  resources: LegalResource[];
}

type SearchScope = 'ALL' | 'TITLE' | 'AUTHORITY';

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ resources }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('ALL');

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return resources.filter((res) => {
      // Document type filter
      const matchesType = filterType === 'ALL' || res.document_type === filterType;
      if (!matchesType) return false;

      // Text search filter
      if (!term) return true;

      if (searchScope === 'TITLE') {
        return res.title.toLowerCase().includes(term);
      }
      if (searchScope === 'AUTHORITY') {
        return res.issuing_authority.toLowerCase().includes(term);
      }

      // 'ALL' searches title, authority, and description
      return (
        res.title.toLowerCase().includes(term) ||
        res.issuing_authority.toLowerCase().includes(term) ||
        res.description.toLowerCase().includes(term) ||
        res.key_sections.some((sec) => sec.toLowerCase().includes(term))
      );
    });
  }, [resources, filterType, searchTerm, searchScope]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setSearchScope('ALL');
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-[#DC957D]/30 text-[#352820] font-semibold dark:bg-[#DC957D]/40 dark:text-[#E8E0D6] px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-[#D6C8B5] pb-6 dark:border-[#171614]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B3A29] dark:text-[#DC957D]">
          <span>VERIFIED SOURCE DIRECTORY</span>
          <span aria-hidden="true">·</span>
          <span>OFFICIAL GOVERNMENT DOMAINS ONLY</span>
        </div>
        <h1 className="mt-2 font-editorial text-3xl font-bold text-[#352820] sm:text-4xl dark:text-[#E8E0D6]">
          Legal Resources & Official Portals
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
          All legal information on NyayaDesk is derived strictly from primary Indian statutes, official gazette notifications, and government grievance portals. Filter by document title, issuing authority, or regulatory classification.
        </p>

        {/* Search & Filter Controls */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-lg">
              <div className="flex items-center gap-2 border border-[#D6C8B5] bg-[#FFFCF7] px-3 py-2 transition-colors focus-within:border-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:focus-within:border-[#DC957D]">
                <Search className="h-4 w-4 shrink-0 text-[#75685E] dark:text-[#B9ADA0]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    searchScope === 'TITLE'
                      ? 'Filter by document title (e.g. Consumer Protection Act)...'
                      : searchScope === 'AUTHORITY'
                      ? 'Filter by issuing authority (e.g. CCPA, Ministry of Law)...'
                      : 'Search by title, issuing authority, or statute name...'
                  }
                  className="w-full bg-transparent text-xs text-[#352820] placeholder-[#75685E] focus:outline-none dark:text-[#E8E0D6] dark:placeholder-[#B9ADA0]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-0.5 text-[#75685E] hover:text-[#352820] dark:text-[#B9ADA0] dark:hover:text-[#E8E0D6]"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Type Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'Principal Act / Statute', label: 'Statutes / Acts' },
                { id: 'Statutory Rules', label: 'Rules' },
                { id: 'Statutory Guidelines', label: 'Guidelines' },
                { id: 'E-Governance Portal Manual', label: 'Portals' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterType === cat.id
                      ? 'border-[#5B3A29] bg-[#5B3A29] text-[#FFFCF7] dark:border-[#DC957D] dark:bg-[#DC957D] dark:text-[#252421]'
                      : 'border-[#D6C8B5] bg-[#FFFCF7] text-[#75685E] hover:border-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#B9ADA0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selectors and Result Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#75685E] dark:text-[#B9ADA0] pt-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">Search Scope:</span>
              <div className="inline-flex items-center gap-1">
                {(['ALL', 'TITLE', 'AUTHORITY'] as SearchScope[]).map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setSearchScope(scope)}
                    className={`px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                      searchScope === scope
                        ? 'border-[#5B3A29] bg-[#F4EBDD] text-[#5B3A29] font-bold dark:border-[#DC957D] dark:bg-[#252421] dark:text-[#DC957D]'
                        : 'border-[#D6C8B5] text-[#75685E] hover:text-[#352820] dark:border-[#171614] dark:text-[#B9ADA0]'
                    }`}
                  >
                    {scope === 'ALL' ? 'All Fields' : scope === 'TITLE' ? 'Title Only' : 'Authority Only'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{filtered.length}</strong> of {resources.length} documents
              </span>
              {(searchTerm || filterType !== 'ALL' || searchScope !== 'ALL') && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 font-semibold text-[#5B3A29] hover:underline dark:text-[#DC957D]"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filtered.length === 0 ? (
        <div className="border border-[#D6C8B5] bg-[#FFFCF7] p-8 text-center dark:border-[#171614] dark:bg-[#382D25]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#D6C8B5] bg-[#F4EBDD] text-[#5B3A29] dark:border-[#171614] dark:bg-[#252421] dark:text-[#DC957D]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="mt-3 font-editorial text-lg font-bold text-[#352820] dark:text-[#E8E0D6]">
            No Legal Documents Match Your Filter
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#75685E] dark:text-[#B9ADA0]">
            No legal documents were found matching <span className="font-semibold text-[#352820] dark:text-[#E8E0D6]">"{searchTerm}"</span> in {searchScope === 'TITLE' ? 'titles' : searchScope === 'AUTHORITY' ? 'authorities' : 'the index'}.
          </p>
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 bg-[#5B3A29] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FFFCF7] hover:bg-[#352820] dark:bg-[#DC957D] dark:text-[#252421]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Search & Show All</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="flex flex-col justify-between border border-[#D6C8B5] bg-[#FFFCF7] p-6 transition-all hover:border-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:hover:border-[#DC957D]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#75685E] dark:text-[#B9ADA0]">
                  <span>{res.document_type}</span>
                  <span className="font-mono text-[11px] text-[#5B3A29] dark:text-[#DC957D]">{res.domain}</span>
                </div>

                <h2 className="mt-2 font-editorial text-xl font-bold text-[#352820] dark:text-[#E8E0D6]">
                  {searchScope === 'TITLE' || searchScope === 'ALL'
                    ? highlightMatch(res.title, searchTerm)
                    : res.title}
                </h2>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5B3A29] dark:text-[#DC957D]">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">
                    {searchScope === 'AUTHORITY' || searchScope === 'ALL'
                      ? highlightMatch(res.issuing_authority, searchTerm)
                      : res.issuing_authority}
                  </span>
                </div>

                <div className="mt-1 text-xs text-[#75685E] dark:text-[#B9ADA0]">
                  Date / Gazette Identifier: <span className="font-medium text-[#352820] dark:text-[#E8E0D6]">{res.date_or_version}</span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
                  {searchScope === 'ALL' ? highlightMatch(res.description, searchTerm) : res.description}
                </p>

                {/* Key Sections Covered */}
                {res.key_sections && res.key_sections.length > 0 && (
                  <div className="mt-4 border-t border-[#D6C8B5]/60 pt-3 dark:border-[#171614]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                      Indexed Legal Sections
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {res.key_sections.map((sec, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[11px] text-[#352820] dark:text-[#E8E0D6]"
                        >
                          {sec} {idx < res.key_sections.length - 1 && '·'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Link to primary text */}
              <div className="mt-6 border-t border-[#D6C8B5]/60 pt-4 dark:border-[#171614]">
                <a
                  href={res.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3A29] hover:underline dark:text-[#DC957D]"
                >
                  <span>Access Primary Document ({res.domain})</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
