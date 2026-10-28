import React, { useState, useEffect } from 'react';
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  Radio
} from 'lucide-react';
import { Machine, SensorReading } from '../types/index.ts';

interface LiveMonitoringViewProps {
  machines: Machine[];
  selectedMachineId: string;
  onSelectMachineId: (id: string) => void;
  readings: SensorReading[];
  isSimulating: boolean;
  toggleSimulation: () => void;
  simulationSpeedMs: number;
  setSimulationSpeedMs: (ms: number) => void;
  onInjectReading: (reading: {
    machine_id: string;
    temperature: number;
    vibration: number;
    motor_current_a?: number;
    speed_rpm?: number;
    is_demo: boolean;
  }) => Promise<void>;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  machines,
  selectedMachineId,
  onSelectMachineId,
  readings,
  isSimulating,
  toggleSimulation,
  simulationSpeedMs,
  setSimulationSpeedMs,
  onInjectReading
}) => {
  const currentMachine = machines.find((m) => m.machine_id === selectedMachineId) || machines[0];
  const machineReadings = readings
    .filter((r) => r.machine_id === currentMachine?.machine_id)
    .slice(0, 15);

  const latestReading = machineReadings[0];
  const currentTemp = latestReading?.temperature ?? currentMachine?.current_temp ?? 58.0;
  const currentVib = latestReading?.vibration ?? currentMachine?.current_vibration ?? 2.1;
  const currentSpeed = latestReading?.speed_rpm ?? currentMachine?.current_speed_rpm ?? 1490;
  const currentCurrent = latestReading?.motor_current_a ?? currentMachine?.current_motor_current_a ?? 14.2;

  // Preset quick fault injection state
  const [injectTemp, setInjectTemp] = useState<number>(currentTemp);
  const [injectVib, setInjectVib] = useState<number>(currentVib);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  useEffect(() => {
    setInjectTemp(currentTemp);
    setInjectVib(currentVib);
  }, [currentMachine?.machine_id]);

  const handleQuickInject = async (temp: number, vib: number) => {
    setIsInjecting(true);
    try {
      await onInjectReading({
        machine_id: currentMachine.machine_id,
        temperature: temp,
        vibration: vib,
        motor_current_a: currentCurrent + (vib > 4.5 ? 3.5 : 0),
        speed_rpm: currentSpeed - (vib > 4.5 ? 40 : 0),
        is_demo: true
      });
    } finally {
      setIsInjecting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/80 border-rose-800/80';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/80 border-orange-800/80';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  // SVG Trend Path Calculation for Responsive Clean Charts
  const chartReadings = [...machineReadings].reverse();
  const maxTemp = Math.max(90, ...chartReadings.map((r) => r.temperature), currentMachine.temp_critical_threshold + 5);
  const minTemp = Math.min(30, ...chartReadings.map((r) => r.temperature));
  const maxVib = Math.max(10, ...chartReadings.map((r) => r.vibration), currentMachine.vibration_critical_threshold + 1);

  const getSvgCoordinates = (values: number[], minVal: number, maxVal: number, width = 360, height = 110) => {
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

  const tempPoints = chartReadings.map((r) => r.temperature);
  const vibPoints = chartReadings.map((r) => r.vibration);
  const tempPath = getSvgCoordinates(tempPoints, minTemp, maxTemp);
  const vibPath = getSvgCoordinates(vibPoints, 0, maxVib);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar: Machine Selector & Simulation Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Asset:
          </label>
          <select
            value={currentMachine?.machine_id}
            onChange={(e) => onSelectMachineId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-cyan-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {machines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_id} — {m.machine_name} ({m.machine_type})
              </option>
            ))}
          </select>
        </div>

        {/* Real-Time Simulation Interval & Stream Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
              DEMO DATA SIMULATION
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-1.5">Interval:</span>
            {[1000, 2000, 5000].map((ms) => (
              <button
                key={ms}
                onClick={() => setSimulationSpeedMs(ms)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  simulationSpeedMs === ms
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Asset Header Info */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
              {currentMachine.machine_id}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300">{currentMachine.location}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {currentMachine.machine_name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Class II Industrial Asset · Monitored via Thermocouple & Accelerometer
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Asset Condition</div>
            <div className={`mt-0.5 px-2.5 py-1 rounded text-xs font-mono font-bold border inline-block ${getStatusColor(currentMachine.status)}`}>
              {currentMachine.status}
            </div>
          </div>
          <div className="text-right pl-4 border-l border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Last Telemetry</div>
            <div className="text-xs font-mono text-slate-300 mt-1">
              {new Date(currentMachine.last_updated).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Live Telemetry Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Gauge Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Bearing Temperature
            </span>
            <span className="text-[11px] font-mono text-slate-500">DS18B20</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {currentTemp.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">°C</span>
          </div>
          {/* Threshold Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${Math.min(100, (currentTemp / 100) * 100)}%` }}
                className={`h-full transition-all duration-300 ${
                  currentTemp >= currentMachine.temp_critical_threshold
                    ? 'bg-rose-500'
                    : currentTemp >= currentMachine.temp_warning_threshold
                    ? 'bg-amber-500'
                    : 'bg-cyan-500'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Warn: {currentMachine.temp_warning_threshold}°C</span>
              <span>Crit: {currentMachine.temp_critical_threshold}°C</span>
            </div>
          </div>
        </div>

        {/* Vibration Magnitude Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-cyan-400" />
              Vibration Velocity
            </span>
            <span className="text-[11px] font-mono text-slate-500">MPU6050</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {currentVib.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-400">mm/s</span>
          </div>
          {/* Vibration Progress Bar */}
          <div className="mt-3 space-y-1">
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${Math.min(100, (currentVib / 10) * 100)}%` }}
                className={`h-full transition-all duration-300 ${
                  currentVib >= currentMachine.vibration_critical_threshold
                    ? 'bg-rose-500'
                    : currentVib >= currentMachine.vibration_warning_threshold
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Warn: {currentMachine.vibration_warning_threshold} mm/s</span>
              <span>Crit: {currentMachine.vibration_critical_threshold} mm/s</span>
            </div>
          </div>
        </div>

        {/* Motor Current */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-cyan-400" />
              Motor Current
            </span>
            <span className="text-[11px] font-mono text-slate-500">CT Sensor</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {currentCurrent.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-400">Amperes</span>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500">
            Nominal full load: 15.0 A (Torque Index: {((currentCurrent / 15.0) * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Rotational Speed */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Rotational Speed
            </span>
            <span className="text-[11px] font-mono text-slate-500">Optical Tach</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {currentSpeed}
            </span>
            <span className="text-sm font-semibold text-slate-400">RPM</span>
          </div>
          <div className="mt-3 text-[10px] font-mono text-slate-500">
            Slip factor: {(1 - currentSpeed / 1500).toFixed(3)} · Nominal: 1500 RPM
          </div>
        </div>
      </div>

      {/* Real-Time Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature Trend */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Temperature Trend (°C)</h3>
              <p className="text-xs text-slate-400">Real-time thermal trajectory with ISO warning boundaries</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {currentTemp.toFixed(1)}°C Live
            </span>
          </div>

          <div className="h-32 w-full bg-slate-950 rounded-lg p-2 relative flex items-center justify-center border border-slate-800/80">
            {tempPath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 360 110" preserveAspectRatio="none">
                {/* Critical threshold line */}
                <line
                  x1="0"
                  y1={110 - ((currentMachine.temp_critical_threshold - minTemp) / Math.max(1, maxTemp - minTemp)) * 110}
                  x2="360"
                  y2={110 - ((currentMachine.temp_critical_threshold - minTemp) / Math.max(1, maxTemp - minTemp)) * 110}
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                {/* Warning threshold line */}
                <line
                  x1="0"
                  y1={110 - ((currentMachine.temp_warning_threshold - minTemp) / Math.max(1, maxTemp - minTemp)) * 110}
                  x2="360"
                  y2={110 - ((currentMachine.temp_warning_threshold - minTemp) / Math.max(1, maxTemp - minTemp)) * 110}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Data line */}
                <path d={tempPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Accumulating telemetry points...</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>Range: {minTemp.toFixed(0)}°C — {maxTemp.toFixed(0)}°C</span>
            <div className="flex items-center gap-3">
              <span className="text-amber-400">--- Warning ({currentMachine.temp_warning_threshold}°C)</span>
              <span className="text-rose-400">--- Critical ({currentMachine.temp_critical_threshold}°C)</span>
            </div>
          </div>
        </div>

        {/* Vibration Trend */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Vibration Amplitude (mm/s)</h3>
              <p className="text-xs text-slate-400">RMS velocity telemetry assessing bearing wear & unbalance</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {currentVib.toFixed(2)} mm/s Live
            </span>
          </div>

          <div className="h-32 w-full bg-slate-950 rounded-lg p-2 relative flex items-center justify-center border border-slate-800/80">
            {vibPath ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 360 110" preserveAspectRatio="none">
                {/* Critical threshold line */}
                <line
                  x1="0"
                  y1={110 - (currentMachine.vibration_critical_threshold / maxVib) * 110}
                  x2="360"
                  y2={110 - (currentMachine.vibration_critical_threshold / maxVib) * 110}
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                {/* Warning threshold line */}
                <line
                  x1="0"
                  y1={110 - (currentMachine.vibration_warning_threshold / maxVib) * 110}
                  x2="360"
                  y2={110 - (currentMachine.vibration_warning_threshold / maxVib) * 110}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Data line */}
                <path d={vibPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Accumulating telemetry points...</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>Scale: 0 — {maxVib.toFixed(1)} mm/s RMS</span>
            <div className="flex items-center gap-3">
              <span className="text-amber-400">--- Warning ({currentMachine.vibration_warning_threshold} mm/s)</span>
              <span className="text-rose-400">--- Critical ({currentMachine.vibration_critical_threshold} mm/s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Reading Injection & Fault Scenario Simulator */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Interactive Scenario & Fault Simulation Controls</h3>
          </div>
          <span className="text-xs text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            Demonstration Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            disabled={isInjecting}
            onClick={() => handleQuickInject(58.2, 2.1)}
            className="p-3 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-emerald-400">Scenario 1: Nominal Baseline</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Temp: 58.2°C · Vib: 2.1 mm/s</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Expected: NORMAL</div>
          </button>

          <button
            disabled={isInjecting}
            onClick={() => handleQuickInject(68.4, 4.2)}
            className="p-3 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-amber-400">Scenario 2: Warning Drift</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Temp: 68.4°C · Vib: 4.2 mm/s</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Expected: WARNING</div>
          </button>

          <button
            disabled={isInjecting}
            onClick={() => handleQuickInject(74.9, 7.8)}
            className="p-3 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
          >
            <div className="text-xs font-semibold text-rose-400">Scenario 3: Severe Bearing Failure</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Temp: 74.9°C · Vib: 7.8 mm/s</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Expected: HIGH / CRITICAL</div>
          </button>
        </div>
      </div>

      {/* Recent Sensor Stream Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Live Sensor Ingestion Log ({currentMachine.machine_id})</h3>
          <span className="text-xs text-slate-400 font-mono">Latest 15 Telemetry Samples</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-medium">Reading ID</th>
                <th className="py-2.5 px-4 font-medium text-right">Temp (°C)</th>
                <th className="py-2.5 px-4 font-medium text-right">Vib (mm/s)</th>
                <th className="py-2.5 px-4 font-medium text-right">Current (A)</th>
                <th className="py-2.5 px-4 font-medium text-right">Speed (RPM)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {machineReadings.map((r) => (
                <tr key={r.reading_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-cyan-400">{r.reading_id}</td>
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
                    {new Date(r.recorded_at).toLocaleTimeString()}
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
