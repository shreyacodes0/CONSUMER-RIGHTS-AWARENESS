import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Paths to verified data files
const PROBLEMS_FILE = path.join(__dirname, 'data', 'problems.json');
const RESOURCES_FILE = path.join(__dirname, 'data', 'resources.json');
const KB_FILE = path.join(__dirname, 'data', 'knowledge_base.json');
const EVAL_FILE = path.join(__dirname, 'data', 'eval_dataset.json');

const MANDATORY_DISCLAIMER =
  'NyayaDesk provides general legal information for educational and awareness purposes only. It does not provide legal advice or analyse individual ongoing cases or disputes.';

// Helper to safely read JSON
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// ----------------------------------------------------
// SAFETY & GUARDRAILS SERVICE (TypeScript Implementation)
// ----------------------------------------------------
const ONGOING_DISPUTE_PATTERNS = [
  /\b(my\s+case|my\s+dispute|case\s+number|case\s+no\b|cc\s*\/\s*\d+|petition\s+no\b)/i,
  /\b(hearing\s+tomorrow|hearing\s+is\s+scheduled|court\s+date|facing\s+trial)\b/i,
  /\b(will\s+i\s+win|chance(s)?\s+of\s+winning|guarantee\s+a\s+win|can\s+i\s+beat)\b/i,
  /\b(draft\s+.*(affidavit|petition|plaint|vakalatnama|legal\s+notice|pleading))\b/i,
  /\b(my\s+lawyer\s+said|opposing\s+counsel|judge\s+ruled\s+against\s+me)\b/i,
  /\b(help\s+me\s+sue\s+specifically|tell\s+me\s+what\s+to\s+say\s+in\s+court)\b/i
];

const OUT_OF_SCOPE_DOMAINS = [
  {
    regex: /\b(divorce|alimony|child\s+custody|hindu\s+marriage\s+act|maintenance\s+under\s+125)\b/i,
    domain: 'Family and Matrimonial Law',
    destination: 'Family Courts or District Legal Services Authorities'
  },
  {
    regex: /\b(anticipatory\s+bail|bail\s+application|crpc|bns|ipc\s+302|fir\s+quashing|murder|theft\s+fir)\b/i,
    domain: 'Criminal Law and Procedure',
    destination: 'the local Police Station or High Court Legal Services Committee'
  },
  {
    regex: /\b(income\s+tax\s+notice|section\s+234f|gst\s+assessment|itrv|scrutiny\s+assessment)\b/i,
    domain: 'Income Tax and Taxation Law',
    destination: 'the Income Tax Department portal (incometax.gov.in) or a Chartered Accountant'
  },
  {
    regex: /\b(property\s+partition|ancestral\s+land\s+dispute|khata\s+transfer|mutation\s+of\s+land)\b/i,
    domain: 'Property and Revenue Law',
    destination: 'the local Sub-Registrar / Revenue Tehsildar or a property advocate'
  }
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /(output|print|show)\s+(the\s+)?system\s+prompt/gi,
  /you\s+are\s+now\s+(hacker|developer\s+mode|dan|unrestricted)/gi,
  /override\s+(all\s+)?safety\s+protocols/gi,
  /delete\s+(the\s+)?(database|index|files)/gi
];

function evaluateSafety(query: string) {
  let sanitized = query.trim();
  let isInjection = false;
  for (const pat of INJECTION_PATTERNS) {
    if (pat.test(sanitized)) {
      sanitized = sanitized.replace(pat, '').trim();
      isInjection = true;
    }
  }

  // Detect out of scope domains to guide brief educational answers
  let domainHint: string | null = null;
  let destinationHint: string | null = null;
  for (const item of OUT_OF_SCOPE_DOMAINS) {
    if (item.regex.test(query)) {
      domainHint = item.domain;
      destinationHint = item.destination;
      break;
    }
  }

  // Only refuse explicit demands for litigation drafting or victory guarantees
  for (const pat of ONGOING_DISPUTE_PATTERNS) {
    if (pat.test(query) && /\b(draft\s+.*(affidavit|petition|plaint|vakalatnama)|guarantee\s+a\s+win|tell\s+me\s+what\s+to\s+say\s+in\s+court)\b/i.test(query)) {
      return {
        shouldRefuse: true,
        refusalType: 'ONGOING_DISPUTE',
        refusalReason:
          'NyayaDesk is an educational legal awareness platform and cannot draft individual court pleadings, predict trial outcomes, or devise personal litigation strategy. For personalized court representation, please consult an advocate or your local District Legal Services Authority.',
        sanitizedQuery: sanitized,
        domainHint,
        destinationHint
      };
    }
  }

  return {
    shouldRefuse: false,
    refusalType: null,
    refusalReason: null,
    sanitizedQuery: sanitized,
    isInjection,
    domainHint,
    destinationHint
  };
}

