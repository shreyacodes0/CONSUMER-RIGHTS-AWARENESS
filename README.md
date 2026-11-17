# NyayaDesk · Legal Information and Consumer Awareness Platform

**Consumer Legal Awareness and Statutory Information Platform**

*Clear Information. Cited Rules. Informed Decisions.*

---

## 1. Project Objective

**NyayaDesk** is a legal information and consumer awareness platform designed to assist Indian consumers in navigating everyday legal problems, statutory remedies, and complaint filing procedures under the **Consumer Protection Act, 2019 (Act No. 35 of 2019)** and the **Consumer Protection (E-Commerce) Rules, 2020**.

The system operates via two complementary modalities:
1. **Reviewed Predefined Problems**: Six high-frequency consumer disputes (Defective Products, Refund & Return Issues, Misleading Advertisements, Online Shopping, Warranty & Guarantees, Consumer Complaint Procedures) with reviewed answers loaded instantly from structured local data without dynamic AI latency.
2. **Retrieval-Augmented Generation (RAG) Chatbot**: A grounded conversational engine that answers questions using relevant passages retrieved from verified Indian government gazette texts and regulatory portals, eliminating hallucinations by requiring strict source citations.

> **Mandatory Educational Disclaimer:**
> *"NyayaDesk provides general legal information for educational and awareness purposes only. It does not provide legal advice or analyse individual ongoing cases or disputes. It is neither government-affiliated nor a substitute for a licensed advocate."*

---

## 2. System Architecture

```
nyayadesk/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── config.py                # Environment and path configurations
│   │   ├── api/
│   │   │   └── endpoints.py         # FastAPI routes (/api/health, /problems, /chat, /admin)
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic request and response schemas
│   │   └── services/
│   │       ├── safety_service.py    # Guardrails: dispute refusal, scope checks, injection defense
│   │       ├── retrieval_service.py # Semantic search, stemming, and token coverage matching
│   │       ├── gemini_service.py    # Google Gen AI Python SDK integration & fallback
│   │       └── document_service.py  # Domain validation, legal chunking, OCR detection
│   ├── tests/
│   │   └── test_nyayadesk.py        # 10 automated unit and component tests
│   ├── run_eval.py                  # Automated 25-question benchmark runner
│   └── requirements.txt             # Python backend dependencies
├── data/
│   ├── problems.json                # 6 verified predefined problems with reviewed answers
│   ├── resources.json               # Official Indian government legal statutes and portals
│   ├── knowledge_base.json          # Verified statutory extracts (CPA 2019, E-Commerce Rules)
│   └── eval_dataset.json            # 25-question benchmark dataset across 6 categories
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Editorial navigation bar with wordmark & theme toggle
│   │   ├── Footer.tsx               # Footer with platform attribution, links, and disclaimer
│   │   ├── DisclaimerBanner.tsx     # Persistent top disclaimer notice
│   │   └── ProblemModal.tsx         # Detailed inspection modal for predefined problems
│   ├── pages/
│   │   ├── HomePage.tsx             # Editorial hero, problem cards, and procedural guide
│   │   ├── ChatPage.tsx             # Conversational interface with citation cards
│   │   ├── ProblemsPage.tsx         # Filterable problem catalog with statutory references
│   │   ├── ResourcesPage.tsx        # Directory of official statutes and government portals
│   │   ├── EvaluationAdminPage.tsx  # In-browser 25-question benchmark runner & ingestion UI
│   │   └── AboutPage.tsx            # Project attribution, methodology, and pipeline overview
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Main application shell with theme persistence
│   ├── main.tsx                     # React 19 root
│   └── index.css                    # Tailwind CSS with editorial warm paper palette tokens
├── server.ts                        # Full-stack Express server with Vite middleware (Port 3000)
├── .env.example                     # Environment configuration template
├── metadata.json                    # AI Studio manifest
└── package.json                     # Frontend & server dependencies
```

