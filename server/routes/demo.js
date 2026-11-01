import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';
import { extractDocumentText } from '../services/documentParser.js';
import { reconstructKnowledge } from '../services/aiService.js';
import { generateHandoverReport } from '../services/handoverGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_DATA_DIR = path.resolve(__dirname, '../sample_data');

const router = express.Router();

// List available pre-packaged sample documents
router.get('/sample-files', (req, res) => {
  try {
    if (!fs.existsSync(SAMPLE_DATA_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(SAMPLE_DATA_DIR).map((name) => {
      const fullPath = path.join(SAMPLE_DATA_DIR, name);
      const stats = fs.statSync(fullPath);
      const ext = path.extname(name).replace('.', '').toLowerCase();
      return {
        fileName: name,
        fileType: ext,
        fileSize: stats.size,
        downloadUrl: `/api/demo/download/${name}`,
      };
    });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download a raw sample document
router.get('/download/:fileName', (req, res) => {
  try {
    const safeName = path.basename(req.params.fileName);
    const filePath = path.join(SAMPLE_DATA_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Sample file not found' });
    }
    res.download(filePath, safeName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1-Click Load Complete Demo Project with Realistic Documents & Analysis
router.post('/load-sample', async (req, res) => {
  try {
    const { autoAnalyze = true, autoReview = false } = req.body;

    const projectId = uuidv4();
    const demoProject = {
      id: projectId,
      name: 'Project Nexus — Core Ledger & Payment Gateway Migration',
      description: 'Mission-critical payment gateway ledger modernization migrating legacy DynamoDB eventual-consistency persistence to PostgreSQL with TimescaleDB. Lead architect Elena Vance is departing.',
      targetRole: 'Staff Solutions Architect & Payment Engineering Lead',
      departingPerson: 'Elena Vance (Lead Solutions Architect)',
      incomingPerson: 'Alex Rivera (Incoming Principal Architect)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createProject(demoProject);

    // Ingest sample files
    const sampleFiles = [
      'ADR-042_Ledger_Architecture.pdf',
      'Release_Readiness_and_QA_Report.docx',
      'Sprint_44_Handover_Meeting_Notes.txt',
      'Team_RACI_and_Task_Status_Export.csv',
    ];

    const ingestedDocuments = [];

    for (const fileName of sampleFiles) {
      const srcPath = path.join(SAMPLE_DATA_DIR, fileName);
      if (fs.existsSync(srcPath)) {
        const stats = fs.statSync(srcPath);
        const ext = path.extname(fileName).toLowerCase().replace('.', '');
        const extraction = await extractDocumentText(srcPath, fileName, ext);

        const docRecord = {
          id: uuidv4(),
          projectId,
          fileName,
          fileType: ext,
          fileSize: stats.size,
          filePath: srcPath,
          uploadedAt: new Date().toISOString(),
          extractedText: extraction.extractedText,
          wordCount: extraction.wordCount,
          status: extraction.success ? 'extracted' : 'error',
          metadata: extraction.metadata,
        };

        const saved = await db.createDocument(docRecord);
        ingestedDocuments.push(saved);
      }
    }

    let findings = [];
    let handover = null;

    if (autoAnalyze && ingestedDocuments.length > 0) {
      const reconstruction = await reconstructKnowledge(projectId, ingestedDocuments, { forceDemo: true });
      findings = await db.createFindingsBatch(reconstruction.findings);

      if (autoReview) {
        // Auto-approve findings to demonstrate end-to-end handover generation immediately
        for (const f of findings) {
          await db.updateFinding(f.id, {
            reviewStatus: 'accepted',
            reviewedAt: new Date().toISOString(),
            reviewNote: 'Pre-verified for demo scenario evaluation',
          });
        }
        const updatedFindings = await db.getFindings(projectId);
        handover = generateHandoverReport(demoProject, updatedFindings, ingestedDocuments);
        await db.saveHandover(projectId, handover);
        await db.updateProject(projectId, { status: 'completed' });
      } else {
        await db.updateProject(projectId, { status: 'analyzing' });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Demo project loaded successfully with authorized synthetic documents and gap evidence matrix',
      project: demoProject,
      documentsCount: ingestedDocuments.length,
      findingsCount: findings.length,
      hasHandover: !!handover,
    });
  } catch (err) {
    console.error('[Demo Loader Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
