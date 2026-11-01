# RELAY — AI-Powered Project Knowledge Reconstruction & Intelligent Handover Platform
## WCC Forge 48 — Round 2 Official Submission Document

**Project Name:** RELAY  
**Tagline:** *Never let critical project knowledge leave with people.*  
**Round:** Round 2 Official Submission (1 November 2026 – 4 November 2026)  
**Status:** Functional, Fully Tested & Demonstrable Product  

---

## 1. Original Problem Statement
Critical technical and operational knowledge in software engineering organizations is intrinsically fragile. Important project knowledge gets scattered across disparate Architecture Decision Records (ADRs), pull request comments, fragmented meeting notes, informal Slack/Teams transcripts, Jira boards, and individual team members' heads. 

When a lead architect, engineering manager, or senior contributor departs a project, the true rationale behind decisions, unassigned dependencies, latent blockers, compliance timelines, and unresolved technical questions frequently disappear with them. 

Generic handovers typically consist of hastily assembled wiki pages or verbal syncs that fail to capture:
- The actual technical trade-offs and rationale behind architectural decisions.
- Prematurely completed tasks where testing failed or was skipped.
- Direct contradictions between what was agreed in meetings versus what was deployed in infrastructure.
- Silent gaps where actionable tasks lack designated owners or deadlines.

---

## 2. Original Solution & Its Purpose
**RELAY** was conceived to solve this critical organizational vulnerability. RELAY is an AI-powered project knowledge reconstruction and intelligent handover platform.

Its purpose is to:
1. **Reconstruct Usable Project Memory:** Ingest authorized project documents across multiple formats (PDF, DOCX, TXT, Markdown, CSV) and extract structured, validated knowledge rather than unstructured prose.
2. **Guarantee Absolute Source Traceability:** Link every extracted decision, task, and risk to verifiable source excerpts with page numbers and structural anchors.
3. **Execute Knowledge Gap Detection:** Classify findings into four primary epistemic states (**Supported**, **Inferred**, **Contradicted**, **Missing**) and identify critical practical gaps.
4. **Enforce Human-in-the-Loop Verification:** Provide an intuitive review interface where human leads accept, edit, or reject findings before treating them as approved truth.
5. **Generate an Actionable First 24 Hours Continuation Plan:** Produce an immediate, time-phased checklist (Hour 0-4, 4-8, 8-16, 16-24) enabling incoming team members to resume work without downtime.

---

## 3. Product Overview & Core Identity
RELAY preserves the exact identity established in Round 1:
- **Visual Identity:** Professional Navy/Teal engineering aesthetic (`#070D17`, `#0B1329`, `#0D9488`, `#06B6D4`).
- **Target Users:** Engineering Leaders, Staff/Principal Solutions Architects, Technical Program Managers, Incoming Engineers.
- **Dual-Engine Flexibility:** Supports Live Cloud LLM API integration (OpenAI GPT-4o-mini / Groq) with strict Zod validation, coupled with a High-Fidelity Deterministic Knowledge Reconstruction Engine for 100% offline hackathon evaluation.
- **Persistent Dual Storage:** Seamless MongoDB Atlas connection via Mongoose with an automatic, zero-dependency persistent JSON local storage fallback.

---

## 4. Implemented Technical Architecture

```
                                  ┌────────────────────────┐
                                  │   Authorized Sources   │
                                  │  PDF, DOCX, TXT, CSV   │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │  Document Parser &     │
                                  │  Section Extraction    │
                                  └───────────┬────────────┘
                                              │
                                              ▼
┌─────────────────────────┐       ┌────────────────────────┐       ┌─────────────────────────┐
│   OpenAI / Live LLM     │ <───> │  Structured AI Engine  │ <───> │  Deterministic Demo     │
│   (Zod Validated JSON)  │       │  & Extraction Service  │       │  Reconstruction Engine  │
└─────────────────────────┘       └───────────┬────────────┘       └─────────────────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Knowledge Gap Detector │
                                  │ 4 States & Evidence    │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Human-in-the-Loop      │
                                  │ Verification Queue     │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Handover Generator &   │
                                  │ 24-Hour Plan Compiler  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Export Engine          │
                                  │ Markdown & Print PDF   │
                                  └────────────────────────┘
```