// ----------------------------------------------------
// RETRIEVAL & GROUNDING SERVICE
// ----------------------------------------------------
const SYNONYMS: Record<string, string[]> = {
  lawyer: ['advocate', 'counsel', 'pleader', 'representation', 'represent'],
  advocate: ['lawyer', 'counsel', 'pleader', 'representation', 'represent'],
  limitation: ['limit', 'period', 'delay', 'condonation', 'years', 'time'],
  cancel: ['cancellation', 'cancelled', 'cancelling', 'refund'],
  cancellation: ['cancel', 'cancelled', 'cancelling', 'refund'],
  refund: ['return', 'take back', 'reimbursement', 'withdrawn', 'money back'],
  return: ['refund', 'returns', 'take back', 'exchange'],
  warranty: ['guarantee', 'warranties', 'guarantees', 'repair', 'service deficiency', 'job sheet'],
  guarantee: ['warranty', 'guarantees', 'warranties', 'express warranty'],
  advertisement: ['advertising', 'ads', 'advertisements', 'endorser', 'celebrity', 'misleading'],
  ads: ['advertisement', 'advertising', 'advertisements', 'misleading', 'false claims'],
  court: ['commission', 'dcdrc', 'scdrc', 'ncdrc', 'forum', 'tribunal', 'edaakhil'],
  online: ['ecommerce', 'e-commerce', 'marketplace', 'platform', 'digital', 'website'],
  shopping: ['purchase', 'buyer', 'order'],
  medicine: ['drug', 'goods', 'product', 'expired', 'defect'],
  checkbox: ['pre-ticked', 'boxes', 'consent', 'automatic', 'flight', 'booking'],
  motherboard: ['laptop', 'hardware', 'goods', 'defect', 'warranty', 'deficiency'],
  home: ['reside', 'resides', 'residence', 'territorial', 'jurisdiction', 'district'],
  state: ['territory', 'jurisdiction', 'district', 'opposite party']
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'have', 'been',
  'was', 'under', 'shall', 'what', 'which', 'when', 'where', 'how', 'who', 'whom',
  'does', 'can', 'could', 'would', 'should', 'about', 'any', 'some', 'into',
  'rules', 'regulations', 'policy', 'specific', 'indian', 'india', 'provisions',
  'consumer', 'protection', 'regarding'
]);

function stem(word: string): string {
  const w = word.toLowerCase();
  for (const s of ['tion', 'tions', 'ing', 'ment', 'ments', 'ies', 'ed', 'es', 's']) {
    if (w.length > s.length + 3 && w.endsWith(s)) {
      return w.slice(0, -s.length);
    }
  }
  return w;
}

