import React from 'react';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Reset Benchmark Dataset?</h3>
            <p className="text-xs text-slate-400">Restore Initial Project Demonstration Data</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed my-4">
          This will restore the database to the benchmark state specified in the project report (M001 Industrial Motor, M002 Water Pump, M003 Conveyor, M004 CNC Spindle, along with benchmark temperature and vibration readings). Any custom machines or test readings added during this session will be reset.
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-slate-400 hover:text-white font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Resetting...' : 'Yes, Reset Benchmark Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
