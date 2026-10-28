import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import { MaintenanceRecord, Machine, MaintenanceAlert } from '../types/index.ts';

interface MaintenanceHistoryViewProps {
  records: MaintenanceRecord[];
  machines: Machine[];
  alerts: MaintenanceAlert[];
  onCreateRecord: (data: Partial<MaintenanceRecord>) => Promise<void>;
  defaultTechnician: string;
}

export const MaintenanceHistoryView: React.FC<MaintenanceHistoryViewProps> = ({
  records,
  machines,
  alerts,
  onCreateRecord,
  defaultTechnician
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [machineFilter, setMachineFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [machineId, setMachineId] = useState<string>(machines[0]?.machine_id || 'M001');
  const [eventType, setEventType] = useState<MaintenanceRecord['event_type']>('Routine Inspection');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [technician, setTechnician] = useState<string>(defaultTechnician);
  const [linkedAlertId, setLinkedAlertId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [hoursSpent, setHoursSpent] = useState<string>('1.5');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    if (machineFilter !== 'ALL' && r.machine_id !== machineFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        r.action_taken.toLowerCase().includes(term) ||
        r.technician.toLowerCase().includes(term) ||
        r.record_id.toLowerCase().includes(term) ||
        r.notes.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!actionTaken.trim() || !technician.trim()) {
      setFormError('Please provide action taken and technician name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateRecord({
        machine_id: machineId,
        event_type: eventType,
        action_taken: actionTaken.trim(),
        technician: technician.trim(),
        linked_alert_id: linkedAlertId || undefined,
        notes: notes.trim(),
        hours_spent: parseFloat(hoursSpent) || 1.5,
        performed_at: new Date().toISOString()
      });
      setShowAddModal(false);
      setActionTaken('');
      setNotes('');
      setLinkedAlertId('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Preventative & Corrective Maintenance History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs of technician inspections, lubrication, bearing replacements, and resolved incidents
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Maintenance Activity</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search action taken, technician, record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-semibold uppercase">Machine:</span>
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Machines</option>
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_id}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px] ml-auto">
          {filteredRecords.length} Documented Work Orders
        </span>
      </div>

      {/* Maintenance Records Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Record ID</th>
                <th className="py-3 px-4 font-medium">Machine</th>
                <th className="py-3 px-4 font-medium">Event Type</th>
                <th className="py-3 px-4 font-medium">Action Performed</th>
                <th className="py-3 px-4 font-medium">Technician</th>
                <th className="py-3 px-4 font-medium text-right">Hours</th>
                <th className="py-3 px-4 font-medium text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r) => (
                <tr key={r.record_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {r.record_id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {r.machine_id}
                    <div className="text-[10px] text-slate-500 font-normal">{r.machine_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                      {r.event_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                    <div>{r.action_taken}</div>
                    {r.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        Notes: {r.notes}
                      </div>
                    )}
                    {r.linked_alert_id && (
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        Linked Alert: {r.linked_alert_id}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {r.technician}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-400">
                    {r.hours_spent ? `${r.hours_spent}h` : '1.5h'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                    <div>{new Date(r.performed_at).toLocaleDateString()}</div>
                    <div className="text-slate-500">{new Date(r.performed_at).toLocaleTimeString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Log Maintenance Action</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Target Machine</label>
                  <select
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    {machines.map((m) => (
                      <option key={m.machine_id} value={m.machine_id}>
                        {m.machine_id} — {m.machine_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="Routine Inspection">Routine Inspection</option>
                    <option value="Bearing Replacement">Bearing Replacement</option>
                    <option value="Lubrication">Lubrication</option>
                    <option value="Sensor Calibration">Sensor Calibration</option>
                    <option value="Motor Rewinding">Motor Rewinding</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Action Performed</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Cleaned air intake filter and regreased drive bearing"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Linked Incident Alert (Optional)
                </label>
                <select
                  value={linkedAlertId}
                  onChange={(e) => setLinkedAlertId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                >
                  <option value="">None (Routine preventative record)</option>
                  {alerts.map((a) => (
                    <option key={a.alert_id} value={a.alert_id}>
                      {a.alert_id} — {a.machine_id}: {a.alert_message.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diagnostic Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Operational observation post-maintenance..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  {isSubmitting ? 'Logging...' : 'Save Maintenance Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
