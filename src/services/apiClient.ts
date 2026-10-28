import {
  Machine,
  SensorReading,
  MaintenanceAlert,
  MaintenanceRecord,
  AnalyticsSummary,
  AnomalyAnalysisResult,
  UserProfile
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchMachines(): Promise<Machine[]> {
  const res = await fetch(`${API_BASE}/machines`);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

export async function createMachine(data: Partial<Machine>): Promise<Machine> {
  const res = await fetch(`${API_BASE}/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create machine');
  }
  return res.json();
}

export async function updateMachine(id: string, data: Partial<Machine>): Promise<Machine> {
  const res = await fetch(`${API_BASE}/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update machine');
  }
  return res.json();
}

export async function fetchReadings(params?: {
  machine_id?: string;
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
}): Promise<SensorReading[]> {
  const query = new URLSearchParams();
  if (params?.machine_id && params.machine_id !== 'ALL') query.set('machine_id', params.machine_id);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to) query.set('date_to', params.date_to);

  const res = await fetch(`${API_BASE}/readings?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch sensor readings');
  return res.json();
}

export async function fetchLatestReadings(): Promise<Record<string, SensorReading>> {
  const res = await fetch(`${API_BASE}/readings/latest`);
  if (!res.ok) throw new Error('Failed to fetch latest readings');
  return res.json();
}

export async function submitSensorReading(data: {
  machine_id: string;
  temperature: number;
  vibration: number;
  motor_current_a?: number;
  speed_rpm?: number;
  sensor_id?: string;
  is_demo?: boolean;
}): Promise<{ reading: SensorReading; alert?: MaintenanceAlert; analysis: AnomalyAnalysisResult }> {
  const res = await fetch(`${API_BASE}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit sensor reading');
  }
  return res.json();
}

export async function analyzeTelemetry(data: {
  machine_id: string;
  temperature: number;
  vibration: number;
}): Promise<AnomalyAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to analyze telemetry');
  }
  return res.json();
}

export async function fetchAlerts(params?: {
  severity?: string;
  machine_id?: string;
  status?: string;
}): Promise<MaintenanceAlert[]> {
  const query = new URLSearchParams();
  if (params?.severity) query.set('severity', params.severity);
  if (params?.machine_id) query.set('machine_id', params.machine_id);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function updateAlertStatus(
  alertId: string,
  action: 'ACKNOWLEDGE' | 'RESOLVE',
  technicianName: string,
  notes?: string
): Promise<MaintenanceAlert> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, technician_name: technicianName, notes })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update alert');
  }
  return res.json();
}

export async function fetchMaintenanceRecords(machineId?: string): Promise<MaintenanceRecord[]> {
  const query = machineId && machineId !== 'ALL' ? `?machine_id=${machineId}` : '';
  const res = await fetch(`${API_BASE}/maintenance-records${query}`);
  if (!res.ok) throw new Error('Failed to fetch maintenance records');
  return res.json();
}

export async function createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
  const res = await fetch(`${API_BASE}/maintenance-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create maintenance record');
  }
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}

export async function resetBenchmarkData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo benchmark dataset');
  return res.json();
}

export async function loginUser(email?: string, password?: string, isDemo = false): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, is_demo: isDemo })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  return data.user;
}
