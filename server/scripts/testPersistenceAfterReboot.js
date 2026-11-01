import { db } from '../models/db.js';

async function checkCurrentData() {
  const projects = await db.getProjects();
  console.log(`CURRENT PERSISTED DATA BEFORE RESTART:`);
  console.log(`Total Projects: ${projects.length}`);

  for (const p of projects) {
    const docs = await db.getDocuments(p.id);
    const findings = await db.getFindings(p.id);
    const handover = await db.getHandover(p.id);
    console.log(`- Project: "${p.name}" (ID: ${p.id})`);
    console.log(`  Docs: ${docs.length} | Findings: ${findings.length} | Handover: ${handover ? 'YES (' + handover.title + ')' : 'NO'}`);
  }
}

checkCurrentData().catch(console.error);
