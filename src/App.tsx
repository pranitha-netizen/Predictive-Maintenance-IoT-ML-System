import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { LiveMonitoringView } from './components/LiveMonitoringView.tsx';
import { IoTSensorModuleView } from './components/IoTSensorModuleView.tsx';
import { MLAnomalyLabView } from './components/MLAnomalyLabView.tsx';
import { AlertsView } from './components/AlertsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { MachineManagementView } from './components/MachineManagementView.tsx';
import { MaintenanceHistoryView } from './components/MaintenanceHistoryView.tsx';
import { SystemArchitectureView } from './components/SystemArchitectureView.tsx';
import { AboutProjectView } from './components/AboutProjectView.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ResetConfirmModal } from './components/ResetConfirmModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';

import {
  Machine,
  SensorReading,
  MaintenanceAlert,
  MaintenanceRecord,
  AnalyticsSummary,
  UserProfile
} from './types/index.ts';
import {
  fetchMachines,
  createMachine,
  updateMachine,
  fetchReadings,
  submitSensorReading,
  fetchAlerts,
  updateAlertStatus,
  fetchMaintenanceRecords,
  createMaintenanceRecord,
  fetchAnalyticsSummary,
  resetBenchmarkData
} from './services/apiClient.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_machines: 4,
    normal_machines: 2,
    warning_machines: 1,
    high_machines: 1,
    critical_machines: 0,
    active_alerts: 2,
    total_alerts: 3,
    total_readings: 7,
    overall_health_score: 84.5,
    latest_update: new Date().toISOString(),
    avg_temperature: 61.5,
    avg_vibration: 3.48,
    peak_temperature: 74.9,
    peak_vibration: 7.8,
    status_distribution: { normal: 2, warning: 1, high: 1, critical: 0 }
  });

  const [selectedMachineId, setSelectedMachineId] = useState<string>('M001');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeedMs, setSimulationSpeedMs] = useState<number>(2000);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Pranitha S S',
    email: 'pranitha.ss@kit-cbe.edu.in',
    role: 'Lead Predictive Maintenance Engineer',
    department: 'Computer Science and Engineering',
    institution: 'KIT – Kalaignarkarunanidhi Institute of Technology',
    is_authenticated: true,
    is_demo: true
  });

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(-4);
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load
  const loadAllData = useCallback(async () => {
    try {
      const [mList, rList, aList, recList, sumData] = await Promise.all([
        fetchMachines(),
        fetchReadings({ limit: 100 }),
        fetchAlerts(),
        fetchMaintenanceRecords(),
        fetchAnalyticsSummary()
      ]);
      setMachines(mList);
      setReadings(rList);
      setAlerts(aList);
      setRecords(recList);
      setSummary(sumData);
    } catch (err) {
      console.error('Error fetching system data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Real-Time Telemetry Simulation Engine
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSimulating || machines.length === 0) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      return;
    }

    simulationRef.current = setInterval(async () => {
      // Pick an active machine for this tick
      const targetMachine = machines[Math.floor(Math.random() * machines.length)];
      if (!targetMachine || !targetMachine.is_monitoring) return;

      // Realistic stochastic walk around current machine state
      const baseTemp = targetMachine.current_temp || 58.0;
      const baseVib = targetMachine.current_vibration || 2.1;

      // Add gentle drift (±0.4°C and ±0.08 mm/s)
      const tempDrift = (Math.random() - 0.49) * 0.8;
      const vibDrift = (Math.random() - 0.49) * 0.16;

      const newTemp = Math.max(35, Math.min(95, baseTemp + tempDrift));
      const newVib = Math.max(0.5, Math.min(15, baseVib + vibDrift));

      try {
        const { reading, alert } = await submitSensorReading({
          machine_id: targetMachine.machine_id,
          temperature: newTemp,
          vibration: newVib,
          motor_current_a: targetMachine.current_motor_current_a,
          speed_rpm: targetMachine.current_speed_rpm,
          is_demo: true
        });

        // Prepend reading
        setReadings((prev) => [reading, ...prev.slice(0, 99)]);

        // Update target machine in list
        setMachines((prev) =>
          prev.map((m) =>
            m.machine_id === targetMachine.machine_id
              ? {
                  ...m,
                  current_temp: reading.temperature,
                  current_vibration: reading.vibration,
                  status: reading.status,
                  last_updated: reading.recorded_at
                }
              : m
          )
        );

        // If an alert was generated, notify
        if (alert) {
          setAlerts((prev) => [alert, ...prev]);
          if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
            addToast(
              alert.severity,
              `Incident Alert [${alert.severity}]: ${targetMachine.machine_id}`,
              `${alert.anomaly_type.replace('_', ' ')} detected at ${reading.temperature}°C / ${reading.vibration} mm/s.`
            );
          }
        }
      } catch (err) {
        console.error('Simulation tick error:', err);
      }
    }, simulationSpeedMs);

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [isSimulating, machines, simulationSpeedMs]);

  // Inject Custom Sensor Reading
  const handleInjectReading = async (readingData: {
    machine_id: string;
    temperature: number;
    vibration: number;
    motor_current_a?: number;
    speed_rpm?: number;
    sensor_id?: string;
    is_demo: boolean;
  }) => {
    const { reading, alert } = await submitSensorReading(readingData);
    setReadings((prev) => [reading, ...prev.slice(0, 99)]);

    // Update machines
    setMachines((prev) =>
      prev.map((m) =>
        m.machine_id === readingData.machine_id
          ? {
              ...m,
              current_temp: reading.temperature,
              current_vibration: reading.vibration,
              status: reading.status,
              last_updated: reading.recorded_at
            }
          : m
      )
    );

    // Refresh summary
    fetchAnalyticsSummary().then(setSummary).catch(console.error);

    if (alert) {
      setAlerts((prev) => [alert, ...prev]);
      const toastType = alert.severity === 'CRITICAL' ? 'CRITICAL' : alert.severity === 'HIGH' ? 'HIGH' : 'WARNING';
      addToast(
        toastType,
        `New Alert [${alert.severity}] Generated`,
        `${reading.machine_id}: ${alert.alert_message}`
      );
    } else {
      addToast('SUCCESS', 'Sensor Reading Ingested', `${reading.machine_id} status evaluated: ${reading.status}`);
    }
  };

  // Update Alert Status (Acknowledge / Resolve)
  const handleUpdateAlert = async (
    alertId: string,
    action: 'ACKNOWLEDGE' | 'RESOLVE',
    technicianName: string,
    notes?: string
  ) => {
    const updated = await updateAlertStatus(alertId, action, technicianName, notes);
    setAlerts((prev) => prev.map((a) => (a.alert_id === alertId ? updated : a)));
    addToast(
      'SUCCESS',
      `Alert ${action === 'ACKNOWLEDGE' ? 'Acknowledged' : 'Resolved'}`,
      `Record updated for ${updated.machine_id} by ${technicianName}.`
    );
    fetchAnalyticsSummary().then(setSummary).catch(console.error);
  };

  // Create Machine
  const handleCreateMachine = async (data: Partial<Machine>) => {
    const newMachine = await createMachine(data);
    setMachines((prev) => [...prev, newMachine]);
    addToast('SUCCESS', 'Asset Registered', `${newMachine.machine_id} (${newMachine.machine_name}) added to fleet.`);
    fetchAnalyticsSummary().then(setSummary).catch(console.error);
  };

  // Update Machine
  const handleUpdateMachine = async (id: string, data: Partial<Machine>) => {
    const updated = await updateMachine(id, data);
    setMachines((prev) => prev.map((m) => (m.machine_id === id ? updated : m)));
    addToast('SUCCESS', 'Asset Updated', `${updated.machine_id} thresholds successfully saved.`);
  };

  // Create Maintenance Record
  const handleCreateRecord = async (data: Partial<MaintenanceRecord>) => {
    const newRecord = await createMaintenanceRecord(data);
    setRecords((prev) => [newRecord, ...prev]);
    addToast('SUCCESS', 'Maintenance Logged', `Work order ${newRecord.record_id} saved.`);
    loadAllData();
  };

  // Reset Demo Benchmark Data
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetBenchmarkData();
      await loadAllData();
      setShowResetModal(false);
      addToast('SUCCESS', 'Benchmark Dataset Restored', 'Reset to project benchmark cases (M001-M004).');
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.acknowledgement_status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (Wordmark - Telemetry - Action & User Profile) */}
      <Navbar
        user={currentUser}
        isSimulating={isSimulating}
        toggleSimulation={() => setIsSimulating(!isSimulating)}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenReset={() => setShowResetModal(true)}
        activeTab={activeTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation with Student Credits */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                machines={machines}
                summary={summary}
                alerts={alerts}
                onSelectMachine={(id) => {
                  setSelectedMachineId(id);
                  setActiveTab('monitoring');
                }}
                onOpenQuickTest={(id) => {
                  setSelectedMachineId(id);
                  setActiveTab('iot-sensor');
                }}
              />
            )}

            {activeTab === 'monitoring' && (
              <LiveMonitoringView
                machines={machines}
                selectedMachineId={selectedMachineId}
                onSelectMachineId={setSelectedMachineId}
                readings={readings}
                isSimulating={isSimulating}
                toggleSimulation={() => setIsSimulating(!isSimulating)}
                simulationSpeedMs={simulationSpeedMs}
                setSimulationSpeedMs={setSimulationSpeedMs}
                onInjectReading={handleInjectReading}
              />
            )}

            {activeTab === 'iot-sensor' && (
              <IoTSensorModuleView
                machines={machines}
                readings={readings}
                onInjectReading={handleInjectReading}
              />
            )}

            {activeTab === 'ml-anomaly' && (
              <MLAnomalyLabView
                machines={machines}
                onInjectReading={handleInjectReading}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                machines={machines}
                onUpdateAlert={handleUpdateAlert}
                technicianName={currentUser.name}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                readings={readings}
                machines={machines}
                alerts={alerts}
                summary={summary}
              />
            )}

            {activeTab === 'machines' && (
              <MachineManagementView
                machines={machines}
                onSelectMachine={(id) => {
                  setSelectedMachineId(id);
                  setActiveTab('monitoring');
                }}
                onCreateMachine={handleCreateMachine}
                onUpdateMachine={handleUpdateMachine}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceHistoryView
                records={records}
                machines={machines}
                alerts={alerts}
                onCreateRecord={handleCreateRecord}
                defaultTechnician={currentUser.name}
              />
            )}

            {activeTab === 'architecture' && <SystemArchitectureView />}

            {activeTab === 'about' && <AboutProjectView />}
          </div>
        </main>
      </div>

      {/* Modals & Toasts */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          addToast('SUCCESS', 'Authenticated', `Logged in as ${user.name}`);
        }}
      />

      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetData}
        isLoading={isResetting}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