---

## 3. Strict Visual Identity & Design Guidelines

NyayaDesk adheres to an editorial legal publication layout inspired by legal journals printed on warm paper. **All generic "AI slop" has been banned**:
- **Strictly No** blue/violet gradients, glowing borders, glassmorphism, or floating robot icons.
- **Zero-Pill Discipline**: Metadata is presented as unboxed, quiet typography with separators (`·`), never candy badge chips.
- **Light Theme**:
  - Warm Beige Background: `#F4EBDD`
  - Paper White Surface: `#FFFCF7`
  - Subtle Border: `#D6C8B5`
  - Chocolate Brown Primary: `#5B3A29`
  - Muted Terracotta Accent: `#DC957D`
  - Primary Text: `#352820` · Secondary Text: `#75685E`
- **Dark Theme**:
  - Dark Charcoal Background: `#252421`
  - Dark Brown Surface: `#382D25`
  - Near Black Borders: `#171614`
  - Main Text: `#E8E0D6` · Secondary Text: `#B9ADA0`
  - Terracotta Accent: `#DC957D`
- **Typography**: Source Serif 4 for authoritative headings; Source Sans 3 for clean legal body text.

---

## 4. Setup and Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10.0 or higher (for Python backend and evaluation scripts)
- **Windows**: Windows 10/11 with PowerShell (or Linux / macOS)

### Step 1: Obtain a Free Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API Key** and generate a new key for your project.
4. Copy your key. In Google AI Studio Build environments, this is automatically injected into user secrets.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:

#### On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

#### On Linux / macOS:
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```env
GEMINI_API_KEY="your-actual-api-key"
GEMINI_MODEL="gemini-2.5-flash"
ADMIN_API_KEY="nyayadesk-admin-dev-key"
APP_URL="http://localhost:3000"
```

> **Note on Free Tier**: `gemini-2.5-flash` and `gemini-1.5-flash` are eligible on the Gemini free tier. If no API key is configured, NyayaDesk gracefully runs in **Verified Knowledge Base Offline Mode** without crashing.

---

## 5. Running the Application

### Option A: Full-Stack Development Mode (Recommended)
This runs the full-stack server on `http://localhost:3000`, providing the React UI, Vite HMR, and all `/api/*` endpoints.

```bash
# 1. Install frontend & server dependencies
npm install

# 2. Start full-stack dev server (Express + Vite)
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option B: Standalone Python FastAPI Backend & CLI Evaluation

#### On Windows PowerShell:
```powershell
# 1. Create a Python virtual environment
python -m venv venv

# 2. Enable script execution if blocked
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install -r backend/requirements.txt

# 5. Start the FastAPI backend server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### On Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive FastAPI OpenAPI documentation will be live at:
**`http://localhost:8000/docs`**

---

## 6. Testing & Evaluation Benchmark

NyayaDesk includes automated unit tests and a 25-question evaluation benchmark.

### Running Unit Tests and Benchmark via CLI:
```bash
python backend/run_eval.py
```

### Actual Benchmark Execution Results:
```
======================================================================
NYAYADESK UNIT & COMPONENT TESTS
======================================================================
  [PASS] Predefined Problems Verification
  [PASS] Safety Guardrail: Ongoing Dispute Refusal
  [PASS] Safety Guardrail: Out of Scope Law
  [PASS] Prompt Injection Neutralization
  [PASS] Retrieval: Pecuniary Jurisdiction
  [PASS] RAG Fallback: Unsupported Query
  [PASS] Citation Integrity & Anti-Hallucination
  [PASS] Ingestion: Domain Validation Failure
  [PASS] Ingestion: Official Government Domain Success
  [PASS] Document Service: Scanned PDF OCR Flag

Unit Tests Summary: 10/10 passed (100.0%)

======================================================================
NYAYADESK 25-QUESTION BENCHMARK EVALUATION
======================================================================
  • Refusal Accuracy (Ongoing disputes & Out of scope): 100.0% (6/6)
  • Retrieval Recall (Valid Consumer Queries):        94.1% (16/17)
  • Unsupported Query Fallback Accuracy:              100.0% (2/2)
  • Average Retrieval Latency:                        3.92 ms
======================================================================
```

