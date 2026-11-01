import mongoose from 'mongoose';

export const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  targetRole: { type: String, default: 'Engineering Lead / Solutions Architect' },
  departingPerson: { type: String, default: '' },
  incomingPerson: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'analyzing', 'reviewed', 'completed'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
  extractedText: { type: String, default: '' },
  wordCount: { type: Number, default: 0 },
  status: { type: String, enum: ['uploaded', 'extracted', 'error'], default: 'uploaded' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

export const FindingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['decision', 'task', 'responsibility', 'deadline', 'dependency', 'risk', 'question', 'context'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  rationale: { type: String, default: '' },
  owner: { type: String, default: '' },
  deadline: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  
  // The 4 Primary Knowledge States specified in RELAY Round 2
  knowledgeState: {
    type: String,
    enum: ['supported', 'inferred', 'contradicted', 'missing'],
    required: true,
    default: 'supported',
  },
  
  // Evidence validation flag (NOT a 5th state!)
  evidenceValidation: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'unverified',
  },
  
  // Evidence references with source document, excerpt, location, and confidence
  evidence: [
    {
      sourceDocName: { type: String, required: true },
      sourceDocId: { type: String, default: '' },
      excerpt: { type: String, required: true },
      pageOrLocation: { type: String, default: 'Section 1' },
      confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
      contradictionNote: { type: String, default: '' },
    },
  ],
  
  // Human Review Workflow
  reviewStatus: {
    type: String,
    enum: ['pending', 'accepted', 'edited', 'rejected'],
    default: 'pending',
  },
  reviewNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: String, default: '' },
  
  // Continuation plan priority
  isContinuationPriority: { type: Boolean, default: false },
  continuationTimeframe: {
    type: String,
    enum: ['Hour 0-4', 'Hour 4-8', 'Hour 8-16', 'Hour 16-24', 'Week 1', 'None'],
    default: 'None',
  },
  continuationAction: { type: String, default: '' },
  
  // Detected gaps description
  detectedGaps: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const HandoverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true, unique: true },
  generatedAt: { type: Date, default: Date.now },
  title: { type: String, required: true },
  overview: { type: String, default: '' },
  projectStatusSummary: { type: String, default: '' },
  first24HoursPlan: [
    {
      timeframe: { type: String, required: true },
      action: { type: String, required: true },
      targetPersonOrSystem: { type: String, default: '' },
      criticalContext: { type: String, default: '' },
      findingId: { type: String },
    },
  ],
  approvedFindingsCount: { type: Number, default: 0 },
  exportMarkdown: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});
