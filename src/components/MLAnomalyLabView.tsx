import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Machine, AnomalyAnalysisResult } from '../types/index.ts';
import { analyzeTelemetry } from '../services/apiClient.ts';

interface MLAnomalyLabViewProps {
  machines: Machine[];
  onInjectReading?: (reading: any) => Promise<void>;
}

export const MLAnomalyLabView: React.FC<MLAnomalyLabViewProps> = ({ machines }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.machine_id || 'M001');
  const [temp, setTemp] = useState<number>(68.4);
  const [vib, setVib] = useState<number>(4.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnomalyAnalysisResult | null>(null);

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];

  const runAnalysis = async (testTemp = temp, testVib = vib) => {
    setLoading(true);
    try {
      const res = await analyzeTelemetry({
        machine_id: selectedMachine.machine_id,
        temperature: testTemp,
        vibration: testVib
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error('Failed to run ML inference:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBenchmarkSelect = (bTemp: number, bVib: number, bMachine = 'M001') => {
    setSelectedMachineId(bMachine);
    setTemp(bTemp);
    setVib(bVib);
    runAnalysis(bTemp, bVib);
  };

  return (
    <div className="space-y-6">
      {/* Header & Theoretical Context */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span>Unsupervised Machine Learning & Dual Threshold Verification</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Isolation Forest Anomaly Detection Laboratory
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Industrial failure precursors often manifest as abnormal joint covariance patterns before single-variable hard limits are breached.
              This module implements Scikit-learn Isolation Forest recursive partitioning combined with ISO 10816 mechanical vibration limits.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/60">
              Academic Demonstration Model
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Test Vectors (From Project Report) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300">
            Project Report Benchmark Test Vectors:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-Click Evaluation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <button
            onClick={() => handleBenchmarkSelect(58.2, 2.1, 'M001')}
            className="p-2.5 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="font-mono text-cyan-400 font-bold">M001 · 58.2°C / 2.1 mm/s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Nominal Baseline</div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold mt-1">Expected: NORMAL</div>
          </button>

          <button
            onClick={() => handleBenchmarkSelect(61.7, 2.6, 'M001')}
            className="p-2.5 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="font-mono text-cyan-400 font-bold">M001 · 61.7°C / 2.6 mm/s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Light Thermal Drift</div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold mt-1">Expected: NORMAL</div>
          </button>

          <button
            onClick={() => handleBenchmarkSelect(68.4, 4.2, 'M001')}
            className="p-2.5 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <div className="font-mono text-amber-400 font-bold">M001 · 68.4°C / 4.2 mm/s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Warning Threshold Cross</div>
            <div className="text-[10px] text-amber-400 font-mono font-semibold mt-1">Expected: WARNING</div>
          </button>

          <button
            onClick={() => handleBenchmarkSelect(74.9, 7.8, 'M001')}
            className="p-2.5 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer"
          >
            <div className="font-mono text-rose-400 font-bold">M001 · 74.9°C / 7.8 mm/s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Severe Bearing Wear</div>
            <div className="text-[10px] text-rose-400 font-mono font-semibold mt-1">Expected: HIGH / CRIT</div>
          </button>

          <button
            onClick={() => handleBenchmarkSelect(55.6, 1.9, 'M002')}
            className="p-2.5 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-colors cursor-pointer"
          >
            <div className="font-mono text-cyan-400 font-bold">M002 · 55.6°C / 1.9 mm/s</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Water Pump Baseline</div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold mt-1">Expected: NORMAL</div>
          </button>
        </div>
      </div>

      {/* Interactive Controls & Real-Time Inference Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Input Form */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Adjust Telemetry Input Features</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Machine Selector */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Asset Specification</label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {machines.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.machine_id} — {m.machine_name} (Warn: {m.temp_warning_threshold}°C / {m.vibration_warning_threshold} mm/s)
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider & Number */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-medium">Bearing Temperature</label>
                <div className="flex items-center gap-1 font-mono text-cyan-400 font-bold">
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right"
                  />
                  <span>°C</span>
                </div>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>40°C (Nominal)</span>
                <span className="text-amber-400">Warn: {selectedMachine.temp_warning_threshold}°C</span>
                <span className="text-rose-400">Crit: {selectedMachine.temp_critical_threshold}°C</span>
                <span>95°C</span>
              </div>
            </div>

            {/* Vibration Slider & Number */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-medium">Vibration Magnitude (RMS)</label>
                <div className="flex items-center gap-1 font-mono text-cyan-400 font-bold">
                  <input
                    type="number"
                    step="0.1"
                    value={vib}
                    onChange={(e) => setVib(parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right"
                  />
                  <span>mm/s</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={vib}
                onChange={(e) => setVib(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0.5 mm/s (Smooth)</span>
                <span className="text-amber-400">Warn: {selectedMachine.vibration_warning_threshold} mm/s</span>
                <span className="text-rose-400">Crit: {selectedMachine.vibration_critical_threshold} mm/s</span>
                <span>12.0 mm/s</span>
              </div>
            </div>

            <button
              onClick={() => runAnalysis()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{loading ? 'Executing ML Inference...' : 'Run Dual Anomaly Evaluation'}</span>
            </button>
          </div>
        </div>

        {/* Inference Diagnostic Results */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Detection Result & Explainability</h3>
              {analysisResult && (
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                  analysisResult.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                  analysisResult.status === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                  analysisResult.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                  'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  {analysisResult.status}
                </span>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-4 text-xs">
                {/* Method & Score Metric */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Detection Mode</div>
                    <div className="text-xs font-semibold text-cyan-400 mt-0.5 font-mono">
                      {analysisResult.detection_method.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Isolation Forest Score</div>
                    <div className="text-sm font-bold text-white font-mono tabular-nums mt-0.5">
                      {analysisResult.anomaly_score.toFixed(3)}
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        (Depth: {analysisResult.isolation_depth})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Isolation Anomaly Probability</span>
                    <span className="font-mono text-white">{(analysisResult.anomaly_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${analysisResult.anomaly_score * 100}%` }}
                      className={`h-full transition-all duration-300 ${
                        analysisResult.anomaly_score > 0.75
                          ? 'bg-rose-500'
                          : analysisResult.anomaly_score > 0.60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                    <span>0.0 (Nominal)</span>
                    <span>0.60 (Suspect)</span>
                    <span>0.75 (High Anomaly)</span>
                    <span>1.0</span>
                  </div>
                </div>

                {/* Flagged Parameters */}
                <div>
                  <div className="text-[11px] text-slate-400 font-medium mb-1">Triggered Parameters:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detected_parameters.length > 0 ? (
                      analysisResult.detected_parameters.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-700">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono">None · Operating within bounds</span>
                    )}
                  </div>
                </div>

                {/* Root Cause Explanation */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-1">
                    Algorithmic Diagnosis
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {analysisResult.explanation}
                  </p>
                </div>

                {/* Actionable Recommendation */}
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                  <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                    Recommended Maintenance Action
                  </div>
                  <p className="text-cyan-200/90 text-[11px] leading-relaxed">
                    {analysisResult.recommended_action}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Adjust sliders or choose a benchmark vector above, then click &quot;Run Dual Anomaly Evaluation&quot; to test the machine learning engine.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
            Model: Scikit-learn Isolation Forest algorithm simulation · Evaluates normalized z-score feature space and decision tree depth.
          </div>
        </div>
      </div>
    </div>
  );
};
