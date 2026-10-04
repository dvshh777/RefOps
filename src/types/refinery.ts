export type UnitState = 'RUNNING' | 'STANDBY' | 'MAINTENANCE' | 'OFFLINE';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  timestamp: string;
  title: string;
  department: string;
  throughputPeakBbl: number;
  runningUnitsCount: number;
  alarmCount: number;
  summary: string;
  status: 'COMPLETED' | 'LIVE' | 'ARCHIVED';
}

export interface ProductionUnit {
  tag: string;
  unit: string;
  state: UnitState;
  rate: number; // bbl/d
  load: number; // % (0 - 100)
  temp: number; // °C
  maxRate: number;
  pressureBar?: number;
}

export interface ThroughputPoint {
  time: string; // e.g., "00:00"
  rate: number; // bbl/d
  target?: number;
}

export interface AlarmEvent {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  tag: string;
  message: string;
  acknowledged: boolean;
}

export interface MaintenanceOrder {
  id: string;
  equipmentTag: string;
  unit: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  scheduledDate: string;
  overdue: boolean;
  assignedTeam: string;
}

export interface SafetyInspection {
  id: string;
  unitTag: string;
  inspector: string;
  category: 'PRESSURE_VESSEL' | 'CORROSION' | 'OSHA_SAFETY' | 'HAZMAT' | 'FIRE_SYSTEM';
  status: 'PASSED' | 'PENDING' | 'OVERDUE' | 'ACTION_REQUIRED';
  inspectionDate: string;
  nextDue: string;
  notes: string;
}

export interface KpiMetric {
  key: string;
  category: 'YIELD' | 'SAFETY' | 'ENERGY' | 'FINANCIAL' | 'ENVIRONMENTAL';
  label: string;
  value: number;
  target: number;
  unit: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  changePercent: number;
}

export interface PlantOverview {
  complexName: string;
  plantId: string;
  status: 'NORMAL OPERATIONS' | 'WARNING' | 'CRITICAL ALARM' | 'NO DATA PUBLISHED';
  nameplateCrude: number; // bbl/d
  continuousRunDays: number;
  safeDays: number;
  licence: string;
  unackAlarmsCount: number;
  overdueInspectionsCount: number;
  blockedWorkOrdersCount: number;
}

export interface CsvUploadRecord {
  id: string;
  timestamp: string;
  department: 'production' | 'maintenance' | 'inspections' | 'kpis';
  filename: string;
  rowsIngested: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  uploadedBy: string;
  fileSize: string;
  summary: string;
}

export interface ShiftLogEntry {
  id: string;
  timestamp: string;
  shift: 'Shift A (00:00 - 08:00)' | 'Shift B (08:00 - 16:00)' | 'Shift C (16:00 - 24:00)';
  operator: string;
  unitTag: string;
  category: 'OPERATIONAL' | 'SAFETY' | 'MAINTENANCE' | 'ENVIRONMENTAL';
  note: string;
  severity: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
  signedOff: boolean;
}

export interface PredictiveAsset {
  tag: string;
  equipmentName: string;
  unit: string;
  healthScore: number; // 0 - 100%
  vibrationMmS: number; // mm/s
  bearingTempC: number; // °C
  estimatedRulDays: number; // Remaining Useful Life in days
  recommendation: string;
  status: 'HEALTHY' | 'DEGRADING' | 'CRITICAL';
}

export interface EmissionsData {
  so2Ppm: number;
  noxPpm: number;
  co2TonsDaily: number;
  flareEfficiency: number; // % e.g. 99.4
  epaStatus: 'COMPLIANT' | 'WARNING' | 'EXCEEDED';
  lastAuditTime: string;
}

export interface RefineryState {
  isDataImported: boolean;
  currentUser?: UserAccount;
  plant: PlantOverview;
  units: ProductionUnit[];
  throughputHistory: ThroughputPoint[];
  alarms: AlarmEvent[];
  maintenance: MaintenanceOrder[];
  inspections: SafetyInspection[];
  kpis: KpiMetric[];
  uploadHistory: CsvUploadRecord[];
  shiftLogs?: ShiftLogEntry[];
  predictiveAssets?: PredictiveAsset[];
  emissions?: EmissionsData;
  analysisHistory?: AnalysisRecord[];
  lastImportTime?: string;
  importedDepartments: {
    production: boolean;
    maintenance: boolean;
    inspections: boolean;
    kpis: boolean;
  };
}
