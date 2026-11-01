import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILES_DIR = path.resolve(__dirname, '../../new_test_documents');

async function verifyRealUploads() {
  console.log('======================================================================');
  console.log('TESTING REAL DOCUMENT UPLOADS & TEXT EXTRACTION (FRESH FILES)');
  console.log('======================================================================\n');

  // 1. Create a brand new project
  const pRes = await fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Project Horizon — Transaction Integrity',
      description: 'Brand new test project to verify multi-format uploads and generic document extraction.',
      targetRole: 'Principal Systems Architect',
      departingPerson: 'David Kim',
      incomingPerson: 'Maya Lin',
    }),
  });

  const project = await pRes.json();
  console.log(`1. Created Project: "${project.name}" (ID: ${project.id})`);

  // 2. Upload the 4 new test files using FormData
  const formData = new FormData();
  formData.append('projectId', project.id);

  const fileNames = [
    'RFC-809_Idempotency.pdf',
    'Postmortem_SEV1_Outage.docx',
    'Security_Vulnerabilities_Q4.csv',
    'Runbook_Canary_Deployment.md',
  ];

  for (const name of fileNames) {
    const fullPath = path.join(FILES_DIR, name);
    const buffer = fs.readFileSync(fullPath);
    const blob = new Blob([buffer]);
    formData.append('files', blob, name);
  }

  const uploadRes = await fetch('http://localhost:5000/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log(`\n2. Upload Response Status: ${uploadRes.status}`);
  console.log(`   Message: ${uploadData.message}`);
  console.log(`   Documents Processed: ${uploadData.documents?.length || 0}`);

  // 3. Inspect extraction results for each file
  let allExtracted = true;
  for (const doc of uploadData.documents) {
    console.log(`\n   📄 Document: "${doc.fileName}" (${doc.fileType.toUpperCase()})`);
    console.log(`      Status: ${doc.status}`);
    console.log(`      Word Count: ${doc.wordCount} words`);
    console.log(`      Extracted Snippet: "${doc.extractedText.slice(0, 120).replace(/\n/g, ' ')}..."`);

    if (doc.status !== 'extracted' || doc.wordCount === 0) {
      allExtracted = false;
    }
  }

  if (!allExtracted) {
    throw new Error('One or more documents failed text extraction!');
  }

  // 4. Trigger Knowledge Reconstruction on this new project
  console.log('\n3. Triggering Reconstruction on new project...');
  const reconRes = await fetch('http://localhost:5000/api/reconstruction/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: project.id, forceDemo: false }),
  });

  const reconData = await reconRes.json();
  console.log(`   Reconstruction Result: Success=${reconData.success}`);
  console.log(`   Active Engine: ${reconData.engine}`);
  console.log(`   Findings Extracted: ${reconData.findingsCount}`);
  console.log(`   Knowledge Gap Stats:`, reconData.stats);

  for (const f of reconData.findings) {
    console.log(`     - [${f.knowledgeState.toUpperCase()}] [${f.evidenceValidation.toUpperCase()}] ${f.title}`);
    if (f.evidence && f.evidence.length > 0) {
      console.log(`       Evidence Source: ${f.evidence[0].sourceDocName} (${f.evidence[0].pageOrLocation})`);
    }
  }

  console.log('\n======================================================================');
  console.log('✅ REAL DOCUMENT UPLOAD & EXTRACTION TEST: 100% PASSED');
  console.log('======================================================================\n');
}

verifyRealUploads().catch(console.error);
