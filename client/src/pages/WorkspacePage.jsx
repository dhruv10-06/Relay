import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  FileDown,
  Printer,
  RotateCcw,
  Check,
  X,
  Edit3,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Clock,
  Sparkles,
  Zap,
  Trash2,
  Eye,
  Download,
  AlertOctagon,
} from 'lucide-react';
import { KnowledgeStateBadge, ValidationBadge, ReviewStatusBadge } from '../components/StateBadge';
import EvidenceModal from '../components/EvidenceModal';
import FindingEditModal from '../components/FindingEditModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import {
  getDocuments,
  uploadDocuments,
  deleteDocument,
  analyzeProject,
  resetReconstruction,
  getFindings,
  getFindingStats,
  reviewFinding,
  bulkApproveFindings,
  getHandover,
  generateHandover,
  getSampleFiles,
} from '../services/api';

export default function WorkspacePage({ project, onBackToDashboard }) {
  // Tabs: 'docs' | 'reconstruction' | 'gaps' | 'review' | 'handover'
  const [activeTab, setActiveTab] = useState('docs');

  // State
  const [documents, setDocuments] = useState([]);
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState(null);
  const [handover, setHandover] = useState(null);
  const [sampleFiles, setSampleFiles] = useState([]);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingHandover, setIsGeneratingHandover] = useState(false);
  const [analysisEngineInfo, setAnalysisEngineInfo] = useState(null);

  // Modals
  const [selectedFindingForEvidence, setSelectedFindingForEvidence] = useState(null);
  const [selectedFindingForEdit, setSelectedFindingForEdit] = useState(null);
  const [selectedDocForView, setSelectedDocForView] = useState(null);

  // Filters for Gaps tab
  const [stateFilter, setStateFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // File Upload input ref
  const fileInputRef = useRef(null);

  // Initial Load
  useEffect(() => {
    loadWorkspaceData();
    fetchSampleFiles();
  }, [project.id]);

  const loadWorkspaceData = async () => {
    setIsLoading(true);
    try {
      const [docs, findngs, st, hnd] = await Promise.all([
        getDocuments(project.id),
        getFindings(project.id),
        getFindingStats(project.id).catch(() => null),
        getHandover(project.id).catch(() => null),
      ]);
      setDocuments(docs);
      setFindings(findngs);
      setStats(st);
      setHandover(hnd);

      // Auto-switch to findings if docs exist and findings exist
      if (findngs.length > 0 && activeTab === 'docs') {
        setActiveTab('gaps');
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSampleFiles = async () => {
    try {
      const samples = await getSampleFiles();
      setSampleFiles(samples);
    } catch (err) {
      console.warn('Could not load sample files:', err);
    }
  };

  // Upload Handlers
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadDocuments(project.id, files);
      const updatedDocs = await getDocuments(project.id);
      setDocuments(updatedDocs);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm('Delete this source document?')) return;
    try {
      await deleteDocument(docId);
      const updatedDocs = await getDocuments(project.id);
      setDocuments(updatedDocs);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Analysis / Reconstruction Handler
  const handleRunReconstruction = async (forceDemo = false) => {
    if (documents.length === 0) {
      alert('Please upload at least one project document first.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeProject(project.id, forceDemo);
      setFindings(result.findings || []);
      setStats(result.stats || null);
      setAnalysisEngineInfo({
        engine: result.engine,
        model: result.model,
        isDemo: result.isDemo,
      });
      setActiveTab('gaps');
    } catch (err) {
      alert('Reconstruction failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all extracted findings and generated handovers for this project?')) return;
    try {
      await resetReconstruction(project.id);
      setFindings([]);
      setStats(null);
      setHandover(null);
      setActiveTab('docs');
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  // Review Actions
  const handleReviewAction = async (findingId, status, reviewNote = '') => {
    try {
      const updated = await reviewFinding(findingId, { status, reviewNote });
      setFindings((prev) => prev.map((f) => (f.id === findingId ? updated : f)));
      const newStats = await getFindingStats(project.id);
      setStats(newStats);
    } catch (err) {
      alert('Review action failed: ' + err.message);
    }
  };

  const handleSaveEdit = async (findingId, editPayload) => {
    try {
      const updated = await reviewFinding(findingId, editPayload);
      setFindings((prev) => prev.map((f) => (f.id === findingId ? updated : f)));
      const newStats = await getFindingStats(project.id);
      setStats(newStats);
      setSelectedFindingForEdit(null);
    } catch (err) {
      alert('Failed to save edit: ' + err.message);
    }
  };

  const handleBulkApprove = async () => {
    if (!confirm('Approve all pending findings that have verified evidence?')) return;
    try {
      await bulkApproveFindings(project.id);
      const updatedFindings = await getFindings(project.id);
      const newStats = await getFindingStats(project.id);
      setFindings(updatedFindings);
      setStats(newStats);
    } catch (err) {
      alert('Bulk approve failed: ' + err.message);
    }
  };

  // Handover Generation
  const handleGenerateHandover = async () => {
    setIsGeneratingHandover(true);
    try {
      const hnd = await generateHandover(project.id);
      setHandover(hnd);
      setActiveTab('handover');
    } catch (err) {
      alert('Handover generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsGeneratingHandover(false);
    }
  };

  // Filtered Findings
  const filteredFindings = findings.filter((f) => {
    if (stateFilter !== 'all' && f.knowledgeState !== stateFilter) return false;
    if (validationFilter !== 'all' && f.evidenceValidation !== validationFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      const matchOwner = (f.owner || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchOwner;
    }
    return true;
  });

  const approvedCount = findings.filter((f) => f.reviewStatus === 'accepted' || f.reviewStatus === 'edited').length;
  const pendingCount = findings.filter((f) => f.reviewStatus === 'pending').length;
  const reviewProgressPercent = findings.length > 0 ? Math.round((approvedCount / findings.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Workspace Header Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToDashboard}
                className="text-xs text-slate-400 hover:text-teal-300 font-mono flex items-center gap-1 transition"
              >
                ← Back to Dashboard
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-mono uppercase text-teal-400">{project.targetRole || 'Engineering Lead'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{project.name}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {project.description || 'Project knowledge reconstruction cockpit.'}
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            {findings.length > 0 && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 border border-slate-700 text-slate-300 transition flex items-center gap-1.5"
                title="Reset all reconstructed findings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={() => handleRunReconstruction(false)}
              disabled={isAnalyzing || documents.length === 0}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Knowledge...' : 'Run Reconstruction'}</span>
            </button>

            {findings.length > 0 && (
              <button
                onClick={handleGenerateHandover}
                disabled={isGeneratingHandover}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <FileCheck2 className={`w-3.5 h-3.5 ${isGeneratingHandover ? 'animate-spin' : ''}`} />
                <span>{isGeneratingHandover ? 'Compiling Handover...' : 'Generate Handover'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="font-bold text-slate-200 text-sm">{documents.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Documents</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="font-bold text-teal-300 text-sm">{findings.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Findings</div>
          </div>
          <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-900/40">
            <div className="font-bold text-rose-300 text-sm">{stats?.contradicted || 0}</div>
            <div className="text-[10px] text-rose-400/90 uppercase font-mono">Contradictions</div>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/40">
            <div className="font-bold text-purple-300 text-sm">{stats?.missing || 0}</div>
            <div className="text-[10px] text-purple-400/90 uppercase font-mono">Missing Gaps</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-900/40">
            <div className="font-bold text-amber-300 text-sm">{stats?.inferred || 0}</div>
            <div className="text-[10px] text-amber-400/90 uppercase font-mono">Inferred</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
            <div className="font-bold text-emerald-300 text-sm">
              {approvedCount}/{findings.length}
            </div>
            <div className="text-[10px] text-emerald-400/90 uppercase font-mono">Approved</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-1 no-scrollbar">
        {[
          { id: 'docs', label: `1. Source Documents (${documents.length})`, icon: FileText },
          { id: 'reconstruction', label: '2. AI Reconstruction', icon: Cpu },
          { id: 'gaps', label: `3. Gap & Evidence Matrix (${findings.length})`, icon: GitCompare },
          { id: 'review', label: `4. Human Review (${pendingCount} Pending)`, icon: CheckCircle2 },
          { id: 'handover', label: '5. Handover & 24H Plan', icon: FileCheck2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                isActive
                  ? 'border-teal-400 text-teal-300 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SOURCE DOCUMENTS & INGESTION */}
      {/* ========================================================================= */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700/80 hover:border-teal-500/60 transition text-center space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.docx,.txt,.md,.markdown,.csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-teal-400 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">
                Upload Authorized Project Documents
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Supports <strong>PDF, DOCX, TXT, Markdown, and CSV</strong>. Text is safely extracted and indexed with structural section anchors.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition active:scale-95 disabled:opacity-50"
            >
              {isUploading ? 'Extracting Text...' : 'Select Files to Upload'}
            </button>
          </div>

          {/* Sample Files Ready to Download/Test */}
          {sampleFiles.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Bundled Test Documents (Judge Evaluation Set)
                </span>
                <span className="text-[11px] text-teal-400 font-mono">Click to download and inspect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {sampleFiles.map((sf, idx) => (
                  <a
                    key={idx}
                    href={sf.downloadUrl}
                    download
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-700 text-slate-300 flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{sf.fileName}</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ingested Sources ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-400 text-xs">
                No documents uploaded yet. Upload files above or use the "Load Sample Scenario" button in the navbar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 transition"
                  >
                    <div className="flex items-start gap-3 truncate">
                      <div className="p-2 rounded-lg bg-slate-800 text-teal-400 shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{doc.fileName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="uppercase text-teal-300">{doc.fileType}</span>
                          <span>•</span>
                          <span>{doc.wordCount?.toLocaleString() || 0} words</span>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Extracted & Ready for Analysis
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedDocForView(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                        title="Preview Extracted Text"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI KNOWLEDGE RECONSTRUCTION */}
      {/* ========================================================================= */}
      {activeTab === 'reconstruction' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-teal-400 font-semibold">
                  Step 3 & 4: Structured Extraction Engine
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  AI-Powered Knowledge Reconstruction & Evidence Linking
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Extracts architectural decisions, tasks, owners, deadlines, dependencies, risks, and rationale using strict Zod schema validation. Every finding is linked to verifiable source citations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunReconstruction(true)}
                  disabled={isAnalyzing || documents.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Force Deterministic Demo Engine"
                >
                  Run Demo Engine
                </button>
                <button
                  onClick={() => handleRunReconstruction(false)}
                  disabled={isAnalyzing || documents.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Cpu className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing Sources...' : 'Run Live Reconstruction'}</span>
                </button>
              </div>
            </div>

            {/* Engine Status Banner */}
            {analysisEngineInfo && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="text-slate-300">
                    Active Engine: <strong>{analysisEngineInfo.engine}</strong> (Model: {analysisEngineInfo.model})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-teal-300">
                  {analysisEngineInfo.isDemo ? 'Offline Deterministic Mode' : 'Live Cloud LLM Mode'}
                </span>
              </div>
            )}
          </div>

          {/* Reconstruction Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Decisions & Rationale',
                count: findings.filter((f) => f.category === 'decision').length,
                desc: 'Architectural choices, technical trade-offs, and recorded justifications.',
              },
              {
                title: 'Tasks & Responsibilities',
                count: findings.filter((f) => ['task', 'responsibility'].includes(f.category)).length,
                desc: 'Action items, assigned owners, and committed delivery milestones.',
              },
              {
                title: 'Dependencies & Blockers',
                count: findings.filter((f) => f.category === 'dependency').length,
                desc: 'Cross-team deliverables, 3rd party APIs, and pending SLAs.',
              },
              {
                title: 'Risks & Unresolved Questions',
                count: findings.filter((f) => ['risk', 'question'].includes(f.category)).length,
                desc: 'Compliance deadlines, security vulnerabilities, and open inquiries.',
              },
              {
                title: 'Contradicted Statements',
                count: findings.filter((f) => f.knowledgeState === 'contradicted').length,
                desc: 'Active discrepancies detected between multiple project documents.',
              },
              {
                title: 'Missing Gaps',
                count: findings.filter((f) => f.knowledgeState === 'missing').length,
                desc: 'Tasks lacking owners, missing deadlines, or decisions lacking rationale.',
              },
            ].map((cat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300">{cat.title}</h4>
                  <span className="text-sm font-bold text-teal-400 font-mono">{cat.count}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>

          {findings.length > 0 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setActiveTab('gaps')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition inline-flex items-center gap-1.5"
              >
                <span>Inspect Gap & Evidence Matrix ({findings.length} findings)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KNOWLEDGE GAP & EVIDENCE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Primary State Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All (${findings.length})` },
                  { id: 'contradicted', label: `Contradicted (${stats?.contradicted || 0})`, color: 'text-rose-400' },
                  { id: 'missing', label: `Missing (${stats?.missing || 0})`, color: 'text-purple-400' },
                  { id: 'inferred', label: `Inferred (${stats?.inferred || 0})`, color: 'text-amber-400' },
                  { id: 'supported', label: `Supported (${stats?.supported || 0})`, color: 'text-emerald-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStateFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      stateFilter === item.id
                        ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700 shadow-sm'
                        : `text-slate-400 hover:text-slate-200 hover:bg-slate-950 ${item.color || ''}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Validation Filter & Search */}
              <div className="flex items-center gap-2">
                <select
                  value={validationFilter}
                  onChange={(e) => setValidationFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">Validation: All</option>
                  <option value="verified">Verified Evidence</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Findings Matrix Cards */}
          {filteredFindings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
              <p>No findings match the selected filters.</p>
              {findings.length === 0 && (
                <button
                  onClick={() => handleRunReconstruction(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950"
                >
                  Run Reconstruction Now
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-5 rounded-2xl bg-slate-900/90 border transition space-y-4 shadow-lg ${
                    finding.knowledgeState === 'contradicted'
                      ? 'border-rose-900/60 bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900'
                      : finding.knowledgeState === 'missing'
                      ? 'border-purple-900/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {finding.category}
                      </span>
                      <KnowledgeStateBadge state={finding.knowledgeState} />
                      <ValidationBadge validation={finding.evidenceValidation} />
                      <ReviewStatusBadge status={finding.reviewStatus} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFindingForEvidence(finding)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Evidence ({finding.evidence?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => setSelectedFindingForEdit(finding)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit / Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">{finding.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
                  </div>

                  {/* Rationale if present */}
                  {finding.rationale && (
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                      <span className="font-semibold text-teal-300">Documented Rationale: </span>
                      <span className="text-slate-300">{finding.rationale}</span>
                    </div>
                  )}

                  {/* Detected Gaps Callout */}
                  {finding.detectedGaps && finding.detectedGaps.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        <span>Identified Knowledge Gaps:</span>
                      </div>
                      <ul className="pl-4 list-disc text-rose-200/90 text-[11px] space-y-0.5">
                        {finding.detectedGaps.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-4">
                      <span>Owner: <strong className={finding.owner?.toLowerCase() === 'unassigned' || !finding.owner ? 'text-purple-400' : 'text-slate-200'}>{finding.owner || 'Unassigned'}</strong></span>
                      <span>Deadline: <strong className={finding.deadline?.toLowerCase() === 'missing' || !finding.deadline ? 'text-purple-400' : 'text-slate-200'}>{finding.deadline || 'Missing'}</strong></span>
                      <span>Status: <strong className="text-slate-200">{finding.status}</strong></span>
                    </div>

                    {finding.continuationTimeframe && finding.continuationTimeframe !== 'None' && (
                      <span className="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/80 font-mono text-[10px]">
                        24H Continuation Priority: {finding.continuationTimeframe}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HUMAN REVIEW & VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Review Header Banner */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-teal-400 font-semibold">Step 6: Human In The Loop</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">Verification & Approval Queue</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Do not automatically treat unreviewed AI output as approved truth. Inspect findings, corroborate evidence, and approve or edit items before handover generation.
                </p>
              </div>

              <button
                onClick={handleBulkApprove}
                disabled={findings.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                Approve All Verified Findings
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Verification Progress: {approvedCount} of {findings.length} findings confirmed</span>
                <span className="font-mono text-teal-300 font-bold">{reviewProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${reviewProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-3">
            {findings.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <KnowledgeStateBadge state={f.knowledgeState} />
                    <ReviewStatusBadge status={f.reviewStatus} />
                    <span className="text-xs font-mono text-slate-400">({f.category})</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{f.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{f.description}</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedFindingForEvidence(f)}
                    className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 transition"
                    title="Inspect Evidence"
                  >
                    Evidence
                  </button>
                  <button
                    onClick={() => setSelectedFindingForEdit(f)}
                    className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    title="Edit Details"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleReviewAction(f.id, 'accepted', 'Approved by lead')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReviewAction(f.id, 'rejected', 'Rejected by lead')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-800 hover:bg-rose-700 text-rose-100 transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HANDOVER REPORT & CONTINUATION PLAN */}
      {/* ========================================================================= */}
      {activeTab === 'handover' && (
        <div className="space-y-6 handover-print-container">
          {/* Generation & Export Actions */}
          <div className="no-print p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-teal-400 font-semibold">Step 7: Handover Package</span>
              <h3 className="text-lg font-bold text-slate-100 mt-1">
                Verified Handover & First 24 Hours Continuation Plan
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Only approved findings are represented as confirmed project truth. Export as Markdown or PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateHandover}
                disabled={isGeneratingHandover}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingHandover ? 'Compiling...' : 'Re-compile Handover'}
              </button>

              <a
                href={`/api/handover/export/markdown?projectId=${project.id}`}
                download
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <FileDown className="w-4 h-4 text-teal-400" />
                <span>Export Markdown</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          {!handover ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">Handover has not been compiled yet.</p>
              <button
                onClick={handleGenerateHandover}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-slate-950"
              >
                Compile Handover Now
              </button>
            </div>
          ) : (
            <div className="space-y-8 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-2xl">
              {/* Report Header */}
              <div className="border-b border-slate-800 pb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-widest font-semibold">
                    RELAY Official Handover Document
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(handover.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-100">{handover.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Departing Lead: <strong className="text-slate-200">{project.departingPerson || 'Elena Vance'}</strong></span>
                  <span>•</span>
                  <span>Incoming Lead: <strong className="text-slate-200">{project.incomingPerson || 'Alex Rivera'}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{handover.approvedFindingsCount} Approved Findings</span>
                </div>
              </div>

              {/* Status Verdict & Overview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transition Status & Executive Verdict
                </h4>
                <div className="text-xs font-bold text-rose-400 font-mono">
                  {handover.projectStatusSummary}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{handover.overview}</p>
              </div>

              {/* FIRST 24 HOURS CONTINUATION PLAN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    ⚡ First 24 Hours Continuation Plan
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Time-phased operational checklist designed to ensure zero downtime and prevent critical knowledge gaps from causing release failures.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Timeframe</th>
                        <th className="py-3 px-4">Action Item</th>
                        <th className="py-3 px-4">Responsible Target</th>
                        <th className="py-3 px-4">Urgency</th>
                        <th className="py-3 px-4">Critical Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
                      {handover.first24HoursPlan?.map((plan, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-teal-300 whitespace-nowrap">
                            {plan.timeframe}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-100">{plan.action}</td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                            {plan.targetPersonOrSystem}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-900">
                              {plan.urgency || 'HIGH'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                            {plan.criticalContext}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Raw Markdown Preview */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Handover Package (Markdown View)
                </h4>
                <pre className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[60vh]">
                  {handover.exportMarkdown}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedFindingForEvidence && (
        <EvidenceModal
          finding={selectedFindingForEvidence}
          onClose={() => setSelectedFindingForEvidence(null)}
        />
      )}

      {selectedFindingForEdit && (
        <FindingEditModal
          finding={selectedFindingForEdit}
          onSave={handleSaveEdit}
          onClose={() => setSelectedFindingForEdit(null)}
        />
      )}

      {selectedDocForView && (
        <DocumentViewerModal
          document={selectedDocForView}
          onClose={() => setSelectedDocForView(null)}
        />
      )}
    </div>
  );
}
