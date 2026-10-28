import { Router, Request, Response } from 'express';
import { dbService } from './db.js';
import { analyzeSensorTelemetry } from './ml.js';

export const apiRouter = Router();

// 1. Health check & System Information
apiRouter.get('/system-info', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    project_title: 'Predictive Maintenance System Using IoT and Machine Learning',
    student_name: 'Pranitha S S',
    department: 'Computer Science and Engineering',
    institution: 'KIT – Kalaignarkarunanidhi Institute of Technology (KIT-CBE)',
    version: '1.0.0-PROTOTYPE',
    timestamp: new Date().toISOString()
  });
});

// 2. Authentication endpoint (Demo & Technician)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, is_demo } = req.body;

  if (is_demo) {
    return res.json({
      success: true,
      user: {
        name: 'Pranitha S S',
        email: email || 'pranitha.ss@kit-cbe.edu.in',
        role: 'Lead Predictive Maintenance Engineer',
        department: 'Computer Science and Engineering',
        institution: 'KIT – Kalaignarkarunanidhi Institute of Technology',
        is_authenticated: true,
        is_demo: true
      },
      message: 'Logged in successfully using academic demo credentials.'
    });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Realistic mock credentials verification
  return res.json({
    success: true,
    user: {
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Industrial Maintenance Technician',
      department: 'Plant Engineering & Diagnostics',
      institution: 'KIT – CBE Industrial IoT Lab',
      is_authenticated: true,
      is_demo: false
    },
    message: 'Authenticated successfully.'
  });
});

