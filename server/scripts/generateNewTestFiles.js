import puppeteer from 'puppeteer-core';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '../../new_test_documents');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function createNewFiles() {
  console.log('Generating fresh, un-seen real test documents...');

  // 1. Fresh PDF
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 30px;">
        <h1>RFC-809: Distributed Transaction Idempotency</h1>
        <p><strong>Author:</strong> David Kim (Senior Staff Engineer)</p>
        <p><strong>Date:</strong> 2026-11-01</p>
        <h2>Section 1: Idempotency Key Design</h2>
        <p>We decided to enforce a mandatory Idempotency-Key HTTP header on all /v2/charge endpoints with a 24-hour TTL stored in Redis.</p>
        <p><strong>Rationale:</strong> Prevents double-charging customers during client network disconnects and retries.</p>
        <p><strong>Assigned Owner:</strong> David Kim</p>
        <p><strong>Deadline:</strong> 2026-11-20</p>
      </body>
    </html>
  `);
  const pdfBytes = await page.pdf({ format: 'A4' });
  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, 'RFC-809_Idempotency.pdf'), pdfBytes);
  console.log('Created: RFC-809_Idempotency.pdf');

  // 2. Fresh DOCX
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: 'Incident Postmortem: SEV-1 Checkout Outage', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: 'Date: October 29, 2026 | Severity: High | Status: Resolved' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Root Cause & Decision', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: 'Connection leak in thread pool caused 429 timeouts. Decision made to cap thread pool at 64 workers.' }),
          new Paragraph({ text: 'Action Item: Deploy thread monitoring metrics by Nov 10. Owner: Unassigned.' }),
        ],
      },
    ],
  });
  const docxBytes = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, 'Postmortem_SEV1_Outage.docx'), docxBytes);
  console.log('Created: Postmortem_SEV1_Outage.docx');

  // 3. Fresh CSV
  const csvContent = `Vulnerability_ID,Package_Name,Severity,Status,Assignee,Target_Fix_Date
VULN-001,openssl,Critical,Open,Marcus Brody,2026-11-05
VULN-002,lodash,Medium,Resolved,Devon Patel,2026-10-20
VULN-003,jsonwebtoken,High,Unassigned,TBD,2026-11-12`;
  fs.writeFileSync(path.join(OUT_DIR, 'Security_Vulnerabilities_Q4.csv'), csvContent);
  console.log('Created: Security_Vulnerabilities_Q4.csv');

  // 4. Fresh Markdown
  const mdContent = `# Engineering Runbook: Zero-Downtime Deployment
**Service:** Core Settlement Engine  
**Version:** v3.1  

## Deployment Protocol
1. Verify database migrations are backwards-compatible before cutover.
2. Decision approved to use Blue-Green deployment with 5% canary routing.
3. Rationale: Eliminates downtime during high-volume banking settlement hours.
4. Assigned Lead: Sarah Chen. Target: Sprint 45.`;
  fs.writeFileSync(path.join(OUT_DIR, 'Runbook_Canary_Deployment.md'), mdContent);
  console.log('Created: Runbook_Canary_Deployment.md');

  console.log('All fresh test documents successfully generated in new_test_documents/!');
}

createNewFiles().catch(console.error);
