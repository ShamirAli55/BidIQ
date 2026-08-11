# BidIQ — AI-Powered Bid & Proposal Response Engine

> **Transform raw RFP documents into structured, compliance-checked, AI-drafted proposals in minutes.**

BidIQ is a full-stack B2B SaaS platform that automates the entire bid response lifecycle — from PDF ingestion and requirement extraction, to capability matching, compliance matrix generation, proposal drafting, and win probability scoring — all powered by a flexible multi-provider LLM architecture.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. AI Service Setup](#2-ai-service-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [LLM Provider Routing](#llm-provider-routing)
- [AI Pipeline Overview](#ai-pipeline-overview)
- [Data Models](#data-models)
- [Scripts](#scripts)

---

## Features

### Core Pipeline
| Feature | Description |
|---|---|
| **PDF Upload & Parsing** | Upload any RFP/tender PDF. Text is extracted, cleaned, and normalized automatically. |
| **LLM Requirement Extraction** | Structured extraction of title, organization, deadlines, mandatory, technical, and financial requirements via a single LLM call. |
| **RAG Capability Matching** | Vector similarity search against a company capability library using ChromaDB + `nomic-embed-text`. Determines `matched` vs `gap` status per requirement. |
| **Batch Classification** | Mandatory and financial requirements are classified as `fact` or `experience` in a single batched LLM call, reducing API calls by ~95%. |
| **Batch Fact-Checking** | All fact-classified requirements are checked against the company profile in a single parallel LLM call. |
| **Batch Draft Generation** | Proposal response paragraphs and compliance statements generated in one batched LLM interaction. |
| **Bid Score & Win Probability** | Compliance percentage, gap count, and sector classification fed into a trained logistic regression model for win probability prediction. |
| **Compliance Matrix** | Formal B2B-grade filterable compliance matrix with Compliant / Gap / Insufficient Data statuses. |

### Platform
- **JWT Authentication** — Secure `httpOnly` cookie-based sessions (signup, login, logout)
- **Multi-Workspace RFP Management** — Manage multiple RFP documents simultaneously
- **Responsive Corporate UI** — Dark, professional B2B interface with Tailwind CSS v4
- **Multi-Provider LLM Routing** — Per-task provider selection (OpenRouter, Hugging Face, Ollama) with automatic failover chains
- **Automatic Provider Failover** — If the primary provider times out or errors, the system silently retries the next configured provider

---

## System Architecture

```mermaid
flowchart LR
    classDef frontend fill:#1e3a5f,stroke:#3b82f6,color:#e0f2fe
    classDef backend fill:#1a2e1a,stroke:#22c55e,color:#dcfce7
    classDef db fill:#2e1a1a,stroke:#f87171,color:#fee2e2
    classDef ai fill:#2e1a3a,stroke:#a855f7,color:#f3e8ff
    classDef util fill:#1e2a3a,stroke:#64748b,color:#cbd5e1

    subgraph FE ["  Frontend  —  port 5173  "]
        direction TB
        UI["WorkspacePage.jsx\nDashboardPage.jsx\nLoginPage.jsx"]
        Store["workspaceStore.js\ndocumentStore.js\nauthStore.js\n— Zustand v5"]
        UI --> Store
    end

    subgraph BE ["  Backend  —  Node.js / Express  —  port 5000  "]
        direction TB
        Controllers["document.controller\nextraction.controller\nmatch.controller\ndraft.controller\nscore.controller\nauth.controller\ncompanyProfile.controller"]
        Utils["llm.js — multi-provider dispatcher\nrfpAnalysis.js — prompts + batch logic\npdfUtils.js — PDF cleaning\nbidUtils.js — compliance + budget\naiService.js — AI service client"]
        Controllers --> Utils
    end

    subgraph DB ["  MongoDB Atlas  "]
        Collections["Document · Extraction\nMatch · DraftSection\nUser · CompanyProfile · Capability"]
    end

    subgraph AI ["  Python AI Service  —  port 8000  "]
        direction TB
        Match["POST /match\nOllama nomic-embed-text\nChromaDB vector search"]
        Predict["POST /predict\nscikit-learn LogisticRegression\n+ StandardScaler"]
    end

    FE -- "HTTP REST\nhttpOnly cookies" --> BE
    BE -- "Mongoose\nMongoDB Atlas" --> DB
    BE -- "HTTP" --> AI
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (ESM modules) |
| Framework | Express.js v5 |
| Database | MongoDB Atlas via Mongoose v9 |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` + `httpOnly` cookies |
| File Handling | Multer (PDF upload) |
| PDF Parsing | `pdf-parse` |
| Excel Reading | `xlsx` (capability library seeding) |
| Package Manager | pnpm |

### AI Service (Python)
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Vector Store | ChromaDB (persistent local store) |
| Embeddings | Ollama `nomic-embed-text:latest` |
| Win Prediction | scikit-learn Logistic Regression + StandardScaler |
| Data Processing | pandas |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | TailwindCSS v4 |
| State Management | Zustand v5 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Routing | React Router DOM v7 |

### LLM Providers
| Task | Default Provider | Model |
|---|---|---|
| Extraction | OpenRouter | `inclusionai/ling-3.0-flash:free` |
| Matching | Hugging Face | `Qwen/Qwen2.5-7B-Instruct` |
| Draft | Hugging Face | `Qwen/Qwen2.5-7B-Instruct` |
| Scoring | OpenRouter | `inclusionai/ling-3.0-flash:free` |

---

## Project Structure

```
BidIQ/
├── backend/                        # Node.js / Express API
│   ├── src/
│   │   ├── app.js                  # Express app entry point
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── companyProfile.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── draft.controller.js
│   │   │   ├── extraction.controller.js
│   │   │   ├── match.controller.js
│   │   │   └── score.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT protect middleware
│   │   ├── models/
│   │   │   ├── Capability.js
│   │   │   ├── CompanyProfile.js
│   │   │   ├── Document.js
│   │   │   ├── DraftSection.js
│   │   │   ├── Extraction.js
│   │   │   ├── Match.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── companyProfile.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── draft.routes.js
│   │   │   ├── extraction.routes.js
│   │   │   ├── match.routes.js
│   │   │   └── score.routes.js
│   │   ├── scripts/
│   │   │   └── seedCapabilities.js  # Seeds ChromaDB + MongoDB from Excel
│   │   ├── data/
│   │   │   └── Capability_Library.xlsx
│   │   └── utils/
│   │       ├── aiService.js         # HTTP client for Python AI service
│   │       ├── bidUtils.js          # Compliance % + budget parser
│   │       ├── llm.js               # Multi-provider LLM dispatcher + failover
│   │       ├── pdfUtils.js          # PDF text cleaning + normalization
│   │       └── rfpAnalysis.js       # Prompts, batch classifiers, batch fact-checker, draft generator
│   ├── uploads/                     # Multer uploaded PDFs (auto-created)
│   ├── .env                         # Local secrets (gitignored)
│   ├── .env.example                 # Environment variable template
│   └── package.json
│
├── frontend/                        # React + Vite SPA
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComplianceMatrixTable.jsx
│   │   │   ├── DraftSectionCard.jsx
│   │   │   ├── ExtractedDetailsView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RequirementCard.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   ├── UploadModal.jsx
│   │   │   └── WinProbabilityCard.jsx
│   │   ├── lib/
│   │   │   └── api.js               # Axios instance with base URL + credentials
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # RFP document repository
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── WorkspacePage.jsx    # Full RFP workspace
│   │   ├── stores/
│   │   │   ├── authStore.js         # Auth state (Zustand)
│   │   │   ├── documentStore.js     # Document list state
│   │   │   └── workspaceStore.js    # Workspace pipeline state
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── ai-service/                      # Python FastAPI AI service
│   ├── main.py                      # /match and /predict endpoints
│   ├── models/
│   │   ├── logistic_model.pkl       # Trained win probability model
│   │   └── scaler.pkl               # StandardScaler for model input
│   ├── chroma_store/                # Persistent ChromaDB vector store
│   ├── scripts/                     # Training/seeding scripts
│   ├── requirements.txt
│   └── venv/
│
└── README.md
```

---

## Getting Started

### Prerequisites

| Requirement | Details |
|---|---|
| Node.js | v22+ (ESM support required) |
| pnpm | `npm install -g pnpm` |
| Python | 3.10+ |
| Ollama | Installed and running locally ([ollama.com](https://ollama.com)) |
| MongoDB Atlas | Free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) |
| OpenRouter Account | Free API key at [openrouter.ai](https://openrouter.ai) |
| Hugging Face Account | Free API key at [huggingface.co](https://huggingface.co/settings/tokens) |

**Required Ollama models** (for vector embeddings, used by the AI service):
```bash
ollama pull nomic-embed-text:latest
```

Optionally, for local LLM inference:
```bash
ollama pull phi4-mini:latest
```

---

### 1. Backend Setup

```bash
cd backend
pnpm install

# Copy and populate environment variables
cp .env.example .env
# Edit .env with your credentials

# Seed metadata to MongoDB (requires MongoDB running/URI configured)
node src/scripts/seedCapabilities.js

# Start development server
pnpm dev
# Server runs on http://localhost:5000
```

---

### 2. AI Service Setup

Ensure Ollama is running and has the embedding model downloaded:
```bash
ollama serve
ollama pull nomic-embed-text:latest
```

Then configure and start the Python AI Service:
```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the ChromaDB local vector store (Ollama must be running)
python scripts/seed_chroma.py

# Start the AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# AI service runs on http://localhost:8000
```

---

### 3. Frontend Setup

```bash
cd frontend
pnpm install

# Start development server
pnpm dev
# App runs on http://localhost:5173
```

---

## Environment Variables

### `backend/.env.example`

```env
# ── Server ─────────────────────────────────────────────────
PORT=5000

# ── Database ───────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bidiq?appName=Cluster0

# ── Authentication ─────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# ── LLM Provider (default fallback if task-specific not set) ─
# Options: openrouter | huggingface | ollama
LLM_PROVIDER=openrouter

# ── Per-Task LLM Provider Routing ──────────────────────────
# Each task can independently use a different LLM provider.
# Options per task: openrouter | huggingface | ollama
EXTRACTION_LLM_PROVIDER=openrouter
MATCH_LLM_PROVIDER=huggingface
DRAFT_LLM_PROVIDER=huggingface
SCORE_LLM_PROVIDER=openrouter

# ── OpenRouter ──────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=inclusionai/ling-3.0-flash:free

# ── Hugging Face ────────────────────────────────────────────
HF_API_KEY=hf_your_key_here
HF_ROUTER_URL=https://router.huggingface.co/v1/chat/completions
HF_INFERENCE_URL=https://api-inference.huggingface.co/models
HF_MODEL_DEFAULT=Qwen/Qwen2.5-7B-Instruct

# ── Ollama (Local) ──────────────────────────────────────────
OLLAMA_MODEL=phi4-mini:latest
OLLAMA_HOST=http://127.0.0.1:11434
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Documents _(protected)_
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents` | List all uploaded RFP documents |
| `POST` | `/api/documents/upload` | Upload a new RFP PDF (`multipart/form-data`, field: `rfpFile`) |
| `GET` | `/api/documents/:id/workspace` | Fetch full workspace state (document, extraction, matches, drafts) |
| `POST` | `/api/documents/:id/extract` | Run LLM extraction on a document |

### Extractions _(protected)_
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/extractions/:id/match` | Run RAG + fact-check matching on an extraction |
| `POST` | `/api/extractions/:id/draft` | Generate proposal draft sections |
| `GET` | `/api/extractions/:id/score` | Calculate compliance score + win probability |

### Company Profile _(protected)_
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/company-profile` | Create or update the company profile |

### AI Service (port 8000)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/match` | Vector similarity match for a requirement text |
| `POST` | `/predict` | Win probability prediction using logistic regression |
| `GET` | `/docs` | FastAPI interactive Swagger docs |

---

## LLM Provider Routing

BidIQ uses a task-based LLM routing system defined entirely via environment variables. Each AI task dispatches to an independent provider with automatic failover.

### Failover Chain

| Primary Provider | Failover Order |
|---|---|
| `openrouter` | OpenRouter → Hugging Face |
| `huggingface` | Hugging Face → OpenRouter |
| `ollama` | Ollama → Hugging Face → OpenRouter |

If the primary provider fails (network timeout, rate limit, API error), the system silently retries the next provider in the chain without returning an error to the frontend.

### Model Recommendations

| Task | Recommended Free Model |
|---|---|
| Extraction (long-context) | `inclusionai/ling-3.0-flash:free` (OpenRouter) |
| Batch Matching | `Qwen/Qwen2.5-7B-Instruct` (Hugging Face) |
| Draft Generation | `Qwen/Qwen2.5-7B-Instruct` (Hugging Face) |
| Sector Scoring | `inclusionai/ling-3.0-flash:free` (OpenRouter) |

---

## AI Pipeline Overview

```mermaid
flowchart TD
    classDef input fill:#0f2027,stroke:#38bdf8,color:#e0f2fe
    classDef process fill:#0f1f0f,stroke:#4ade80,color:#dcfce7
    classDef llm fill:#1a0f2e,stroke:#a78bfa,color:#ede9fe
    classDef rag fill:#1a1a0f,stroke:#facc15,color:#fef9c3
    classDef output fill:#1f0f0f,stroke:#f87171,color:#fee2e2
    classDef score fill:#0f1a2e,stroke:#60a5fa,color:#dbeafe

    PDF(["PDF Upload"])
    Clean["pdf-parse + pdfUtils.js\nClean & normalize raw text"]

    PDF --> Clean

    Clean --> Extract

    subgraph Extract [" Step 1 — Requirement Extraction  ·  1 LLM call &#40;OpenRouter: ling-3.0-flash&#41; "]
        direction LR
        ExtractNode["extraction.controller.js\nbuildExtractionPrompt\n\nOutputs saved to MongoDB Extraction document:\n  · title, organization, rfpNumber, country\n  · submissionDeadline, estimatedBudget\n  · mandatoryRequirements&#91;&#93;\n  · technicalRequirements&#91;&#93;\n  · financialRequirements&#91;&#93;\n  · deliverables&#91;&#93; · requiredDocuments&#91;&#93;"]
    end

    Extract --> TechReqs["technicalRequirements&#91;&#93;"]
    Extract --> MandFin["mandatoryRequirements&#91;&#93;\nfinancialRequirements&#91;&#93;"]

    subgraph TechMatch [" Step 2a — RAG Matching  &#40;per technical requirement&#41; "]
        TechRAG["aiService.js → POST :8000/match\nOllama nomic-embed-text embedding\nChromaDB cosine similarity\n\nIf distance < 350 → matched\nIf distance > 400 → gap"]
    end

    TechReqs --> TechMatch

    subgraph ClassifyStep [" Step 2b — Batch Classification  ·  1 LLM call &#40;HuggingFace: Qwen2.5-7B&#41; "]
        ClassifyNode["classifyRequirementsBatch\nEach requirement labelled:\n  fact  — verifiable company attribute\n  experience  — past project evidence required"]
    end

    MandFin --> ClassifyStep

    ClassifyStep --> ExpItems["Experience items"]
    ClassifyStep --> FactItems["Fact items"]

    subgraph ExpMatch [" Step 2c — RAG Matching  &#40;experience items&#41; "]
        ExpRAG["POST :8000/match\nSame vector search as Step 2a\n→ matched or gap"]
    end

    subgraph FactCheck [" Step 2d — Batch Fact-Check  ·  1 LLM call &#40;HuggingFace: Qwen2.5-7B&#41; "]
        FactNode["factCheckRequirementsBatch\nvs CompanyProfile document\n\nVerdict per item:\n  PASS · FAIL · INSUFFICIENT_DATA"]
    end

    ExpItems --> ExpMatch
    FactItems --> FactCheck

    TechMatch --> Drafts
    ExpMatch --> Drafts
    FactCheck --> Drafts

    subgraph Drafts [" Step 3 — Batch Draft Generation  ·  1 LLM call &#40;HuggingFace: Qwen2.5-7B&#41; "]
        DraftNode["generateDraftsBatch\nFor matched/pass items only:\n  RAG matches → evidence-based proposal paragraphs\n  Fact passes → compliance confirmation sentences\nSaved to MongoDB DraftSection collection"]
    end

    Drafts --> Scoring

    subgraph Scoring [" Step 4 — Bid Scoring "]
        direction LR
        Compliance["bidUtils.js\ncomputeBidStats\ncompliance_percent\ngaps_found · doc_pages"]
        Sector["classifySector\n1 LLM call — OpenRouter\n→ Education, IT Services,\n  Healthcare, Finance..."]
        Win["POST :8000/predict\nscikit-learn LogisticRegression\nInput features: budget · response_time\ncompliance_pct · gaps · sector · month\n\nOutput: Win probability 0–1"]
        Compliance --> Win
        Sector --> Win
    end
```

> **Total LLM calls per full RFP analysis: ~4–6 calls** (down from 30–40 sequential calls)

---

## Data Models

### Document
```js
{ originalName, filePath, extractedText, pageCount, uploadedAt }
```

### Extraction
```js
{
  document,                    // ref: Document
  title, organization, rfpNumber, country,
  submissionDeadline, projectDuration, contractType, estimatedBudget,
  mandatoryRequirements[],     // array of strings
  technicalRequirements[],
  financialRequirements[],
  deliverables[],
  requiredDocuments[],
  evaluationCriteria[],
  contact: { email, address },
  rawLLMResponse
}
```

### Match
```js
{
  extraction,                  // ref: Extraction
  requirementText,
  requirementType,             // technical | mandatory | financial
  method,                      // rag | fact_check
  status,                      // matched | gap | pass | fail | insufficient_data
  matchedCapabilities[],       // [{ capId, distance, documentText }]
  factCheckResult: { verdict, reason }
}
```

### DraftSection
```js
{
  extraction,                  // ref: Extraction
  requirementText,
  draftText,
  basedOnCapability,           // ref: Capability
  source                       // rag | fact_check
}
```

### CompanyProfile
```js
{
  name, registrationYear, country, certifications[],
  annualTurnover, sectors[], pastProjects[],
  blacklisted, officeLocations[]
}
```

---

## Data Seeding & Initialization

BidIQ relies on a pre-compiled historical capability library (`backend/src/data/Capability_Library.csv`) to match extracted RFP requirements. Two separate seed scripts must be run to initialize the app databases:

### 1. MongoDB Bid History Seeding
- **Script**: `backend/src/scripts/seedCapabilities.js`
- **Command** (from `backend/` directory):
  ```bash
  node src/scripts/seedCapabilities.js
  ```
- **Description**: Connects to the configured MongoDB database, clears existing capability documents, reads `Capability_Library.csv`, and seeds the `Capability` collection with historical metadata (budget, outcomes, sectors, timelines, and managers).

### 2. ChromaDB RAG Vector Store Seeding
- **Script**: `ai-service/scripts/seed_chroma.py`
- **Command** (from `ai-service/` directory with virtual environment active):
  ```bash
  python scripts/seed_chroma.py
  ```
- **Description**: Deletes any pre-existing local vector collection, reads the shared `Capability_Library.csv` file, gets embeddings from Ollama using the configured model (`nomic-embed-text`), and registers all historical bids in local persistent ChromaDB storage.
- **Dependency**: Requires local Ollama service to be active.

---

## License

MIT
