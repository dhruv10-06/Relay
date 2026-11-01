import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSampleDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'Release Readiness & QA Audit Report: Q4 Milestone',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Document ID: ', bold: true }),
              new TextRun('QA-REL-2026-10-28 | '),
              new TextRun({ text: 'Author: ', bold: true }),
              new TextRun('Sarah Chen (Principal QA & Reliability Engineer) | '),
              new TextRun({ text: 'Date: ', bold: true }),
              new TextRun('October 28, 2026'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '1. Executive Summary & Verdict',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'OVERALL STATUS: BLOCKED. ', bold: true }),
              new TextRun('The candidate release v2.4-RC3 cannot be promoted to production due to critical test regressions and conflicting configuration states across core microservices.'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '2. Service Verification Findings',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: 'A. Data Reconciliation Service',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Jira Status: ', bold: true }),
              new TextRun('Marked as "COMPLETED" (100% progress logged by external contract team).\n'),
              new TextRun({ text: 'QA Verification Reality: ', bold: true }),
              new TextRun('Automated regression suite execution failed with a 32% error rate on non-idempotent settlement transactions. Test Suite #TR-881 (Ledger Parity Check) was skipped due to timeout errors in the test harness.\n'),
              new TextRun({ text: 'Audit Finding: ', bold: true }),
              new TextRun('The service is NOT complete. Promoting this service to production will cause ledger imbalance under concurrent loads.'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'B. Redis Caching Cluster Configuration',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Current Deployed Configuration: ', bold: true }),
              new TextRun('DevOps deployed the production Redis cluster with eviction policy set to LFU (Least Frequently Used) with maxmemory 8GB, following infra ticket INFRA-409.\n'),
              new TextRun({ text: 'Conflict Warning: ', bold: true }),
              new TextRun('This directly conflicts with the architectural decision recorded in engineering syncs specifying LRU (Least Recently Used) with 4GB. This mismatch causes cache pollution under periodic batch jobs.'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '3. Compliance and Audit Risks',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Urgent Risk: ', bold: true }),
              new TextRun('Annual PCI-DSS Level 1 compliance audit filing is due on November 18, 2026.\n'),
              new TextRun({ text: 'Blocker: ', bold: true }),
              new TextRun('Legacy cloud provider has not signed the shared responsibility attestation appendix. If not resolved within 14 business days, card processing operations will face regulatory suspension.'),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.resolve(__dirname, '../../sample_documents');
  const destPath = path.join(outDir, 'Release_Readiness_and_QA_Report.docx');
  fs.writeFileSync(destPath, buffer);
  console.log(`Generated DOCX at: ${destPath}`);
}

generateSampleDocx().catch(console.error);
