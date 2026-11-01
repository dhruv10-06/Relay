async function testReviewAndHandover() {
  console.log('======================================================================');
  console.log('TESTING HUMAN REVIEW, EDITING, REJECTION & HANDOVER GENERATION');
  console.log('======================================================================\n');

  // Fetch projects
  const pRes = await fetch('http://localhost:5000/api/projects');
  const projects = await pRes.json();
  const project = projects.find((p) => p.name.includes('Project Horizon')) || projects[0];

  console.log(`Using Project: "${project.name}" (ID: ${project.id})`);

  // Fetch findings
  const fRes = await fetch(`http://localhost:5000/api/findings?projectId=${project.id}`);
  const findings = await fRes.json();
  console.log(`Initial Findings Count: ${findings.length}`);

  if (findings.length < 3) {
    throw new Error('Need at least 3 findings to test review workflows.');
  }

  // 1. Accept Finding 0
  const f0 = findings[0];
  const acceptRes = await fetch(`http://localhost:5000/api/findings/${f0.id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'accepted',
      reviewNote: 'Approved by lead architect after reviewing idempotency specification.',
    }),
  });
  const acceptedFinding = await acceptRes.json();
  console.log(`\n1. Accepted Finding: "${acceptedFinding.title}"`);
  console.log(`   Review Status: ${acceptedFinding.reviewStatus} (Note: ${acceptedFinding.reviewNote})`);

  // 2. Edit & Approve Finding 1
  const f1 = findings[1];
  const editRes = await fetch(`http://localhost:5000/api/findings/${f1.id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'edited',
      reviewNote: 'Owner and delivery milestone assigned during review sync.',
      edits: {
        title: 'Thread Pool Capacity Cap at 64 Workers (Postmortem Action)',
        description: 'Cap thread pool to 64 workers to prevent 429 connection timeouts during flash sales.',
        owner: 'Maya Lin (Incoming Lead)',
        deadline: '2026-11-20',
        knowledgeState: 'supported',
        continuationTimeframe: 'Hour 4-8',
        continuationAction: 'Verify thread pool cap configuration in staging cluster.',
      },
    }),
  });
  const editedFinding = await editRes.json();
  console.log(`\n2. Edited Finding: "${editedFinding.title}"`);
  console.log(`   New Owner: ${editedFinding.owner} | Deadline: ${editedFinding.deadline} | State: ${editedFinding.knowledgeState}`);
  console.log(`   Review Status: ${editedFinding.reviewStatus}`);

  // 3. Reject Finding 2
  const f2 = findings[2];
  const rejectRes = await fetch(`http://localhost:5000/api/findings/${f2.id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'rejected',
      reviewNote: 'Duplicate finding; covered by thread pool capacity cap.',
    }),
  });
  const rejectedFinding = await rejectRes.json();
  console.log(`\n3. Rejected Finding: "${rejectedFinding.title}"`);
  console.log(`   Review Status: ${rejectedFinding.reviewStatus} (Note: ${rejectedFinding.reviewNote})`);

  // 4. Generate Handover Report
  console.log(`\n4. Generating Handover Report...`);
  const hRes = await fetch('http://localhost:5000/api/handover/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: project.id }),
  });
  const handover = await hRes.json();

  console.log(`   Handover Title: "${handover.title}"`);
  console.log(`   Approved Findings in Handover: ${handover.approvedFindingsCount}`);
  console.log(`   Rejected Findings Excluded: ${handover.rejectedFindingsCount}`);
  console.log(`   First 24 Hours Plan Items: ${handover.first24HoursPlan.length}`);

  for (const plan of handover.first24HoursPlan) {
    console.log(`     🕒 [${plan.timeframe}] ${plan.action} (Target: ${plan.targetPersonOrSystem})`);
  }

  // 5. Test Export Markdown Endpoint
  console.log(`\n5. Testing Markdown Export Endpoint...`);
  const exportRes = await fetch(`http://localhost:5000/api/handover/export/markdown?projectId=${project.id}`);
  const mdText = await exportRes.text();
  console.log(`   Export Status: ${exportRes.status}`);
  console.log(`   Markdown Length: ${mdText.length} characters`);
  console.log(`   Markdown Header: ${mdText.slice(0, 150).replace(/\n/g, ' ')}...`);

  // Assertions
  if (handover.rejectedFindingsCount !== 1) {
    throw new Error('Rejected findings were not accurately tracked!');
  }
  if (!mdText.includes('FIRST 24 HOURS CONTINUATION PLAN')) {
    throw new Error('Exported Markdown is missing First 24 Hours Continuation Plan!');
  }

  console.log('\n======================================================================');
  console.log('✅ HUMAN REVIEW & HANDOVER EXPORT TEST: 100% PASSED');
  console.log('======================================================================\n');

  return { projectId: project.id, handoverId: handover.id };
}

testReviewAndHandover().catch(console.error);
