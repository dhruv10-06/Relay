import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDocumentationPdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([600, 850]);
  let { height } = page.getSize();
  let y = height - 50;
  const margin = 50;

  function checkNewPage(neededSpace = 30) {
    if (y - neededSpace < 50) {
      page = pdfDoc.addPage([600, 850]);
      y = 800;
    }
  }

  // Cover / Header
  page.drawText('RELAY — WCC FORGE 48 ROUND 2 OFFICIAL SUBMISSION', {
    x: margin,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0.05, 0.4, 0.4),
  });
  y -= 20;

  page.drawText('Project Knowledge Reconstruction & Intelligent Handover Platform', {
    x: margin,
    y,
    size: 11,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  page.drawText('Tagline: Never let critical project knowledge leave with people.', {
    x: margin,
    y,
    size: 9,
    font,
    color: rgb(0.1, 0.3, 0.5),
  });
  y -= 25;

  page.drawLine({
    start: { x: margin, y },
    end: { x: 550, y },
    thickness: 1.5,
    color: rgb(0.1, 0.5, 0.5),
  });
  y -= 30;

  const sections = [
    {
      title: '1. Problem Statement',
      body: 'Critical project knowledge gets scattered across documents, conversations, task records, and team members. When a lead or senior engineer departs, the rationale behind decisions, unassigned dependencies, latent blockers, and unresolved questions disappear with them.',
    },
    {
      title: '2. Solution Purpose & Identity',
      body: 'RELAY reconstructs usable project knowledge from authorized sources, guarantees verbatim source traceability, detects knowledge gaps across 4 primary states (Supported, Inferred, Contradicted, Missing), enforces human review, and compiles an actionable First 24 Hours Continuation Plan.',
    },
    {
      title: '3. Technical Architecture',
      body: 'Frontend: React 19, Vite, Tailwind CSS v4, Lucide Icons. Backend: Node.js, Express REST API. Persistence: Dual-mode MongoDB Atlas with automatic persistent JSON storage fallback. AI Integration: OpenAI/Groq with Zod schema validation and a High-Fidelity Deterministic Demo Engine.',
    },
    {
      title: '4. The 4 Primary Knowledge States',
      body: '1. Supported: Backed by direct evidence (e.g. ADR-042 adopting TimescaleDB with 650ms benchmark).\n2. Inferred: Deduced from informal discussions (e.g. HikariCP pool sizing of 120 without formal stress benchmark).\n3. Contradicted: Conflicting statements across docs (e.g. Redis LRU vs LFU; Data Reconciliation 100% complete vs 32% QA test failure).\n4. Missing: Actionable items lacking owners (Kafka mTLS), missing deadlines, or decisions lacking rationale (KMS 14-day key rotation).',
    },
    {
      title: '5. The First 24 Hours Continuation Plan',
      body: 'Generates a time-phased operational roadmap: Hour 0-4 (Immediate triage, assign Kafka mTLS certs); Hour 4-8 (QA test failure audit, escalate FinVance API v3.4 blocker); Hour 8-16 (Reconcile Redis LRU vs LFU conflict); Hour 16-24 (PCI-DSS compliance filing briefing).',
    },
    {
      title: '6. Testing & Quality Assurance',
      body: 'End-to-end user journeys fully tested and verified: document ingestion for PDF, DOCX, TXT, CSV; text extraction; gap classification; human review acceptance/rejection; First 24 Hours Continuation Plan generation; and Markdown export.',
    },
    {
      title: '7. Three Major Round 3 Improvements',
      body: '1. Continuous Knowledge Sync: Real-time integrations with GitHub, Linear/Jira, and Slack transcripts.\n2. Advanced Conflict Intelligence: Deep cross-document attention and claim-level contradiction reasoning.\n3. Secure Team Handover: Role-based permissions, cryptographic audit logs, and recipient-tailored views.',
    },
  ];

  for (const sec of sections) {
    checkNewPage(40);
    page.drawText(sec.title, {
      x: margin,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.4),
    });
    y -= 16;

    const lines = sec.body.split('\n');
    for (const rawLine of lines) {
      const words = rawLine.split(' ');
      let line = '';
      for (const word of words) {
        if ((line + word).length > 78) {
          checkNewPage(18);
          page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 13;
          line = '';
        }
        line += word + ' ';
      }
      if (line) {
        checkNewPage(18);
        page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 16;
      }
    }
    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  const outDir = path.resolve(__dirname, '../../docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const destPath = path.join(outDir, 'RELAY_WCC_Forge48_Round2_Submission.pdf');
  fs.writeFileSync(destPath, pdfBytes);
  console.log(`Successfully generated Round 2 PDF at: ${destPath}`);
}

generateDocumentationPdf().catch(console.error);
