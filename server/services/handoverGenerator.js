import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a comprehensive handover report and First 24 Hours Continuation Plan
 * using verified and approved findings.
 */
export function generateHandoverReport(project, findings, documents) {
  // Filter approved findings vs pending/rejected
  const approvedFindings = findings.filter((f) => f.reviewStatus === 'accepted' || f.reviewStatus === 'edited');
  const rejectedFindings = findings.filter((f) => f.reviewStatus === 'rejected');
  const pendingFindings = findings.filter((f) => f.reviewStatus === 'pending');

  // Group by category
  const decisions = approvedFindings.filter((f) => f.category === 'decision');
  const tasks = approvedFindings.filter((f) => ['task', 'responsibility'].includes(f.category));
  const dependencies = approvedFindings.filter((f) => f.category === 'dependency');
  const risks = approvedFindings.filter((f) => f.category === 'risk');
  const questions = approvedFindings.filter((f) => f.category === 'question');

  // Identify state groups
  const contradictedFindings = approvedFindings.filter((f) => f.knowledgeState === 'contradicted');
  const missingFindings = approvedFindings.filter((f) => f.knowledgeState === 'missing');
  const inferredFindings = approvedFindings.filter((f) => f.knowledgeState === 'inferred');

  // Build the First 24 Hours Continuation Plan
  const first24HoursPlan = [];

  // 1. Hour 0-4: Critical triage, unassigned owners, urgent security
  const hour0_4Items = approvedFindings.filter(
    (f) => f.continuationTimeframe === 'Hour 0-4' || (f.knowledgeState === 'missing' && ['task', 'responsibility'].includes(f.category))
  );
  if (hour0_4Items.length > 0) {
    hour0_4Items.forEach((item) => {
      first24HoursPlan.push({
        id: uuidv4(),
        timeframe: 'Hour 0-4: Immediate Triage & Ownership',
        action: item.continuationAction || `Assign lead owner and provision credentials for: ${item.title}`,
        targetPersonOrSystem: item.owner || 'Engineering Manager / Security Lead',
        criticalContext: item.description,
        findingId: item.id,
        urgency: 'CRITICAL',
      });
    });
  } else {
    first24HoursPlan.push({
      id: uuidv4(),
      timeframe: 'Hour 0-4: Immediate Triage & Ownership',
      action: 'Verify system access, production credentials, and repository write permissions with Departing Lead.',
      targetPersonOrSystem: project.departingPerson || 'Outgoing Lead',
      criticalContext: 'Establish baseline operational connectivity and verify multi-factor authentication access.',
      urgency: 'HIGH',
    });
  }

  // 2. Hour 4-8: QA regressions, premature completion checks, external vendor blockers
  const hour4_8Items = approvedFindings.filter(
    (f) => f.continuationTimeframe === 'Hour 4-8' || f.category === 'dependency' || f.detectedGaps?.some((g) => g.includes('Premature'))
  );
  if (hour4_8Items.length > 0) {
    hour4_8Items.forEach((item) => {
      first24HoursPlan.push({
        id: uuidv4(),
        timeframe: 'Hour 4-8: Quality Assurance & Vendor Escalation',
        action: item.continuationAction || `Escalate external blocker or review QA test failures for: ${item.title}`,
        targetPersonOrSystem: item.owner || 'QA Lead / Vendor Liaison',
        criticalContext: item.description,
        findingId: item.id,
        urgency: 'HIGH',
      });
    });
  }

  // 3. Hour 8-16: Contradictions & Architecture Alignment
  const hour8_16Items = approvedFindings.filter(
    (f) => f.continuationTimeframe === 'Hour 8-16' || f.knowledgeState === 'contradicted'
  );
  if (hour8_16Items.length > 0) {
    hour8_16Items.forEach((item) => {
      first24HoursPlan.push({
        id: uuidv4(),
        timeframe: 'Hour 8-16: Specification Alignment & Conflict Resolution',
        action: item.continuationAction || `Reconcile architectural contradiction with platform engineers for: ${item.title}`,
        targetPersonOrSystem: 'Platform / Infrastructure Team',
        criticalContext: item.description,
        findingId: item.id,
        urgency: 'MEDIUM',
      });
    });
  }

  // 4. Hour 16-24: Compliance & Executive Briefing
  const hour16_24Items = approvedFindings.filter(
    (f) => f.continuationTimeframe === 'Hour 16-24' || f.category === 'risk'
  );
  if (hour16_24Items.length > 0) {
    hour16_24Items.forEach((item) => {
      first24HoursPlan.push({
        id: uuidv4(),
        timeframe: 'Hour 16-24: Compliance Briefing & Roadmap Alignment',
        action: item.continuationAction || `Review regulatory deadlines and mitigation status for: ${item.title}`,
        targetPersonOrSystem: 'Compliance Officer / Engineering Director',
        criticalContext: item.description,
        findingId: item.id,
        urgency: 'HIGH',
      });
    });
  }

  // Generate High-Definition Markdown Document
  const markdown = generateHandoverMarkdown(project, {
    approvedFindings,
    decisions,
    tasks,
    dependencies,
    risks,
    contradictedFindings,
    missingFindings,
    inferredFindings,
    first24HoursPlan,
    documents,
  });

  return {
    id: uuidv4(),
    projectId: project.id,
    generatedAt: new Date().toISOString(),
    title: `Intelligent Handover Package: ${project.name}`,
    overview: `This handover package was reconstructed by RELAY from ${documents.length} authorized source documents. It consolidates ${approvedFindings.length} human-approved findings, flags ${contradictedFindings.length} cross-document contradictions, identifies ${missingFindings.length} missing knowledge elements, and establishes an executable First 24 Hours Continuation Plan for the incoming technical lead.`,
    projectStatusSummary: contradictedFindings.length > 0 ? 'CRITICAL ATTENTION REQUIRED: Active specification contradictions and QA test regressions detected.' : 'STABLE: Ready for orderly transition.',
    first24HoursPlan,
    approvedFindingsCount: approvedFindings.length,
    pendingFindingsCount: pendingFindings.length,
    rejectedFindingsCount: rejectedFindings.length,
    exportMarkdown: markdown,
  };
}

