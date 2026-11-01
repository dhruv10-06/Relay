import express from 'express';
import { db } from '../models/db.js';
import { reconstructKnowledge } from '../services/aiService.js';
import { computeGapStats } from '../services/gapDetector.js';

const router = express.Router();

// Trigger Knowledge Reconstruction
router.post('/analyze', async (req, res) => {
  try {
    const { projectId, forceDemo } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await db.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const documents = await db.getDocuments(projectId);
    if (documents.length === 0) {
      return res.status(400).json({
        error: 'No documents uploaded for this project. Please upload project documents first.',
      });
    }

    // Clear previous findings if re-analyzing
    await db.deleteFindingsByProject(projectId);

    // Run AI or Deterministic Reconstruction
    const result = await reconstructKnowledge(projectId, documents, { forceDemo });
    
    // Persist extracted findings
    const savedFindings = await db.createFindingsBatch(result.findings);
    const stats = computeGapStats(savedFindings);

    // Update project state
    await db.updateProject(projectId, { status: 'analyzing' });

    res.json({
      success: true,
      engine: result.engine,
      model: result.model,
      isDemo: result.isDemo,
      findingsCount: savedFindings.length,
      stats,
      findings: savedFindings,
    });
  } catch (err) {
    console.error('[Reconstruction Route Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reset reconstructed knowledge
router.post('/reset', async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    await db.resetProjectKnowledge(projectId);
    await db.updateProject(projectId, { status: 'draft' });

    res.json({ success: true, message: 'Project knowledge reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
