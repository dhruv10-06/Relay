import React, { useState } from 'react';
import {
  FolderPlus,
  Zap,
  ArrowRight,
  Trash2,
  FileText,
  AlertTriangle,
  GitCompare,
  CheckCircle2,
  Layers,
  Search,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage({
  projects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLoadSample,
  isSampleLoading,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetRole: 'Staff Solutions Architect / Engineering Lead',
    departingPerson: '',
    incomingPerson: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await onCreateProject(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      targetRole: 'Staff Solutions Architect / Engineering Lead',
      departingPerson: '',
      incomingPerson: '',
    });
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Project Handover Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reconstruct project memory, identify evidence gaps, and verify handovers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLoadSample}
            disabled={isSampleLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-teal-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 fill-current ${isSampleLoading ? 'animate-spin' : ''}`} />
            <span>{isSampleLoading ? 'Loading Sample...' : 'Load Sample Project'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
          >
            <FolderPlus className="w-4 h-4 text-teal-400" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredProjects.length} of {projects.length} project(s)
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No Projects Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Get started by creating a new project or loading the comprehensive <strong>Project Nexus</strong> sample scenario.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onLoadSample}
              disabled={isSampleLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
            >
              Load Sample Scenario
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Create Blank Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const stats = p.stats || {};
            return (
              <div
                key={p.id}
                className="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition hover:shadow-xl hover:shadow-slate-950/50"
              >
                <div className="space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        p.hasHandover
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                          : p.findingCount > 0
                          ? 'bg-teal-950/70 text-teal-300 border-teal-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {p.hasHandover ? 'Handover Generated' : p.findingCount > 0 ? 'Knowledge Reconstructed' : 'Ingestion Pending'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${p.name}"?`)) onDeleteProject(p.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3
                      onClick={() => onSelectProject(p.id)}
                      className="text-base font-bold text-slate-100 group-hover:text-teal-300 cursor-pointer transition leading-snug line-clamp-1"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description || 'No project description provided.'}
                    </p>
                  </div>

                  {/* Departing & Incoming Leads */}
                  {(p.departingPerson || p.incomingPerson) && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-[11px]">
                      {p.departingPerson && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>Departing: <strong className="text-slate-300">{p.departingPerson}</strong></span>
                        </div>
                      )}
                      {p.incomingPerson && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>Incoming: <strong className="text-slate-300">{p.incomingPerson}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-4 gap-1.5 py-2 border-y border-slate-800 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-950/40">
                      <div className="text-xs font-bold text-slate-200">{p.documentCount || 0}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Sources</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950/40">
                      <div className="text-xs font-bold text-teal-300">{p.findingCount || 0}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Findings</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
                      <div className="text-xs font-bold text-rose-400">{stats.contradicted || 0}</div>
                      <div className="text-[10px] text-rose-300/80 font-mono">Conflicts</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-purple-950/20 border border-purple-900/30">
                      <div className="text-xs font-bold text-purple-300">{stats.missing || 0}</div>
                      <div className="text-[10px] text-purple-300/80 font-mono">Missing</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={() => onSelectProject(p.id)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-slate-200 transition flex items-center justify-center gap-1.5 group-hover:border-teal-500/50"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Create New Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-medium text-slate-200 mb-1">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Core Banking Gateway Migration"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-200 mb-1">Project Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief context regarding the engineering scope, tech stack, and transition goals..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-200 mb-1">Departing Lead</label>
                  <input
                    type="text"
                    name="departingPerson"
                    value={formData.departingPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. Elena Vance"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-200 mb-1">Incoming Lead</label>
                  <input
                    type="text"
                    name="incomingPerson"
                    value={formData.incomingPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-200 mb-1">Target Engineering Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  placeholder="e.g. Staff Solutions Architect"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
