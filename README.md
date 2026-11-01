# 🚀 RELAY — AI-Powered Project Knowledge Reconstruction & Intelligent Handover Platform

> **Tagline:** *Never let critical project knowledge leave with people.*  
> **Hackathon:** WCC Forge 48 — Round 2 Official Build  
> **Live App Local URL:** [http://localhost:5000](http://localhost:5000)  
> **Official PDF Report:** [`docs/RELAY_WCC_Forge48_Round2_Submission.pdf`](docs/RELAY_WCC_Forge48_Round2_Submission.pdf)  

---

## 📖 Executive Summary
When senior engineers or architects depart, critical context vanishes: the true rationale behind architectural decisions, premature task completions hiding test regressions, silent dependencies without committed SLAs, and conflicting infrastructure configurations.

**RELAY** reconstructs structured project memory from authorized documents (**PDF, DOCX, TXT, Markdown, CSV**), executes **Knowledge Gap Detection** across four primary epistemic states (**Supported, Inferred, Contradicted, Missing**), provides human-in-the-loop review, and compiles an actionable **First 24 Hours Continuation Plan** so incoming leads can resume work with zero downtime.

---

## ⚡ Quick Start Guide (Run Locally in 60 Seconds)

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 3. Start the Full-Stack Application
```bash
npm start
```
The server will start on **`http://localhost:5000`** and serve both the REST API and the production React frontend!

---

## 🎯 2-Minute Judge Evaluation Guide

We have engineered RELAY to be completely self-contained and immediately evaluable without external API keys or setup hurdles:

1. **Open the App:** Navigate to `http://localhost:5000`.
2. **1-Click Scenario Load:** Click **"Load Sample Scenario"** in the top navigation bar.
   - This automatically initializes **Project Nexus — Core Ledger & Payment Gateway Migration**.
   - Ingests 4 multi-format documents:
     - `ADR-042_Ledger_Architecture.pdf` (Architectural decisions & rationale)
     - `Release_Readiness_and_QA_Report.docx` (QA test regressions & compliance audit)
     - `Sprint_44_Handover_Meeting_Notes.txt` (Meeting transcripts & cache agreement)
     - `Team_RACI_and_Task_Status_Export.csv` (Tabular task assignments & status)
3. **Inspect the Gap & Evidence Matrix (Tab 3):**
   - Click the **"Contradicted (2)"** filter: Notice how RELAY catches that DevOps deployed **LFU** with 8GB RAM in the QA report, directly conflicting with the **LRU** 4GB specification in meeting notes! Also inspect the premature completion where Jira reported 100% complete while QA automated regression tests failed with a 32% error rate.
   - Click **"Inspect Evidence"** on any finding: Read the verbatim source excerpt with page/section anchors.
   - Click the **"Missing (3)"** filter: Notice the unassigned owner and missing deadline on Kafka mTLS certs, and the missing rationale on KMS 14-day key rotation.
4. **Human Verification (Tab 4):**
   - Click **"Approve All Verified Findings"** or manually review, edit, and approve individual items.
5. **View Handover & 24H Continuation Plan (Tab 5):**
   - Review the generated **First 24 Hours Continuation Plan** (Hour 0-4, Hour 4-8, Hour 8-16, Hour 16-24).
   - Click **"Export Markdown"** or **"Print / Save as PDF"** to test export capabilities!

---

## 🧠 Core Architecture: The 4 Primary Knowledge States

RELAY strictly enforces a 4-state epistemic classification model, decoupling evidence validation from knowledge status:

| Knowledge State | Color / Badge | Definition | Practical Example from Sample Scenario |
|---|---|---|---|
| **Supported** | 🟢 Emerald | Backed by direct evidence in authorized project records. | PostgreSQL 16 with TimescaleDB adopted for Core Ledger with 650ms query benchmark (ADR-042). |
| **Inferred** | 🟡 Amber | Deduced from informal discussions; lacks formal benchmark verification. | HikariCP database connection pool size of 120 based on informal dev comments; no stress benchmark on record. |
| **Contradicted** | 🔴 Rose | Conflicting statements detected between multiple authorized documents. | Meeting notes mandate LRU (4GB) cache eviction, whereas QA report shows LFU (8GB) was deployed; Data Reconciliation marked 100% complete despite 32% test failure. |
| **Missing** | 🟣 Purple | Critical required information is completely absent. | Urgent Kafka mTLS ingress configuration has no owner and no deadline; KMS 14-day rotation has no documented rationale. |

> **Evidence Validation:** Represented separately as a **Verified** vs **Unverified** flag. For example, a finding may have direct quotes (Verified) but describe an absent owner (Missing state).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, Axios. Print-optimized CSS for PDF export.
- **Backend:** Node.js v24 (ES Modules), Express.js 4.21, Multer file upload.
- **Persistence:**
  - **MongoDB Atlas** via Mongoose when `MONGODB_URI` is provided in `.env`.
  - **Automatic Local JSON Storage** fallback (`server/data/db.json`) when running standalone with zero external dependencies.
- **Document Processing:**
  - `pdf-parse` with raw stream fallback
  - `mammoth` (DOCX parsing)
  - `csv-parse` (tabular formatting)
  - Native UTF-8 Markdown and Text readers
- **AI & Validation:**
  - **Live LLM:** OpenAI GPT-4o-mini / Groq integration with strict Zod schema validation.
  - **Deterministic Engine:** Built-in high-fidelity offline reconstruction engine for predictable evaluation.

---

## 📁 Repository Directory Structure

```
Relay/
├── client/                     # React 19 + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/         # StateBadge, EvidenceModal, FindingEditModal, DocumentViewerModal, Navbar
│   │   ├── pages/              # LandingPage, DashboardPage, WorkspacePage
│   │   ├── services/           # api.js client
│   │   └── index.css           # Tailwind v4 theme and print stylesheet
│   └── package.json
├── server/                     # Express.js REST API
│   ├── models/                 # schemas.js (Mongoose) & db.js (dual-mode storage)
│   ├── routes/                 # projects, documents, reconstruction, findings, handover, demo
│   ├── services/               # documentParser, aiService, gapDetector, handoverGenerator
│   ├── sample_data/            # Ingestion test set (PDF, DOCX, TXT, CSV)
│   ├── scripts/                # testEndpoints.js, generateSamplePdf.js, generateDocumentationPdf.js
│   ├── data/                   # Persistent local JSON storage (db.json)
│   └── server.js               # Server entry point
├── sample_documents/           # Standalone test files for judge manual upload testing
├── docs/                       # Official Round 2 Proposal & Submission PDF
├── .env.example                # Clean environment variables template
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🌐 REST API Endpoints

### Projects
- `GET /api/projects`: List all projects with document and finding counts.
- `GET /api/projects/:id`: Get project details and gap statistics.
- `POST /api/projects`: Create a new project workspace.
- `PUT /api/projects/:id`: Update project metadata.
- `DELETE /api/projects/:id`: Delete project and associated records.

### Documents
- `GET /api/documents?projectId=:id`: List documents for project.
- `POST /api/documents/upload`: Multi-file upload for PDF, DOCX, TXT, MD, CSV.
- `DELETE /api/documents/:id`: Remove document.

### Reconstruction & Findings
- `POST /api/reconstruction/analyze`: Trigger AI / Deterministic reconstruction and gap detection.
- `POST /api/reconstruction/reset`: Reset extracted knowledge base.
- `GET /api/findings?projectId=:id`: List findings with optional state/category/validation filters.
- `PUT /api/findings/:id/review`: Human review action (Accept, Edit, Reject).
- `POST /api/findings/bulk-approve`: Bulk approve verified findings.

### Handover & Export
- `GET /api/handover?projectId=:id`: Retrieve compiled handover and 24-hour continuation plan.
- `POST /api/handover/generate`: Compile handover from approved findings.
- `GET /api/handover/export/markdown?projectId=:id`: Download Markdown file.

### Demo
- `POST /api/demo/load-sample`: 1-click loads sample documents and initiates analysis.
- `GET /api/demo/sample-files`: List downloadable test documents.

---

## 🔮 Three Major Round 3 Improvements

1. **Continuous Project Knowledge Synchronisation:**
   - Integrate authorized engineering platforms (GitHub/GitLab for PRs and ADRs, Jira/Linear for task discrepancies, Slack for transcribed meeting syncs) to update project knowledge continuously instead of relying solely on manual file uploads.
2. **Advanced Evidence and Conflict Intelligence:**
   - Implement deep cross-document reasoning, automated source reliability weighting (e.g., approved ADRs outweigh informal chat transcripts), and sentence-level contradiction embeddings.
3. **Team Collaboration and Secure Handover:**
   - Implement granular role-based permissions (Departing Lead, Reviewer, Incoming Engineer, Auditor), cryptographic signature verification on approved findings, recipient-specific handover views, and collaborative annotation threads.

---

## 📄 License & Attribution
Built for the **WCC Forge 48 Hackathon Round 2** (November 2026).  
*Never let critical project knowledge leave with people.*
