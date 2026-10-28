import React, { useEffect } from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'CRITICAL' | 'HIGH' | 'WARNING' | 'SUCCESS';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'CRITICAL'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : toast.type === 'HIGH'
              ? 'bg-orange-950/90 border-orange-800 text-orange-200'
              : toast.type === 'WARNING'
              ? 'bg-amber-950/90 border-amber-800 text-amber-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          {toast.type === 'CRITICAL' || toast.type === 'HIGH' ? (
            <AlertOctagon className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          ) : toast.type === 'WARNING' ? (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          )}

          <div className="flex-1 text-xs">
            <div className="font-bold tracking-tight text-white">{toast.title}</div>
            <div className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.message}</div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