function generateHandoverMarkdown(project, data) {
  const {
    approvedFindings,
    decisions,
    tasks,
    dependencies,
    risks,
    contradictedFindings,
    missingFindings,
    inferredFindings,
    first24HoursPlan,
    documents,
  } = data;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# RELAY Intelligent Handover Package
**Project:** ${project.name}  
**Date Generated:** ${dateStr}  
**Departing Lead:** ${project.departingPerson || 'Not Specified'}  
**Incoming Lead:** ${project.incomingPerson || 'Not Specified'}  
**Status:** Human Verified & Approved (${approvedFindings.length} Approved Findings)  

---

## 1. Executive Summary & Transition Status
${project.description || 'Project knowledge reconstruction completed via RELAY.'}

- **Total Ingested Sources:** ${documents.length} verified documents
- **Approved Architectural Findings:** ${approvedFindings.length}
- **Cross-Document Contradictions Detected:** ${contradictedFindings.length}
- **Missing Information Gaps:** ${missingFindings.length}
- **Inferred (Unverified) Context:** ${inferredFindings.length}

---

## 2. ⚡ FIRST 24 HOURS CONTINUATION PLAN
*A deterministic, step-by-step checklist designed to enable immediate operational continuity for the incoming team member.*

| Timeframe | Action Required | Responsible Lead / Target | Urgency | Context & Finding Ref |
|---|---|---|---|---|
`;

  first24HoursPlan.forEach((plan) => {
    md += `| **${plan.timeframe}** | ${plan.action} | ${plan.targetPersonOrSystem} | \`${plan.urgency}\` | ${plan.criticalContext.slice(0, 100)}... |\n`;
  });

  md += `\n---

## 3. Approved Architectural Decisions
`;

  if (decisions.length === 0) {
    md += `*No architectural decisions have been approved yet.*\n`;
  } else {
    decisions.forEach((d, i) => {
      md += `### ${i + 1}. ${d.title}
- **Status:** \`${d.status}\` | **Owner:** ${d.owner || 'Unassigned'} | **Target:** ${d.deadline || 'TBD'}
- **Knowledge State:** \`${d.knowledgeState.toUpperCase()}\` | **Evidence:** \`${d.evidenceValidation.toUpperCase()}\`
- **Context & Description:** ${d.description}
- **Documented Rationale:** ${d.rationale || '⚠️ None provided in source documents'}
`;
      if (d.evidence && d.evidence.length > 0) {
        md += `- **Supporting Evidence:**
`;
        d.evidence.forEach((ev) => {
          md += `  > "${ev.excerpt}"  
  > — *Source: ${ev.sourceDocName} (${ev.pageOrLocation})*  
`;
        });
      }
      md += `\n`;
    });
  }

  md += `---

## 4. Tasks, Responsibilities & Delivery Milestones
`;

  if (tasks.length === 0) {
    md += `*No tasks recorded.*\n`;
  } else {
    tasks.forEach((t, i) => {
      md += `### ${i + 1}. ${t.title}
- **Owner:** ${t.owner || '⚠️ UNASSIGNED'} | **Deadline:** ${t.deadline || '⚠️ MISSING'} | **Status:** \`${t.status}\`
- **Knowledge State:** \`${t.knowledgeState.toUpperCase()}\` | **Validation:** \`${t.evidenceValidation.toUpperCase()}\`
- **Details:** ${t.description}
`;
      if (t.detectedGaps && t.detectedGaps.length > 0) {
        md += `- **Identified Gaps:** ${t.detectedGaps.join('; ')}\n`;
      }
      md += `\n`;
    });
  }

  md += `---

## 5. ⚠️ Knowledge Gaps & Contradiction Matrix
*Critical discrepancies detected across authorized project documentation that require human resolution.*

`;

  if (contradictedFindings.length === 0 && missingFindings.length === 0) {
    md += `*No critical contradictions or missing gaps remain in approved findings.*\n`;
  } else {
    if (contradictedFindings.length > 0) {
      md += `### Active Contradictions Across Sources
`;
      contradictedFindings.forEach((cf, idx) => {
        md += `#### ${idx + 1}. ${cf.title}
- **Description:** ${cf.description}
- **Conflicting Evidence References:**
`;
        cf.evidence.forEach((ev) => {
          md += `  - **Source [${ev.sourceDocName} - ${ev.pageOrLocation}]:** "${ev.excerpt}" ${ev.contradictionNote ? `*(Note: ${ev.contradictionNote})*` : ''}\n`;
        });
        md += `\n`;
      });
    }

    if (missingFindings.length > 0) {
      md += `### Missing Information & Unassigned Ownership
`;
      missingFindings.forEach((mf, idx) => {
        md += `- **${mf.title}:** ${mf.detectedGaps?.join(' ') || mf.description}\n`;
      });
      md += `\n`;
    }
  }

  md += `---

## 6. External Dependencies & Operational Risks
`;

  if (dependencies.length > 0) {
    md += `### External Dependencies
`;
    dependencies.forEach((dep) => {
      md += `- **${dep.title}:** ${dep.description} (Owner: ${dep.owner || 'TBD'}, Status: \`${dep.status}\`)\n`;
    });
    md += `\n`;
  }

  if (risks.length > 0) {
    md += `### Operational & Compliance Risks
`;
    risks.forEach((rk) => {
      md += `- **${rk.title}:** ${rk.description} (Deadline: ${rk.deadline || 'TBD'}, Status: \`${rk.status}\`)\n`;
    });
    md += `\n`;
  }

  md += `---

## 7. Traceability Index (Authorized Sources)
The findings in this handover were extracted and verified against the following documents:
`;

  documents.forEach((doc, idx) => {
    md += `${idx + 1}. **${doc.fileName}** (${doc.fileType.toUpperCase()}, ${doc.wordCount} words, uploaded ${new Date(doc.uploadedAt).toLocaleDateString()})\n`;
  });

  md += `\n*Handover compiled by RELAY — Never let critical project knowledge leave with people.*`;

  return md;
}