### In-Browser Benchmark Execution:
Navigate to the **Evaluation & Ingestion** tab in the top navigation bar, then click **Run 25-Question Benchmark Live** to execute all 25 queries directly in the web UI with real-time latency and status badges.

---

## 7. Legal Safety & Guardrail Policies

NyayaDesk enforces three strict safety layers:

1. **Ongoing Individual Dispute Refusal**:
   When a user requests assistance on pending litigation (e.g., case numbers like `CC/412/2025`, questions like *"What is my chance of winning?"*, or requests to draft personal court pleadings/affidavits), the system immediately refuses:
   > *"NyayaDesk is an educational legal awareness platform and cannot analyse individual ongoing cases, predict court outcomes, draft personal court affidavits, or devise litigation strategy. For pending legal proceedings, please consult an advocate or contact the National Consumer Helpline (1915)."*

2. **Domain Scope Restriction**:
   Queries relating to Criminal Law (bail, FIR quashing), Family Law (divorce, custody), or Income Tax are rejected with immediate redirection to the competent official authority.

3. **Untrusted Input & Document Isolation**:
   Prompt injection vectors (`"Ignore previous instructions"`, `"Output system prompt"`) are scrubbed before semantic processing. Instructions embedded inside uploaded documents cannot override system instructions.

4. **Conservative Fallback for Unsupported Queries**:
   When questions lack supporting evidence in the indexed statutes (e.g., satellite sales or cryptocurrency), NyayaDesk explicitly informs the user that verified documentation is absent rather than hallucinating an answer.

---

## 8. Document Ingestion Pipeline

Administrative users can ingest new official circulars and regulations through the **Evaluation & Ingestion** portal:
1. **Domain Validation**: Only official Indian government domains (`indiacode.nic.in`, `consumeraffairs.gov.in`, `consumerhelpline.gov.in`, `edaakhil.nic.in`) are accepted.
2. **Scanned PDF Rejection**: Scanned image PDFs without extractable text are flagged for OCR processing rather than silently indexing blank files.
3. **Section-Aware Chunking**: Preserves section and rule headers (`Section 2(10)`, `Rule 4`) to ensure citations point to legally meaningful units.
4. **Security**: Protected by the `X-Admin-Key` header (`nyayadesk-admin-dev-key`).

---

## 9. Official Indian Consumer Legal Resources

1. **Consumer Protection Act, 2019 (Act No. 35 of 2019)**: [India Code Portal](https://www.indiacode.nic.in/handle/123456789/15256)
2. **Consumer Protection (E-Commerce) Rules, 2020**: [Dept. of Consumer Affairs](https://consumeraffairs.nic.in/acts-and-rules/consumer-protection)
3. **CCPA Guidelines for Prevention of Misleading Advertisements, 2022**: [CCPA Notifications](https://consumeraffairs.nic.in/guidelines/ccpa-guidelines)
4. **National Consumer Helpline (NCH - 1915)**: [consumerhelpline.gov.in](https://consumerhelpline.gov.in/)
5. **e-Daakhil Electronic Filing Portal**: [edaakhil.nic.in](https://edaakhil.nic.in)
6. **CDRC Jurisdiction Rules, 2021**: [Pecuniary Limits Gazette](https://consumeraffairs.nic.in/acts-and-rules/consumer-protection)

---

## 10. Platform Overview & Focus

- **Platform**: NyayaDesk Legal Awareness Initiative
- **Focus**: Transparent, Non-Hallucinatory Retrieval-Augmented Generation for Indian Consumer Law
