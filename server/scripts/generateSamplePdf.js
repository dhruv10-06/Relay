import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSamplePdf() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            padding: 40px;
          }
          h1 {
            color: #0f172a;
            font-size: 22px;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .meta {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 16px;
            color: #0f766e;
            margin-top: 24px;
            margin-bottom: 8px;
          }
          p {
            font-size: 13px;
            margin: 6px 0;
          }
          .note {
            background-color: #f1f5f9;
            padding: 10px;
            border-left: 3px solid #0d9488;
            font-size: 12px;
            margin: 12px 0;
          }
        </style>
      </head>
      <body>
        <h1>Architecture Decision Record: ADR-042</h1>
        <div class="meta">
          <strong>Project:</strong> Nexus Core Ledger & Payment Gateway Migration | 
          <strong>Status:</strong> Approved | 
          <strong>Author:</strong> Elena Vance (Lead Solutions Architect) | 
          <strong>Date:</strong> October 14, 2026
        </div>

        <h2>1. Context & Problem Statement</h2>
        <p>The legacy ledger relies on a monolithic DynamoDB NoSQL cluster with custom eventual-consistency resolution logic. This has caused reconciliation discrepancies exceeding $42,000 during high-throughput flash events. The engineering organization requires a deterministic, ACID-compliant ledger storage solution capable of supporting 8,500 financial transactions per second with real-time auditability.</p>

        <h2>2. Approved Decision & Rationale</h2>
        <p>We have decided to adopt PostgreSQL 16 with TimescaleDB hypertables for all double-entry transaction ledgers, replacing the DynamoDB store.</p>
        <div class="note">
          <strong>Documented Rationale:</strong><br>
          1. Strict ACID Compliance: Immediate row-level locking and strict serializability are mandatory for cross-border payment settlement.<br>
          2. Audit Query Performance: TimescaleDB hypertables provide native chunking by timestamp, reducing 90-day forensic audit query execution times from 4 minutes to under 650ms.<br>
          3. Regulatory Requirements: Compliance standards (FINRA & European Central Bank DORA directives) require verifiable point-in-time state reconstruction.
        </div>
        <p><strong>Lead Owner:</strong> Elena Vance (Lead Solutions Architect)</p>
        <p><strong>Target Delivery:</strong> Sprint 43 (October 24, 2026)</p>
        <p><strong>Status:</strong> Approved and Implementation In Progress</p>

        <h2>3. External Dependencies & Blockers</h2>
        <p>Critical Dependency: Core Banking Gateway API v3.4 release by 3rd-party vendor (FinVance Inc.). Dependency Status: UNRESOLVED. Vendor support ticket #FV-9021 remains open without an SLA commitment or staging endpoint delivery date.</p>

        <h2>4. Key Management & Security</h2>
        <p>A decision was recorded to rotate root AWS KMS customer-managed signing keys on a 14-day cycle. (Note: No rationale or compliance justification was provided for this 14-day frequency; standard security policy specifies 90-day rotation).</p>
      </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    printBackground: true,
  });

  await browser.close();

  const out1 = path.resolve(__dirname, '../../sample_documents/ADR-042_Ledger_Architecture.pdf');
  const out2 = path.resolve(__dirname, '../sample_data/ADR-042_Ledger_Architecture.pdf');
  
  fs.writeFileSync(out1, pdfBuffer);
  fs.writeFileSync(out2, pdfBuffer);
  console.log(`Generated standard compliant PDF at: ${out1} and ${out2} (${pdfBuffer.length} bytes)`);
}

generateSamplePdf().catch(console.error);
