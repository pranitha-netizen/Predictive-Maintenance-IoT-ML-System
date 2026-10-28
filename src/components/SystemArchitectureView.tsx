import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Radio,
  Server,
  Database,
  BrainCircuit,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const SystemArchitectureView: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  const layers = [
    {
      id: 1,
      title: '1. Sensing Layer',
      subtitle: 'Transducers & Physical Data Acquisition',
      icon: Cpu,
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20',
      hardware: ['Dallas DS18B20 1-Wire Digital Thermometer (±0.5°C)', 'MPU6050 3-Axis Accelerometer / Gyroscope', 'ADXL345 High-Resolution Accelerometer', 'Non-invasive Current Transformer (SCT-013)'],
      description: 'Physical transducers mounted directly on critical mechanical locations—specifically drive-end and non-drive-end bearing casings of electric induction motors, centrifugal pump housings, and conveyor drive gearboxes. Measures high-frequency vibration accelerations (converted to RMS velocity mm/s) and bearing housing thermal rise.',
      protocols: '1-Wire, I2C, SPI Bus, Analog 0-5V ADC'
    },
    {
      id: 2,
      title: '2. Edge & Communication Layer',
      subtitle: 'Microcontroller & Transport Protocol',
      icon: Radio,
      color: 'border-blue-500/40 text-blue-400 bg-blue-950/20',
      hardware: ['Espressif ESP32 Dual-Core Tensilica Xtensa LX6 (240 MHz)', 'Raspberry Pi 4 Model B Embedded Gateway', '2.4 GHz 802.11 b/g/n Wi-Fi Transceiver', 'MQTT Client / HTTP REST Client'],
      description: 'Collects raw ADC and digital register samples from sensors at 100 Hz, performs anti-aliasing filtering, computes Root Mean Square (RMS) vibration velocity in mm/s compliant with ISO 10816, packages payloads into structured JSON, and dispatches via HTTP POST or MQTT broker topic (e.g. factory/bayA/machine/M001/telemetry).',
      protocols: 'HTTP/1.1 POST, MQTT v3.1.1 with QoS 1, TLS 1.3'
    },
    {
      id: 3,
      title: '3. Data Processing Layer',
      subtitle: 'Ingestion, Validation & Feature Engineering',
      icon: Server,
      color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20',
      hardware: ['Node.js / Express Server', 'FastAPI / Python Gateway Engine', 'Zod / JSON Schema Input Validator', 'Moving Average & Crest Factor Computer'],
      description: 'Validates input telemetry types and physical bounds (-20°C to 150°C, 0 to 50 mm/s), rejects malformed sensor packets, and extracts rolling statistical features (5-point moving average temperature, vibration velocity change rate ΔV/Δt, and thermal gradient ΔT/Δt) required for multi-variate modeling.',
      protocols: 'RESTful API (/api/readings), CORS, Bearer Token Auth'
    },
    {
      id: 4,
      title: '4. Storage Layer',
      subtitle: 'Relational Database & Historical Persistence',
      icon: Database,
      color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
      hardware: ['SQLite Relational Database Engine', 'ACID Transactions & Write-Ahead Logging (WAL)', 'Extensible MySQL Schema Migration Ready', 'JSON Document Snapshots'],
      description: 'Maintains durable relational entities: Machines, Sensors, Sensor_Readings, Anomaly_Events, Maintenance_Alerts, and Maintenance_Records. Supports rapid indexed time-series queries for charting and historical auditability.',
      protocols: 'SQLite SQL Dialect, Parameterized Prepared Queries'
    },
    {
      id: 5,
      title: '5. Analytics & ML Layer',
      subtitle: 'Isolation Forest & Threshold Classification',
      icon: BrainCircuit,
      color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
      hardware: ['Scikit-learn Isolation Forest Unsupervised Model', 'ISO 10816-3 Mechanical Vibration Boundaries', 'Mahalanobis Covariance Distance Metric', 'Z-Score Normalization Engine'],
      description: 'Executes dual-pipeline anomaly evaluation. First, checks machine-specific Warning and Critical boundaries. Second, projects multi-parameter features [Temp_z, Vib_z, Combined_Covariance] into an ensemble of 100 Isolation Trees to identify unusual operational signatures before hard thresholds are crossed.',
      protocols: 'Python Scikit-learn / NumPy / In-Engine Inference Engine'
    },
    {
      id: 6,
      title: '6. Alert & Presentation Layer',
      subtitle: 'Industrial Human-Machine Interface (HMI)',
      icon: Bell,
      color: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
      hardware: ['React 19 Interactive Dashboard', 'Tailwind CSS Dark Theme & Industry 4.0 Aesthetics', 'Chart.js & SVG Telemetry Curves', 'Alert Dispatcher & Technician Action Portal'],
      description: 'Renders actionable visual intelligence for maintenance engineers. Dispatches severity-rated alerts (LOW, MEDIUM, HIGH, CRITICAL), presents real-time trend plots, supports technician acknowledgment with repair notes, and provides CSV data export for engineering audits.',
      protocols: 'SSE / Polling Telemetry Sync, CSV RFC 4180'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Full-Stack IoT & Edge Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Six-Layer System Architecture & Data Flow
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              From physical transducer excitation on industrial equipment to real-time machine learning inference and operator dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End Visual Dataflow Pipe */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
        <div className="text-xs font-semibold text-slate-300 mb-3">
          End-to-End Real-Time Data Pipeline:
        </div>
        <div className="flex items-center gap-2 min-w-[750px] text-xs">
          {[
            { label: 'Industrial Machine', sub: 'Induction Motor / Pump' },
            { label: 'IoT Sensors', sub: 'DS18B20 & MPU6050' },
            { label: 'Edge Controller', sub: 'ESP32 / Raspberry Pi' },
            { label: 'HTTP / MQTT API', sub: 'JSON Telemetry Packets' },
            { label: 'Feature Extraction', sub: 'Rolling Averages & Rates' },
            { label: 'Dual Detection', sub: 'Isolation Forest & Limits' },
            { label: 'Technician Dashboard', sub: 'Alerts & Live Trends' }
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex-1 text-center">
                <div className="font-semibold text-slate-200 text-[11px] truncate">{step.label}</div>
                <div className="text-[10px] text-cyan-400 mt-0.5 font-mono truncate">{step.sub}</div>
              </div>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 6 Layers Grid & Detailed Layer Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Selection Column */}
        <div className="space-y-2.5">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${layer.color} border shadow-lg`
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-950 border ${isSelected ? 'border-cyan-500/50' : 'border-slate-800'}`}>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{layer.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{layer.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Detailed Specs */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          {(() => {
            const current = layers.find((l) => l.id === selectedLayer) || layers[0];
            const Icon = current.icon;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{current.title}</h3>
                    <p className="text-xs text-cyan-400 font-mono">{current.subtitle}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  {current.description}
                </div>

                {/* Hardware & Components List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wider text-[10px]">
                    Hardware Specifications & Components:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {current.hardware.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protocol Info */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-0.5">
                    Interface Protocols & Standards
                  </span>
                  <span className="text-cyan-300 font-mono text-[11px]">{current.protocols}</span>
                </div>

                {/* Visual Rig Image for Sensing / Hardware Layer */}
                {current.id === 1 && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src="/src/assets/images/industrial_motor_sensor_rig_1793089202471.jpg"
                      alt="Industrial Motor Sensor Rig with Tri-Axial Accelerometer and Thermocouple"
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-2 bg-slate-950 text-[10px] text-slate-400 text-center font-mono">
                      Experimental Rig: Tri-axial piezoelectric accelerometer and RTD thermocouple on induction motor bearing
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
