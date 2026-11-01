import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();

  let y = height - 50;
  const margin = 50;

  // Header
  page.drawText('PROJECT NEXUS: ARCHITECTURE DECISION RECORD', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0.05, 0.2, 0.4),
  });

  y -= 25;
  page.drawText('Document ID: ADR-042 | Status: Approved | Date: Oct 14, 2026', {
    x: margin,
    y,
    size: 10,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 20;
  page.drawLine({
    start: { x: margin, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 30;
  const sections = [
    {
      title: '1. Problem Statement & Legacy Flaws',
      body: 'Legacy DynamoDB implementation suffered from eventual consistency reconciliation anomalies during high traffic bursts, resulting in $42,000 ledger drift. A strictly ACID-compliant transactional persistence engine is required.',
    },
    {
      title: '2. Approved Decision: PostgreSQL with TimescaleDB',
      body: 'We formally adopt PostgreSQL 16 with TimescaleDB hypertables for all double-entry ledger accounts. Rationale: Strict ACID transactions, native chunked audit queries under 650ms, and compliance with European Central Bank DORA directives.',
    },
    {
      title: '3. Lead Owner & Delivery Milestone',
      body: 'Lead Architect: Elena Vance. Target Sprint: Sprint 43 (October 24, 2026). Status: Approved and in active execution.',
    },
    {
      title: '4. External Blockers & Third-Party Dependencies',
      body: 'Critical dependency: Core Banking Gateway API v3.4 by FinVance Inc. Status: UNRESOLVED. Vendor support ticket #FV-9021 remains open with no SLA commitment or staging endpoint delivery date.',
    },
    {
      title: '5. Cryptographic Key Management',
      body: 'Decision recorded to rotate AWS KMS customer-managed signing keys on a 14-day cycle. (Note: No rationale or compliance justification was provided for this 14-day frequency; standard security policy specifies 90 days).',
    },
  ];

  for (const sec of sections) {
    page.drawText(sec.title, {
      x: margin,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.1, 0.3, 0.5),
    });
    y -= 18;

    // Simple text wrap
    const words = sec.body.split(' ');
    let line = '';
    for (const word of words) {
      if ((line + word).length > 70) {
        page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 14;
        line = '';
      }
      line += word + ' ';
    }
    if (line) {
      page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 25;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outDir = path.resolve(__dirname, '../../sample_documents');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const destPath = path.join(outDir, 'ADR-042_Ledger_Architecture.pdf');
  fs.writeFileSync(destPath, pdfBytes);
  console.log(`Generated PDF at: ${destPath}`);
}

generateSamplePdf().catch(console.error);
