import React, { useState } from 'react';
import {
  Cpu,
  Send,
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Server,
  ArrowRight,
  Database,
  Radio
} from 'lucide-react';
import { Machine, SensorReading } from '../types/index.ts';

interface IoTSensorModuleViewProps {
  machines: Machine[];
  readings: SensorReading[];
  onInjectReading: (reading: {
    machine_id: string;
    temperature: number;
    vibration: number;
    motor_current_a?: number;
    speed_rpm?: number;
    sensor_id?: string;
    is_demo: boolean;
  }) => Promise<void>;
}

export const IoTSensorModuleView: React.FC<IoTSensorModuleViewProps> = ({
  machines,
  readings,
  onInjectReading
}) => {
  // Manual Reading Form State
  const [selectedMachine, setSelectedMachine] = useState<string>(machines[0]?.machine_id || 'M001');
  const [sensorId, setSensorId] = useState<string>('S001-AUTO');
  const [sensorType, setSensorType] = useState<string>('Temperature + Vibration');
  const [temperature, setTemperature] = useState<string>('62.5');
  const [vibration, setVibration] = useState<string>('2.8');
  const [motorCurrent, setMotorCurrent] = useState<string>('14.5');
  const [speedRpm, setSpeedRpm] = useState<string>('1480');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'arduino'>('curl');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const tempNum = parseFloat(temperature);
    const vibNum = parseFloat(vibration);
    const currentNum = motorCurrent ? parseFloat(motorCurrent) : 14.0;
    const speedNum = speedRpm ? parseInt(speedRpm, 10) : 1500;

    if (isNaN(tempNum)) {
      setErrorMsg('Please enter a valid numeric temperature value.');
      return;
    }
    if (tempNum < -20 || tempNum > 150) {
      setErrorMsg('Temperature must be between -20°C and 150°C.');
      return;
    }

    if (isNaN(vibNum)) {
      setErrorMsg('Please enter a valid numeric vibration magnitude.');
      return;
    }
    if (vibNum < 0 || vibNum > 50) {
      setErrorMsg('Vibration must be between 0 and 50 mm/s.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onInjectReading({
        machine_id: selectedMachine,
        sensor_id: sensorId,
        temperature: tempNum,
        vibration: vibNum,
        motor_current_a: currentNum,
        speed_rpm: speedNum,
        is_demo: false // Tagged as manual hardware test reading
      });
      setSuccessMsg(`Reading successfully ingested for ${selectedMachine}! Evaluated by threshold & ML engine.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit sensor reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCodeSnippet = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    if (selectedLanguage === 'curl') {
      return `curl -X POST "${origin}/api/readings" \\
  -H "Content-Type: application/json" \\
  -d '{
    "machine_id": "${selectedMachine}",
    "sensor_id": "ESP32-NODE-01",
    "temperature": ${temperature || '62.5'},
    "vibration": ${vibration || '2.8'},
    "motor_current_a": ${motorCurrent || '14.5'},
    "speed_rpm": ${speedRpm || '1480'},
    "is_demo": false
  }'`;
    }
    if (selectedLanguage === 'python') {
      return `import requests
import json
import time

API_URL = "${origin}/api/readings"

payload = {
    "machine_id": "${selectedMachine}",
    "sensor_id": "RPI-SENSOR-EDGE",
    "temperature": ${temperature || '62.5'},
    "vibration": ${vibration || '2.8'},
    "motor_current_a": ${motorCurrent || '14.5'},
    "speed_rpm": ${speedRpm || '1480'},
    "is_demo": False
}

response = requests.post(API_URL, json=payload)
print(f"Status Code: {response.status_code}")
print("Server Response:", response.json())`;
    }
    return `// Arduino / ESP32 Sensor Telemetry Ingestion Sketch
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "KIT_LAB_WIFI";
const char* password = "lab_password";
const char* serverUrl = "${origin}/api/readings";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\\"machine_id\\":\\"${selectedMachine}\\",";
    json += "\\"temperature\\":${temperature || '62.5'},";
    json += "\\"vibration\\":${vibration || '2.8'},";
    json += "\\"is_demo\\":false}";

    int httpCode = http.POST(json);
    Serial.printf("Response Code: %d\\n", httpCode);
    http.end();
  }
  delay(2000); // Poll sensors every 2 seconds
}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* End-to-End IoT Pipeline Schematic */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">IoT Ingestion Pipeline Architecture</h2>
            <p className="text-xs text-slate-400">Continuous telemetry flow from physical transducers to ML analytics</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Endpoint: /api/readings Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-cyan-400 uppercase">1. Transducers</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">DS18B20 & MPU6050</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Analog / I2C Signals</div>
          </div>
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-cyan-400 uppercase">2. Edge Controller</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">ESP32 / Raspberry Pi</div>
            <div className="text-[10px] text-slate-500 mt-0.5">ADC, Filtering & Wi-Fi</div>
          </div>
          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-cyan-400 uppercase">3. Ingestion Server</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Express & SQLite</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Validation & ML Scorer</div>
          </div>
        </div>
      </div>

      {/* Manual Sensor-Reading Submission Form & API Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Ingestion Form */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Manual Sensor Reading Ingestion</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Test the entire validation, threshold alert, and ML anomaly engine workflow by injecting custom telemetry.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Machine ID</label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {machines.map((m) => (
                    <option key={m.machine_id} value={m.machine_id}>
                      {m.machine_id} - {m.machine_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Sensor Identifier</label>
                <input
                  type="text"
                  value={sensorId}
                  onChange={(e) => setSensorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. S001-TMP"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. 62.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Vibration Velocity (mm/s)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vibration}
                  onChange={(e) => setVibration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. 2.80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Motor Current (Amperes)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={motorCurrent}
                  onChange={(e) => setMotorCurrent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. 14.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Rotational Speed (RPM)
                </label>
                <input
                  type="number"
                  value={speedRpm}
                  onChange={(e) => setSpeedRpm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="e.g. 1480"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Evaluating & Ingesting...' : 'Ingest Sensor Reading'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Hardware API Integration Documentation */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">External Hardware Integration</h3>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Transmit live telemetry directly from edge hardware (ESP32, Raspberry Pi, Arduino) using REST POST:
            </p>

            {/* Language Switcher */}
            <div className="flex gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-3 text-xs">
              {(['curl', 'python', 'arduino'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex-1 py-1 px-2.5 rounded font-mono uppercase text-[11px] transition-colors cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56">
              {getCodeSnippet()}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span>Payload format: JSON · Method: POST · Content-Type: application/json</span>
          </div>
        </div>
      </div>

      {/* Recent Sensor Ingestion History Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Telemetry Ingestions Across Factory</h3>
          <span className="text-xs text-slate-400 font-mono">{readings.length} Logged Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-medium">Reading ID</th>
                <th className="py-2.5 px-4 font-medium">Machine</th>
                <th className="py-2.5 px-4 font-medium">Sensor ID</th>
                <th className="py-2.5 px-4 font-medium text-right">Temp (°C)</th>
                <th className="py-2.5 px-4 font-medium text-right">Vib (mm/s)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Source</th>
                <th className="py-2.5 px-4 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {readings.slice(0, 10).map((r) => (
                <tr key={r.reading_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-cyan-400">{r.reading_id}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-200">{r.machine_id}</td>
                  <td className="py-2.5 px-4 text-slate-400">{r.sensor_id || '—'}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-200">{r.temperature.toFixed(1)}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-200">{r.vibration.toFixed(2)}</td>
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
                  <td className="py-2.5 px-4 text-[10px]">
                    {r.is_demo ? (
                      <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                        DEMO SIM
                      </span>
                    ) : (
                      <span className="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        MANUAL / HARDWARE
                      </span>
                    )}
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