### Component Stack
- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, Axios. Responsive desktop and mobile layout with print-optimized media queries.
- **Backend:** Node.js v24 (ES Modules), Express.js 4.21, CORS, Multer.
- **Database & Persistence:** Dual-mode persistence layer. Connects to MongoDB Atlas via Mongoose if `MONGODB_URI` is provided; automatically uses local persistent JSON file storage (`server/data/db.json`) if running standalone.
- **Document Processing:** `pdf-parse` with raw stream fallback, `mammoth` (DOCX), `csv-parse`, and native UTF-8 text processors.
- **AI & Validation:** Zod schema validation ensuring structured JSON outputs; dual-mode runtime supporting OpenAI/Groq or the built-in deterministic demo engine.

---

## 5. Actual Working Features

| Feature Module | Working Capabilities | Status |
|---|---|---|
| **Project Workspace** | Create, view, update, delete projects; set departing and incoming leads; track real-time gap statistics | Fully Implemented & Tested |
| **Document Ingestion** | Multi-file upload for PDF, DOCX, TXT, MD, CSV; automatic word count calculation; structural header detection; preview modal | Fully Implemented & Tested |
| **AI Knowledge Extraction** | Reconstructs decisions, tasks, owners, deadlines, dependencies, risks, and rationale; returns validated JSON | Fully Implemented & Tested |
| **Evidence Traceability** | Links each finding to source document name, section anchor, confidence level, and direct verbatim quote | Fully Implemented & Tested |
| **4-State Gap Detection** | Classifies into Supported, Inferred, Contradicted, and Missing; identifies missing owners, missing deadlines, missing rationale, and false completions | Fully Implemented & Tested |
| **Human Review Workflow** | Accept, edit (with full modal editor), or reject findings; bulk approval of verified items; real-time progress bar | Fully Implemented & Tested |
| **First 24 Hours Plan** | Generates time-phased continuation plan (Hour 0-4, 4-8, 8-16, 16-24) based on urgent gaps and approved findings | Fully Implemented & Tested |
| **Handover Export** | One-click export to Markdown (.md) download and clean, print-optimized browser PDF generation | Fully Implemented & Tested |
| **1-Click Demo Scenario** | Pre-bundled **Project Nexus** scenario demonstrating all 4 states, contradictions, and gaps in a single click | Fully Implemented & Tested |

---

## 6. The 4 Knowledge States & Practical Gaps Demonstrated

### The 4 Primary States
1. **Supported:** Supported by direct evidence in authorized project records.
   - *Example:* PostgreSQL 16 with TimescaleDB adopted for Core Ledger. Backed by ADR-042 with documented rationale (strict ACID compliance and 650ms query benchmark).
2. **Inferred:** Reasonably deduced from informal comments or partial transcripts; lacks formal benchmark verification.
   - *Example:* HikariCP database connection pool sizing (`max_connections=120`). Deduced from verbal comment in Sprint 44 sync; stress benchmark was never performed.
3. **Contradicted:** Conflicting statements detected across multiple authorized documents.
   - *Example 1:* Redis Cache Eviction Policy. Sprint 44 meeting notes mandate LRU (Least Recently Used) with 4GB RAM, whereas QA Report reveals DevOps deployed LFU (Least Frequently Used) with 8GB RAM.
   - *Example 2:* Data Reconciliation Service. Marked as "100% Completed" on Jira board, but QA audit reveals regression test suite failed with a 32% error rate and ledger parity was skipped.
4. **Missing:** Critical required information is completely absent.
   - *Example 1:* Mutual TLS (mTLS) Kafka Ingress Configuration. Urgent production task with no assigned owner and no committed deadline.
   - *Example 2:* AWS KMS Customer-Managed Signing Key Rotation. Decision recorded to rotate keys every 14 days, but technical rationale is completely missing.
   - *Example 3:* Core Banking Gateway API v3.4 (FinVance Inc.). Critical external dependency with ticket open and no committed SLA or staging endpoint.

---

## 7. The First 24 Hours Continuation Plan
Rather than overwhelming incoming engineers with sprawling documentation, RELAY compiles an actionable, priority-ordered roadmap:

