import express from 'express';
import { db } from '../models/db.js';
import { computeGapStats } from '../services/gapDetector.js';

const router = express.Router();

// Get findings for a project with optional filters
router.get('/', async (req, res) => {
  try {
    const { projectId, state, validation, category, reviewStatus } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    let findings = await db.getFindings(projectId);

    if (state) {
      findings = findings.filter((f) => f.knowledgeState === state);
    }
    if (validation) {
      findings = findings.filter((f) => f.evidenceValidation === validation);
    }
    if (category) {
      findings = findings.filter((f) => f.category === category);
    }
    if (reviewStatus) {
      findings = findings.filter((f) => f.reviewStatus === reviewStatus);
    }

    res.json(findings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get gap and review statistics for a project
router.get('/stats', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const findings = await db.getFindings(projectId);
    const stats = computeGapStats(findings);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Review a finding (Accept, Edit, Reject)
router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote, edits } = req.body;

    if (!['accepted', 'edited', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'accepted', 'edited', 'rejected', or 'pending'." });
    }

    const finding = await db.getFinding(id);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });

    const updates = {
      reviewStatus: status,
      reviewNote: reviewNote !== undefined ? reviewNote : finding.reviewNote,
      reviewedAt: new Date().toISOString(),
    };

    // If human edited the finding
    if (edits && typeof edits === 'object') {
      if (edits.title) updates.title = edits.title;
      if (edits.description) updates.description = edits.description;
      if (edits.owner !== undefined) updates.owner = edits.owner;
      if (edits.deadline !== undefined) updates.deadline = edits.deadline;
      if (edits.rationale !== undefined) updates.rationale = edits.rationale;
      if (edits.status) updates.status = edits.status;
      if (edits.knowledgeState) updates.knowledgeState = edits.knowledgeState;
      if (edits.evidenceValidation) updates.evidenceValidation = edits.evidenceValidation;
      if (edits.continuationTimeframe) updates.continuationTimeframe = edits.continuationTimeframe;
      if (edits.continuationAction) updates.continuationAction = edits.continuationAction;
    }

    const updated = await db.updateFinding(id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk approve/accept all pending findings for a project
router.post('/bulk-approve', async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const findings = await db.getFindings(projectId);
    const updatedFindings = [];

    for (const f of findings) {
      if (f.reviewStatus === 'pending') {
        const updated = await db.updateFinding(f.id, {
          reviewStatus: 'accepted',
          reviewedAt: new Date().toISOString(),
          reviewNote: 'Approved in bulk review',
        });
        updatedFindings.push(updated);
      }
    }

    res.json({
      message: `Approved ${updatedFindings.length} findings`,
      count: updatedFindings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
