import { db } from '../models/db.js';

async function testExcerpts() {
  const projects = await db.getProjects();
  if (projects.length === 0) {
    console.log('No projects to check.');
    return;
  }

  // Check the newest project
  const p = projects[0];
  const docs = await db.getDocuments(p.id);
  const findings = await db.getFindings(p.id);

  console.log(`======================================================================`);
  console.log(`VERIFYING VERBATIM EVIDENCE TRACEABILITY FOR: "${p.name}"`);
  console.log(`Documents Ingested: ${docs.length} | Findings Analyzed: ${findings.length}`);
  console.log(`======================================================================\n`);

  let totalExcerpts = 0;
  let exactMatches = 0;

  for (const f of findings) {
    console.log(`Finding: [${f.knowledgeState.toUpperCase()}] [${f.evidenceValidation.toUpperCase()}] "${f.title}"`);
    for (const ev of f.evidence || []) {
      totalExcerpts++;
      const matchingDoc = docs.find(
        (d) => d.fileName.toLowerCase() === ev.sourceDocName.toLowerCase() || ev.sourceDocName.toLowerCase().includes(d.fileName.toLowerCase())
      );

      if (!matchingDoc) {
        console.log(`  ❌ Source document not found in project: "${ev.sourceDocName}"`);
        continue;
      }

      // Check verbatim presence with whitespace normalization
      const normalize = (s) => s.replace(/\s+/g, ' ').trim();
      const docClean = normalize(matchingDoc.extractedText);
      const excerptClean = normalize(ev.excerpt);

      const isSub = docClean.includes(excerptClean);
      if (isSub) {
        exactMatches++;
        console.log(`  ✅ 100% VERBATIM MATCH in [${matchingDoc.fileName} - ${ev.pageOrLocation}]`);
        console.log(`     Excerpt: "${excerptClean.slice(0, 100)}..." (${excerptClean.length} chars)`);
      } else {
        console.log(`  ❌ NOT MATCHED in [${matchingDoc.fileName}]:`);
        console.log(`     Excerpt: "${excerptClean.slice(0, 100)}..."`);
      }
    }
    console.log('');
  }

  console.log(`======================================================================`);
  console.log(`VERBATIM TRACEABILITY RESULT: ${exactMatches} / ${totalExcerpts} (${Math.round((exactMatches / totalExcerpts) * 100)}%)`);
  console.log(`======================================================================`);
}

testExcerpts().catch(console.error);
