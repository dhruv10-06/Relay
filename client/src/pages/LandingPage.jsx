import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Zap,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  FileCheck2,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
} from 'lucide-react';
import { KnowledgeStateBadge, ValidationBadge } from '../components/StateBadge';

export default function LandingPage({ onOpenDashboard, onLoadSample, isSampleLoading }) {
  return (
    <div className="space-y-20 pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>WCC Forge 48 Round 2 — Official Hackathon Build</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15] mb-6">
          Never let critical project knowledge{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">
            leave with people.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          RELAY ingests scattered project documents, reconstructs verified architectural decisions, detects silent knowledge gaps and conflicting statements, and generates an actionable <strong>First 24 Hours Continuation Plan</strong> for incoming leads.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLoadSample}
            disabled={isSampleLoading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 fill-current ${isSampleLoading ? 'animate-spin' : ''}`} />
            <span>{isSampleLoading ? 'Loading Scenario...' : 'Explore Sample Project (Project Nexus)'}</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>Open Projects Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-teal-400 font-mono text-xs mb-1 font-semibold">01. INGESTION</div>
            <div className="font-semibold text-slate-200 text-sm">PDF, DOCX, TXT, CSV</div>
            <div className="text-slate-400 text-xs mt-1">Multi-format textual parsing & anchor extraction</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-teal-400 font-mono text-xs mb-1 font-semibold">02. RECONSTRUCTION</div>
            <div className="font-semibold text-slate-200 text-sm">Structured Knowledge</div>
            <div className="text-slate-400 text-xs mt-1">Zod-validated decisions, tasks, owners, risks</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-teal-400 font-mono text-xs mb-1 font-semibold">03. GAP INTELLIGENCE</div>
            <div className="font-semibold text-slate-200 text-sm">4 Primary States</div>
            <div className="text-slate-400 text-xs mt-1">Supported, Inferred, Contradicted, Missing</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-teal-400 font-mono text-xs mb-1 font-semibold">04. HANDOVER PLAN</div>
            <div className="font-semibold text-slate-200 text-sm">First 24 Hours</div>
            <div className="text-slate-400 text-xs mt-1">Executable Hour 0-24 roadmap & Markdown export</div>
          </div>
        </div>
      </section>

      {/* Differentiating Feature: 4 Knowledge States Showcase */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-mono tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800">
            Core Differentiator
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-3">
            Strict 4-State Knowledge Classification Matrix
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            Unlike generic summaries that hallucinate completeness, RELAY categorizes every finding into one of four verified epistemic states, decoupling evidence validation from knowledge status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supported */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-800/80 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">STATE 1</span>
              <KnowledgeStateBadge state="supported" size="lg" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Supported by Direct Evidence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Findings directly backed by authoritative project documents (e.g. approved Architecture Decision Records, signed specs). Evidence citations include exact verbatim quotes and section locations.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400/90 font-mono">
              Sample: "PostgreSQL 16 with TimescaleDB adopted for strict ACID compliance & 650ms query time (ADR-042)."
            </div>
          </div>

          {/* Inferred */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-800/80 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">STATE 2</span>
              <KnowledgeStateBadge state="inferred" size="lg" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Reasonably Inferred (Unverified)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Information deduced from informal meeting discussions, verbal comments, or developer chat logs that lack formal benchmark verification or engineering approval.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400/90 font-mono">
              Sample: "HikariCP pool size = 120 based on informal test runs; benchmark stress test not completed."
            </div>
          </div>

          {/* Contradicted */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-800/80 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">STATE 3</span>
              <KnowledgeStateBadge state="contradicted" size="lg" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Contradicted Across Sources</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct discrepancies detected between multiple project documents (e.g., meeting notes specify LRU cache eviction, while deployment logs show LFU was deployed; or task marked complete while tests failed).
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-400/90 font-mono">
              Sample: "Redis Eviction: Meeting Notes specify LRU (4GB) vs QA Report revealing LFU deployed (8GB)."
            </div>
          </div>

          {/* Missing */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-800/80 transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">STATE 4</span>
              <KnowledgeStateBadge state="missing" size="lg" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Missing Critical Information</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Action items missing designated owners, deliverables without committed deadlines, architectural decisions lacking documented technical rationale, or external dependencies without SLAs.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-400/90 font-mono">
              Sample: "Kafka mTLS certificates on production ingress: No owner assigned, no due date set."
            </div>
          </div>
        </div>
      </section>

      {/* The 7-Step Workflow */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-100">The End-to-End RELAY Journey</h3>
            <p className="text-xs text-slate-400">
              How RELAY guarantees seamless technical transitions through human-in-the-loop verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-left">
            {[
              { step: '01', title: 'Create Project', desc: 'Initialize workspace & set departing/incoming roles.' },
              { step: '02', title: 'Upload Docs', desc: 'PDF, DOCX, TXT, CSV with text extraction.' },
              { step: '03', title: 'AI Extraction', desc: 'Zod schema validated structured findings.' },
              { step: '04', title: 'Evidence Trace', desc: 'Verbatim quotes linked to source documents.' },
              { step: '05', title: 'Gap Detection', desc: 'Flag 4 states, missing owners, and contradictions.' },
              { step: '06', title: 'Human Review', desc: 'Accept, edit, or reject findings with audit trail.' },
              { step: '07', title: 'Handover Plan', desc: 'Generate First 24H Continuation Plan & export.' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                <span className="text-teal-400 font-mono font-bold text-xs">{s.step}</span>
                <div className="font-semibold text-slate-200 text-xs">{s.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Ready to evaluate? Launch the bundled <strong>Project Nexus</strong> scenario with 1 click.
            </div>
            <button
              onClick={onLoadSample}
              disabled={isSampleLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Launch Demo Workspace</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