// 3. Machines API
apiRouter.get('/machines', (_req: Request, res: Response) => {
  try {
    const machines = dbService.getMachines();
    res.json(machines);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/machines', (req: Request, res: Response) => {
  try {
    const {
      machine_id,
      machine_name,
      machine_type,
      location,
      temp_warning_threshold,
      temp_critical_threshold,
      vibration_warning_threshold,
      vibration_critical_threshold,
      is_monitoring
    } = req.body;

    if (!machine_id || !machine_name || !machine_type || !location) {
      return res.status(400).json({ error: 'Missing required machine properties (machine_id, machine_name, machine_type, location)' });
    }

    const created = dbService.createMachine({
      machine_id: machine_id.trim().toUpperCase(),
      machine_name: machine_name.trim(),
      machine_type,
      location: location.trim(),
      status: 'NORMAL',
      is_monitoring: is_monitoring !== undefined ? Boolean(is_monitoring) : true,
      temp_warning_threshold: Number(temp_warning_threshold) || 65.0,
      temp_critical_threshold: Number(temp_critical_threshold) || 75.0,
      vibration_warning_threshold: Number(vibration_warning_threshold) || 4.5,
      vibration_critical_threshold: Number(vibration_critical_threshold) || 7.0
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/machines/:id', (req: Request, res: Response) => {
  const machine = dbService.getMachineById(req.params.id);
  if (!machine) {
    return res.status(404).json({ error: `Machine ${req.params.id} not found` });
  }
  res.json(machine);
});

apiRouter.put('/machines/:id', (req: Request, res: Response) => {
  try {
    const updated = dbService.updateMachine(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Sensor Readings API
apiRouter.get('/readings', (req: Request, res: Response) => {
  try {
    const { machine_id, limit, offset, date_from, date_to } = req.query;
    const readings = dbService.getReadings({
      machine_id: machine_id as string,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
      date_from: date_from as string,
      date_to: date_to as string
    });
    res.json(readings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/readings/latest', (_req: Request, res: Response) => {
  try {
    const latest = dbService.getLatestReadings();
    res.json(latest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/readings', (req: Request, res: Response) => {
  try {
    const { machine_id, temperature, vibration, motor_current_a, speed_rpm, sensor_id, is_demo } = req.body;

    if (!machine_id) {
      return res.status(400).json({ error: 'machine_id is required' });
    }

    const tempNum = Number(temperature);
    const vibNum = Number(vibration);

    if (isNaN(tempNum) || isNaN(vibNum)) {
      return res.status(400).json({ error: 'Valid numerical temperature and vibration values are required' });
    }

    if (tempNum < -20 || tempNum > 200) {
      return res.status(400).json({ error: 'Temperature reading out of physical sensor bounds (-20°C to 200°C)' });
    }

    if (vibNum < 0 || vibNum > 100) {
      return res.status(400).json({ error: 'Vibration reading out of physical accelerometer bounds (0 to 100 mm/s)' });
    }

    const result = dbService.recordSensorReading({
      machine_id: machine_id.trim().toUpperCase(),
      temperature: tempNum,
      vibration: vibNum,
      motor_current_a: motor_current_a !== undefined ? Number(motor_current_a) : undefined,
      speed_rpm: speed_rpm !== undefined ? Number(speed_rpm) : undefined,
      sensor_id,
      is_demo: is_demo !== undefined ? Boolean(is_demo) : true
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. ML Anomaly Detection Inference API (Dedicated ad-hoc analyzer)
apiRouter.post('/analyze', (req: Request, res: Response) => {
  try {
    const { machine_id, temperature, vibration } = req.body;
    if (!machine_id) {
      return res.status(400).json({ error: 'machine_id is required' });
    }

    const machine = dbService.getMachineById(machine_id);
    if (!machine) {
      return res.status(404).json({ error: `Machine ${machine_id} not found` });
    }

    const tempNum = Number(temperature);
    const vibNum = Number(vibration);

    if (isNaN(tempNum) || isNaN(vibNum)) {
      return res.status(400).json({ error: 'Valid numerical temperature and vibration values are required' });
    }

    const recent = dbService.getReadings({ machine_id: machine.machine_id, limit: 5 }).map((r) => ({
      temperature: r.temperature,
      vibration: r.vibration
    }));

    const analysis = analyzeSensorTelemetry(machine, tempNum, vibNum, recent);
    res.json(analysis);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Alerts API
apiRouter.get('/alerts', (req: Request, res: Response) => {
  try {
    const { severity, machine_id, status } = req.query;
    const alerts = dbService.getAlerts({
      severity: severity as string,
      machine_id: machine_id as string,
      status: status as string
    });
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/alerts/:id', (req: Request, res: Response) => {
  const alert = dbService.getAlertById(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: `Alert ${req.params.id} not found` });
  }
  res.json(alert);
});

apiRouter.patch('/alerts/:id', (req: Request, res: Response) => {
  try {
    const { action, technician_name, notes } = req.body;
    if (!action || !['ACKNOWLEDGE', 'RESOLVE'].includes(action)) {
      return res.status(400).json({ error: 'action must be either ACKNOWLEDGE or RESOLVE' });
    }

    const updated = dbService.updateAlertStatus(req.params.id, action, technician_name, notes);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Maintenance Records API
apiRouter.get('/maintenance-records', (req: Request, res: Response) => {
  try {
    const { machine_id } = req.query;
    const records = dbService.getMaintenanceRecords(machine_id as string);
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/maintenance-records', (req: Request, res: Response) => {
  try {
    const { machine_id, event_type, action_taken, technician, notes, linked_alert_id, hours_spent, performed_at } = req.body;
    if (!machine_id || !event_type || !action_taken || !technician) {
      return res.status(400).json({ error: 'Missing required maintenance record fields (machine_id, event_type, action_taken, technician)' });
    }

    const record = dbService.createMaintenanceRecord({
      machine_id,
      event_type,
      action_taken,
      technician,
      notes: notes || '',
      linked_alert_id,
      hours_spent: hours_spent ? Number(hours_spent) : 1.5,
      performed_at
    });

    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Analytics Summary API
apiRouter.get('/analytics/summary', (_req: Request, res: Response) => {
  try {
    const summary = dbService.getAnalyticsSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Reset Demo Data API
apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  try {
    dbService.resetToBenchmark();
    res.json({
      success: true,
      message: 'Database reset to initial academic benchmark dataset successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. CSV Export API
apiRouter.get('/export/csv', (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const machineId = req.query.machine_id as string;

    if (type === 'alerts') {
      const alerts = dbService.getAlerts({ machine_id: machineId });
      const headers = ['Alert ID', 'Machine ID', 'Severity', 'Anomaly Type', 'Temperature (°C)', 'Vibration (mm/s)', 'Sent At', 'Status', 'Recommended Action'];
      const rows = alerts.map((a) => [
        a.alert_id,
        a.machine_id,
        a.severity,
        a.anomaly_type,
        a.temperature,
        a.vibration,
        `"${a.sent_at}"`,
        a.acknowledgement_status,
        `"${(a.recommended_action || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="predictive_maintenance_alerts_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    // Default: Sensor readings export
    const readings = dbService.getReadings({ machine_id: machineId, limit: 1000 });
    const headers = ['Reading ID', 'Machine ID', 'Sensor ID', 'Temperature (°C)', 'Vibration (mm/s)', 'Current (A)', 'Speed (RPM)', 'Status', 'Anomaly Score', 'Recorded At'];
    const rows = readings.map((r) => [
      r.reading_id,
      r.machine_id,
      r.sensor_id || '',
      r.temperature,
      r.vibration,
      r.motor_current_a || '',
      r.speed_rpm || '',
      r.status,
      r.anomaly_score || '',
      `"${r.recorded_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="predictive_maintenance_readings_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
