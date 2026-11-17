import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '../types';
import {
  Send,
  Trash2,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';

interface ChatPageProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialQuery = '',
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [onlineSearchEnabled, setOnlineSearchEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const exampleQuestions = [
    'What official procedure can a consumer use to raise a grievance about an online purchase?',
    'What is the statutory limitation period for filing a complaint in the Consumer Forum?',
    'What are the revised pecuniary limits for District and State Consumer Commissions?',
    'Is a "No Return, No Refund" policy valid for defective electronic products?',
    'Within how many hours must an e-commerce platform acknowledge a complaint?'
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // If initialQuery is passed from Hero or Problem Card
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery);
      handleSend(initialQuery.trim());
      onClearInitialQuery?.();
    }
  }, [initialQuery]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          enableOnlineSearch: onlineSearchEnabled
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        legal_provision: data.legal_provision,
        procedure: data.procedure,
        citations: data.citations,
        limitations: data.limitations,
        is_grounded: data.is_grounded,
        search_grounded: data.search_grounded,
        search_queries: data.search_queries,
        web_sources: data.web_sources,
        refusal: data.refusal,
        refusal_reason: data.refusal_reason,
        model_used: data.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        'Unable to complete legal query. Please ensure the local server is running, or verify network access.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] min-h-[580px] max-w-5xl flex-col border border-[#D6C8B5] bg-[#FFFCF7] dark:border-[#171614] dark:bg-[#382D25]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6C8B5] px-6 py-4 dark:border-[#171614]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-xl font-bold text-[#352820] dark:text-[#E8E0D6]">
              NyayaDesk Legal Information Assistant
            </h1>
            <span className="text-xs text-[#75685E] dark:text-[#B9ADA0]">
              · {onlineSearchEnabled ? 'Google Search Grounded' : 'Grounded Statutory RAG'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#75685E] dark:text-[#B9ADA0]">
            Provides plain-language explanations cited from verified Indian consumer statutes and live official sources. General legal awareness only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Web Search Grounding Toggle */}
          <button
            type="button"
            onClick={() => setOnlineSearchEnabled(!onlineSearchEnabled)}
            className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-all ${
              onlineSearchEnabled
                ? 'border-[#5B3A29] bg-[#5B3A29] text-[#FFFCF7] dark:border-[#DC957D] dark:bg-[#DC957D] dark:text-[#252421]'
                : 'border-[#D6C8B5] bg-[#F4EBDD]/60 text-[#75685E] hover:bg-[#D6C8B5] dark:border-[#171614] dark:bg-[#252421] dark:text-[#B9ADA0]'
            }`}
            title={
              onlineSearchEnabled
                ? 'Google Search Grounding is ON: queries use gemini-3.8-flash with real-time web search'
                : 'Google Search Grounding is OFF: queries use strict local statutory knowledge base'
            }
          >
            <Globe className={`h-3.5 w-3.5 ${onlineSearchEnabled ? 'text-[#DC957D] dark:text-[#5B3A29]' : ''}`} />
            <span>Online Search: {onlineSearchEnabled ? 'Active' : 'Offline'}</span>
          </button>

          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 border border-[#D6C8B5] bg-[#F4EBDD] px-3 py-1.5 text-xs font-medium text-[#352820] transition-colors hover:bg-[#D6C8B5] dark:border-[#171614] dark:bg-[#252421] dark:text-[#E8E0D6]"
            title="Start fresh conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Conversation Flow */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="mx-auto my-auto max-w-2xl py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#D6C8B5] bg-[#F4EBDD] text-[#5B3A29] dark:border-[#171614] dark:bg-[#252421] dark:text-[#DC957D]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-[#352820] dark:text-[#E8E0D6]">
              Ask a Consumer Law Question
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#75685E] dark:text-[#B9ADA0]">
              NyayaDesk retrieves passages from the Consumer Protection Act 2019, E-Commerce Rules 2020, and CCPA guidelines to answer with cited evidence.
            </p>

            {/* Suggested Question Chips */}
            <div className="mt-8 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                Suggested Questions
              </span>
              <div className="mt-3 flex flex-col gap-2">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="flex items-center justify-between border border-[#D6C8B5] bg-[#F4EBDD]/50 px-4 py-2.5 text-left text-xs font-medium text-[#352820] transition-colors hover:border-[#5B3A29] hover:bg-[#F4EBDD] dark:border-[#171614] dark:bg-[#252421]/60 dark:text-[#E8E0D6] dark:hover:border-[#DC957D]"
                  >
                    <span>{q}</span>
                    <span className="ml-2 text-xs font-bold text-[#DC957D]">Ask →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] text-[#75685E] dark:text-[#B9ADA0] mb-1">
                <span>{msg.role === 'user' ? 'You' : 'NyayaDesk Assistant'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
                {msg.model_used && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-[10px] text-[#5B3A29] dark:text-[#DC957D]">
                      {msg.model_used}
                    </span>
                  </>
                )}
              </div>

              {/* Message Bubble / Surface */}
              <div
                className={`max-w-3xl border p-4 sm:p-5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'border-[#5B3A29] bg-[#5B3A29] text-[#FFFCF7] dark:border-[#DC957D] dark:bg-[#DC957D] dark:text-[#252421]'
                    : msg.refusal
                    ? 'border-[#DC957D] bg-[#F4EBDD] text-[#352820] dark:border-[#DC957D] dark:bg-[#252421] dark:text-[#E8E0D6]'
                    : 'border-[#D6C8B5] bg-[#FFFCF7] text-[#352820] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#E8E0D6]'
                }`}
              >
                {/* Search Grounding Banner if Grounded via Google Search */}
                {msg.search_grounded && (
                  <div className="mb-3.5 border-b border-[#D6C8B5] pb-2.5 dark:border-[#171614]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 border border-[#5B3A29] bg-[#F4EBDD] px-2 py-0.5 text-[11px] font-semibold text-[#5B3A29] dark:border-[#DC957D] dark:bg-[#252421] dark:text-[#DC957D]">
                        <Globe className="h-3 w-3 text-[#5B3A29] dark:text-[#DC957D]" />
                        <span>Grounded with Google Search (gemini-3.8-flash)</span>
                      </span>
                      {msg.search_queries && msg.search_queries.length > 0 && (
                        <span className="text-[10px] text-[#75685E] dark:text-[#B9ADA0]">
                          Web searches performed:
                        </span>
                      )}
                    </div>
                    {msg.search_queries && msg.search_queries.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {msg.search_queries.map((q, qIdx) => (
                          <span
                            key={qIdx}
                            className="border border-[#D6C8B5] bg-[#F4EBDD]/50 px-2 py-0.5 font-mono text-[10px] text-[#352820] dark:border-[#171614] dark:bg-[#252421]/60 dark:text-[#E8E0D6]"
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Refusal Notice */}
                {msg.refusal && (
                  <div className="mb-3 flex items-start gap-2 border-b border-[#DC957D]/50 pb-2.5 text-xs text-[#5B3A29] dark:text-[#DC957D]">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <div>
                      <strong className="font-semibold">Guardrail Policy:</strong>{' '}
                      {msg.refusal_reason === 'ONGOING_DISPUTE'
                        ? 'Ongoing Individual Dispute / Litigation Strategy Refusal'
                        : 'Out of Scope Domain Notice'}
                    </div>
                  </div>
                )}

                {/* Plain-Language Answer Text */}
                <div className="space-y-3 whitespace-pre-line text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Applicable Provision Tag */}
                {msg.legal_provision && !msg.refusal && (
                  <div className="mt-4 border-t border-[#D6C8B5] pt-3 dark:border-[#171614]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                      Statutory Provision / Authority
                    </div>
                    <div className="mt-1 font-mono text-xs font-semibold text-[#5B3A29] dark:text-[#DC957D]">
                      {msg.legal_provision}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Procedure */}
                {msg.procedure && msg.procedure.length > 0 && !msg.refusal && (
                  <div className="mt-4 border-t border-[#D6C8B5] pt-3 dark:border-[#171614]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                      Procedural Guidance
                    </div>
                    <ol className="mt-2 space-y-1.5">
                      {msg.procedure.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 text-xs">
                          <span className="font-mono font-bold text-[#5B3A29] dark:text-[#DC957D]">
                            {sIdx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Citations (Statutory and Live Web) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 border-t border-[#D6C8B5] pt-3 dark:border-[#171614]">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#75685E] dark:text-[#B9ADA0]">
                      <span>
                        Verified Authorities & Citations ({msg.citations.length})
                      </span>
                      {msg.citations.some(c => c.is_web_source) && (
                        <span className="inline-flex items-center gap-1 font-normal lowercase text-[10px] text-[#5B3A29] dark:text-[#DC957D]">
                          <Globe className="h-3 w-3" /> includes live web sources
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className={`border p-2.5 text-xs transition-colors ${
                            c.is_web_source
                              ? 'border-[#5B3A29]/30 bg-[#F4EBDD]/60 dark:border-[#DC957D]/30 dark:bg-[#252421]/70'
                              : 'border-[#D6C8B5] bg-[#F4EBDD]/40 dark:border-[#171614] dark:bg-[#252421]/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-[#352820] dark:text-[#E8E0D6] line-clamp-1">
                              {c.document_title}
                            </div>
                            {c.is_web_source && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 border border-[#5B3A29]/30 bg-[#5B3A29]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#5B3A29] dark:border-[#DC957D]/30 dark:bg-[#DC957D]/20 dark:text-[#DC957D]">
                                <Globe className="h-2.5 w-2.5" />
                                WEB
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-[#5B3A29] dark:text-[#DC957D]">
                            {c.issuing_authority} {c.section_number && c.section_number !== 'Live Grounding' ? `· ${c.section_number}` : ''}
                          </div>
                          {c.excerpt && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-[#75685E] italic dark:text-[#B9ADA0]">
                              "{c.excerpt}"
                            </p>
                          )}
                          <a
                            href={c.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#5B3A29] hover:underline dark:text-[#DC957D]"
                          >
                            <span>{c.is_web_source ? 'Visit Live Source Link' : 'Official Gazette'}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start gap-1">
            <span className="text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
              NyayaDesk Assistant is processing your legal query...
            </span>
            <div className="flex items-center gap-2 border border-[#D6C8B5] bg-[#FFFCF7] px-4 py-3 text-xs text-[#5B3A29] dark:border-[#171614] dark:bg-[#382D25] dark:text-[#DC957D]">
              <div className="h-2 w-2 animate-ping bg-[#5B3A29] dark:bg-[#DC957D]" />
              <span className="font-mono">
                {onlineSearchEnabled
                  ? 'Searching live government portals, gazette notifications & statutory repositories with Google Search...'
                  : 'Retrieving relevant passages from local statutory knowledge base...'}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>Query Error</span>
            </div>
            <p className="mt-1">{errorMessage}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bottom Bar */}
      <div className="border-t border-[#D6C8B5] bg-[#FFFCF7] p-4 dark:border-[#171614] dark:bg-[#382D25]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a general consumer rights question (Enter to submit, Shift+Enter for new line)..."
            className="flex-1 resize-none border border-[#D6C8B5] bg-[#F4EBDD]/30 p-2.5 text-xs text-[#352820] placeholder-[#75685E] focus:border-[#5B3A29] focus:outline-none dark:border-[#171614] dark:bg-[#252421]/50 dark:text-[#E8E0D6] dark:placeholder-[#B9ADA0] dark:focus:border-[#DC957D]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#5B3A29] text-[#FFFCF7] transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-[#DC957D] dark:text-[#252421]"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#75685E] dark:text-[#B9ADA0]">
          <div className="flex items-center gap-2">
            <span>Shift+Enter for newline</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setOnlineSearchEnabled(!onlineSearchEnabled)}
              className="inline-flex items-center gap-1 font-medium hover:underline text-[#5B3A29] dark:text-[#DC957D]"
              title="Click to toggle Google Search Grounding"
            >
              <Globe className="h-3 w-3" />
              <span>{onlineSearchEnabled ? 'Live Web Search Active' : 'Offline Statutory Mode'}</span>
            </button>
          </div>
          <span>NyayaDesk does not provide legal advice or analyse individual ongoing cases.</span>
        </div>
      </div>
    </div>
  );
};
