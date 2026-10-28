import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Cpu,
  ShieldAlert,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const windowsCmd = `# 1. Clone repository
git clone https://github.com/pranitha-ss/predictive-maintenance-iot-ml.git
cd predictive-maintenance-iot-ml

# 2. Install dependencies
npm install

# 3. Start development full-stack server
npm run dev

# 4. Open in browser: http://localhost:3000`;

  const linuxCmd = `# 1. Clone and enter directory
git clone https://github.com/pranitha-ss/predictive-maintenance-iot-ml.git
cd predictive-maintenance-iot-ml

# 2. Install Node dependencies
npm install

# 3. Launch application server (Express + Vite)
npm run dev

# 4. Access dashboard at http://localhost:3000`;

  return (
    <div className="space-y-6">
      {/* Student & Institutional Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative shrink-0">
            <img
              src="/src/assets/images/avatar_engineer_pranitha_1793089201898.jpg"
              alt="Pranitha S S - Lead Student Researcher"
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-xl object-cover border-2 border-cyan-500/50 shadow-xl"
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-cyan-500 text-slate-950 p-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <GraduationCap className="w-4 h-4" />
              <span>Final Year B.E. Capstone Engineering Project</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Predictive Maintenance System Using IoT and Machine Learning
            </h1>
            <div className="text-xs text-slate-300 font-medium">
              Student Researcher: <strong className="text-white">Pranitha S S</strong>
            </div>
            <div className="text-xs text-slate-400">
              Department of Computer Science and Engineering ·{' '}
              <span className="text-cyan-400 font-medium">KIT – Kalaignarkarunanidhi Institute of Technology (KIT-CBE)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement vs Proposed Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Approach / Problem Statement */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Problem Statement & Legacy Approach</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2">
              The Cost of Reactive & Fixed-Schedule Maintenance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Traditional manufacturing facilities predominantly rely on <em>corrective maintenance</em> (running machinery until catastrophic failure occurs) or <em>time-based preventive maintenance</em> (servicing equipment on arbitrary calendar intervals regardless of actual wear).
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">·</span>
                <span>Unplanned downtime costs industrial plants thousands of dollars per hour.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">·</span>
                <span>Premature parts replacement wastes usable component lifespan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">·</span>
                <span>Delayed fault detection risks complete motor seizure and operator hazards.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Proposed Solution */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Proposed IoT & ML Solution</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2">
              Continuous Condition-Based Predictive Health
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              This system introduces continuous IoT telemetry monitoring combined with dual-tier anomaly detection: combining strict ISO 10816 threshold limits with an unsupervised Scikit-learn Isolation Forest algorithm to detect subtle abnormal operational dynamics before physical failure.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time thermal and tri-axial vibration telemetry ingestion.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multi-parameter Isolation Forest scoring detecting anomalous covariance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated severity dispatch (LOW, MEDIUM, HIGH, CRITICAL) for technicians.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Primary Objectives & Core Modules */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Project Objectives & Implemented Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">1. Telemetry Monitoring</div>
            <p className="text-slate-400 mt-1">Continuous ingestion of temperature, vibration, current, and RPM across machine bays.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">2. Dual Anomaly Detection</div>
            <p className="text-slate-400 mt-1">ISO threshold boundaries combined with unsupervised Isolation Forest path depth analysis.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">3. Alert Lifecycle Manager</div>
            <p className="text-slate-400 mt-1">Four-tier severity triage with technician acknowledgment, resolution logging, and audit tracking.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">4. Historical Time-Series</div>
            <p className="text-slate-400 mt-1">Trend trajectory curves, fleet condition comparisons, and CSV telemetry exports.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">5. Machine Fleet Registry</div>
            <p className="text-slate-400 mt-1">Custom machine registration, per-unit threshold configuration, and active monitoring controls.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-semibold text-cyan-400">6. Hardware Integration API</div>
            <p className="text-slate-400 mt-1">Direct REST endpoint for physical ESP32 and Raspberry Pi nodes with cURL and C++ code generator.</p>
          </div>
        </div>
      </div>

      {/* Advantages, Limitations & Future Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Advantages */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="font-bold text-white text-sm mb-2 text-emerald-400">Project Advantages</div>
          <ul className="space-y-1.5 text-slate-300">
            <li>✓ Early incipient fault warning hours or days prior to seizure.</li>
            <li>✓ Unsupervised learning handles unlabeled industrial operational states.</li>
            <li>✓ Lightweight architecture runs efficiently on edge gateways or local PCs.</li>
            <li>✓ Open REST interface connects seamlessly with legacy PLC systems.</li>
          </ul>
        </div>

        {/* Limitations */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="font-bold text-white text-sm mb-2 text-amber-400">Prototype Limitations</div>
          <ul className="space-y-1.5 text-slate-300">
            <li>⚠ Thresholds require baseline calibration per machine class and mounting rigidity.</li>
            <li>⚠ Academic prototype relies on statistical models and simulated feature sets.</li>
            <li>⚠ Does not directly account for ambient seasonal temperature swings.</li>
            <li>⚠ Single-point accelerometer does not capture all gear mesh harmonics.</li>
          </ul>
        </div>

        {/* Future Enhancements */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="font-bold text-white text-sm mb-2 text-cyan-400">Future Enhancements</div>
          <ul className="space-y-1.5 text-slate-300">
            <li>→ Remaining Useful Life (RUL) estimation using LSTM or Temporal CNNs.</li>
            <li>→ TinyML deployment directly onto ESP32 microcontroller cores.</li>
            <li>→ Integration with acoustic ultrasound emission sensors.</li>
            <li>→ MQTT broker with TLS mutual authentication for enterprise hardening.</li>
          </ul>
        </div>
      </div>

      {/* Local Execution Instructions for Windows & Linux */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Local Execution & Installation Instructions</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Windows & Linux</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Windows (PowerShell / Command Prompt)</span>
              <button
                onClick={() => copyCommand(windowsCmd, 'win')}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copiedCmd === 'win' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'win' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
              {windowsCmd}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Linux / macOS (Bash Shell)</span>
              <button
                onClick={() => copyCommand(linuxCmd, 'nix')}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copiedCmd === 'nix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'nix' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
              {linuxCmd}
            </pre>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-800/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-400 block mb-0.5">Academic Prototype Disclaimer:</strong>
          This system was created by Pranitha S S for condition monitoring and early anomaly detection in an academic engineering context. It is an engineering prototype and not an IEC 61508 / SIL-rated certified industrial safety system. Machine thresholds must be calibrated to specific mechanical installations and operating loads. The system does not guarantee prevention or detection of every mechanical failure.
        </div>
      </div>
    </div>
  );
};
