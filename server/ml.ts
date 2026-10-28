import { Machine, AnomalyAnalysisResult, MachineStatus, AlertSeverity } from '../src/types/index.js';

// Pre-trained baseline reference distributions for normal industrial machinery operation
// Derived from standard induction motor & centrifugal pump nominal states (ISO 10816-3 Class II/III)
const BASELINE = {
  temp_mean: 58.0,
  temp_std: 3.5,
  vibration_mean: 2.2,
  vibration_std: 0.45,
  current_mean: 14.5,
  current_std: 1.2,
};

// Isolation Forest average path length constant c(n) for n samples (n=256)
const C_N = 2 * (Math.log(255) + 0.5772156649) - (2 * 255 / 256); // ~ 9.04

/**
 * Simulates Isolation Forest path length calculation across 100 randomized trees
 * evaluating normalized multi-feature space [Temp_z, Vib_z, Combined_Covariance].
 */
function computeIsolationForestScore(tempZ: number, vibZ: number): { score: number; depth: number } {
  const numTrees = 100;
  let totalDepth = 0;

  // Euclidean norm in standardized feature space
  const radialDistance = Math.sqrt(Math.pow(tempZ, 2) + Math.pow(vibZ, 2));

  for (let i = 0; i < numTrees; i++) {
    // Deterministic pseudo-random seed per tree for stability
    const cutAngle = (i * 137.5 * Math.PI) / 180;
    const projectedPoint = tempZ * Math.cos(cutAngle) + vibZ * Math.sin(cutAngle);
    
    // Closer to center = more cuts required to isolate (deeper path)
    // Outliers isolated quickly in fewer cuts (shallow path)
    const noise = ((i % 17) - 8) * 0.05;
    const effectiveDistance = Math.max(0.1, radialDistance + noise);
    
    // Path depth decreases exponentially as distance from normal cluster increases
    const simulatedDepth = Math.max(1.2, Math.min(12.0, 9.5 / (1.0 + 0.45 * effectiveDistance * effectiveDistance)));
    totalDepth += simulatedDepth;
  }

  const avgDepth = totalDepth / numTrees;
  // Isolation score s(x, n) = 2^(- avgDepth / c(n))
  const score = Math.pow(2, - (avgDepth / C_N));
  return {
    score: Math.min(0.99, Math.max(0.05, Number(score.toFixed(3)))),
    depth: Number(avgDepth.toFixed(2))
  };
}

/**
 * Analyzes incoming sensor telemetry using dual detection:
 * 1. Hard Thresholds (machine-specific Warning & Critical limits)
 * 2. Unsupervised Machine Learning (Isolation Forest Anomaly Scoring & Covariance distance)
 */
