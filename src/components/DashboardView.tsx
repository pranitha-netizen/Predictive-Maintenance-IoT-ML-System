import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Machine, AnalyticsSummary, AnomalyEvent, MaintenanceAlert } from '../types/index.ts';

interface DashboardViewProps {
  machines: Machine[];
  summary: AnalyticsSummary;
  alerts: MaintenanceAlert[];
  anomalyEvents?: AnomalyEvent[];
  onSelectMachine: (machineId: string) => void;
  onOpenQuickTest: (machineId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  machines,
  summary,
  alerts,
  onSelectMachine,
  onOpenQuickTest
}) => {
  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            NORMAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-800/60 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            HIGH
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60 font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            CRITICAL
          </span>
        );
    }
  };

  const activeAlerts = alerts.filter((a) => a.acknowledgement_status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Hero Banner with Academic Project Attribution */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 mb-1">
              <span>Department of Computer Science & Engineering</span>
              <span>·</span>
              <span>KIT-CBE Project Prototype</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Industrial Condition Monitoring & Predictive Health
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Continuous IoT sensor ingestion analyzing real-time temperature and vibration telemetry.
              Powered by dual threshold validation and unsupervised Scikit-learn Isolation Forest anomaly classification.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Plant Health Index</div>
              <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
                {summary.overall_health_score}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Machines */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Units</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono tabular-nums">
            {summary.total_machines}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Configured assets</div>
        </div>

        {/* Normal Machines */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Nominal State</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {summary.normal_machines}
          </div>
          <div className="mt-1 text-[11px] text-emerald-500/80 font-medium">Within safe envelope</div>
        </div>

        {/* Requiring Attention */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Needs Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {summary.warning_machines}
          </div>
          <div className="mt-1 text-[11px] text-amber-500/80 font-medium">Warning threshold</div>
        </div>

        {/* Critical & High */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>High / Critical</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {summary.high_machines + summary.critical_machines}
          </div>
          <div className="mt-1 text-[11px] text-rose-500/80 font-medium">Intervention required</div>
        </div>

        {/* Active Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Alerts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            {summary.active_alerts}
          </div>
          <div className="mt-1 text-[11px] text-cyan-500/80 font-medium">Unresolved events</div>
        </div>

        {/* Latest Sensor Ingestion */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Latest Update</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-200 font-mono truncate">
            {new Date(summary.latest_update).toLocaleTimeString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Live telemetry sync</div>
        </div>
      </div>

      {/* Status Distribution & System Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution Bar */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Machine Health Distribution</h2>
              <p className="text-xs text-slate-400">Current condition status across all monitored fleet units</p>
            </div>
            <div className="text-xs text-cyan-400 font-mono">
              ISO 10816 Industrial Standard
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-4 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800 p-0.5">
            <div
              style={{ width: `${(summary.normal_machines / Math.max(1, summary.total_machines)) * 100}%` }}
              className="bg-emerald-500 h-full rounded transition-all duration-500"
              title={`Normal: ${summary.normal_machines}`}
            />
            <div
              style={{ width: `${(summary.warning_machines / Math.max(1, summary.total_machines)) * 100}%` }}
              className="bg-amber-500 h-full rounded transition-all duration-500 mx-0.5"
              title={`Warning: ${summary.warning_machines}`}
            />
            <div
              style={{ width: `${(summary.high_machines / Math.max(1, summary.total_machines)) * 100}%` }}
              className="bg-orange-500 h-full rounded transition-all duration-500 mx-0.5"
              title={`High: ${summary.high_machines}`}
            />
            <div
              style={{ width: `${(summary.critical_machines / Math.max(1, summary.total_machines)) * 100}%` }}
              className="bg-rose-500 h-full rounded transition-all duration-500"
              title={`Critical: ${summary.critical_machines}`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Normal ({summary.normal_machines})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500 shrink-0" />
              <span className="text-slate-300">Warning ({summary.warning_machines})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500 shrink-0" />
              <span className="text-slate-300">High ({summary.high_machines})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-500 shrink-0" />
              <span className="text-slate-300">Critical ({summary.critical_machines})</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostics Insight */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Diagnostic Summary</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">
              {summary.high_machines + summary.critical_machines > 0
                ? 'Fault Signatures Detected'
                : 'All Monitored Units Operating Within Spec'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {summary.high_machines + summary.critical_machines > 0
                ? 'Thermal and vibration deviation detected on Unit M001. Bearing wear frequency isolated by ML model.'
                : 'Peak plant temperature is stabilized at nominal values with low vibration harmonics across all running equipment.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Avg Temp: <strong className="text-slate-200">{summary.avg_temperature}°C</strong></span>
            <span>Avg Vib: <strong className="text-slate-200">{summary.avg_vibration} mm/s</strong></span>
          </div>
        </div>
      </div>

      {/* Machine Fleet Overview Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Monitored Machine Fleet</h2>
            <p className="text-xs text-slate-400">Live operational status and sensor readings across factory bays</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {machines.length} Total Units Tracked
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Machine ID</th>
                <th className="py-3 px-4 font-medium">Asset Name</th>
                <th className="py-3 px-4 font-medium">Location</th>
                <th className="py-3 px-4 font-medium text-right">Temp (°C)</th>
                <th className="py-3 px-4 font-medium text-right">Vib (mm/s)</th>
                <th className="py-3 px-4 font-medium">Condition</th>
                <th className="py-3 px-4 font-medium">Last Ingestion</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {machines.map((m) => (
                <tr key={m.machine_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {m.machine_id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {m.machine_name}
                    <div className="text-[11px] text-slate-500 font-normal">{m.machine_type}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {m.location}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-200">
                    {m.current_temp !== undefined ? `${m.current_temp.toFixed(1)}°C` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-200">
                    {m.current_vibration !== undefined ? `${m.current_vibration.toFixed(2)} mm/s` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(m.status)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                    {new Date(m.last_updated).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectMachine(m.machine_id)}
                        className="px-2.5 py-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 rounded transition-colors cursor-pointer"
                      >
                        Live Monitor
                      </button>
                      <button
                        onClick={() => onOpenQuickTest(m.machine_id)}
                        className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
                        title="Simulate / inject sensor reading for this machine"
                      >
                        Inject Data
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      {activeAlerts.length > 0 && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Active Maintenance Alerts</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {activeAlerts.length} Actionable Items
            </span>
          </div>

          <div className="space-y-2">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.alert_id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-cyan-400">{alert.machine_id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-semibold text-slate-200">{alert.machine_name}</span>
                    <span className="text-slate-500">·</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      alert.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-300">{alert.alert_message}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    <div>{alert.temperature}°C · {alert.vibration} mm/s</div>
                    <div className="text-slate-500">{new Date(alert.sent_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
