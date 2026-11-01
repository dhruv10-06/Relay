import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectSchema, DocumentSchema, FindingSchema, HandoverSchema } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure local data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Local JSON Storage State
let localDb = {
  projects: [],
  documents: [],
  findings: [],
  handovers: [],
};

// Load existing local JSON DB if present
if (fs.existsSync(JSON_DB_FILE)) {
  try {
    const raw = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    localDb = { ...localDb, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('[DB] Failed to parse existing local db.json, initializing fresh store:', err.message);
  }
}

function persistLocalDb() {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist local JSON db:', err.message);
  }
}

let isMongoConnected = false;
let ProjectModel, DocumentModel, FindingModel, HandoverModel;

export async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI provided in environment. Running in persistent local JSON storage mode.');
    return { mode: 'json' };
  }

  try {
    console.log('[DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isMongoConnected = true;
    ProjectModel = mongoose.model('Project', ProjectSchema);
    DocumentModel = mongoose.model('Document', DocumentSchema);
    FindingModel = mongoose.model('Finding', FindingSchema);
    HandoverModel = mongoose.model('Handover', HandoverSchema);
    console.log('[DB] Successfully connected to MongoDB Atlas!');
    return { mode: 'mongodb' };
  } catch (err) {
    console.warn(`[DB] Could not connect to MongoDB (${err.message}). Seamlessly falling back to persistent local JSON storage.`);
    isMongoConnected = false;
    return { mode: 'json_fallback', error: err.message };
  }
}

export const db = {
  getStorageMode() {
    return isMongoConnected ? 'MongoDB Atlas' : 'Local Persistent Storage (JSON)';
  },

  // Projects
  async getProjects() {
    if (isMongoConnected) {
      return await ProjectModel.find().sort({ updatedAt: -1 }).lean();
    }
    return [...localDb.projects].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },

  async getProject(id) {
    if (isMongoConnected) {
      return await ProjectModel.findOne({ id }).lean();
    }
    return localDb.projects.find((p) => p.id === id) || null;
  },

  async createProject(project) {
    project.createdAt = project.createdAt || new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      const created = await ProjectModel.create(project);
      return created.toObject();
    }
    localDb.projects.push(project);
    persistLocalDb();
    return project;
  },

  async updateProject(id, updates) {
    updates.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      return await ProjectModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    }
    const idx = localDb.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localDb.projects[idx] = { ...localDb.projects[idx], ...updates };
      persistLocalDb();
      return localDb.projects[idx];
    }
    return null;
  },

  async deleteProject(id) {
    if (isMongoConnected) {
      await ProjectModel.deleteOne({ id });
      await DocumentModel.deleteMany({ projectId: id });
      await FindingModel.deleteMany({ projectId: id });
      await HandoverModel.deleteOne({ projectId: id });
      return true;
    }
    localDb.projects = localDb.projects.filter((p) => p.id !== id);
    localDb.documents = localDb.documents.filter((d) => d.projectId !== id);
    localDb.findings = localDb.findings.filter((f) => f.projectId !== id);
    localDb.handovers = localDb.handovers.filter((h) => h.projectId !== id);
    persistLocalDb();
    return true;
  },

  // Documents
  async getDocuments(projectId) {
    if (isMongoConnected) {
      return await DocumentModel.find({ projectId }).sort({ uploadedAt: -1 }).lean();
    }
    return localDb.documents.filter((d) => d.projectId === projectId);
  },

  async getDocument(id) {
    if (isMongoConnected) {
      return await DocumentModel.findOne({ id }).lean();
    }
    return localDb.documents.find((d) => d.id === id) || null;
  },

  async createDocument(doc) {
    doc.uploadedAt = doc.uploadedAt || new Date().toISOString();
    if (isMongoConnected) {
      const created = await DocumentModel.create(doc);
      return created.toObject();
    }
    localDb.documents.push(doc);
    persistLocalDb();
    return doc;
  },

  async updateDocument(id, updates) {
    if (isMongoConnected) {
      return await DocumentModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    }
    const idx = localDb.documents.findIndex((d) => d.id === id);
    if (idx !== -1) {
      localDb.documents[idx] = { ...localDb.documents[idx], ...updates };
      persistLocalDb();
      return localDb.documents[idx];
    }
    return null;
  },

  async deleteDocument(id) {
    if (isMongoConnected) {
      await DocumentModel.deleteOne({ id });
      return true;
    }
    localDb.documents = localDb.documents.filter((d) => d.id !== id);
    persistLocalDb();
    return true;
  },

  // Findings
  async getFindings(projectId) {
    if (isMongoConnected) {
      return await FindingModel.find({ projectId }).sort({ createdAt: 1 }).lean();
    }
    return localDb.findings.filter((f) => f.projectId === projectId);
  },

  async getFinding(id) {
    if (isMongoConnected) {
      return await FindingModel.findOne({ id }).lean();
    }
    return localDb.findings.find((f) => f.id === id) || null;
  },

  async createFinding(finding) {
    finding.createdAt = finding.createdAt || new Date().toISOString();
    finding.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      const created = await FindingModel.create(finding);
      return created.toObject();
    }
    localDb.findings.push(finding);
    persistLocalDb();
    return finding;
  },

  async createFindingsBatch(findings) {
    const timestamp = new Date().toISOString();
    findings.forEach((f) => {
      f.createdAt = f.createdAt || timestamp;
      f.updatedAt = timestamp;
    });
    if (isMongoConnected) {
      const created = await FindingModel.insertMany(findings);
      return created.map((c) => c.toObject());
    }
    localDb.findings.push(...findings);
    persistLocalDb();
    return findings;
  },

  async updateFinding(id, updates) {
    updates.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      return await FindingModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    }
    const idx = localDb.findings.findIndex((f) => f.id === id);
    if (idx !== -1) {
      localDb.findings[idx] = { ...localDb.findings[idx], ...updates };
      persistLocalDb();
      return localDb.findings[idx];
    }
    return null;
  },

  async deleteFindingsByProject(projectId) {
    if (isMongoConnected) {
      await FindingModel.deleteMany({ projectId });
      return true;
    }
    localDb.findings = localDb.findings.filter((f) => f.projectId !== projectId);
    persistLocalDb();
    return true;
  },

  // Handover
  async getHandover(projectId) {
    if (isMongoConnected) {
      return await HandoverModel.findOne({ projectId }).lean();
    }
    return localDb.handovers.find((h) => h.projectId === projectId) || null;
  },

  async saveHandover(projectId, handoverData) {
    handoverData.projectId = projectId;
    handoverData.updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      return await HandoverModel.findOneAndUpdate(
        { projectId },
        handoverData,
        { upsert: true, new: true }
      ).lean();
    }
    const idx = localDb.handovers.findIndex((h) => h.projectId === projectId);
    if (idx !== -1) {
      localDb.handovers[idx] = { ...localDb.handovers[idx], ...handoverData };
    } else {
      localDb.handovers.push(handoverData);
    }
    persistLocalDb();
    return handoverData;
  },

  // Reset or clear project findings/handovers for re-analysis
  async resetProjectKnowledge(projectId) {
    if (isMongoConnected) {
      await FindingModel.deleteMany({ projectId });
      await HandoverModel.deleteOne({ projectId });
      return true;
    }
    localDb.findings = localDb.findings.filter((f) => f.projectId !== projectId);
    localDb.handovers = localDb.handovers.filter((h) => h.projectId !== projectId);
    persistLocalDb();
    return true;
  },
};
