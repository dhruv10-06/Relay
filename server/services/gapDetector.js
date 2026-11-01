/**
 * RELAY Knowledge Gap Detector & Evidence Validator
 * Classifies findings into the 4 Primary States:
 *   1. Supported
 *   2. Inferred
 *   3. Contradicted
 *   4. Missing
 * 
 * Flags Evidence Validation separately:
 *   - Verified
 *   - Unverified
 * 
 * Identifies practical knowledge gaps:
 *   - Task without assigned owner
 *   - Missing deadline
 *   - Decision without rationale
 *   - Premature task completion (marked complete despite unfinished/failed testing)
 *   - Unresolved external dependency
 *   - Cross-document conflicting statements
 */

export function runGapAnalysis(findings, documents = []) {
  return findings.map((finding) => {
    const gaps = [];
    let state = finding.knowledgeState || 'supported';
    let validation = finding.evidenceValidation || 'unverified';
    let isContinuationPriority = false;
    let continuationTimeframe = finding.continuationTimeframe || 'None';
    let continuationAction = finding.continuationAction || '';

    // Check evidence count & validity
    const hasEvidence = Array.isArray(finding.evidence) && finding.evidence.length > 0;
    const hasMultipleSources = hasEvidence && finding.evidence.length > 1;

    // 1. Check for Missing Owner on Tasks / Responsibilities
    if (['task', 'responsibility'].includes(finding.category)) {
      const owner = (finding.owner || '').trim().toLowerCase();
      if (!owner || owner === 'unassigned' || owner === 'missing' || owner === 'tbd' || owner === 'unknown' || owner === 'nobody') {
        gaps.push('Missing Owner: Action item has no designated assignee or responsible lead.');
        if (state !== 'contradicted') state = 'missing';
        isContinuationPriority = true;
        continuationTimeframe = 'Hour 0-4';
        continuationAction = `Assign urgent owner for: ${finding.title}`;
      }
    }

    // 2. Check for Missing Deadline
    if (['task', 'decision', 'dependency'].includes(finding.category)) {
      const deadline = (finding.deadline || '').trim().toLowerCase();
      if (!deadline || deadline === 'missing' || deadline === 'tbd' || deadline === 'none' || deadline === 'unspecified') {
        gaps.push('Missing Deadline: No delivery milestone, target date, or SLA committed.');
        if (state === 'supported') state = 'missing';
      }
    }

    // 3. Check for Decision Missing Rationale
    if (finding.category === 'decision') {
      const rationale = (finding.rationale || '').trim().toLowerCase();
      if (!rationale || rationale === 'missing' || rationale === 'none' || rationale.length < 15 || rationale.includes('no rationale') || rationale.includes('unspecified')) {
        gaps.push('Missing Rationale: Architectural decision recorded without documented technical or business justification.');
        if (state === 'supported') state = 'missing';
      }
    }

    // 4. Check for Premature Task Completion vs Unfinished Testing
    const descLower = (finding.description || '').toLowerCase();
    const statusLower = (finding.status || '').toLowerCase();
    const isReportedComplete = statusLower.includes('complete') || descLower.includes('marked as completed') || descLower.includes('100%');
    const hasTestFailure = descLower.includes('failed') || descLower.includes('regression') || descLower.includes('skipped') || descLower.includes('not complete') || descLower.includes('error rate');
    
    if (isReportedComplete && hasTestFailure) {
      gaps.push('Premature Completion Discrepancy: Marked complete on task board but test suite failed or was skipped in QA verification.');
      state = 'contradicted';
      isContinuationPriority = true;
      continuationTimeframe = 'Hour 4-8';
      continuationAction = `Audit test failure & reopen task: ${finding.title}`;
    }

    // 5. Check for Cross-Document Contradictions
    const hasContradictionNote = finding.evidence && finding.evidence.some((e) => e.contradictionNote && e.contradictionNote.trim().length > 0);
    if (hasContradictionNote || descLower.includes('conflict') || descLower.includes('contradict') || descLower.includes('mismatch')) {
      state = 'contradicted';
      if (!gaps.some((g) => g.toLowerCase().includes('conflict') || g.toLowerCase().includes('contradict'))) {
        gaps.push('Conflicting Evidence: Discrepancy detected between multiple authorized project documents.');
      }
      isContinuationPriority = true;
      if (continuationTimeframe === 'None') {
        continuationTimeframe = 'Hour 8-16';
        continuationAction = `Clarify conflicting specifications across sources for: ${finding.title}`;
      }
    }

    // 6. Check for Unresolved External Dependencies
    if (finding.category === 'dependency') {
      if (statusLower.includes('unresolved') || statusLower.includes('blocked') || descLower.includes('no sla') || descLower.includes('ticket open')) {
        gaps.push('Unresolved External Dependency: Blocking dependency has no confirmed SLA or delivery date.');
        isContinuationPriority = true;
        if (continuationTimeframe === 'None') {
          continuationTimeframe = 'Hour 4-8';
          continuationAction = `Contact external vendor/team regarding blocker for: ${finding.title}`;
        }
      }
    }

    // 7. Check Inferred Findings
    if (finding.knowledgeState === 'inferred' || descLower.includes('inferred') || descLower.includes('informal') || descLower.includes('recommendation without formal')) {
      state = 'inferred';
      gaps.push('Inferred Context: Deduced from informal discussions or partial comments; lacks formal benchmark verification.');
    }

    // Evidence Validation Flag Evaluation (Separate from State!)
    if (!hasEvidence || finding.evidence.some((e) => !e.excerpt || e.excerpt.length < 20 || e.confidence === 'low')) {
      validation = 'unverified';
      gaps.push('Unverified Evidence: Finding lacks high-confidence source document excerpt or citation.');
    } else if (hasEvidence && finding.evidence.every((e) => e.excerpt && e.excerpt.length >= 20 && e.confidence !== 'low')) {
      // If evidence is corroborated and directly quoted from source documents
      validation = 'verified';
    }

    // Assign fallback continuation action if priority
    if (isContinuationPriority && !continuationAction) {
      continuationAction = `Review and resolve gap on: ${finding.title}`;
    }

    return {
      ...finding,
      knowledgeState: state,
      evidenceValidation: validation,
      detectedGaps: gaps,
      isContinuationPriority,
      continuationTimeframe,
      continuationAction,
    };
  });
}

/**
 * Computes statistical summary of knowledge gaps across a project
 */
export function computeGapStats(findings) {
  const stats = {
    total: findings.length,
    supported: 0,
    inferred: 0,
    contradicted: 0,
    missing: 0,
    verified: 0,
    unverified: 0,
    pendingReview: 0,
    accepted: 0,
    edited: 0,
    rejected: 0,
    criticalGapsCount: 0,
  };

  findings.forEach((f) => {
    if (stats[f.knowledgeState] !== undefined) stats[f.knowledgeState]++;
    if (stats[f.evidenceValidation] !== undefined) stats[f.evidenceValidation]++;
    if (stats[f.reviewStatus] !== undefined) stats[f.reviewStatus]++;
    if (f.detectedGaps && f.detectedGaps.length > 0) stats.criticalGapsCount += f.detectedGaps.length;
  });

  return stats;
}
