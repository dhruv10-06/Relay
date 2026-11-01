import React from 'react';
import { Layers, Zap, FolderGit2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onLoadSample, isSampleLoading }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black text-xl tracking-wider">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">RELAY</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-teal-950 text-teal-300 border border-teal-800">
                WCC Forge 48
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Never let critical project knowledge leave with people
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                currentView === 'landing'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Overview & Guide
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                currentView === 'dashboard'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Projects Workspace
            </button>
          </nav>

          {/* 1-Click Load Scenario CTA */}
          <button
            onClick={onLoadSample}
            disabled={isSampleLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20 transition active:scale-95 disabled:opacity-50"
            title="Load sample project with synthetic documents and knowledge gap matrix"
          >
            <Zap className={`w-3.5 h-3.5 fill-current ${isSampleLoading ? 'animate-spin' : ''}`} />
            <span>{isSampleLoading ? 'Loading Scenario...' : 'Load Sample Scenario'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