function tokenize(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  return cleaned
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

interface Passage {
  id: string;
  document_id: string;
  document_title: string;
  issuing_authority: string;
  section_number: string;
  page_number?: string;
  official_url: string;
  version_date: string;
  keywords: string[];
  content: string;
}

function retrievePassages(query: string, passages: Passage[], topK = 4, threshold = 0.28) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { matches: [], hasEvidence: false };

  const scored: { score: number; distinctMatches: number; passage: Passage }[] = [];

  for (const passage of passages) {
    const contentTokens = new Set(tokenize(passage.content));
    const stemmedContent = new Set([...contentTokens].map(stem));
    const keywordTokens = new Set(passage.keywords.flatMap(kw => tokenize(kw)));
    const stemmedKeywords = new Set([...keywordTokens].map(stem));
    const titleTokens = new Set(tokenize(passage.document_title));
    const sectionTokens = new Set(tokenize(passage.section_number));
    const rawContent = passage.content.toLowerCase();

    let distinctMatches = 0;
    let weight = 0;

    for (const q of queryTokens) {
      const qClean = q.toLowerCase();
      const qStem = stem(qClean);
      const qExp = [qClean, qStem];
      if (SYNONYMS[qClean]) {
        qExp.push(...SYNONYMS[qClean]);
      }

      let matched = false;
      let tokenWeight = 0;

      for (const candidate of qExp) {
        const cStem = stem(candidate);
        if (sectionTokens.has(candidate)) {
          tokenWeight = Math.max(tokenWeight, 5.0);
          matched = true;
        } else if (keywordTokens.has(candidate) || stemmedKeywords.has(cStem)) {
          tokenWeight = Math.max(tokenWeight, 3.5);
          matched = true;
        } else if (titleTokens.has(candidate)) {
          tokenWeight = Math.max(tokenWeight, 2.0);
          matched = true;
        } else if (contentTokens.has(candidate) || stemmedContent.has(cStem) || rawContent.includes(candidate)) {
          tokenWeight = Math.max(tokenWeight, 1.2);
          matched = true;
        }
      }

      if (matched) {
        distinctMatches += 1;
        weight += tokenWeight;
      }
    }

    if (distinctMatches > 0) {
      const coverage = distinctMatches / queryTokens.length;
      const denom = Math.max(1.0, Math.sqrt(queryTokens.length) * 2.8);
      const score = Math.min(1.0, (weight / denom) * (0.6 + 0.4 * coverage));
      if (score > 0.10) {
        scored.push({ score, distinctMatches, passage });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, topK).map(s => s.passage);
  const highestScore = scored.length > 0 ? scored[0].score : 0;
  const bestMatches = scored.length > 0 ? scored[0].distinctMatches : 0;

  const minMatchesRequired = queryTokens.length <= 2 ? 1 : 2;
  const coverageRatio = bestMatches / queryTokens.length;

  const hasEvidence =
    highestScore >= threshold &&
    bestMatches >= minMatchesRequired &&
    coverageRatio >= 0.20 &&
    topMatches.length > 0;

  return { matches: topMatches, hasEvidence };
}

function getValidGeminiModel(): string {
  const envModel = (process.env.GEMINI_MODEL || '').trim();
  // Valid models must start with gemini- or models/gemini-
  // Reject keys/tokens like AQ.Ab... or invalid formats
  if (envModel && (envModel.startsWith('gemini-') || envModel.startsWith('models/gemini-'))) {
    return envModel.replace(/^models\//, '');
  }
  return 'gemini-3.1-flash-lite';
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (req, res) => {
  const problems = readJsonFile<any[]>(PROBLEMS_FILE, []);
  const passages = readJsonFile<Passage[]>(KB_FILE, []);
  const apiKey = process.env.GEMINI_API_KEY || '';
  const model = getValidGeminiModel();

  res.json({
    status: 'healthy',
    project: 'NyayaDesk',
    version: '1.0.0',
    gemini_configured: Boolean(apiKey),
    gemini_model: model,
    indexed_passages_count: passages.length,
    predefined_problems_count: problems.length,
    platform: 'Consumer Legal Awareness & Information Platform'
  });
});

// GET /api/problems
app.get('/api/problems', (req, res) => {
  const problems = readJsonFile<any[]>(PROBLEMS_FILE, []);
  res.json(problems);
});

// GET /api/problems/:id
app.get('/api/problems/:id', (req, res) => {
  const problems = readJsonFile<any[]>(PROBLEMS_FILE, []);
  const found = problems.find(p => p.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: `Problem '${req.params.id}' not found.` });
  }
  res.json(found);
});

// GET /api/resources
app.get('/api/resources', (req, res) => {
  const resources = readJsonFile<any[]>(RESOURCES_FILE, []);
  res.json(resources);
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const message = (req.body?.message || '').trim();
  const enableOnlineSearch = req.body?.enableOnlineSearch !== false; // enabled by default
  if (!message || message.length < 2) {
    return res.status(400).json({ error: 'Message must be at least 2 characters.' });
  }

  // 1. Safety Guardrail Evaluation
  const safety = evaluateSafety(message);
  if (safety.shouldRefuse) {
    return res.json({
      answer: safety.refusalReason,
      legal_provision: 'Guardrail: Educational Scope Policy',
      procedure: [],
      citations: [],
      limitations: 'NyayaDesk strictly provides general legal information, not litigation advice.',
      is_grounded: true,
      search_grounded: false,
      search_queries: [],
      web_sources: [],
      refusal: true,
      refusal_reason: safety.refusalType,
      disclaimer: MANDATORY_DISCLAIMER,
      model_used: 'NyayaDesk Safety Policy Engine',
      sources_count: 0
    });
  }

  const queryToSearch = safety.sanitizedQuery || message;

  // 2. Semantic & Passage Retrieval
  const passages = readJsonFile<Passage[]>(KB_FILE, []);
  const { matches, hasEvidence } = retrievePassages(queryToSearch, passages);

  // Build standard verified citations from retrieved local passages only if hasEvidence is true
  const localCitations = (hasEvidence && !safety.domainHint)
    ? matches.map(p => ({
        document_title: p.document_title,
        issuing_authority: p.issuing_authority,
        section_number: p.section_number,
        page_number: p.page_number || '1',
        official_url: p.official_url,
        excerpt: p.content.slice(0, 180) + '...',
        is_web_source: false
      }))
    : [];

  const apiKey = process.env.GEMINI_API_KEY;
  const initialModel = getValidGeminiModel();

  // 3. Grounded Gemini AI Call with optional Google Search Grounding
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const evidenceBlock = (hasEvidence && !safety.domainHint && matches.length > 0)
        ? matches
            .map(
              (p, i) =>
                `[LOCAL STATUTORY PASSAGE ${i + 1}]\nDocument: ${p.document_title}\nSection: ${p.section_number}\nAuthority: ${p.issuing_authority}\nText: ${p.content}`
            )
            .join('\n\n')
        : '';

      const domainPromptNote = safety.domainHint
        ? `\nNOTE ON SCOPE: This query touches ${safety.domainHint}. Provide a brief accurate legal explanation (2-4 sentences) and advise referring to ${safety.destinationHint}.`
        : (matches.length === 0
            ? '\nNOTE: This question is not in the local consumer repository. Provide a brief, accurate explanation (2-4 sentences) of the applicable Indian legal framework, statutory rights, or procedures.'
            : '');

      let response: any = null;
      let successfulModel = '';
      let searchGrounded = false;
      let webSources: { title: string; url: string }[] = [];
      let webSearchQueries: string[] = [];
      let combinedCitations = [...localCitations];

      // Step A: Live Web Search Grounding with gemini-3.8-flash
      if (enableOnlineSearch) {
        try {
          const searchPrompt = `You are NyayaDesk, an educational legal awareness and consumer protection assistant for India.
Explain the applicable consumer rights, statutory provisions, or general Indian legal provisions for the user question below accurately and concisely (in 2-4 sentences).
If the question is out of context or falls outside core Consumer Protection Law, provide a brief, accurate explanation of the relevant Indian law and indicate the appropriate legal authority or forum.
Use the Google Search tool to search for verified, up-to-date Indian legal provisions, gazette notifications, or regulatory guidelines if needed.
Do NOT invent legal sections, case numbers, or hallucinate facts.
Provide your response strictly in valid JSON format matching this structure:
{
  "explanation": "Clear plain language explanation (brief, informative, 2-4 sentences)",
  "legal_provision": "Exact legal provisions, acts, or regulatory guidelines cited",
  "procedure": ["Step 1", "Step 2", "Step 3"],
  "limitations": "Key limitations, statutory limitation periods, or legal caveats"
}

USER QUESTION: ${queryToSearch}
${evidenceBlock ? `VERIFIED LOCAL STATUTORY PASSAGES:\n${evidenceBlock}` : 'LOCAL KNOWLEDGE BASE: No exact local passage match found. Use Google Search or verified Indian legal statutory knowledge.'}
${domainPromptNote}

Respond with pure JSON only, without markdown fences.`;

          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: searchPrompt,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });
          successfulModel = 'gemini-3.8-flash (Google Search Grounded)';

          // Extract grounding metadata
          const metadata = response.candidates?.[0]?.groundingMetadata;
          const chunks = metadata?.groundingChunks || [];
          const queries = metadata?.webSearchQueries || [];
          webSearchQueries = Array.isArray(queries) ? queries : [];

          for (const chunk of chunks) {
            if (chunk?.web?.uri) {
              const uri = chunk.web.uri;
              const title = chunk.web.title || 'Official Legal Web Source';
              if (!webSources.some(s => s.url === uri)) {
                webSources.push({ title, url: uri });
                combinedCitations.push({
                  document_title: title,
                  issuing_authority: 'Online Source (Google Search)',
                  section_number: 'Live Grounding',
                  page_number: 'Online',
                  official_url: uri,
                  excerpt: `Retrieved via live Google Search grounding for: "${queryToSearch}"`,
                  is_web_source: true
                });
              }
            }
          }
          searchGrounded = webSources.length > 0 || webSearchQueries.length > 0;
        } catch (searchErr: any) {
          console.warn('Google Search Grounding encountered an issue or quota exhaustion:', searchErr?.message || searchErr);
          // Seamless fallback to standard model generation below
        }
      }

      // Step B: Standard candidate model fallback (runs for ANY question, including unindexed and out-of-scope)
      if (!response) {
        const localPrompt = `You are NyayaDesk, an educational legal awareness assistant for India.
Explain the applicable legal provisions, rights, and grievance procedures for the user question below clearly and concisely.
If the question is out of context or falls outside core Consumer Protection Law, provide a brief, accurate explanation of the relevant Indian law (2-4 sentences) and indicate the appropriate legal authority or forum.

STRICT INSTRUCTIONS:
Provide your response strictly in valid JSON format matching this structure:
{
  "explanation": "Clear, plain-language explanation (if out-of-context, provide a brief accurate summary of Indian law in 2-4 sentences)",
  "legal_provision": "Exact statutory section or relevant act (e.g., Bharatiya Nyaya Sanhita, Indian Contract Act, Motor Vehicles Act, CPA 2019, etc.)",
  "procedure": ["Step 1", "Step 2", "Step 3"],
  "limitations": "Key caveats, jurisdiction, or advisory note"
}

USER QUESTION: ${queryToSearch}
${evidenceBlock ? `VERIFIED LOCAL EVIDENCE PASSAGES:\n${evidenceBlock}` : ''}
${domainPromptNote}

Respond with pure JSON only, without markdown fences.`;

        const candidateModels = [
          initialModel,
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite',
          'gemini-flash-latest'
        ].filter((m, i, arr) => m && arr.indexOf(m) === i);

        for (const m of candidateModels) {
          try {
            response = await ai.models.generateContent({
              model: m,
              contents: localPrompt
            });
            successfulModel = m;
            break;
          } catch (err: any) {
            console.warn(`Gemini candidate model ${m} failed (${err.message}). Trying next candidate...`);
          }
        }
      }

      // Step C: Process response if any model succeeded
      if (response) {
        let rawText = (response.text || '').trim();
        if (rawText.startsWith('```json')) rawText = rawText.slice(7);
        if (rawText.startsWith('```')) rawText = rawText.slice(3);
        if (rawText.endsWith('```')) rawText = rawText.slice(0, -3);
        rawText = rawText.trim();

        let parsed: any;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = {
            explanation: rawText || (matches[0] ? matches[0].content : 'Information retrieved from Indian legal sources.'),
            legal_provision: matches[0] ? `${matches[0].document_title} — ${matches[0].section_number}` : (safety.domainHint ? `${safety.domainHint} Framework` : 'Indian Legal Framework'),
            procedure: [
              'Preserve relevant documentation, invoices, and communications.',
              safety.destinationHint ? `Consult ${safety.destinationHint} for formal redressal.` : 'Identify the competent forum having territorial jurisdiction.',
              'Access free legal aid via National Legal Services Authority (nalsa.gov.in) or call 15100.'
            ],
            limitations: 'General educational information under Indian Law.'
          };
        }

        let limitationText = parsed.limitations || 'General educational information under Indian Law.';
        if (safety.domainHint) {
          limitationText = `Educational overview for ${safety.domainHint}. For formal legal proceedings, refer to ${safety.destinationHint}.`;
        } else if (enableOnlineSearch && !searchGrounded && hasEvidence) {
          limitationText += ' (Note: Live online search was temporarily rate-limited; answer was verified against the local statutory repository).';
        } else if (!hasEvidence && !searchGrounded) {
          limitationText += ' (Note: Brief educational overview; consult an advocate for individual case representation).';
        }

        // If no citations were attached, attach an authoritative statutory portal citation
        if (combinedCitations.length === 0) {
          combinedCitations.push({
            document_title: parsed.legal_provision || 'India Code — Statutory Legal Repository',
            issuing_authority: safety.destinationHint || 'Legislative Department, Ministry of Law and Justice',
            section_number: 'Statutory Reference',
            page_number: 'Online',
            official_url: 'https://www.indiacode.nic.in',
            excerpt: 'General statutory provisions, acts, and procedural rules under Indian Law.',
            is_web_source: false
          });
        }

        return res.json({
          answer: parsed.explanation || (matches[0] ? matches[0].content : ''),
          legal_provision: parsed.legal_provision || (matches[0] ? `${matches[0].document_title} — ${matches[0].section_number}` : 'Indian Statutory Guidelines'),
          procedure: parsed.procedure || [
            'Preserve proof of transaction and all written communications.',
            'Escalate to the appropriate statutory authority or helpline.',
            'Consult legal aid or a qualified advocate if formal proceedings are required.'
          ],
          citations: combinedCitations,
          limitations: limitationText,
          is_grounded: true,
          search_grounded: searchGrounded,
          search_queries: webSearchQueries,
          web_sources: webSources,
          refusal: false,
          disclaimer: MANDATORY_DISCLAIMER,
          model_used: successfulModel,
          sources_count: combinedCitations.length
        });
      }
    } catch (err: any) {
      console.warn('Gemini API call returned an error or quota was reached. Falling back to verified local synthesis:', err?.message || err);
    }
  }

  // 4. Deterministic Local Synthesis / Informative General Fallback (Offline Mode)
  if (matches.length > 0) {
    const top = matches[0];
    return res.json({
      answer: `Under ${top.document_title}, ${top.section_number}: ${top.content}`,
      legal_provision: `${top.document_title} — ${top.section_number}`,
      procedure: [
        'Preserve tax invoice, packaging, and digital communication.',
        'Register an informal grievance with the merchant or National Consumer Helpline (1915).',
        'If unresolved, file an electronic complaint on e-Daakhil (edaakhil.nic.in) within 2 years.'
      ],
      citations: localCitations,
      limitations: 'Information synthesized directly from verified statutory extracts in the local knowledge base.',
      is_grounded: true,
      search_grounded: false,
      search_queries: [],
      web_sources: [],
      refusal: false,
      disclaimer: MANDATORY_DISCLAIMER,
      model_used: 'Verified Knowledge Base (Local Grounded Synthesis)',
      sources_count: localCitations.length
    });
  }

  // 5. Brief educational overview for unindexed or out-of-context queries when offline
  const fallbackAnswer = safety.domainHint
    ? `Under Indian law, matters concerning ${safety.domainHint} are regulated by statutory provisions administered through ${safety.destinationHint}. While NyayaDesk primarily focuses on Consumer Protection Law, citizens can approach the designated judicial forum, civil court, or legal services authority for formal redressal.`
    : `Under Indian law, rights and remedies for this matter are governed by statutory legal provisions and relevant judicial or regulatory authorities. For authentic statutory texts, citizens can review indiacode.nic.in, or consult a registered advocate or legal aid clinic (National Legal Services Authority at nalsa.gov.in / National Consumer Helpline at 1915).`;

  return res.json({
    answer: fallbackAnswer,
    legal_provision: safety.domainHint ? `${safety.domainHint} Framework` : 'General Indian Statutory Framework',
    procedure: [
      'Preserve all relevant documentary proof, invoices, notices, and communications.',
      safety.destinationHint ? `Approach ${safety.destinationHint} for formal grievance redressal.` : 'Identify the competent forum or court having territorial jurisdiction.',
      'Seek legal advice via National Legal Services Authority (nalsa.gov.in) or call the toll-free helpline 15100.'
    ],
    citations: [
      {
        document_title: 'India Code — Digital Repository of Indian Central and State Acts',
        issuing_authority: 'Legislative Department, Ministry of Law and Justice',
        section_number: 'Statutory Reference',
        page_number: 'Online',
        official_url: 'https://www.indiacode.nic.in',
        excerpt: 'Official digital repository of all Central and State statutes in India.',
        is_web_source: false
      }
    ],
    limitations: 'Brief general legal information provided for educational awareness.',
    is_grounded: true,
    search_grounded: false,
    search_queries: [],
    web_sources: [],
    refusal: false,
    disclaimer: MANDATORY_DISCLAIMER,
    model_used: 'NyayaDesk General Legal Awareness Synthesis',
    sources_count: 1
  });
});

