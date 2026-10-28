import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { MaintenanceAlert, Machine } from '../types/index.ts';

interface AlertsViewProps {
  alerts: MaintenanceAlert[];
  machines: Machine[];
  onUpdateAlert: (
    alertId: string,
    action: 'ACKNOWLEDGE' | 'RESOLVE',
    technicianName: string,
    notes?: string
  ) => Promise<void>;
  technicianName: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  machines,
  onUpdateAlert,
  technicianName
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [machineFilter, setMachineFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<MaintenanceAlert | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter alerts
  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (machineFilter !== 'ALL' && a.machine_id !== machineFilter) return false;
    if (statusFilter !== 'ALL' && a.acknowledgement_status !== statusFilter) return false;
    return true;
  });

  const handleAction = async (action: 'ACKNOWLEDGE' | 'RESOLVE') => {
    if (!selectedAlert) return;
    setIsProcessing(true);
    try {
      await onUpdateAlert(selectedAlert.alert_id, action, technicianName, actionNotes);
      setSelectedAlert(null);
      setActionNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-950 text-orange-400 border border-orange-800">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            RESOLVED
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400">
            <UserCheck className="w-3.5 h-3.5" />
            ACKNOWLEDGED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            UNACKNOWLEDGED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Maintenance Alerts & Incident Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time notifications categorized by severity (LOW, MEDIUM, HIGH, CRITICAL)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export/csv?type=alerts"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Alerts (CSV)</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Filters:</span>
        </div>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="HIGH">High Only</option>
          <option value="MEDIUM">Medium Only</option>
          <option value="LOW">Low Only</option>
        </select>

        {/* Machine Filter */}
        <select
          value={machineFilter}
          onChange={(e) => setMachineFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All Machines</option>
          {machines.map((m) => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.machine_id} — {m.machine_name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All Statuses</option>
          <option value="UNACKNOWLEDGED">Unacknowledged</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <span className="ml-auto text-slate-400 font-mono">
          Showing {filteredAlerts.length} of {alerts.length} Alerts
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-4 rounded-xl bg-slate-900/90 border transition-all ${
                alert.acknowledgement_status === 'UNACKNOWLEDGED'
                  ? alert.severity === 'CRITICAL'
                    ? 'border-rose-700/80 bg-rose-950/20'
                    : 'border-slate-700'
                  : 'border-slate-800/80 opacity-90'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {alert.alert_id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {alert.machine_id} — {alert.machine_name}
                    </span>
                    <span className="text-slate-600">·</span>
                    {getSeverityBadge(alert.severity)}
                    <span className="text-slate-600">·</span>
                    {getStatusBadge(alert.acknowledgement_status)}
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {alert.alert_message}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300">
                    <strong className="text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">
                      Recommended Engineering Protocol:
                    </strong>
                    {alert.recommended_action}
                  </div>

                  {alert.acknowledgement_status === 'RESOLVED' && alert.resolution_notes && (
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Resolution Note: {alert.resolution_notes} (by {alert.resolved_by})
                    </div>
                  )}

                  {alert.acknowledgement_status === 'ACKNOWLEDGED' && alert.acknowledged_by && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Acknowledged by: {alert.acknowledged_by} at {new Date(alert.acknowledged_at || '').toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Telemetry at Incident & Actions */}
                <div className="flex flex-col sm:items-end justify-between shrink-0 space-y-3">
                  <div className="text-right font-mono text-xs text-slate-400">
                    <div>
                      Temp: <strong className="text-slate-200">{alert.temperature}°C</strong>
                    </div>
                    <div>
                      Vib: <strong className="text-slate-200">{alert.vibration} mm/s</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {new Date(alert.sent_at).toLocaleTimeString()} · {new Date(alert.sent_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.acknowledgement_status === 'UNACKNOWLEDGED' && (
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-lg transition-colors cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.acknowledgement_status !== 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-lg transition-colors cursor-pointer"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No Matching Alerts Found</h3>
            <p className="text-xs mt-1">All telemetry is nominal for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Process Alert: {selectedAlert.alert_id} ({selectedAlert.machine_id})
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-200">{selectedAlert.alert_message}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Severity: {selectedAlert.severity} · Temp: {selectedAlert.temperature}°C · Vib: {selectedAlert.vibration} mm/s
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Action Taken / Notes:
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="e.g. Inspected motor bearings, tightened loose base bolts, lubrication confirmed."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Technician: {technicianName}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              {selectedAlert.acknowledgement_status === 'UNACKNOWLEDGED' && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleAction('ACKNOWLEDGE')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 cursor-pointer"
                >
                  Acknowledge Incident
                </button>
              )}
              <button
                disabled={isProcessing}
                onClick={() => handleAction('RESOLVE')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
