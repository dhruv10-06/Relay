import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase, db } from './models/db.js';
import projectsRouter from './routes/projects.js';
import documentsRouter from './routes/documents.js';
import reconstructionRouter from './routes/reconstruction.js';
import findingsRouter from './routes/findings.js';
import handoverRouter from './routes/handover.js';
import demoRouter from './routes/demo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health & System Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'RELAY',
    version: '2.0.0-round2',
    timestamp: new Date().toISOString(),
    storageEngine: db.getStorageMode(),
    aiMode: process.env.OPENAI_API_KEY ? 'Live LLM API Enabled' : 'Deterministic Demo Mode Ready',
  });
});

// Mount API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/reconstruction', reconstructionRouter);
app.use('/api/findings', findingsRouter);
app.use('/api/handover', handoverRouter);
app.use('/api/demo', demoRouter);

// Serve static frontend build if it exists (for unified production deployment)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server after Database Initialization
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 RELAY Server is listening on http://localhost:${PORT}`);
    console.log(`📦 Storage Engine: ${db.getStorageMode()}`);
    console.log(`🤖 AI Configuration: ${process.env.OPENAI_API_KEY ? 'OpenAI Live' : 'Deterministic Demo Mode'}`);
    console.log(`====================================================`);
  });
}

startServer();
