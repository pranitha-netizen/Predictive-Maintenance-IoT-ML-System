import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  AlertCircle,
  Cpu,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { loginUser } from '../services/apiClient.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState<string>('pranitha.ss@kit-cbe.edu.in');
  const [password, setPassword] = useState<string>('KitEng@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid engineering personnel email address.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginUser(email, password, false);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginUser('pranitha.ss@kit-cbe.edu.in', undefined, true);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Maintenance Personnel Authentication
            </h2>
            <p className="text-xs text-cyan-400">
              KIT-CBE Predictive Maintenance Portal
            </p>
          </div>
        </div>

        {currentUser.is_demo && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center gap-2 text-xs text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Currently active in <strong>Demo Access Mode</strong> (Pranitha S S - Lead Engineer).</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Engineer / Technician Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="technician@plant.kit-cbe.edu.in"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Authenticate Personnel'}</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleDemoLogin}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>1-Click Demo Login (Pranitha S S - KIT-CBE)</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Academic Engineering Prototype · Zero cleartext secrets stored in client code.
        </div>
      </div>
    </div>
  );
};
