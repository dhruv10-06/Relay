async function test() {
  const res = await fetch('http://localhost:5000/api/projects');
  const projects = await res.json();
  console.log(`Found ${projects.length} project(s)`);

  if (projects.length > 0) {
    const p = projects[0];
    console.log(`\nProject: ${p.name}`);
    console.log(`Stats:`, p.stats);

    const fRes = await fetch(`http://localhost:5000/api/findings?projectId=${p.id}`);
    const findings = await fRes.json();
    console.log(`\nFindings (${findings.length}):`);
    findings.forEach((f) => {
      console.log(`- [State: ${f.knowledgeState.toUpperCase()}] [Validation: ${f.evidenceValidation.toUpperCase()}] ${f.title}`);
      if (f.detectedGaps && f.detectedGaps.length > 0) {
        f.detectedGaps.forEach((g) => console.log(`    ⚠️ GAP: ${g}`));
      }
      if (f.evidence && f.evidence.length > 0) {
        f.evidence.forEach((e) => console.log(`    📄 Source: ${e.sourceDocName} (${e.pageOrLocation})`));
      }
    });

    // Test Handover Generation
    console.log('\nTesting Handover Generation:');
    // First review/approve the findings
    for (const f of findings) {
      await fetch(`http://localhost:5000/api/findings/${f.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', reviewNote: 'Approved in test' }),
      });
    }

    const hRes = await fetch('http://localhost:5000/api/handover/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: p.id }),
    });
    const handover = await hRes.json();
    console.log(`Handover generated successfully!`);
    console.log(`Title: ${handover.title}`);
    console.log(`First 24 Hours Plan Items: ${handover.first24HoursPlan.length}`);
    handover.first24HoursPlan.forEach((plan) => {
      console.log(`  🕒 [${plan.timeframe}] ${plan.action}`);
    });
  }
}

test().catch(console.error);