| Timeframe | Action Item | Target Lead / System | Urgency | Context |
|---|---|---|---|---|
| **Hour 0-4** | Provision & Deploy mTLS Certs on Kafka Ingress | Security Lead / DevOps | `CRITICAL` | External banking partner webhooks will fail SSL handshake |
| **Hour 4-8** | Audit Reconciliation Service & Reopen RECON-104 | QA Lead / Senior Dev | `HIGH` | 32% regression test failure prevents production release |
| **Hour 4-8** | Escalate Ticket #FV-9021 with FinVance Account Mgr | Vendor Liaison | `HIGH` | Core Gateway v3.4 blocking SEPA / FedNow rail integration |
| **Hour 8-16** | Reconcile Redis Eviction Policy (LRU vs LFU) | Platform Lead | `MEDIUM` | Fix cache pollution under periodic batch workloads |
| **Hour 16-24** | Brief Leadership & Legal on PCI-DSS Vendor Signoff | Compliance Officer | `HIGH` | Annual Level 1 audit filing due in 18 days |

---

## 8. Testing and Quality Assurance
All core workflows were systematically tested and verified:
- **API Test Suite:** Automated test script (`server/scripts/testEndpoints.js`) executed end-to-end:
  - Ingested PDF, DOCX, TXT, CSV documents.
  - Verified 100% text extraction across all formats.
  - Confirmed gap detection classifies all 4 primary states.
  - Verified human review approvals and rejections.
  - Validated generation of the First 24 Hours Continuation Plan.
- **Data Persistence:** Project records, uploaded documents, review statuses, and handovers persist reliably to disk (`server/data/db.json`) across server restarts.
- **Client Build:** Vite production build compiles in <300ms with zero linting or bundling errors.

---

## 9. Changes from the Round 1 Proposal
The implementation faithfully preserves 100% of the Round 1 proposal while making practical technical refinements:
1. **Decoupled Evidence Validation from Epistemic State:** As required by Section 2, Step 5, evidence validation (Verified / Unverified) is tracked independently from the four primary knowledge states (Supported, Inferred, Contradicted, Missing).
2. **Dual-Mode Persistence Layer:** Implemented MongoDB Atlas via Mongoose alongside an automatic local JSON storage fallback. This ensures the application works out-of-the-box without requiring judges to configure external Atlas clusters.
3. **High-Fidelity Deterministic Mode:** Built a deterministic knowledge reconstruction engine ensuring evaluators can test the entire workflow with realistic synthetic documents even when cloud LLM API keys are not provided.

---

## 10. Current Limitations
- **File Upload Limits:** Single-file upload is currently constrained to 25MB to prevent memory exhaustion on small server instances.
- **Synchronous Document Extraction:** Document parsing runs in-process; high-volume enterprise archives would benefit from an asynchronous Redis BullMQ queue.
- **Session Authentication:** Currently operates in team-workspace mode; multi-tenant enterprise SSO (OAuth2 / SAML) is slated for Round 3.

---

## 11. Three Major Round 3 Improvements

### 1. Continuous Project Knowledge Synchronisation
- **Description:** Move beyond static document uploads by integrating directly with authorized engineering tools: GitHub/GitLab (ADRs, PR discussions, commit history), Jira/Linear (ticket status discrepancies), and Slack/Discord (engineering sync transcripts).
- **Practical Value:** Automatically detects knowledge divergence in real-time when code changes invalidate architectural decisions, keeping project handovers continuously up-to-date.

### 2. Advanced Evidence and Conflict Intelligence
- **Description:** Implement multi-document cross-attention and claim-level contradiction reasoning using hybrid BM25 + dense vector embeddings. Incorporate automated source reliability weighting (e.g., an approved ADR outweighs an informal transcript).
- **Practical Value:** Resolves multi-way conflicting specifications with mathematical confidence scores and highlights exact contradictory sentences across tens of thousands of pages.

### 3. Team Collaboration and Role-Based Secure Handover
- **Description:** Introduce granular role-based access control (Departing Lead, Reviewer, Incoming Engineer, Auditor), cryptographic signature verification on approved findings, recipient-specific handover views, and collaborative annotation threads.
- **Practical Value:** Ensures sensitive compliance records and credentials remain compartmentalized while establishing a tamper-evident audit log for corporate governance.
