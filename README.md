# Predictive Maintenance System Using IoT and Machine Learning

**Academic Engineering Capstone Project**  
- **Student Researcher:** Pranitha S S  
- **Department:** Computer Science and Engineering  
- **Institution:** KIT – Kalaignarkarunanidhi Institute of Technology (KIT-CBE), Coimbatore, Tamil Nadu, India  

---

## 1. Project Overview

The **Predictive Maintenance System Using IoT and Machine Learning** is an industrial condition-monitoring platform engineered to detect incipient machine faults before catastrophic breakdown occurs. By acquiring continuous temperature, vibration velocity (RMS), rotational speed, and current telemetry from machine bearings, the system combines **configurable threshold limits** with **unsupervised Scikit-learn Isolation Forest anomaly detection** to alert maintenance personnel with four severity tiers (LOW, MEDIUM, HIGH, CRITICAL).

### Key Objectives
1. **Continuous Industrial Monitoring:** Real-time ingestion of thermal and vibration dynamics.
2. **Dual-Tier Anomaly Detection:** Combining ISO 10816 mechanical vibration limits with multivariate Isolation Forest outlier scoring.
3. **Automated Alert Dispatch:** Severity classification and guided diagnostic protocols for technicians.
4. **Historical Trend Analysis:** Tracking thermal and vibration trajectories with CSV export capability.
5. **Durable Maintenance Logging:** Recording work orders linked to machine incident alerts.

---

## 2. System Architecture

The system is organized into six functional layers:

```
[ Industrial Machine ] (Induction Motor / Water Pump / Conveyor)
        │
        ▼
[ Layer 1: Sensing Layer ] (DS18B20 Thermocouple & MPU6050 Accelerometer)
        │
        ▼
[ Layer 2: Edge & Communication ] (ESP32 / Raspberry Pi -> HTTP / MQTT)
        │
        ▼
[ Layer 3: Data Processing Layer ] (Express API Validation & Feature Extraction)
        │
        ▼
[ Layer 4: Storage Layer ] (Persistent Relational Schema in SQLite)
        │
        ▼
[ Layer 5: Analytics & ML Layer ] (Isolation Forest & Threshold Verification)
        │
        ▼
[ Layer 6: Alert & Presentation Layer ] (React 19 Dashboard & Alert Manager)
```

---

## 3. Pre-Seeded Benchmark Test Cases

The application initializes with the exact benchmark dataset from the project report:

| Machine ID | Machine Name | Temperature | Vibration | Expected Status | Condition Signature |
|---|---|---:|---:|:---:|---|
| **M001** | Industrial Motor | 58.2 °C | 2.1 mm/s | **NORMAL** | Nominal Baseline Operation |
| **M001** | Industrial Motor | 61.7 °C | 2.6 mm/s | **NORMAL** | Light Thermal Drift |
| **M001** | Industrial Motor | 68.4 °C | 4.2 mm/s | **WARNING** | Warning Threshold Exceeded |
| **M001** | Industrial Motor | 74.9 °C | 7.8 mm/s | **HIGH** | Incipient Bearing Seizure |
| **M002** | Centrifugal Pump | 55.6 °C | 1.9 mm/s | **NORMAL** | Pump Baseline Nominal |

---

## 4. REST API Documentation

The server exposes comprehensive REST endpoints on `/api`:

### Machines
- `GET /api/machines`: Retrieve all registered machines.
- `POST /api/machines`: Register a new machine with custom warning and critical limits.
- `GET /api/machines/:id`: Retrieve single machine details.
- `PUT /api/machines/:id`: Update machine name, location, and thresholds.

### Sensor Telemetry
- `GET /api/readings`: Fetch historical sensor readings with optional query filters (`machine_id`, `limit`, `date_from`, `date_to`).
- `GET /api/readings/latest`: Retrieve latest reading for every machine.
- `POST /api/readings`: Ingest new sensor reading. Automatically triggers the threshold and ML anomaly engine, records anomaly events, and issues maintenance alerts.

