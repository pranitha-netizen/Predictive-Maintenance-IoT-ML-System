import React from 'react';
import { Play, Pause, User, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface NavbarProps {
  user: UserProfile;
  isSimulating: boolean;
  toggleSimulation: () => void;
  onOpenLogin: () => void;
  onOpenReset: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isSimulating,
  toggleSimulation,
  onOpenLogin,
  onOpenReset,
  activeTab
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Predictive Maintenance IoT
          </span>
          <span className="text-[11px] text-cyan-400 font-medium tracking-wide">
            KIT-CBE · CSE Academic Engineering Project
          </span>
        </div>
      </div>

      {/* Zone 2: System Telemetry Breadcrumb */}
      <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
        <span className="text-slate-200 font-medium capitalize">{activeTab.replace('-', ' ')}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ML Isolation Engine Ready</span>
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-400 font-mono tabular-nums">SQLite Ingestion Active</span>
      </div>

      {/* Zone 3: Primary Action & User Status */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Reset Demo Data Button */}
        <button
          onClick={onOpenReset}
          title="Reset database to academic benchmark dataset"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset Benchmark</span>
        </button>

        {/* Live Simulation Stream Toggle */}
        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm whitespace-nowrap cursor-pointer ${
            isSimulating
              ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Telemetry: Streaming</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Telemetry</span>
            </>
          )}
        </button>

        {/* User Account Button */}
        <button
          onClick={onOpenLogin}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="hidden lg:inline whitespace-nowrap">{user.name}</span>
          {user.is_demo && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
              DEMO
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
