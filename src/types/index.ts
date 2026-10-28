export type MachineStatus = 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Machine {
  machine_id: string;
  machine_name: string;
  machine_type: 'Industrial Motor' | 'Water Pump' | 'Conveyor System' | 'CNC Milling' | 'Air Compressor' | string;
  location: string;
  status: MachineStatus;
  is_monitoring: boolean;
  temp_warning_threshold: number;
  temp_critical_threshold: number;
  vibration_warning_threshold: number;
  vibration_critical_threshold: number;
  created_at: string;
  last_updated: string;
  current_temp?: number;
  current_vibration?: number;
  current_speed_rpm?: number;
  current_motor_current_a?: number;
}

export interface Sensor {
  sensor_id: string;
  machine_id: string;
  sensor_type: 'Temperature' | 'Vibration' | 'Speed' | 'Current';
  unit: string;
  installation_date: string;
  model: string;
}

export interface SensorReading {
  reading_id: string;
  machine_id: string;
  sensor_id?: string;
  temperature: number;
  vibration: number;
  operating_value?: number; // e.g. motor current or RPM
  motor_current_a?: number;
  speed_rpm?: number;
  status: MachineStatus;
  is_demo: boolean;
  recorded_at: string;
  anomaly_score?: number;
}

export interface AnomalyEvent {
  event_id: string;
  machine_id: string;
  anomaly_type: 'TEMPERATURE_EXCEEDED' | 'VIBRATION_EXCEEDED' | 'DUAL_THRESHOLD_EXCEEDED' | 'ISOLATION_FOREST_OUTLIER' | 'RAPID_THERMAL_SURGE' | 'HIGH_HARMONIC_VIBRATION';
  severity: AlertSeverity;
  detected_at: string;
  description: string;
  detection_method: 'THRESHOLD_BASED' | 'MACHINE_LEARNING' | 'HYBRID_DETECTION';
  anomaly_score: number;
  temperature_val: number;
  vibration_val: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface MaintenanceAlert {
  alert_id: string;
  event_id: string;
  machine_id: string;
  machine_name?: string;
  recipient: string;
  alert_message: string;
  severity: AlertSeverity;
  sent_at: string;
  acknowledgement_status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  anomaly_type: string;
  temperature: number;
  vibration: number;
  recommended_action: string;
}

export interface MaintenanceRecord {
  record_id: string;
  machine_id: string;
  machine_name?: string;
  event_type: 'Routine Inspection' | 'Bearing Replacement' | 'Lubrication' | 'Sensor Calibration' | 'Motor Rewinding' | 'Emergency Repair';
  action_taken: string;
  technician: string;
  performed_at: string;
  linked_alert_id?: string;
  notes: string;
  hours_spent?: number;
}

export interface AnalyticsSummary {
  total_machines: number;
  normal_machines: number;
  warning_machines: number;
  high_machines: number;
  critical_machines: number;
  active_alerts: number;
  total_alerts: number;
  total_readings: number;
  overall_health_score: number;
  latest_update: string;
  avg_temperature: number;
  avg_vibration: number;
  peak_temperature: number;
  peak_vibration: number;
  status_distribution: {
    normal: number;
    warning: number;
    high: number;
    critical: number;
  };
}

export interface AnomalyAnalysisRequest {
  machine_id: string;
  temperature: number;
  vibration: number;
  motor_current_a?: number;
  speed_rpm?: number;
}

export interface AnomalyAnalysisResult {
  machine_id: string;
  temperature: number;
  vibration: number;
  status: MachineStatus;
  severity: AlertSeverity | 'NONE';
  anomaly_score: number; // 0.00 to 1.00
  isolation_depth: number;
  is_anomaly: boolean;
  detection_method: 'THRESHOLD_BASED' | 'MACHINE_LEARNING' | 'HYBRID_DETECTION' | 'NOMINAL';
  detected_parameters: string[];
  explanation: string;
  recommended_action: string;
  feature_breakdown: {
    temp_deviation_pct: number;
    vibration_deviation_pct: number;
    thermal_gradient: number;
    vibration_crest_factor: number;
    mahalanobis_dist: number;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  institution: string;
  is_authenticated: boolean;
  is_demo: boolean;
}
