import React, { useState } from 'react';
import { X, Check, Save, AlertCircle } from 'lucide-react';

export default function FindingEditModal({ finding, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: finding?.title || '',
    description: finding?.description || '',
    rationale: finding?.rationale || '',
    owner: finding?.owner || '',
    deadline: finding?.deadline || '',
    status: finding?.status || 'pending',
    knowledgeState: finding?.knowledgeState || 'supported',
    evidenceValidation: finding?.evidenceValidation || 'unverified',
    continuationTimeframe: finding?.continuationTimeframe || 'None',
    continuationAction: finding?.continuationAction || '',
    reviewNote: finding?.reviewNote || '',
  });

  const [reviewAction, setReviewAction] = useState('accepted');

  if (!finding) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(finding.id, {
      status: reviewAction,
      reviewNote: formData.reviewNote || 'Reviewed and modified by human operator',
      edits: {
        title: formData.title,
        description: formData.description,
        rationale: formData.rationale,
        owner: formData.owner,
        deadline: formData.deadline,
        status: formData.status,
        knowledgeState: formData.knowledgeState,
        evidenceValidation: formData.evidenceValidation,
        continuationTimeframe: formData.continuationTimeframe,
        continuationAction: formData.continuationAction,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div>
            <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Human Verification Interface</span>
            <h3 className="text-lg font-semibold text-slate-100">Review & Edit Finding</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Finding Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {finding.category === 'decision' && (
            <div>
              <label className="block font-medium text-slate-300 mb-1">Architectural Rationale</label>
              <textarea
                name="rationale"
                rows={2}
                value={formData.rationale}
                onChange={handleChange}
                placeholder="Explain technical or business reasons for this decision..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Designated Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="e.g. Elena Vance, Devon Patel, Unassigned"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Deadline / Milestone</label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                placeholder="e.g. 2026-10-24, Sprint 43, Missing"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Primary Knowledge State</label>
              <select
                name="knowledgeState"
                value={formData.knowledgeState}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="supported">Supported (Direct Evidence)</option>
                <option value="inferred">Inferred (Reasonable Deduction)</option>
                <option value="contradicted">Contradicted (Conflicting Evidence)</option>
                <option value="missing">Missing (Information Absent)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Evidence Validation Flag</label>
              <select
                name="evidenceValidation"
                value={formData.evidenceValidation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="verified">Verified Evidence</option>
                <option value="unverified">Unverified (Requires Follow-up)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Continuation Plan Timeframe</label>
              <select
                name="continuationTimeframe"
                value={formData.continuationTimeframe}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              >
                <option value="None">None (Standard Reference)</option>
                <option value="Hour 0-4">Hour 0-4 (Immediate Triage)</option>
                <option value="Hour 4-8">Hour 4-8 (QA & Vendor Escalation)</option>
                <option value="Hour 8-16">Hour 8-16 (Conflict Resolution)</option>
                <option value="Hour 16-24">Hour 16-24 (Executive Briefing)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Continuation Action Item</label>
              <input
                type="text"
                name="continuationAction"
                value={formData.continuationAction}
                onChange={handleChange}
                placeholder="Actionable instruction for incoming lead..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Reviewer Note / Verification Log</label>
            <input
              type="text"
              name="reviewNote"
              value={formData.reviewNote}
              onChange={handleChange}
              placeholder="e.g. Verified with architecture Slack channel; adjusted owner to Devon"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action Choice */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="reviewAction"
                  value="accepted"
                  checked={reviewAction === 'accepted'}
                  onChange={() => setReviewAction('accepted')}
                  className="text-teal-500 focus:ring-0"
                />
                <span className="font-medium text-emerald-400">Approve Finding</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="reviewAction"
                  value="rejected"
                  checked={reviewAction === 'rejected'}
                  onChange={() => setReviewAction('rejected')}
                  className="text-rose-500 focus:ring-0"
                />
                <span className="font-medium text-rose-400">Reject Finding</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
                  reviewAction === 'accepted'
                    ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/40'
                    : 'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Save Review Decision</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
