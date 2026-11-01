import express from 'express';
import { db } from '../models/db.js';
import { generateHandoverReport } from '../services/handoverGenerator.js';

const router = express.Router();

// Get generated handover for a project
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const handover = await db.getHandover(projectId);
    if (!handover) return res.status(404).json({ error: 'Handover report not yet generated' });

    res.json(handover);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate or re-generate handover
router.post('/generate', async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await db.getProject(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const documents = await db.getDocuments(projectId);
    const findings = await db.getFindings(projectId);

    if (findings.length === 0) {
      return res.status(400).json({
        error: 'No findings available. Please run knowledge reconstruction first.',
      });
    }

    const handover = generateHandoverReport(project, findings, documents);
    const saved = await db.saveHandover(projectId, handover);

    // Update project status to completed
    await db.updateProject(projectId, { status: 'completed' });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export as raw Markdown file download
router.get('/export/markdown', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await db.getProject(projectId);
    const handover = await db.getHandover(projectId);

    if (!handover || !handover.exportMarkdown) {
      return res.status(404).json({ error: 'Handover report not found. Please generate it first.' });
    }

    const safeTitle = (project ? project.name : 'relay-handover')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_handover_package.md"`);
    res.send(handover.exportMarkdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
