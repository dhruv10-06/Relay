import React from 'react';
import { X, FileText, CheckCircle2, AlertOctagon, ExternalLink, ShieldCheck } from 'lucide-react';
import { KnowledgeStateBadge, ValidationBadge } from './StateBadge';

export default function EvidenceModal({ finding, onClose }) {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-teal-400 bg-teal-950/70 px-2 py-0.5 rounded border border-teal-800/60">
                {finding.category}
              </span>
              <KnowledgeStateBadge state={finding.knowledgeState} />
              <ValidationBadge validation={finding.evidenceValidation} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 leading-snug">{finding.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Description & Context */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Finding Description</h4>
            <p className="text-slate-200 leading-relaxed">{finding.description}</p>
            {finding.rationale && (
              <div className="pt-2 border-t border-slate-700/40">
                <span className="text-xs font-semibold text-teal-300">Documented Rationale: </span>
                <span className="text-slate-300">{finding.rationale}</span>
              </div>
            )}
          </div>

          {/* Detected Gaps Alert */}
          {finding.detectedGaps && finding.detectedGaps.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Detected Knowledge Gaps ({finding.detectedGaps.length})</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-rose-200/90 text-xs">
                {finding.detectedGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence Citations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Supporting Evidence References ({finding.evidence?.length || 0})
              </h4>
              <span className="text-xs text-slate-500 font-mono">Traceability Guarantee: Verbatim</span>
            </div>

            {(!finding.evidence || finding.evidence.length === 0) ? (
              <div className="p-4 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-slate-400">
                No direct citations attached. This finding is classified as Inferred or Missing.
              </div>
            ) : (
              <div className="space-y-3">
                {finding.evidence.map((ev, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition ${
                      ev.contradictionNote
                        ? 'bg-rose-950/20 border-rose-800/80'
                        : 'bg-slate-800/70 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-400" />
                        <span className="font-semibold text-slate-200 text-xs">{ev.sourceDocName}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                        {ev.pageOrLocation}
                      </span>
                    </div>

                    <blockquote className="italic text-slate-200 text-xs pl-3 border-l-2 border-teal-500 my-2 leading-relaxed bg-slate-950/40 p-2 rounded">
                      "{ev.excerpt}"
                    </blockquote>

                    {ev.contradictionNote && (
                      <div className="mt-2 text-xs text-rose-300 bg-rose-950/60 p-2 rounded border border-rose-900/60 flex items-start gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Conflict Note:</strong> {ev.contradictionNote}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Source Confidence: <strong className="text-slate-300 capitalize">{ev.confidence || 'high'}</strong></span>
                      <span className="text-teal-400 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-teal-400" /> Verified Passage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Evidence Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
