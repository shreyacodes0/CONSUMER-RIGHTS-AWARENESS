export interface PredefinedProblem {
  id: string;
  title: string;
  short_description: string;
  reviewed_answer: string;
  legal_provision: string;
  source_citation: string;
  official_url: string;
  procedure: string[];
  is_verified: boolean;
  verification_status: string;
  suggested_questions: string[];
}

export interface LegalResource {
  id: string;
  title: string;
  issuing_authority: string;
  document_type: string;
  date_or_version: string;
  official_url: string;
  domain: string;
  description: string;
  key_sections: string[];
  verified: boolean;
}

export interface Citation {
  document_title: string;
  issuing_authority: string;
  section_number: string;
  page_number?: string;
  official_url: string;
  excerpt?: string;
  is_web_source?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  legal_provision?: string;
  procedure?: string[];
  citations?: Citation[];
  limitations?: string;
  is_grounded?: boolean;
  search_grounded?: boolean;
  search_queries?: string[];
  web_sources?: { title: string; url: string }[];
  refusal?: boolean;
  refusal_reason?: string;
  model_used?: string;
  timestamp: string;
}