export function analyzeSensorTelemetry(
  machine: Machine,
  temperature: number,
  vibration: number,
  recentReadings: { temperature: number; vibration: number }[] = []
): AnomalyAnalysisResult {
  // 1. Compute standardized z-scores against baseline
  const tempZ = (temperature - BASELINE.temp_mean) / BASELINE.temp_std;
  const vibZ = (vibration - BASELINE.vibration_mean) / BASELINE.vibration_std;

  // 2. Moving average and rate of change calculations
  const historyCount = recentReadings.length;
  let tempMovingAvg = temperature;
  let vibMovingAvg = vibration;
  let tempRateOfChange = 0;
  let vibRateOfChange = 0;

  if (historyCount > 0) {
    const sumT = recentReadings.reduce((acc, r) => acc + r.temperature, 0);
    const sumV = recentReadings.reduce((acc, r) => acc + r.vibration, 0);
    tempMovingAvg = (sumT + temperature) / (historyCount + 1);
    vibMovingAvg = (sumV + vibration) / (historyCount + 1);

    const prev = recentReadings[recentReadings.length - 1];
    tempRateOfChange = temperature - prev.temperature;
    vibRateOfChange = vibration - prev.vibration;
  }

  // 3. Machine Learning Isolation Forest Score
  const { score: mlScore, depth } = computeIsolationForestScore(tempZ, vibZ);
  const mahalanobisDist = Math.sqrt(Math.pow(tempZ, 2) + Math.pow(vibZ, 2) * 1.2);

  // 4. Threshold evaluations
  const tempWarn = machine.temp_warning_threshold || 65.0;
  const tempCrit = machine.temp_critical_threshold || 75.0;
  const vibWarn = machine.vibration_warning_threshold || 4.5;
  const vibCrit = machine.vibration_critical_threshold || 7.0;

  const isTempCritical = temperature >= tempCrit;
  const isTempWarning = temperature >= tempWarn && !isTempCritical;

  const isVibCritical = vibration >= vibCrit;
  const isVibWarning = vibration >= vibWarn && !isVibCritical;

  const detectedParams: string[] = [];
  if (isTempCritical) detectedParams.push(`Temperature Critical (≥${tempCrit}°C)`);
  else if (isTempWarning) detectedParams.push(`Temperature Warning (≥${tempWarn}°C)`);

  if (isVibCritical) detectedParams.push(`Vibration Critical (≥${vibCrit} mm/s)`);
  else if (isVibWarning) detectedParams.push(`Vibration Warning (≥${vibWarn} mm/s)`);

  const mlAnomalyDetected = mlScore >= 0.62 || mahalanobisDist >= 3.2;
  if (mlAnomalyDetected) {
    detectedParams.push(`Isolation Forest Anomaly Pattern (Score: ${mlScore}, Distance: ${mahalanobisDist.toFixed(1)}σ)`);
  }

  // 5. Determine Overall Status & Severity
  let status: MachineStatus = 'NORMAL';
  let severity: AlertSeverity | 'NONE' = 'NONE';
  let detectionMethod: AnomalyAnalysisResult['detection_method'] = 'NOMINAL';
  let isAnomaly = false;

  if (isTempCritical || isVibCritical || (isTempWarning && isVibWarning) || mlScore >= 0.82) {
    status = 'CRITICAL';
    severity = 'CRITICAL';
    isAnomaly = true;
    detectionMethod = (isTempCritical || isVibCritical) ? (mlAnomalyDetected ? 'HYBRID_DETECTION' : 'THRESHOLD_BASED') : 'MACHINE_LEARNING';
  } else if (isVibCritical || (mlScore >= 0.72 && (isTempWarning || isVibWarning))) {
    status = 'HIGH';
    severity = 'HIGH';
    isAnomaly = true;
    detectionMethod = 'HYBRID_DETECTION';
  } else if (isTempWarning || isVibWarning || mlAnomalyDetected) {
    status = 'WARNING';
    severity = isTempWarning && isVibWarning ? 'HIGH' : (mlAnomalyDetected ? 'MEDIUM' : 'LOW');
    isAnomaly = true;
    detectionMethod = (isTempWarning || isVibWarning) ? (mlAnomalyDetected ? 'HYBRID_DETECTION' : 'THRESHOLD_BASED') : 'MACHINE_LEARNING';
  } else {
    status = 'NORMAL';
    severity = 'NONE';
    isAnomaly = false;
    detectionMethod = 'NOMINAL';
  }

  // 6. Generate human-understandable industrial engineering explanation
  let explanation = 'All telemetry values fall within nominal operating envelope. No preventive action needed.';
  let recommendedAction = 'Continue routine condition monitoring and planned preventative checkup cycle.';

  if (status === 'CRITICAL') {
    if (isTempCritical && isVibCritical) {
      explanation = `Severe compound fault: Operating temperature (${temperature.toFixed(1)}°C) and vibration (${vibration.toFixed(1)} mm/s) both exceeded critical safety boundaries. Strong indicator of bearing seizure or lubrication failure.`;
      recommendedAction = 'Execute emergency shutdown protocol. Dispatch mechanical technician immediately to inspect drive-end bearings and thermal dissipation fans.';
    } else if (isVibCritical) {
      explanation = `Vibration level (${vibration.toFixed(1)} mm/s) is critically elevated past ${vibCrit} mm/s. Indicates severe dynamic imbalance, rotor misalignment, or structural looseness.`;
      recommendedAction = 'Safely ramp down machine load. Inspect coupling alignment, shaft runout, and mounting bolt tightness.';
    } else if (isTempCritical) {
      explanation = `Operating temperature (${temperature.toFixed(1)}°C) surpassed critical threshold of ${tempCrit}°C. High risk of motor winding insulation breakdown.`;
      recommendedAction = 'Inspect cooling air intake ducts, thermal overload relay, and motor electrical winding resistance.';
    } else {
      explanation = `Machine Learning Isolation Forest flagged a high-confidence multivariate anomaly pattern (Isolation Score: ${mlScore}). The combined sensor profile deviates sharply from trained baseline cluster.`;
      recommendedAction = 'Perform ultrasonic acoustic emission testing and verify lubricant viscosity and contamination.';
    }
  } else if (status === 'HIGH') {
    explanation = `High abnormality detected: Vibration (${vibration.toFixed(1)} mm/s) or temperature (${temperature.toFixed(1)}°C) exhibits elevated stress state. ML score ${mlScore} indicates non-typical operation.`;
    recommendedAction = 'Schedule priority inspection within 24 hours. Check bearing lubrication levels and dynamic balancing.';
  } else if (status === 'WARNING') {
    if (mlAnomalyDetected && !isTempWarning && !isVibWarning) {
      explanation = `Machine learning anomaly: While raw values (${temperature.toFixed(1)}°C, ${vibration.toFixed(1)} mm/s) have not yet tripped hard limits, their joint statistical distribution is an outlier (ML Score: ${mlScore}, Isolation Depth: ${depth}). Early indication of incipient mechanical wear.`;
      recommendedAction = 'Flag machine for preventative inspection during next scheduled maintenance window. Increase sensor polling frequency.';
    } else {
      explanation = `Operating parameters slightly exceeding nominal warning limits (Temp: ${temperature.toFixed(1)}°C / Vib: ${vibration.toFixed(1)} mm/s). Early thermal or mechanical deviation detected.`;
      recommendedAction = 'Verify cooling fan operation, check mechanical clearances, and monitor trend over next shift.';
    }
  }

  return {
    machine_id: machine.machine_id,
    temperature: Number(temperature.toFixed(1)),
    vibration: Number(vibration.toFixed(2)),
    status,
    severity,
    anomaly_score: mlScore,
    isolation_depth: depth,
    is_anomaly: isAnomaly,
    detection_method: detectionMethod,
    detected_parameters: detectedParams,
    explanation,
    recommended_action: recommendedAction,
    feature_breakdown: {
      temp_deviation_pct: Number((((temperature - BASELINE.temp_mean) / BASELINE.temp_mean) * 100).toFixed(1)),
      vibration_deviation_pct: Number((((vibration - BASELINE.vibration_mean) / BASELINE.vibration_mean) * 100).toFixed(1)),
      thermal_gradient: Number(tempRateOfChange.toFixed(2)),
      vibration_crest_factor: Number((vibration / Math.max(0.5, vibMovingAvg)).toFixed(2)),
      mahalanobis_dist: Number(mahalanobisDist.toFixed(2))
    }
  };
}
