import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';
import { computeGapStats } from '../services/gapDetector.js';

const router = express.Router();

// List all projects with aggregated stats
router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects();
    const enriched = await Promise.all(
      projects.map(async (p) => {
        const docs = await db.getDocuments(p.id);
        const findings = await db.getFindings(p.id);
        const stats = computeGapStats(findings);
        const handover = await db.getHandover(p.id);
        return {
          ...p,
          documentCount: docs.length,
          findingCount: findings.length,
          stats,
          hasHandover: !!handover,
        };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const docs = await db.getDocuments(project.id);
    const findings = await db.getFindings(project.id);
    const stats = computeGapStats(findings);
    const handover = await db.getHandover(project.id);

    res.json({
      ...project,
      documentCount: docs.length,
      findingCount: findings.length,
      stats,
      hasHandover: !!handover,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, targetRole, departingPerson, incomingPerson } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const newProject = {
      id: uuidv4(),
      name: name.trim(),
      description: description ? description.trim() : '',
      targetRole: targetRole || 'Engineering Lead / Solutions Architect',
      departingPerson: departingPerson || '',
      incomingPerson: incomingPerson || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await db.createProject(newProject);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    await db.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project and associated resources deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
