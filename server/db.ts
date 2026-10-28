import fs from 'node:fs';
import path from 'node:path';
import {
  Machine,
  Sensor,
  SensorReading,
  AnomalyEvent,
  MaintenanceAlert,
  MaintenanceRecord,
  AnalyticsSummary,
  MachineStatus
} from '../src/types/index.js';
import { analyzeSensorTelemetry } from './ml.js';

interface DatabaseSchema {
  machines: Machine[];
  sensors: Sensor[];
  sensor_readings: SensorReading[];
  anomaly_events: AnomalyEvent[];
  maintenance_alerts: MaintenanceAlert[];
  maintenance_records: MaintenanceRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'predictive_maintenance_db.json');

// Initial benchmark dataset required by the project specification
function getInitialSeedData(): DatabaseSchema {
  const now = new Date();
  const isoMinutesAgo = (min: number) => new Date(now.getTime() - min * 60 * 1000).toISOString();
  const isoHoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600 * 1000).toISOString();

  const machines: Machine[] = [
    {
      machine_id: 'M001',
      machine_name: 'Industrial Induction Motor',
      machine_type: 'Industrial Motor',
      location: 'Workshop Bay A - Line 1',
      status: 'HIGH',
      is_monitoring: true,
      temp_warning_threshold: 65.0,
      temp_critical_threshold: 74.0,
      vibration_warning_threshold: 4.0,
      vibration_critical_threshold: 7.0,
      created_at: isoHoursAgo(72),
      last_updated: isoMinutesAgo(2),
      current_temp: 74.9,
      current_vibration: 7.8,
      current_speed_rpm: 1485,
      current_motor_current_a: 18.6
    },
    {
      machine_id: 'M002',
      machine_name: 'High-Pressure Centrifugal Water Pump',
      machine_type: 'Water Pump',
      location: 'Utility Pump Room 2',
      status: 'NORMAL',
      is_monitoring: true,
      temp_warning_threshold: 68.0,
      temp_critical_threshold: 78.0,
      vibration_warning_threshold: 4.5,
      vibration_critical_threshold: 7.5,
      created_at: isoHoursAgo(72),
      last_updated: isoMinutesAgo(4),
      current_temp: 55.6,
      current_vibration: 1.9,
      current_speed_rpm: 2950,
      current_motor_current_a: 14.1
    },
    {
      machine_id: 'M003',
      machine_name: 'Overhead Material Conveyor Drive',
      machine_type: 'Conveyor System',
      location: 'Assembly Area 3',
      status: 'WARNING',
      is_monitoring: true,
      temp_warning_threshold: 62.0,
      temp_critical_threshold: 72.0,
      vibration_warning_threshold: 3.8,
      vibration_critical_threshold: 6.5,
      created_at: isoHoursAgo(72),
      last_updated: isoMinutesAgo(5),
      current_temp: 64.2,
      current_vibration: 4.1,
      current_speed_rpm: 720,
      current_motor_current_a: 9.8
    },
    {
      machine_id: 'M004',
      machine_name: 'Heavy Duty 5-Axis CNC Milling Spindle',
      machine_type: 'CNC Milling',
      location: 'Precision Machine Shop 4',
      status: 'NORMAL',
      is_monitoring: true,
      temp_warning_threshold: 60.0,
      temp_critical_threshold: 70.0,
      vibration_warning_threshold: 3.5,
      vibration_critical_threshold: 6.0,
      created_at: isoHoursAgo(72),
      last_updated: isoMinutesAgo(8),
      current_temp: 52.4,
      current_vibration: 1.6,
      current_speed_rpm: 9600,
      current_motor_current_a: 12.3
    }
  ];

  const sensors: Sensor[] = [
    {
      sensor_id: 'S001-TMP',
      machine_id: 'M001',
      sensor_type: 'Temperature',
      unit: '°C',
      installation_date: '2026-01-15',
      model: 'Dallas DS18B20 Digital Thermocouple'
    },
    {
      sensor_id: 'S001-VIB',
      machine_id: 'M001',
      sensor_type: 'Vibration',
      unit: 'mm/s',
      installation_date: '2026-01-15',
      model: 'MPU6050 3-Axis Piezoelectric Accelerometer'
    },
    {
      sensor_id: 'S002-TMP',
      machine_id: 'M002',
      sensor_type: 'Temperature',
      unit: '°C',
      installation_date: '2026-01-20',
      model: 'PT100 Platinum RTD Sensor'
    },
    {
      sensor_id: 'S002-VIB',
      machine_id: 'M002',
      sensor_type: 'Vibration',
      unit: 'mm/s',
      installation_date: '2026-01-20',
      model: 'ADXL345 High-Resolution Accelerometer'
    },
    {
      sensor_id: 'S003-TMP',
      machine_id: 'M003',
      sensor_type: 'Temperature',
      unit: '°C',
      installation_date: '2026-02-01',
      model: 'Dallas DS18B20 Digital Thermocouple'
    },
    {
      sensor_id: 'S003-VIB',
      machine_id: 'M003',
      sensor_type: 'Vibration',
      unit: 'mm/s',
      installation_date: '2026-02-01',
      model: 'MPU6050 3-Axis Accelerometer'
    }
  ];

  // Specific benchmark readings requested by the project prompt:
  // M001 | 58.2 °C | 2.1 mm/s | NORMAL
  // M001 | 61.7 °C | 2.6 mm/s | NORMAL
  // M001 | 68.4 °C | 4.2 mm/s | WARNING
  // M001 | 74.9 °C | 7.8 mm/s | HIGH
  // M002 | 55.6 °C | 1.9 mm/s | NORMAL
  const sensor_readings: SensorReading[] = [
    {
      reading_id: 'RD-1001',
      machine_id: 'M001',
      sensor_id: 'S001-TMP',
      temperature: 58.2,
      vibration: 2.1,
      operating_value: 14.2,
      motor_current_a: 14.2,
      speed_rpm: 1490,
      status: 'NORMAL',
      is_demo: true,
      recorded_at: isoHoursAgo(5),
      anomaly_score: 0.18
    },
    {
      reading_id: 'RD-1002',
      machine_id: 'M001',
      sensor_id: 'S001-TMP',
      temperature: 61.7,
      vibration: 2.6,
      operating_value: 14.8,
      motor_current_a: 14.8,
      speed_rpm: 1488,
      status: 'NORMAL',
      is_demo: true,
      recorded_at: isoHoursAgo(3),
      anomaly_score: 0.24
    },
    {
      reading_id: 'RD-1003',
      machine_id: 'M001',
      sensor_id: 'S001-TMP',
      temperature: 68.4,
      vibration: 4.2,
      operating_value: 16.5,
      motor_current_a: 16.5,
      speed_rpm: 1482,
      status: 'WARNING',
      is_demo: true,
      recorded_at: isoHoursAgo(1),
      anomaly_score: 0.64
    },
    {
      reading_id: 'RD-1004',
      machine_id: 'M001',
      sensor_id: 'S001-TMP',
      temperature: 74.9,
      vibration: 7.8,
      operating_value: 18.6,
      motor_current_a: 18.6,
      speed_rpm: 1475,
      status: 'HIGH',
      is_demo: true,
      recorded_at: isoMinutesAgo(2),
      anomaly_score: 0.88
    },
    {
      reading_id: 'RD-1005',
      machine_id: 'M002',
      sensor_id: 'S002-TMP',
      temperature: 55.6,
      vibration: 1.9,
      operating_value: 14.1,
      motor_current_a: 14.1,
      speed_rpm: 2950,
      status: 'NORMAL',
      is_demo: true,
      recorded_at: isoMinutesAgo(4),
      anomaly_score: 0.15
    },
    {
      reading_id: 'RD-1006',
      machine_id: 'M003',
      sensor_id: 'S003-TMP',
      temperature: 64.2,
      vibration: 4.1,
      operating_value: 9.8,
      motor_current_a: 9.8,
      speed_rpm: 720,
      status: 'WARNING',
      is_demo: true,
      recorded_at: isoMinutesAgo(5),
      anomaly_score: 0.61
    },
    {
      reading_id: 'RD-1007',
      machine_id: 'M004',
      sensor_id: 'S004-TMP',
      temperature: 52.4,
      vibration: 1.6,
      operating_value: 12.3,
      motor_current_a: 12.3,
      speed_rpm: 9600,
      status: 'NORMAL',
      is_demo: true,
      recorded_at: isoMinutesAgo(8),
      anomaly_score: 0.12
    }
  ];

  // Seed Anomaly Events from the benchmark test cases
  const anomaly_events: AnomalyEvent[] = [
    {
      event_id: 'EVT-2001',
      machine_id: 'M001',
      anomaly_type: 'DUAL_THRESHOLD_EXCEEDED',
      severity: 'HIGH',
      detected_at: isoMinutesAgo(2),
      description: 'Thermal rise to 74.9°C accompanied by high vibration amplitude of 7.8 mm/s on motor bearing housing.',
      detection_method: 'HYBRID_DETECTION',
      anomaly_score: 0.88,
      temperature_val: 74.9,
      vibration_val: 7.8,
      status: 'ACTIVE'
    },
    {
      event_id: 'EVT-2002',
      machine_id: 'M001',
      anomaly_type: 'VIBRATION_EXCEEDED',
      severity: 'MEDIUM',
      detected_at: isoHoursAgo(1),
      description: 'Vibration crossed warning threshold (4.2 mm/s vs 4.0 mm/s limit) during heavy torque cycle.',
      detection_method: 'THRESHOLD_BASED',
      anomaly_score: 0.64,
      temperature_val: 68.4,
      vibration_val: 4.2,
      status: 'ACKNOWLEDGED'
    },
    {
      event_id: 'EVT-2003',
      machine_id: 'M003',
      anomaly_type: 'ISOLATION_FOREST_OUTLIER',
      severity: 'LOW',
      detected_at: isoMinutesAgo(5),
      description: 'Unusual correlation pattern between drive roller vibration and temperature rise gradient.',
      detection_method: 'MACHINE_LEARNING',
      anomaly_score: 0.61,
      temperature_val: 64.2,
      vibration_val: 4.1,
      status: 'ACTIVE'
    }
  ];

  const maintenance_alerts: MaintenanceAlert[] = [
    {
      alert_id: 'ALT-3001',
      event_id: 'EVT-2001',
      machine_id: 'M001',
      machine_name: 'Industrial Induction Motor',
      recipient: 'Maintenance Team - Pranitha S S (KIT-CBE)',
      alert_message: 'High Alert: M001 Industrial Induction Motor temperature reached 74.9°C with 7.8 mm/s vibration. Bearing failure risk.',
      severity: 'HIGH',
      sent_at: isoMinutesAgo(2),
      acknowledgement_status: 'UNACKNOWLEDGED',
      anomaly_type: 'DUAL_THRESHOLD_EXCEEDED',
      temperature: 74.9,
      vibration: 7.8,
      recommended_action: 'Immediately halt conveyor line 1 feed. Inspect bearing grease condition and check for rotor eccentricity.'
    },
    {
      alert_id: 'ALT-3002',
      event_id: 'EVT-2002',
      machine_id: 'M001',
      machine_name: 'Industrial Induction Motor',
      recipient: 'Maintenance Team - Pranitha S S (KIT-CBE)',
      alert_message: 'Warning: M001 vibration reading reached 4.2 mm/s above safe threshold.',
      severity: 'MEDIUM',
      sent_at: isoHoursAgo(1),
      acknowledgement_status: 'ACKNOWLEDGED',
      acknowledged_by: 'Pranitha S S (Engineer)',
      acknowledged_at: isoMinutesAgo(45),
      anomaly_type: 'VIBRATION_EXCEEDED',
      temperature: 68.4,
      vibration: 4.2,
      recommended_action: 'Perform vibration spectrum analysis and schedule inspection within 24 hours.'
    },
    {
      alert_id: 'ALT-3003',
      event_id: 'EVT-2003',
      machine_id: 'M003',
      machine_name: 'Overhead Material Conveyor Drive',
      recipient: 'Shift Supervisor - Assembly 3',
      alert_message: 'Low Alert: ML Isolation Forest flagged subtle divergence on conveyor drive roller.',
      severity: 'LOW',
      sent_at: isoMinutesAgo(5),
      acknowledgement_status: 'UNACKNOWLEDGED',
      anomaly_type: 'ISOLATION_FOREST_OUTLIER',
      temperature: 64.2,
      vibration: 4.1,
      recommended_action: 'Monitor next thermal cycle; verify tension of transmission drive belt.'
    }
  ];

  const maintenance_records: MaintenanceRecord[] = [
    {
      record_id: 'MREC-4001',
      machine_id: 'M001',
      machine_name: 'Industrial Induction Motor',
      event_type: 'Lubrication',
      action_taken: 'Applied high-temperature synthetic polyurea grease to non-drive end bearing assembly.',
      technician: 'Pranitha S S (Lead)',
      performed_at: isoHoursAgo(48),
      linked_alert_id: 'ALT-PREV-01',
      notes: 'Initial grease level was depleted. Temperature dropped back to 58.2°C nominal post-application.',
      hours_spent: 1.5
    },
    {
      record_id: 'MREC-4002',
      machine_id: 'M002',
      machine_name: 'High-Pressure Centrifugal Water Pump',
      event_type: 'Sensor Calibration',
      action_taken: 'Recalibrated PT100 RTD sensor and verified zero-offset calibration with dry block calibrator.',
      technician: 'M. Vignesh (Instrumentation Eng.)',
      performed_at: isoHoursAgo(24),
      notes: 'Sensor reading verified with ±0.1°C accuracy.',
      hours_spent: 1.0
    },
    {
      record_id: 'MREC-4003',
      machine_id: 'M004',
      machine_name: 'Heavy Duty 5-Axis CNC Milling Spindle',
      event_type: 'Routine Inspection',
      action_taken: 'Laser shaft alignment and acoustic check of spindle ceramic bearings.',
      technician: 'Pranitha S S (Lead)',
      performed_at: isoHoursAgo(12),
      notes: 'Total indicated runout < 2 microns. Ready for high-precision batch processing.',
      hours_spent: 2.0
    }
  ];

  return {
    machines,
    sensors,
    sensor_readings,
    anomaly_events,
    maintenance_alerts,
    maintenance_records
  };
}

