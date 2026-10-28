import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  BrainCircuit,
  AlertTriangle,
  BarChart3,
  Settings2,
  Wrench,
  Network,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'iot-sensor', label: 'IoT Sensor Data', icon: Cpu },
    { id: 'ml-anomaly', label: 'ML Anomaly Lab', icon: BrainCircuit },
    {
      id: 'alerts',
      label: 'Alerts & Actions',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined
    },
    { id: 'analytics', label: 'Historical Analytics', icon: BarChart3 },
    { id: 'machines', label: 'Machine Fleet', icon: Settings2 },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
    { id: 'architecture', label: 'System Architecture', icon: Network },
    { id: 'about', label: 'About Project', icon: GraduationCap }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Monitoring Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Engineering Student Credits Box */}
      <div className="p-3.5 m-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
        <div className="text-slate-200 font-semibold mb-0.5">Pranitha S S</div>
        <div className="text-slate-400 text-[10px] leading-tight">Dept. of Computer Science & Engineering</div>
        <div className="text-cyan-400 text-[10px] mt-1 font-medium">KIT - Coimbatore (KIT-CBE)</div>
      </div>
    </aside>
  );
};
