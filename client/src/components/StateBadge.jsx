import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, GitCompare, ShieldCheck, ShieldAlert, Check, X, Edit3, Clock } from 'lucide-react';

export function KnowledgeStateBadge({ state, size = 'sm' }) {
  const normalized = (state || 'supported').toLowerCase();

  const configs = {
    supported: {
      label: 'Supported',
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      icon: CheckCircle2,
      desc: 'Backed by direct evidence from authorized documents',
    },
    inferred: {
      label: 'Inferred',
      bg: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      icon: HelpCircle,
      desc: 'Deduced from informal comments; lacks formal benchmark',
    },
    contradicted: {
      label: 'Contradicted',
      bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80 animate-pulse',
      icon: GitCompare,
      desc: 'Direct conflict detected between multiple sources',
    },
    missing: {
      label: 'Missing Info',
      bg: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
      icon: AlertTriangle,
      desc: 'Required owner, deadline, or rationale is absent',
    },
  };

  const config = configs[normalized] || configs.supported;
  const Icon = config.icon;
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      title={config.desc}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${config.bg} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function ValidationBadge({ validation }) {
  const isVerified = (validation || 'unverified').toLowerCase() === 'verified';

  return (
    <span
      title={isVerified ? 'Evidence excerpt corroborated from source text' : 'Lacks corroborated citation'}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${
        isVerified
          ? 'bg-sky-950/60 text-sky-300 border-sky-800/60'
          : 'bg-slate-900 text-slate-400 border-slate-700'
      }`}
    >
      {isVerified ? (
        <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
      ) : (
        <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
      )}
      <span>{isVerified ? 'Verified Evidence' : 'Unverified'}</span>
    </span>
  );
}

export function ReviewStatusBadge({ status }) {
  const norm = (status || 'pending').toLowerCase();

  switch (norm) {
    case 'accepted':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
          <Check className="w-3 h-3" /> Approved
        </span>
      );
    case 'edited':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-900/60 text-blue-200 border border-blue-700/60">
          <Edit3 className="w-3 h-3" /> Edited & Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
          <X className="w-3 h-3" /> Rejected
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          <Clock className="w-3 h-3 text-slate-400" /> Pending Review
        </span>
      );
  }
}
