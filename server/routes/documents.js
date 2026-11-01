import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';
import { extractDocumentText } from '../services/documentParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// File filter to validate supported document types
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.txt', '.md', '.markdown', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type '${ext}'. Please upload PDF, DOCX, TXT, MD, or CSV.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const router = express.Router();

// List documents for a project
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });
    const docs = await db.getDocuments(projectId);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload document(s) for a project
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await db.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const processedDocuments = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      
      // Extract readable text and metadata
      const extraction = await extractDocumentText(file.path, file.originalname, ext);

      const docRecord = {
        id: uuidv4(),
        projectId,
        fileName: file.originalname,
        fileType: ext,
        fileSize: file.size,
        filePath: file.path,
        uploadedAt: new Date().toISOString(),
        extractedText: extraction.extractedText,
        wordCount: extraction.wordCount,
        status: extraction.success ? 'extracted' : 'error',
        metadata: extraction.metadata,
      };

      const saved = await db.createDocument(docRecord);
      processedDocuments.push(saved);
    }

    res.status(201).json({
      message: `Successfully uploaded and extracted ${processedDocuments.length} document(s)`,
      documents: processedDocuments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const doc = await db.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Clean up file if present
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (e) {
        console.warn('Could not delete physical file:', e.message);
      }
    }

    await db.deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
