import puppeteer from 'puppeteer-core';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(`
    <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1>Architecture Decision Record: ADR-042</h1>
        <p><strong>Project:</strong> Nexus Core Ledger & Payment Gateway Migration</p>
        <p><strong>Status:</strong> Approved</p>
        <p><strong>Decision:</strong> We have decided to adopt PostgreSQL 16 with TimescaleDB hypertables for all double-entry transaction ledgers, replacing the DynamoDB store.</p>
        <p><strong>Rationale:</strong> Mandatory strict row-level ACID transactions for payment settlement; TimescaleDB hypertables reduce 90-day forensic audit queries from 4m to under 650ms; satisfies FINRA & ECB DORA directives.</p>
        <p><strong>Lead Owner:</strong> Elena Vance (Lead Solutions Architect)</p>
        <p><strong>Target Completion:</strong> Sprint 43 (October 24, 2026)</p>
        <p><strong>Critical Dependency:</strong> Core Banking Gateway API v3.4 release by 3rd-party vendor (FinVance Inc.). Dependency Status: UNRESOLVED. Vendor support ticket #FV-9021 remains open without an SLA commitment or staging endpoint delivery date.</p>
        <p>A decision was recorded to rotate root AWS KMS customer-managed signing keys on a 14-day cycle. (Note: No rationale or compliance justification was provided for this 14-day frequency; standard security policy specifies 90-day rotation).</p>
      </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  console.log(`Generated standard PDF: ${pdfBuffer.length} bytes`);
  const parsed = await pdfParse(pdfBuffer);
  console.log(`Parsed successfully with pdf-parse!`);
  console.log(`Text Length: ${parsed.text.length}`);
  console.log(`Sample Text:\n${parsed.text.slice(0, 300)}`);
  
  return pdfBuffer;
}

test().catch(console.error);