#### Sample Ingestion Request:
```bash
curl -X POST "http://localhost:3000/api/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id": "M001",
    "sensor_id": "ESP32-NODE-01",
    "temperature": 74.9,
    "vibration": 7.8,
    "motor_current_a": 18.6,
    "speed_rpm": 1475,
    "is_demo": false
  }'
```

#### Sample Response:
```json
{
  "reading": {
    "reading_id": "RD-1004",
    "machine_id": "M001",
    "sensor_id": "ESP32-NODE-01",
    "temperature": 74.9,
    "vibration": 7.8,
    "status": "HIGH",
    "recorded_at": "2026-10-27T08:15:00.000Z",
    "anomaly_score": 0.88
  },
  "alert": {
    "alert_id": "ALT-3001",
    "machine_id": "M001",
    "severity": "HIGH",
    "alert_message": "[HIGH] M001 - Industrial Induction Motor: Temperature Critical (≥74°C), Vibration Critical (≥7.0 mm/s)",
    "recommended_action": "Immediately halt conveyor line 1 feed. Inspect bearing grease condition and check for rotor eccentricity."
  }
}
```

### ML Anomaly Inference
- `POST /api/analyze`: Ad-hoc feature decomposition and Isolation Forest evaluation.

### Maintenance Alerts & Records
- `GET /api/alerts`: List alerts with optional filters (`severity`, `machine_id`, `status`).
- `PATCH /api/alerts/:id`: Acknowledge or Resolve an incident.
- `GET /api/maintenance-records`: List historical maintenance work orders.
- `POST /api/maintenance-records`: Log a new maintenance action.
- `GET /api/export/csv?type=readings|alerts`: Export filtered records as RFC 4180 CSV.
- `POST /api/demo/reset`: Restore database to initial project benchmark cases.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Python** (v3.9 or higher, optional for Python ML scripts)

### Installation on Windows (PowerShell / CMD)
```powershell
# 1. Clone the project repository
git clone https://github.com/pranitha-ss/predictive-maintenance-iot-ml.git
cd predictive-maintenance-iot-ml

# 2. Install Node dependencies
npm install

# 3. Start development server (serves React frontend + Express API)
npm run dev

# 4. Open in browser:
# Navigate to http://localhost:3000
```

### Installation on Linux / macOS (Terminal)
```bash
# 1. Clone repository
git clone https://github.com/pranitha-ss/predictive-maintenance-iot-ml.git
cd predictive-maintenance-iot-ml

# 2. Install dependencies
npm install

# 3. Start the application
npm run dev

# 4. Open browser at http://localhost:3000
```

---

## 6. Testing Instructions

1. **Verify Baseline Telemetry:** Navigate to **Main Dashboard** and confirm M001, M002, M003, and M004 are loaded.
2. **Test Real-Time Simulation:** In the top navigation bar, click **Simulate Telemetry** and observe live SVG trend plots on **Live Monitoring**.
3. **Execute ML Anomaly Detection:** Go to **ML Anomaly Lab**, select benchmark vector `M001 · 74.9°C / 7.8 mm/s`, and click **Run Dual Anomaly Evaluation**. Verify that the Isolation Forest score reaches ~0.88 with HIGH/CRITICAL alert classification.
4. **Test External Hardware Ingestion:** Use the cURL or Python code snippet from **IoT Sensor Data** to submit a reading; verify it appears in the live table.
5. **Acknowledge and Resolve Alerts:** Go to **Alerts & Actions**, click **Acknowledge**, enter technician notes, and mark as **Resolved**.
6. **Export Data:** Navigate to **Historical Analytics** and click **Export Sensor Telemetry (CSV)** to verify data download.
7. **Reset Benchmark:** Click **Reset Benchmark** in the top bar to restore default states.

---

## 7. Academic Disclaimer

This application is an academic engineering capstone prototype developed by **Pranitha S S** at **KIT – Kalaignarkarunanidhi Institute of Technology (KIT-CBE)**. It illustrates condition monitoring and early anomaly classification for industrial equipment. It is not an IEC 61508 / SIL certified emergency shutdown safety instrumented system (SIS). Operating thresholds must always be calibrated to physical equipment ratings.
