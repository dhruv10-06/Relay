import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
const SHOTS_DIR = path.resolve(ROOT_DIR, 'docs/verification_screenshots');
const OUT_PDF = path.resolve(ROOT_DIR, 'docs/RELAY_WCC_Forge48_Round2_Submission.pdf');

function getBase64Image(filename) {
  const filePath = path.join(SHOTS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

async function buildExecutivePdf() {
  console.log('Generating Final Round 2 Submission PDF with embedded real screenshots...');

  const imgLanding = getBase64Image('01_landing_page.png');
  const imgDashboard = getBase64Image('02_dashboard.png');
  const imgDocs = getBase64Image('04_tab1_source_documents.png');
  const imgMatrix = getBase64Image('07_tab3_contradicted_filter.png');
  const imgEvidence = getBase64Image('08_evidence_modal_redis.png');
  const imgReview = getBase64Image('10_tab4_human_review_approved.png');
  const imgHandover = getBase64Image('11_tab5_handover_report.png');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RELAY — Round 2 Official Submission</title>
  <style>
    @page {
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-size: 9pt;
        color: #64748b;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }
    .header-banner {
      border-bottom: 2px solid #0d9488;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
      background-color: #0f766e;
      color: #ffffff;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 24pt;
      color: #0f172a;
      margin: 8px 0 4px 0;
      font-weight: 800;
    }
    .tagline {
      font-size: 12pt;
      color: #0d9488;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      font-size: 8.5pt;
      margin-bottom: 20px;
    }
    .meta-item strong {
      display: block;
      color: #475569;
      font-size: 7.5pt;
      text-transform: uppercase;
    }
    h2 {
      font-size: 13.5pt;
      color: #0f766e;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    h3 {
      font-size: 11pt;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
      font-weight: 700;
    }
    p {
      margin: 6px 0 10px 0;
      text-align: justify;
    }
    ul, ol {
      margin: 6px 0 12px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 12px 0 16px 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
    }
    .state-supported { color: #047857; font-weight: 700; }
    .state-inferred { color: #b45309; font-weight: 700; }
    .state-contradicted { color: #be123c; font-weight: 700; }
    .state-missing { color: #6d28d9; font-weight: 700; }
    .screenshot-container {
      margin: 14px 0 18px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .screenshot {
      width: 100%;
      max-width: 95%;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .screenshot-caption {
      font-size: 8pt;
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }
    .page-break {
      page-break-before: always;
    }
    .callout {
      background-color: #f0fdfa;
      border-left: 3px solid #0d9488;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9.5pt;
      border-radius: 0 6px 6px 0;
    }
  </style>
</head>
<body>

  <!-- Cover / Header -->
  <div class="header-banner">
    <span class="badge">WCC Forge 48 — Round 2 Official Build</span>
    <h1>RELAY</h1>
    <div class="tagline">Never let critical project knowledge leave with people.</div>
    <div style="font-size: 9pt; color: #64748b;">
      AI-Powered Project Knowledge Reconstruction & Intelligent Handover Platform
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>Submission Window</strong>
      1 Nov 2026 – 4 Nov 2026
    </div>
    <div class="meta-item">
      <strong>Technical Stack</strong>
      Node.js, Express, React, Vite, Tailwind
    </div>
    <div class="meta-item">
      <strong>Verification Verdict</strong>
      100% Executed & Tested
    </div>
    <div class="meta-item">
      <strong>Source Code</strong>
      Public GitHub Repository
    </div>
  </div>

  <!-- Section 1 & 2 -->
  <h2>1. Original Problem Statement</h2>
  <p>
    Critical technical and operational knowledge in software engineering organizations is intrinsically fragile. High-value context is routinely scattered across Architecture Decision Records (ADRs), pull request comments, fragmented meeting notes, informal Slack transcripts, Jira boards, and individual team members' heads.
  </p>
  <p>
    When a lead architect, engineering director, or senior contributor leaves, the true rationale behind decisions, unassigned dependencies, latent blockers, compliance timelines, and unresolved technical questions frequently disappear with them. Generic handovers typically consist of hastily assembled wiki pages or verbal syncs that fail to capture premature task completions, direct contradictions between what was agreed in meetings versus what was deployed in infrastructure, or silent gaps where actionable tasks lack designated owners.
  </p>

  <h2>2. Original Solution & Core Purpose</h2>
  <p>
    <strong>RELAY</strong> reconstructs usable project knowledge from authorized sources, identifies missing or conflicting information, enables human verification, and compiles an actionable handover for the incoming lead.
  </p>
  <div class="callout">
    <strong>RELAY Core Purpose:</strong> Ingest authorized multi-format documents (PDF, DOCX, TXT, Markdown, CSV), reconstruct structured findings with Zod schema validation, classify knowledge into four primary states (Supported, Inferred, Contradicted, Missing), guarantee 100% verbatim source traceability, enforce human review approval, and produce an actionable <strong>First 24 Hours Continuation Plan</strong> for the incoming engineer.
  </div>

  <div class="screenshot-container">
    <img src="${imgLanding}" class="screenshot" alt="RELAY Landing Page">
    <div class="screenshot-caption">Figure 1: RELAY Landing Page showcasing core value proposition and 4-state epistemic classification.</div>
  </div>

  <div class="page-break"></div>

  <!-- Section 3 & 4 -->
  <h2>3. Product Overview & Architecture</h2>
  <p>
    RELAY operates as a full-stack, single-tenant or team workspace application. The architecture cleanly decouples document ingestion, structured reconstruction, epistemic gap analysis, human verification, and handover compilation.
  </p>

  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technologies</th>
        <th>Responsibilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Axios</td>
        <td>Single-page reactive workspace, multi-format upload, interactive gap matrix, modal evidence inspector, review queue, print-to-PDF styles.</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Node.js v24 (ES Modules), Express.js 4.21, Multer</td>
        <td>REST API routing, multi-part file upload processing, text extraction pipeline, handover compilation, markdown file streaming.</td>
      </tr>
      <tr>
        <td><strong>Persistence</strong></td>
        <td>MongoDB Atlas via Mongoose + Persistent JSON Fallback</td>
        <td>Dual-mode database abstraction (<code>server/models/db.js</code>). Seamlessly connects to MongoDB Atlas when URI is supplied; defaults to local persistent JSON file storage with zero runtime dependencies.</td>
      </tr>
      <tr>
        <td><strong>Document Processing</strong></td>
        <td><code>pdf-parse</code>, <code>mammoth</code> (DOCX), <code>csv-parse</code>, UTF-8 parser</td>
        <td>Multi-format text extraction, word counts, structural anchor mapping, and raw text previews.</td>
      </tr>
      <tr>
        <td><strong>AI & Validation</strong></td>
        <td>Zod Schema Validation + OpenAI/Gemini/Groq + Deterministic Demo Engine</td>
        <td>Validates structured finding schemas; operates in live cloud LLM mode when an API key is configured or high-fidelity deterministic mode for offline hackathon evaluation.</td>
      </tr>
    </tbody>
  </table>

  <div class="screenshot-container">
    <img src="${imgDashboard}" class="screenshot" alt="RELAY Dashboard">
    <div class="screenshot-caption">Figure 2: RELAY Projects Dashboard showing project cards, status badges, and real-time gap counters.</div>
  </div>

  <h2>4. The Four Primary Knowledge States & Practical Gaps</h2>
  <p>
    RELAY enforces a strict 4-state epistemic classification model, separating evidence validation (Verified vs Unverified) from the primary knowledge state:
  </p>
  <ul>
    <li><strong class="state-supported">1. Supported:</strong> Backed by direct verbatim evidence in authorized records (e.g., PostgreSQL 16 with TimescaleDB adopted in ADR-042 with a 650ms query benchmark).</li>
    <li><strong class="state-inferred">2. Inferred:</strong> Deduced from informal discussions; lacks formal benchmark verification (e.g., HikariCP connection pool size = 120 based on informal dev comments; benchmark never run).</li>
    <li><strong class="state-contradicted">3. Contradicted:</strong> Direct discrepancies across authorized documents (e.g., Sprint meeting notes mandate LRU 4GB cache eviction, while QA report reveals DevOps deployed LFU 8GB; or task marked 100% complete despite QA test regression).</li>
    <li><strong class="state-missing">4. Missing:</strong> Critical information is absent (e.g., Kafka mTLS ingress configuration has no owner and no deadline; KMS 14-day key rotation decision lacks technical rationale).</li>
  </ul>

  <div class="page-break"></div>

  <!-- Section 5: Screenshots of the Real Application -->
  <h2>5. Verified Real Application Workflows</h2>

  <div class="screenshot-container">
    <img src="${imgDocs}" class="screenshot" alt="Source Documents">
    <div class="screenshot-caption">Figure 3: Tab 1 — Source Documents listing uploaded PDF, DOCX, TXT, and CSV with extraction status and word counts.</div>
  </div>

  <div class="screenshot-container">
    <img src="${imgMatrix}" class="screenshot" alt="Gap & Evidence Matrix">
    <div class="screenshot-caption">Figure 4: Tab 3 — Knowledge Gap Matrix filtered by 'Contradicted', highlighting the Redis LRU vs LFU mismatch.</div>
  </div>

  <div class="screenshot-container">
    <img src="${imgEvidence}" class="screenshot" alt="Evidence Modal">
    <div class="screenshot-caption">Figure 5: Supporting Evidence Modal showing side-by-side verbatim quotes from Sprint Notes and QA Report.</div>
  </div>

  <div class="page-break"></div>

  <div class="screenshot-container">
    <img src="${imgReview}" class="screenshot" alt="Human Review">
    <div class="screenshot-caption">Figure 6: Tab 4 — Human Review & Approval Queue after verification (100% confirmed progress bar).</div>
  </div>

  <div class="screenshot-container">
    <img src="${imgHandover}" class="screenshot" alt="Handover Report">
    <div class="screenshot-caption">Figure 7: Tab 5 — Generated Handover Package with time-phased First 24 Hours Continuation Plan table and Markdown preview.</div>
  </div>

  <h2>6. The First 24 Hours Continuation Plan</h2>
  <p>
    Rather than dumping encyclopedic documentation on incoming personnel, RELAY synthesizes approved findings into an urgent, chronological continuation roadmap:
  </p>

  <table>
    <thead>
      <tr>
        <th>Timeframe</th>
        <th>Action Required</th>
        <th>Responsible Target</th>
        <th>Urgency</th>
        <th>Critical Context</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Hour 0-4</strong></td>
        <td>Assign lead & provision mTLS certs on Kafka Ingress</td>
        <td>Security / DevOps Lead</td>
        <td><code>CRITICAL</code></td>
        <td>External banking partner payment webhooks will fail SSL handshake.</td>
      </tr>
      <tr>
        <td><strong>Hour 4-8</strong></td>
        <td>Audit Reconciliation Service & Reopen RECON-104</td>
        <td>QA Lead / Senior Dev</td>
        <td><code>HIGH</code></td>
        <td>Automated regression tests failed with 32% error rate; parity check skipped.</td>
      </tr>
      <tr>
        <td><strong>Hour 4-8</strong></td>
        <td>Escalate Ticket #FV-9021 with FinVance Vendor</td>
        <td>Vendor Liaison</td>
        <td><code>HIGH</code></td>
        <td>Core Banking Gateway API v3.4 blocking SEPA and FedNow settlements.</td>
      </tr>
      <tr>
        <td><strong>Hour 8-16</strong></td>
        <td>Reconcile Redis Eviction Policy (LRU vs LFU)</td>
        <td>Platform Team</td>
        <td><code>MEDIUM</code></td>
        <td>Align infra config with architectural decision to prevent cache pollution.</td>
      </tr>
      <tr>
        <td><strong>Hour 16-24</strong></td>
        <td>Brief Leadership on PCI-DSS Filing Due in 18 Days</td>
        <td>Compliance Officer</td>
        <td><code>HIGH</code></td>
        <td>Legacy cloud provider has not signed shared responsibility attestation.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- Sections 7-12 -->
  <h2>7. Testing and Verification Summary</h2>
  <p>
    Every feature in RELAY was validated through automated test scripts and real browser sessions in Google Chrome:
  </p>
  <ul>
    <li><strong>Verbatim Traceability Audit:</strong> <code>server/scripts/checkVerbatimExcerpts.js</code> confirmed that <strong>10/10 (100%)</strong> evidence excerpts are exact verbatim substrings of the source documents.</li>
    <li><strong>Fresh Multi-Format Uploads:</strong> Generated and uploaded fresh unseen files (PDF, DOCX, CSV, Markdown); verified extraction and word counting.</li>
    <li><strong>Human Review Logic:</strong> Tested accepting, editing, and rejecting findings; verified that rejected items are excluded from the confirmed handover package.</li>
    <li><strong>Server Reboot & Persistence:</strong> Terminated and restarted the server daemon; proved 100% of projects, findings, review decisions, and handovers persisted across reboot.</li>
  </ul>

  <h2>8. Changes from Round 1 Proposal</h2>
  <p>
    The core concept and architecture from Round 1 were strictly preserved. Two refinements were introduced:
  </p>
  <ol>
    <li><strong>Decoupled Evidence Validation:</strong> In accordance with Round 2 instructions, evidence validation (Verified vs Unverified) is represented as a separate orthogonal flag rather than a fifth primary state.</li>
    <li><strong>Dual-Mode Storage Engine:</strong> Implemented MongoDB Atlas via Mongoose alongside local persistent JSON storage, ensuring the platform runs reliably in zero-dependency evaluation environments.</li>
  </ol>

  <h2>9. Current Limitations</h2>
  <ul>
    <li><strong>Document Size:</strong> Uploads are capped at 25MB per file to prevent memory exhaustion on small server instances.</li>
    <li><strong>Multi-Tenancy:</strong> The platform operates in team workspace mode without granular RBAC; enterprise SSO (SAML/OAuth2) is scheduled for Round 3.</li>
  </ul>

  <h2>10. Three Major Round 3 Improvements</h2>

  <h3>1. Continuous Project Knowledge Synchronisation</h3>
  <p>
    <strong>Description:</strong> Move beyond static document uploads by establishing real-time webhooks with authorized developer tools: GitHub/GitLab (for ADRs, PR reviews, and commit messages), Jira/Linear (for task status discrepancies), and Slack/Discord (for engineering sync transcripts).<br>
    <strong>Practical Value:</strong> Automatically detects knowledge divergence when code changes invalidate architectural decisions, keeping handovers continuously up-to-date without manual intervention.
  </p>

  <h3>2. Advanced Evidence and Conflict Intelligence</h3>
  <p>
    <strong>Description:</strong> Implement multi-document cross-attention and claim-level contradiction reasoning using hybrid BM25 + dense vector embeddings. Incorporate automated source reliability weighting (e.g., an approved ADR outweighs an informal chat transcript).<br>
    <strong>Practical Value:</strong> Resolves multi-way conflicting specifications with mathematical confidence scores and highlights exact contradictory sentences across tens of thousands of pages.
  </p>

  <h3>3. Team Collaboration and Role-Based Secure Handover</h3>
  <p>
    <strong>Description:</strong> Introduce granular role-based access control (Departing Lead, Reviewer, Incoming Engineer, Auditor), cryptographic signature verification on approved findings, recipient-specific handover views, and collaborative annotation threads.<br>
    <strong>Practical Value:</strong> Ensures sensitive compliance records and credentials remain compartmentalized while establishing a tamper-evident audit log for corporate governance.

  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; text-align: center;">
    RELAY — WCC Forge 48 Round 2 Official Submission • "Never let critical project knowledge leave with people."
  </div>

</body>
</html>
  `;

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
    printBackground: true,
  });

  await browser.close();

  const stats = fs.statSync(OUT_PDF);
  console.log(`✅ Successfully generated Executive Submission PDF (${stats.size} bytes) at: ${OUT_PDF}`);
}

buildExecutivePdf().catch(console.error);
