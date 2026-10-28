import React, { useState } from 'react';
import {
  Settings2,
  Plus,
  Edit,
  Power,
  CheckCircle,
  AlertTriangle,
  X,
  Sliders,
  Cpu,
  MapPin
} from 'lucide-react';
import { Machine } from '../types/index.ts';

interface MachineManagementViewProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
  onCreateMachine: (data: Partial<Machine>) => Promise<void>;
  onUpdateMachine: (id: string, data: Partial<Machine>) => Promise<void>;
}

export const MachineManagementView: React.FC<MachineManagementViewProps> = ({
  machines,
  onSelectMachine,
  onCreateMachine,
  onUpdateMachine
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // New Machine Form State
  const [newId, setNewId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<string>('Industrial Motor');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newTempWarn, setNewTempWarn] = useState<number>(65.0);
  const [newTempCrit, setNewTempCrit] = useState<number>(75.0);
  const [newVibWarn, setNewVibWarn] = useState<number>(4.0);
  const [newVibCrit, setNewVibCrit] = useState<number>(7.0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newId.trim() || !newName.trim() || !newLocation.trim()) {
      setFormError('Please fill in all required fields (ID, Name, Location).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateMachine({
        machine_id: newId.trim().toUpperCase(),
        machine_name: newName.trim(),
        machine_type: newType,
        location: newLocation.trim(),
        temp_warning_threshold: newTempWarn,
        temp_critical_threshold: newTempCrit,
        vibration_warning_threshold: newVibWarn,
        vibration_critical_threshold: newVibCrit,
        is_monitoring: true
      });
      setShowAddModal(false);
      // Reset form
      setNewId('');
      setNewName('');
      setNewLocation('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to register machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    setIsSubmitting(true);
    try {
      await onUpdateMachine(editingMachine.machine_id, {
        machine_name: editingMachine.machine_name,
        location: editingMachine.location,
        temp_warning_threshold: editingMachine.temp_warning_threshold,
        temp_critical_threshold: editingMachine.temp_critical_threshold,
        vibration_warning_threshold: editingMachine.vibration_warning_threshold,
        vibration_critical_threshold: editingMachine.vibration_critical_threshold
      });
      setEditingMachine(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMonitoring = async (m: Machine) => {
    try {
      await onUpdateMachine(m.machine_id, {
        is_monitoring: !m.is_monitoring
      });
    } catch (err: any) {
      alert(err.message || 'Failed to toggle monitoring');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Industrial Asset & Threshold Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure individual machines, assign ISO vibration limits, and tune temperature thresholds
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Machine</span>
        </button>
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((m) => (
          <div
            key={m.machine_id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                    {m.machine_id}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-300">{m.machine_type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleMonitoring(m)}
                    className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      m.is_monitoring
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{m.is_monitoring ? 'ACTIVE' : 'MUTED'}</span>
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                {m.machine_name}
              </h3>

              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                <span>{m.location}</span>
              </div>

              {/* Thresholds Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Temp Thresholds</div>
                  <div className="text-slate-200 mt-0.5">
                    Warn: <strong className="text-amber-400">{m.temp_warning_threshold}°C</strong>
                  </div>
                  <div className="text-slate-200">
                    Crit: <strong className="text-rose-400">{m.temp_critical_threshold}°C</strong>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Vibration Thresholds</div>
                  <div className="text-slate-200 mt-0.5">
                    Warn: <strong className="text-amber-400">{m.vibration_warning_threshold} mm/s</strong>
                  </div>
                  <div className="text-slate-200">
                    Crit: <strong className="text-rose-400">{m.vibration_critical_threshold} mm/s</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Current Condition: <strong className="text-slate-300">{m.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingMachine(m)}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-cyan-400" />
                  <span>Edit Thresholds</span>
                </button>
                <button
                  onClick={() => onSelectMachine(m.machine_id)}
                  className="px-2.5 py-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 rounded border border-cyan-800/50 transition-colors cursor-pointer"
                >
                  Live Monitor
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Register New Industrial Machine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-rose-950/80 border border-rose-800 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Machine ID (Unique)</label>
                  <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="e.g. M005"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Asset Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="Industrial Motor">Industrial Motor</option>
                    <option value="Water Pump">Water Pump</option>
                    <option value="Conveyor System">Conveyor System</option>
                    <option value="CNC Milling">CNC Milling</option>
                    <option value="Air Compressor">Air Compressor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Machine Name / Description</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Primary Cooling Tower Blower Fan"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Plant Location / Shop Floor</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Utility Building B - Level 2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Temp Warning (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTempWarn}
                    onChange={(e) => setNewTempWarn(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Temp Critical (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTempCrit}
                    onChange={(e) => setNewTempCrit(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vibration Warning (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVibWarn}
                    onChange={(e) => setNewVibWarn(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vibration Critical (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVibCrit}
                    onChange={(e) => setNewVibCrit(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Thresholds Modal */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Edit Thresholds: {editingMachine.machine_id}
              </h3>
              <button onClick={() => setEditingMachine(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Machine Name</label>
                <input
                  type="text"
                  value={editingMachine.machine_name}
                  onChange={(e) => setEditingMachine({ ...editingMachine, machine_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Plant Location</label>
                <input
                  type="text"
                  value={editingMachine.location}
                  onChange={(e) => setEditingMachine({ ...editingMachine, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Temp Warning (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingMachine.temp_warning_threshold}
                    onChange={(e) => setEditingMachine({ ...editingMachine, temp_warning_threshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Temp Critical (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingMachine.temp_critical_threshold}
                    onChange={(e) => setEditingMachine({ ...editingMachine, temp_critical_threshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vibration Warning (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMachine.vibration_warning_threshold}
                    onChange={(e) => setEditingMachine({ ...editingMachine, vibration_warning_threshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vibration Critical (mm/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMachine.vibration_critical_threshold}
                    onChange={(e) => setEditingMachine({ ...editingMachine, vibration_critical_threshold: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className="px-3 py-2 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
