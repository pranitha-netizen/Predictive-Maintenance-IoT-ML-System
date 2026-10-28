import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Layers,
  Thermometer,
  Activity,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { SensorReading, Machine, MaintenanceAlert, AnalyticsSummary } from '../types/index.ts';

interface AnalyticsViewProps {
  readings: SensorReading[];
  machines: Machine[];
  alerts: MaintenanceAlert[];
  summary: AnalyticsSummary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  readings,
  machines,
  alerts,
  summary
}) => {
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');

  const filteredReadings = readings.filter((r) => {
    if (selectedMachine !== 'ALL' && r.machine_id !== selectedMachine) return false;
    return true;
  });

  // Calculate stats for current filter
  const count = filteredReadings.length;
  const avgTemp = count > 0 ? (filteredReadings.reduce((acc, r) => acc + r.temperature, 0) / count).toFixed(1) : '0';
  const peakTemp = count > 0 ? Math.max(...filteredReadings.map((r) => r.temperature)).toFixed(1) : '0';
  const avgVib = count > 0 ? (filteredReadings.reduce((acc, r) => acc + r.vibration, 0) / count).toFixed(2) : '0';
  const peakVib = count > 0 ? Math.max(...filteredReadings.map((r) => r.vibration)).toFixed(2) : '0';

  // Severity counts
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter((a) => a.severity === 'HIGH').length;
  const medAlerts = alerts.filter((a) => a.severity === 'MEDIUM').length;
  const lowAlerts = alerts.filter((a) => a.severity === 'LOW').length;

  // SVG Chart points
  const reverseList = [...filteredReadings].reverse();
  const maxT = Math.max(85, ...filteredReadings.map((r) => r.temperature));
  const minT = Math.min(35, ...filteredReadings.map((r) => r.temperature));
  const maxV = Math.max(10, ...filteredReadings.map((r) => r.vibration));

  const getSvgCoordinates = (values: number[], minVal: number, maxVal: number, width = 600, height = 140) => {
    if (values.length < 2) return '';
    const stepX = width / (values.length - 1);
    return values
      .map((val, idx) => {
        const x = idx * stepX;
        const normalizedY = (val - minVal) / Math.max(1, maxVal - minVal);
        const y = height - normalizedY * height;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const tempPath = getSvgCoordinates(reverseList.map((r) => r.temperature), minT, maxT);
  const vibPath = getSvgCoordinates(reverseList.map((r) => r.vibration), 0, maxV);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Historical Telemetry Analytics & Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-asset statistical evaluation, parameter variance, and alert severity distributions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/export/csv?machine_id=${selectedMachine}`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Sensor Telemetry (CSV)</span>
          </a>
        </div>
      </div>

      {/* Filter and Summary Statistics */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Target Fleet Filter:
          </span>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Machines Fleetwide</option>
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_id} — {m.machine_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span>Records: <strong className="text-slate-200">{count}</strong></span>
          <span>·</span>
          <span>Avg Temp: <strong className="text-cyan-400">{avgTemp}°C</strong> (Peak: {peakTemp}°C)</span>
          <span>·</span>
          <span>Avg Vib: <strong className="text-emerald-400">{avgVib} mm/s</strong> (Peak: {peakVib} mm/s)</span>
        </div>
      </div>

      {/* Historical Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Historical Temperature */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Historical Temperature (°C)</h3>
              <p className="text-xs text-slate-400">Thermal trajectory of historical sensor readings</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Peak: {peakTemp}°C
            </span>
          </div>

          <div className="h-36 w-full bg-slate-950 rounded-lg p-2 relative flex items-center justify-center border border-slate-800/80">
            {tempPath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                <path d={tempPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No historical records available</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>Baseline Minimum: {minT.toFixed(0)}°C</span>
            <span>Recorded Maximum: {maxT.toFixed(0)}°C</span>
          </div>
        </div>

        {/* Historical Vibration */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Historical Vibration Amplitude (mm/s)</h3>
              <p className="text-xs text-slate-400">RMS mechanical vibration oscillations over time</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Peak: {peakVib} mm/s
            </span>
          </div>

          <div className="h-36 w-full bg-slate-950 rounded-lg p-2 relative flex items-center justify-center border border-slate-800/80">
            {vibPath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                <path d={vibPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No historical records available</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>Zero Velocity: 0.0 mm/s</span>
            <span>Recorded Maximum: {maxV.toFixed(1)} mm/s</span>
          </div>
        </div>
      </div>

      {/* Cross-Machine Comparison & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Machine-wise Condition Comparison */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Machine-Wise Fleet Comparison</h3>
          <p className="text-xs text-slate-400 mb-4">Current operating parameters across registered machines</p>

          <div className="space-y-3">
            {machines.map((m) => (
              <div key={m.machine_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-cyan-400">{m.machine_id} · {m.machine_name}</span>
                  <span className="font-mono text-[10px] uppercase text-slate-400">{m.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Temp: {m.current_temp || 0}°C</span>
                      <span>Limit: {m.temp_critical_threshold}°C</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ((m.current_temp || 0) / 100) * 100)}%` }}
                        className="h-full bg-cyan-500 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Vib: {m.current_vibration || 0} mm/s</span>
                      <span>Limit: {m.vibration_critical_threshold} mm/s</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ((m.current_vibration || 0) / 10) * 100)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Severity Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-1">Alert Severity Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Total historical anomaly and threshold incidents by classification</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60">
              <div className="text-[10px] uppercase font-mono text-rose-400 font-bold">Critical</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{criticalAlerts}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Immediate stop protocol</div>
            </div>

            <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-800/60">
              <div className="text-[10px] uppercase font-mono text-orange-400 font-bold">High</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{highAlerts}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Urgent technician dispatch</div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60">
              <div className="text-[10px] uppercase font-mono text-amber-400 font-bold">Medium / Warning</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{medAlerts}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Inspection scheduled</div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60">
              <div className="text-[10px] uppercase font-mono text-blue-400 font-bold">Low Deviation</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{lowAlerts}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Continuous telemetry watch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Sensor Readings Log Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Historical Telemetry Ledger</h3>
          <span className="text-xs text-slate-400 font-mono">Showing {filteredReadings.slice(0, 15).length} of {count} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-medium">Reading ID</th>
                <th className="py-2.5 px-4 font-medium">Machine ID</th>
                <th className="py-2.5 px-4 font-medium text-right">Temp (°C)</th>
                <th className="py-2.5 px-4 font-medium text-right">Vib (mm/s)</th>
                <th className="py-2.5 px-4 font-medium text-right">Current (A)</th>
                <th className="py-2.5 px-4 font-medium text-right">Speed (RPM)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Recorded Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReadings.slice(0, 15).map((r) => (
                <tr key={r.reading_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-cyan-400">{r.reading_id}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-200">{r.machine_id}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-200">{r.temperature.toFixed(1)}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-200">{r.vibration.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">
                    {r.motor_current_a !== undefined ? r.motor_current_a.toFixed(1) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">
                    {r.speed_rpm !== undefined ? r.speed_rpm : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      r.status === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      r.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(r.recorded_at).toLocaleTimeString()} · {new Date(r.recorded_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