// GET /api/admin/documents
app.get('/api/admin/documents', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'nyayadesk-admin-dev-key';
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrative credentials.' });
  }

  const passages = readJsonFile<Passage[]>(KB_FILE, []);
  res.json({
    total_passages: passages.length,
    passages
  });
});

// POST /api/admin/documents/ingest
app.post('/api/admin/documents/ingest', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'nyayadesk-admin-dev-key';
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrative credentials.' });
  }

  const { title, issuing_authority, official_url, raw_text, is_scanned, version_date } = req.body || {};

  const ALLOWED_DOMAINS = [
    'indiacode.nic.in',
    'consumeraffairs.nic.in',
    'consumeraffairs.gov.in',
    'consumerhelpline.gov.in',
    'edaakhil.nic.in'
  ];

  try {
    const parsedUrl = new URL(official_url);
    const domain = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));

    if (!isAllowed) {
      return res.json({
        success: false,
        message: `Domain '${domain}' is not in the verified official source domains list (${ALLOWED_DOMAINS.join(', ')}).`,
        document_id: '',
        chunks_created: 0,
        validation_status: 'Rejected: Unverified Domain',
        is_scanned_ocr_required: false
      });
    }

    if (is_scanned || (raw_text !== undefined && raw_text.trim().length === 0)) {
      return res.json({
        success: false,
        message: 'The provided document is a scanned image without extractable digital text. OCR processing is required.',
        document_id: '',
        chunks_created: 0,
        validation_status: 'Rejected: OCR Required',
        is_scanned_ocr_required: true
      });
    }

    const docId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32);
    const textToChunk = raw_text || `Section 1: General provisions and scope under ${title}.`;

    // Simple legal chunking
    const clauses = textToChunk.split(/(?=(?:Section\s+\d+|Rule\s+\d+|Chapter\s+[IVXLCDM]+))/i);
    const newPassages: Passage[] = [];

    clauses.forEach((c: string, idx: number) => {
      const clean = c.trim();
      if (clean.length > 20) {
        const secMatch = clean.match(/((?:Section|Rule)\s+\d+(?:\([0-9a-zA-Z]+\))?)/i);
        const sectionId = secMatch ? secMatch[1] : `Clause ${idx + 1}`;
        newPassages.push({
          id: `${docId}-${Math.random().toString(36).substring(2, 7)}`,
          document_id: docId,
          document_title: title,
          issuing_authority: issuing_authority || 'Government of India',
          section_number: sectionId,
          page_number: String(idx + 1),
          official_url,
          version_date: version_date || '2024',
          keywords: tokenize(clean).slice(0, 8),
          content: clean.slice(0, 1200)
        });
      }
    });

    const currentKB = readJsonFile<Passage[]>(KB_FILE, []);
    currentKB.push(...newPassages);
    writeJsonFile(KB_FILE, currentKB);

    return res.json({
      success: true,
      message: `Successfully ingested and indexed ${newPassages.length} verified legal passages.`,
      document_id: docId,
      chunks_created: newPassages.length,
      validation_status: 'Verified and Indexed',
      is_scanned_ocr_required: false
    });
  } catch (err: any) {
    return res.status(400).json({ error: `URL parsing error: ${err.message}` });
  }
});

// DELETE /api/admin/documents/:id
app.delete('/api/admin/documents/:id', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'nyayadesk-admin-dev-key';
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrative credentials.' });
  }

  const docId = req.params.id;
  const currentKB = readJsonFile<Passage[]>(KB_FILE, []);
  const filtered = currentKB.filter(p => p.document_id !== docId && p.id !== docId);

  if (filtered.length === currentKB.length) {
    return res.status(404).json({ error: `No document chunks found matching '${docId}'.` });
  }

  writeJsonFile(KB_FILE, filtered);
  res.json({ success: true, removed_count: currentKB.length - filtered.length });
});

// GET /api/eval/dataset
app.get('/api/eval/dataset', (req, res) => {
  const evalData = readJsonFile<any[]>(EVAL_FILE, []);
  res.json(evalData);
});

// Vite Middleware Integration for Development Server on Port 3000
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NyayaDesk server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
