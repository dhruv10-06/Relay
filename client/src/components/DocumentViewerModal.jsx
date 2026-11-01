import React from 'react';
import { X, FileText, Download, CheckCircle, Info } from 'lucide-react';

export default function DocumentViewerModal({ document, onClose }) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-800/60 text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                  {document.fileType?.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {document.wordCount ? `${document.wordCount.toLocaleString()} words` : ''}
                </span>
                <span className="text-xs text-slate-500">
                  {(document.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100">{document.fileName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          {document.metadata?.detectedSections && document.metadata.detectedSections.length > 0 && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1.5">
                Detected Structural Headers & Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {document.metadata.detectedSections.map((sec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300/80 font-mono text-[10px]"
                  >
                    {sec.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Extracted Text Content
              </span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> High-Fidelity Extraction Complete
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-slate-200 text-xs whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[50vh]">
              {document.extractedText || 'No text extracted.'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Document Preview
          </button>
        </div>
      </div>
    </div>
  );
}
