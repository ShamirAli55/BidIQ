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
flowchart TD
    Browser["🌐 Browser Client\nReact 19 + Zustand + TailwindCSS v4"]

    Backend["⚙️ Node.js / Express Backend\n\ndocument.controller → PDF upload & workspace\nextraction.controller → LLM requirement extraction\nmatch.controller → RAG + fact-check matching\ndraft.controller → Batch proposal draft generation\nscore.controller → Bid scoring & win probability\nauth.controller → JWT cookie authentication\ncompanyProfile.controller → Company profile management\n\nUtils: llm.js · rfpAnalysis.js · pdfUtils.js · bidUtils.js · aiService.js"]

    MongoDB[("🗄️ MongoDB Atlas\n\nDocument\nExtraction\nMatch\nDraftSection\nUser\nCompanyProfile\nCapability")]

    AIService["🐍 Python AI Service\nFastAPI + ChromaDB\n\nPOST /match\n→ nomic-embed-text embeddings\n→ ChromaDB vector similarity search\n\nPOST /predict\n→ scikit-learn Logistic Regression\n→ Win probability output"]

    Browser -- "HTTP REST (httpOnly cookies)" --> Backend
    Backend -- "Mongoose / MongoDB Atlas" --> MongoDB
    Backend -- "HTTP (port 8000)" --> AIService
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
    A(["📄 PDF Upload"])
    B["🧹 Text Clean + Normalize\npdfUtils.js"]
    C["🤖 LLM Requirement Extraction\n1 LLM call — OpenRouter\n\nOutputs: title · org · deadline\nmandatory · technical · financial\nrequirements · deliverables · docs"]

    A --> B --> C

    C --> D["🔧 Technical Requirements"]
    C --> E["📋 Mandatory + Financial Requirements"]

    D --> D1["🔍 RAG Vector Search\nChromaDB per requirement\n→ status: matched or gap"]

    E --> F["🏷️ Batch Classification\n1 LLM call — HuggingFace\n→ fact or experience per item"]

    F --> G["🏆 Experience Items"]
    F --> H["📌 Fact Items"]

    G --> G1["🔍 RAG Vector Search\nper item\n→ status: matched or gap"]
    H --> H1["✅ Batch Fact-Check\n1 LLM call — HuggingFace\nvs Company Profile\n→ pass · fail · insufficient_data"]

    D1 --> I["✍️ Batch Draft Generation\n1 LLM call — HuggingFace\n\nRAG matches → capability evidence paragraphs\nFact passes → compliance confirmation sentences"]
    G1 --> I
    H1 --> I

    I --> J["📊 Bid Scoring"]
    J --> J1["📐 Compliance % Calculation"]
    J --> J2["🌐 Sector Classification\n1 LLM call — OpenRouter"]
    J --> J3["🎯 Win Probability Prediction\nLogistic Regression — scikit-learn AI service"]
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