class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.machines && parsed.sensor_readings) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read persisted database file, re-seeding default data:', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetToBenchmark(): DatabaseSchema {
    this.db = getInitialSeedData();
    this.saveData(this.db);
    return this.db;
  }

  // --- Machines ---
  public getMachines(): Machine[] {
    return this.db.machines;
  }

  public getMachineById(id: string): Machine | undefined {
    return this.db.machines.find((m) => m.machine_id.toUpperCase() === id.toUpperCase());
  }

  public createMachine(machine: Omit<Machine, 'created_at' | 'last_updated'>): Machine {
    const existing = this.getMachineById(machine.machine_id);
    if (existing) {
      throw new Error(`Machine with ID ${machine.machine_id} already exists`);
    }

    const now = new Date().toISOString();
    const newMachine: Machine = {
      ...machine,
      created_at: now,
      last_updated: now,
      current_temp: machine.current_temp || 55.0,
      current_vibration: machine.current_vibration || 2.0,
      current_speed_rpm: machine.current_speed_rpm || 1500,
      current_motor_current_a: machine.current_motor_current_a || 12.0
    };

    this.db.machines.push(newMachine);
    this.saveData(this.db);
    return newMachine;
  }

  public updateMachine(id: string, updates: Partial<Machine>): Machine {
    const idx = this.db.machines.findIndex((m) => m.machine_id.toUpperCase() === id.toUpperCase());
    if (idx === -1) {
      throw new Error(`Machine with ID ${id} not found`);
    }

    const updated: Machine = {
      ...this.db.machines[idx],
      ...updates,
      machine_id: this.db.machines[idx].machine_id, // Immutable ID
      last_updated: new Date().toISOString()
    };

    this.db.machines[idx] = updated;
    this.saveData(this.db);
    return updated;
  }

  // --- Sensors ---
  public getSensors(machineId?: string): Sensor[] {
    if (machineId) {
      return this.db.sensors.filter((s) => s.machine_id.toUpperCase() === machineId.toUpperCase());
    }
    return this.db.sensors;
  }

  // --- Sensor Readings ---
  public getReadings(params?: { machine_id?: string; limit?: number; offset?: number; date_from?: string; date_to?: string }): SensorReading[] {
    let readings = [...this.db.sensor_readings];

    if (params?.machine_id) {
      readings = readings.filter((r) => r.machine_id.toUpperCase() === params.machine_id!.toUpperCase());
    }

    if (params?.date_from) {
      const fromTime = new Date(params.date_from).getTime();
      readings = readings.filter((r) => new Date(r.recorded_at).getTime() >= fromTime);
    }

    if (params?.date_to) {
      const toTime = new Date(params.date_to).getTime();
      readings = readings.filter((r) => new Date(r.recorded_at).getTime() <= toTime);
    }

    // Sort descending by recorded_at
    readings.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

    if (params?.limit) {
      readings = readings.slice(params.offset || 0, (params.offset || 0) + params.limit);
    }

    return readings;
  }

  public getLatestReadings(): Record<string, SensorReading> {
    const latestMap: Record<string, SensorReading> = {};
    for (const r of this.getReadings()) {
      if (!latestMap[r.machine_id]) {
        latestMap[r.machine_id] = r;
      }
    }
    return latestMap;
  }

  public recordSensorReading(reading: {
    machine_id: string;
    temperature: number;
    vibration: number;
    motor_current_a?: number;
    speed_rpm?: number;
    sensor_id?: string;
    is_demo?: boolean;
  }): { reading: SensorReading; alert?: MaintenanceAlert; analysis: ReturnType<typeof analyzeSensorTelemetry> } {
    const machine = this.getMachineById(reading.machine_id);
    if (!machine) {
      throw new Error(`Machine with ID ${reading.machine_id} does not exist`);
    }

    // Retrieve recent readings for moving-average and rate-of-change calculation
    const recent = this.getReadings({ machine_id: reading.machine_id, limit: 5 }).map((r) => ({
      temperature: r.temperature,
      vibration: r.vibration
    }));

    // Run Machine Learning & Threshold Anomaly Engine
    const analysis = analyzeSensorTelemetry(machine, reading.temperature, reading.vibration, recent);

    const now = new Date().toISOString();
    const readingId = `RD-${Date.now().toString().slice(-6)}`;

    const newReading: SensorReading = {
      reading_id: readingId,
      machine_id: machine.machine_id,
      sensor_id: reading.sensor_id || `S-${machine.machine_id}`,
      temperature: Number(reading.temperature.toFixed(1)),
      vibration: Number(reading.vibration.toFixed(2)),
      operating_value: reading.motor_current_a || machine.current_motor_current_a || 14.0,
      motor_current_a: reading.motor_current_a || machine.current_motor_current_a || 14.0,
      speed_rpm: reading.speed_rpm || machine.current_speed_rpm || 1500,
      status: analysis.status,
      is_demo: reading.is_demo !== undefined ? reading.is_demo : true,
      recorded_at: now,
      anomaly_score: analysis.anomaly_score
    };

    this.db.sensor_readings.unshift(newReading);
    // Keep last 1000 readings in memory/disk to prevent unbounded growth
    if (this.db.sensor_readings.length > 1000) {
      this.db.sensor_readings = this.db.sensor_readings.slice(0, 1000);
    }

    // Update machine status and telemetry
    machine.status = analysis.status;
    machine.current_temp = newReading.temperature;
    machine.current_vibration = newReading.vibration;
    machine.current_speed_rpm = newReading.speed_rpm;
    machine.current_motor_current_a = newReading.motor_current_a;
    machine.last_updated = now;

    let generatedAlert: MaintenanceAlert | undefined;

    // If an anomaly or warning is detected, generate Anomaly Event and Maintenance Alert
    if (analysis.is_anomaly && analysis.severity !== 'NONE') {
      const eventId = `EVT-${Date.now().toString().slice(-6)}`;
      const alertId = `ALT-${Date.now().toString().slice(-6)}`;

      let anomalyType: AnomalyEvent['anomaly_type'] = 'ISOLATION_FOREST_OUTLIER';
      if (reading.temperature >= machine.temp_critical_threshold && reading.vibration >= machine.vibration_critical_threshold) {
        anomalyType = 'DUAL_THRESHOLD_EXCEEDED';
      } else if (reading.temperature >= machine.temp_warning_threshold) {
        anomalyType = 'TEMPERATURE_EXCEEDED';
      } else if (reading.vibration >= machine.vibration_warning_threshold) {
        anomalyType = 'VIBRATION_EXCEEDED';
      }

      const newEvent: AnomalyEvent = {
        event_id: eventId,
        machine_id: machine.machine_id,
        anomaly_type: anomalyType,
        severity: analysis.severity,
        detected_at: now,
        description: analysis.explanation,
        detection_method: analysis.detection_method === 'NOMINAL' ? 'MACHINE_LEARNING' : analysis.detection_method,
        anomaly_score: analysis.anomaly_score,
        temperature_val: newReading.temperature,
        vibration_val: newReading.vibration,
        status: 'ACTIVE'
      };

      this.db.anomaly_events.unshift(newEvent);

      generatedAlert = {
        alert_id: alertId,
        event_id: eventId,
        machine_id: machine.machine_id,
        machine_name: machine.machine_name,
        recipient: 'Maintenance Team - Pranitha S S (KIT-CBE)',
        alert_message: `[${analysis.severity}] ${machine.machine_id} - ${machine.machine_name}: ${analysis.detected_parameters.join(', ')}`,
        severity: analysis.severity,
        sent_at: now,
        acknowledgement_status: 'UNACKNOWLEDGED',
        anomaly_type: anomalyType,
        temperature: newReading.temperature,
        vibration: newReading.vibration,
        recommended_action: analysis.recommended_action
      };

      this.db.maintenance_alerts.unshift(generatedAlert);
    }

    this.saveData(this.db);
    return { reading: newReading, alert: generatedAlert, analysis };
  }

  // --- Alerts ---
  public getAlerts(params?: { severity?: string; machine_id?: string; status?: string }): MaintenanceAlert[] {
    let alerts = [...this.db.maintenance_alerts];

    if (params?.severity && params.severity !== 'ALL') {
      alerts = alerts.filter((a) => a.severity.toUpperCase() === params.severity!.toUpperCase());
    }

    if (params?.machine_id && params.machine_id !== 'ALL') {
      alerts = alerts.filter((a) => a.machine_id.toUpperCase() === params.machine_id!.toUpperCase());
    }

    if (params?.status && params.status !== 'ALL') {
      alerts = alerts.filter((a) => a.acknowledgement_status.toUpperCase() === params.status!.toUpperCase());
    }

    return alerts.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  public getAlertById(alertId: string): MaintenanceAlert | undefined {
    return this.db.maintenance_alerts.find((a) => a.alert_id.toUpperCase() === alertId.toUpperCase());
  }

  public updateAlertStatus(
    alertId: string,
    action: 'ACKNOWLEDGE' | 'RESOLVE',
    technicianName: string,
    notes?: string
  ): MaintenanceAlert {
    const alert = this.getAlertById(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const now = new Date().toISOString();
    if (action === 'ACKNOWLEDGE') {
      alert.acknowledgement_status = 'ACKNOWLEDGED';
      alert.acknowledged_by = technicianName || 'Pranitha S S (KIT-CBE)';
      alert.acknowledged_at = now;
    } else if (action === 'RESOLVE') {
      alert.acknowledgement_status = 'RESOLVED';
      alert.resolved_by = technicianName || 'Pranitha S S (KIT-CBE)';
      alert.resolved_at = now;
      alert.resolution_notes = notes || 'Condition stabilized through inspection.';

      // Also resolve corresponding anomaly event
      const evt = this.db.anomaly_events.find((e) => e.event_id === alert.event_id);
      if (evt) {
        evt.status = 'RESOLVED';
      }
    }

    this.saveData(this.db);
    return alert;
  }

  // --- Maintenance Records ---
  public getMaintenanceRecords(machineId?: string): MaintenanceRecord[] {
    let records = [...this.db.maintenance_records];
    if (machineId && machineId !== 'ALL') {
      records = records.filter((r) => r.machine_id.toUpperCase() === machineId.toUpperCase());
    }
    return records.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
  }

  public createMaintenanceRecord(record: Omit<MaintenanceRecord, 'record_id' | 'performed_at'> & { performed_at?: string }): MaintenanceRecord {
    const machine = this.getMachineById(record.machine_id);
    const newRecord: MaintenanceRecord = {
      ...record,
      record_id: `MREC-${Date.now().toString().slice(-6)}`,
      machine_name: machine?.machine_name || record.machine_name || record.machine_id,
      performed_at: record.performed_at || new Date().toISOString(),
      hours_spent: record.hours_spent || 1.5
    };

    this.db.maintenance_records.unshift(newRecord);

    // If linked to an alert, resolve it
    if (record.linked_alert_id) {
      try {
        this.updateAlertStatus(record.linked_alert_id, 'RESOLVE', record.technician, `Resolved by maintenance record ${newRecord.record_id}: ${record.action_taken}`);
      } catch {
        // ignore if not found
      }
    }

    this.saveData(this.db);
    return newRecord;
  }

  // --- Analytics Summary ---
  public getAnalyticsSummary(): AnalyticsSummary {
    const machines = this.db.machines;
    const readings = this.db.sensor_readings;
    const alerts = this.db.maintenance_alerts;

    let normal = 0;
    let warning = 0;
    let high = 0;
    let critical = 0;

    for (const m of machines) {
      if (m.status === 'NORMAL') normal++;
      else if (m.status === 'WARNING') warning++;
      else if (m.status === 'HIGH') high++;
      else if (m.status === 'CRITICAL') critical++;
    }

    const activeAlerts = alerts.filter((a) => a.acknowledgement_status !== 'RESOLVED').length;

    let avgTemp = 0;
    let avgVib = 0;
    let peakTemp = 0;
    let peakVib = 0;

    if (readings.length > 0) {
      const sumT = readings.reduce((acc, r) => acc + r.temperature, 0);
      const sumV = readings.reduce((acc, r) => acc + r.vibration, 0);
      avgTemp = Number((sumT / readings.length).toFixed(1));
      avgVib = Number((sumV / readings.length).toFixed(2));
      peakTemp = Math.max(...readings.map((r) => r.temperature));
      peakVib = Math.max(...readings.map((r) => r.vibration));
    }

    // Health score: 100 - penalties for warning (8%), high (18%), critical (30%)
    const healthScore = Math.max(
      15,
      Math.min(
        100,
        Number((100 - (warning * 8 + high * 18 + critical * 30) / Math.max(1, machines.length)).toFixed(1))
      )
    );

    return {
      total_machines: machines.length,
      normal_machines: normal,
      warning_machines: warning,
      high_machines: high,
      critical_machines: critical,
      active_alerts: activeAlerts,
      total_alerts: alerts.length,
      total_readings: readings.length,
      overall_health_score: healthScore,
      latest_update: readings[0]?.recorded_at || new Date().toISOString(),
      avg_temperature: avgTemp,
      avg_vibration: avgVib,
      peak_temperature: peakTemp,
      peak_vibration: peakVib,
      status_distribution: {
        normal,
        warning,
        high,
        critical
      }
    };
  }
}

export const dbService = new DatabaseService();
