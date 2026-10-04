import {
  RefineryState,
  ProductionUnit,
  ThroughputPoint,
  AlarmEvent,
  MaintenanceOrder,
  SafetyInspection,
  KpiMetric,
  PlantOverview,
  ShiftLogEntry,
  PredictiveAsset,
  EmissionsData,
  UserAccount,
  AnalysisRecord,
} from '../src/types/refinery.js';

// Initial Empty Refinery State as seen in the reference model
const EMPTY_PLANT: PlantOverview = {
  complexName: 'UNNAMED COMPLEX',
  plantId: 'PLANT-01',
  status: 'NORMAL OPERATIONS',
  nameplateCrude: 0,
  continuousRunDays: 0,
  safeDays: 0,
  licence: '',
  unackAlarmsCount: 0,
  overdueInspectionsCount: 0,
  blockedWorkOrdersCount: 0,
};

// Baseline unit grid present on initial monitor
const INITIAL_UNITS: ProductionUnit[] = [
  { tag: 'CDU-05', unit: 'Atmospheric Crude Distillation', state: 'RUNNING', rate: 176461, load: 88, temp: 362, maxRate: 200000, pressureBar: 3.2 },
  { tag: 'VDU-05', unit: 'Vacuum Distillation', state: 'RUNNING', rate: 94246, load: 86, temp: 415, maxRate: 110000, pressureBar: 0.15 },
  { tag: 'FCC-05', unit: 'Fluid Catalytic Cracking', state: 'RUNNING', rate: 72189, load: 90, temp: 543, maxRate: 80000, pressureBar: 2.8 },
];

const INITIAL_PREDICTIVE_ASSETS: PredictiveAsset[] = [
  { tag: 'P-101A', equipmentName: 'Crude Charge Pump A', unit: 'CDU-05', healthScore: 94, vibrationMmS: 1.8, bearingTempC: 68, estimatedRulDays: 142, recommendation: 'Routine lube oil check at next scheduled PM window.', status: 'HEALTHY' },
  { tag: 'C-201B', equipmentName: 'FCC Wet Gas Compressor', unit: 'FCC-05', healthScore: 68, vibrationMmS: 4.2, bearingTempC: 88, estimatedRulDays: 18, recommendation: 'Elevated bearing vibration detected. Schedule seal overhaul within 14 days.', status: 'DEGRADING' },
  { tag: 'E-304C', equipmentName: 'Vacuum Tower Overhead Exchanger', unit: 'VDU-05', healthScore: 88, vibrationMmS: 2.1, bearingTempC: 74, estimatedRulDays: 95, recommendation: 'Fouling trend normal. Pressure drop within acceptable threshold.', status: 'HEALTHY' },
  { tag: 'H-501', equipmentName: 'Crude Pre-heat Furnace Heater', unit: 'CDU-05', healthScore: 52, vibrationMmS: 5.6, bearingTempC: 96, estimatedRulDays: 7, recommendation: 'CRITICAL: Tube skin temp elevated. Inspect burner alignment.', status: 'CRITICAL' },
];

const INITIAL_EMISSIONS: EmissionsData = {
  so2Ppm: 12.4,
  noxPpm: 18.1,
  co2TonsDaily: 1420.5,
  flareEfficiency: 99.4,
  epaStatus: 'COMPLIANT',
  lastAuditTime: '2026-10-04 10:30:00',
};

const INITIAL_SHIFT_LOGS: ShiftLogEntry[] = [
  {
    id: 'LOG-901',
    timestamp: '2026-10-04 07:45:00',
    shift: 'Shift A (00:00 - 08:00)',
    operator: 'Chief Operator H. Vance',
    unitTag: 'CDU-05',
    category: 'OPERATIONAL',
    note: 'Completed crude feed switch to Heavy Arab Crude blend. Column top pressure adjusted to 3.2 bar. All temperature profiles stable.',
    severity: 'NORMAL',
    signedOff: true,
  },
  {
    id: 'LOG-902',
    timestamp: '2026-10-04 09:15:00',
    shift: 'Shift B (08:00 - 16:00)',
    operator: 'Sr. Console Tech M. Sterling',
    unitTag: 'FCC-05',
    category: 'MAINTENANCE',
    note: 'Wet Gas Compressor C-201B bearing vibration trend monitored. Increased lube oil circulation pressure by 0.5 bar. Alerted Mechanical Dept B.',
    severity: 'ATTENTION',
    signedOff: true,
  },
  {
    id: 'LOG-903',
    timestamp: '2026-10-04 10:10:00',
    shift: 'Shift B (08:00 - 16:00)',
    operator: 'Safety Supervisor R. Chen',
    unitTag: 'VDU-05',
    category: 'SAFETY',
    note: 'Ultrasonic thickness testing completed on Vacuum Column Overhead Pipe line. No corrosion loss exceeding 0.2mm tolerance.',
    severity: 'NORMAL',
    signedOff: true,
  },
];

export class RefineryDatabase {
  private state: RefineryState;
  private users: Map<string, { account: UserAccount; passwordHash: string }> = new Map();
  private userAnalysisRecords: Map<string, AnalysisRecord[]> = new Map();

  constructor() {
    const demoUser: UserAccount = {
      id: 'USR-1001',
      name: 'H. Vance',
      email: 'operator@refinery.com',
      role: 'Chief Process Engineer',
      createdAt: '2026-10-04 08:00:00',
    };

    this.users.set(demoUser.id, { account: demoUser, passwordHash: 'password123' });
    this.userAnalysisRecords.set(demoUser.id, [
      {
        id: 'ANL-8001',
        userId: demoUser.id,
        timestamp: '2026-10-04 09:30:00',
        title: 'Crude Fractionation & CDU Load Analysis',
        department: 'production',
        throughputPeakBbl: 382400,
        runningUnitsCount: 3,
        alarmCount: 0,
        summary: 'Crude charge rate benchmarked at 382,400 bbl/d. Yield efficiency at 98.2%.',
        status: 'COMPLETED',
      },
      {
        id: 'ANL-8002',
        userId: demoUser.id,
        timestamp: '2026-10-04 10:15:00',
        title: 'Vibration & Thermal Degradation Scan',
        department: 'maintenance',
        throughputPeakBbl: 376000,
        runningUnitsCount: 3,
        alarmCount: 1,
        summary: 'Wet Gas Compressor C-201B vibration warning logged. Seal overhaul recommended.',
        status: 'COMPLETED',
      },
    ]);

    this.state = {
      isDataImported: false,
      currentUser: demoUser,
      plant: { ...EMPTY_PLANT },
      units: [...INITIAL_UNITS],
      throughputHistory: [],
      alarms: [],
      maintenance: [],
      inspections: [],
      kpis: [],
      uploadHistory: [],
      predictiveAssets: [...INITIAL_PREDICTIVE_ASSETS],
      emissions: { ...INITIAL_EMISSIONS },
      shiftLogs: [...INITIAL_SHIFT_LOGS],
      analysisHistory: this.userAnalysisRecords.get(demoUser.id) || [],
      importedDepartments: {
        production: false,
        maintenance: false,
        inspections: false,
        kpis: false,
      },
    };
  }

  public registerUser(name: string, email: string, password: string): UserAccount {
    const existing = Array.from(this.users.values()).find(
      (u) => u.account.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error('User account already exists with this email.');
    }

    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAccount: UserAccount = {
      id: userId,
      name,
      email,
      role: 'Process Operations Tech',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.users.set(userId, { account: newAccount, passwordHash: password });
    this.userAnalysisRecords.set(userId, [
      {
        id: `ANL-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: userId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        title: 'Initial Account Onboarding Analysis',
        department: 'production',
        throughputPeakBbl: 350000,
        runningUnitsCount: 3,
        alarmCount: 0,
        summary: `Baseline analysis record created for ${name} (${email}).`,
        status: 'COMPLETED',
      },
    ]);

    this.state.currentUser = newAccount;
    this.state.analysisHistory = this.userAnalysisRecords.get(userId) || [];
    return newAccount;
  }

  public loginUser(email: string, password: string): UserAccount {
    const entry = Array.from(this.users.values()).find(
      (u) => u.account.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );

    if (!entry) {
      throw new Error('Invalid email or password credentials.');
    }

    this.state.currentUser = entry.account;
    this.state.analysisHistory = this.userAnalysisRecords.get(entry.account.id) || [];
    return entry.account;
  }

  public logoutUser() {
    this.state.currentUser = undefined;
    this.state.analysisHistory = [];
  }

  public saveAnalysisRecord(
    userId: string,
    record: { title: string; department: string; summary: string }
  ): AnalysisRecord {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const peakRate = this.state.throughputHistory.length
      ? Math.max(...this.state.throughputHistory.map((p) => p.rate))
      : 342896;

    const newRecord: AnalysisRecord = {
      id: `ANL-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      timestamp: timestampStr,
      title: record.title,
      department: record.department,
      throughputPeakBbl: peakRate,
      runningUnitsCount: this.state.units.filter((u) => u.state === 'RUNNING').length,
      alarmCount: this.state.alarms.filter((a) => !a.acknowledged).length,
      summary: record.summary,
      status: 'COMPLETED',
    };

    const userRecords = this.userAnalysisRecords.get(userId) || [];
    this.userAnalysisRecords.set(userId, [newRecord, ...userRecords]);
    this.state.analysisHistory = this.userAnalysisRecords.get(userId) || [];
    return newRecord;
  }

  public getState(): RefineryState {
    return this.state;
  }

  public resetState(): RefineryState {
    this.state = {
      isDataImported: false,
      plant: { ...EMPTY_PLANT },
      units: [...INITIAL_UNITS],
      throughputHistory: [],
      alarms: [],
      maintenance: [],
      inspections: [],
      kpis: [],
      uploadHistory: [],
      predictiveAssets: [...INITIAL_PREDICTIVE_ASSETS],
      emissions: { ...INITIAL_EMISSIONS },
      shiftLogs: [...INITIAL_SHIFT_LOGS],
      importedDepartments: {
        production: false,
        maintenance: false,
        inspections: false,
        kpis: false,
      },
    };
    return this.state;
  }

  public addShiftLog(log: Omit<ShiftLogEntry, 'id' | 'timestamp' | 'signedOff'>) {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: ShiftLogEntry = {
      id: `LOG-${Math.floor(900 + Math.random() * 100)}`,
      timestamp: timestampStr,
      shift: log.shift,
      operator: log.operator || 'Operator OP-402',
      unitTag: log.unitTag || 'PLANT-WIDE',
      category: log.category || 'OPERATIONAL',
      note: log.note,
      severity: log.severity || 'NORMAL',
      signedOff: true,
    };

    if (!this.state.shiftLogs) {
      this.state.shiftLogs = [];
    }
    this.state.shiftLogs = [newEntry, ...this.state.shiftLogs];
    return this.state;
  }

  public clearUploadHistory(): RefineryState {
    this.state.uploadHistory = [];
    return this.state;
  }

  public recordUpload(
    department: 'production' | 'maintenance' | 'inspections' | 'kpis',
    filename: string,
    rowsCount: number,
    summary: string
  ) {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const newRecord = {
      id: `LOG-${Math.floor(8000 + Math.random() * 1000)}`,
      timestamp: timestampStr,
      department,
      filename: filename || `${department}_telemetry_${now.getTime().toString().slice(-4)}.csv`,
      rowsIngested: rowsCount,
      status: 'SUCCESS' as const,
      uploadedBy: 'Operator OP-402',
      fileSize: `${(rowsCount * 0.28 + 0.5).toFixed(1)} KB`,
      summary,
    };

    this.state.uploadHistory = [newRecord, ...this.state.uploadHistory];
  }

  public acknowledgeAlarm(alarmId: string) {
    const alarm = this.state.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.acknowledged = true;
    }
    this.updateCounts();
    return this.state;
  }

  public acknowledgeAllAlarms() {
    this.state.alarms.forEach(a => {
      a.acknowledged = true;
    });
    this.updateCounts();
    return this.state;
  }

  // Micro-fluctuate live telemetry (simulating live REST / streaming feed from physical refinery sensors)
  public tickLiveTelemetry() {
    this.state.units = this.state.units.map(unit => {
      if (unit.state !== 'RUNNING') return unit;
      const rateDelta = Math.floor((Math.random() - 0.48) * 120);
      const tempDelta = Math.floor((Math.random() - 0.5) * 2);
      const newRate = Math.max(0, Math.min(unit.maxRate, unit.rate + rateDelta));
      const newLoad = Math.round((newRate / unit.maxRate) * 100);
      const newTemp = Math.max(20, Math.min(800, unit.temp + tempDelta));
      return {
        ...unit,
        rate: newRate,
        load: newLoad,
        temp: newTemp,
      };
    });

    // If data is imported and throughput points exist, slightly wiggle the current hour's point
    if (this.state.throughputHistory.length > 0) {
      const lastIdx = this.state.throughputHistory.length - 1;
      const totalRate = this.state.units.reduce((sum, u) => sum + (u.state === 'RUNNING' ? u.rate : 0), 0);
      this.state.throughputHistory[lastIdx].rate = totalRate;
    }

    return this.state;
  }

  public updateCounts() {
    const unack = this.state.alarms.filter(a => !a.acknowledged).length;
    const overdueInsp = this.state.inspections.filter(i => i.status === 'OVERDUE' || i.status === 'ACTION_REQUIRED').length;
    const blockedWo = this.state.maintenance.filter(m => m.status === 'BLOCKED').length;

    this.state.plant.unackAlarmsCount = unack;
    this.state.plant.overdueInspectionsCount = overdueInsp;
    this.state.plant.blockedWorkOrdersCount = blockedWo;

    if (unack > 2) {
      this.state.plant.status = 'CRITICAL ALARM';
    } else if (unack > 0 || overdueInsp > 0 || blockedWo > 0) {
      this.state.plant.status = 'WARNING';
    } else {
      this.state.plant.status = 'NORMAL OPERATIONS';
    }
  }

  public loadProductionCSV(rows: any[]) {
    // Parse production units & plant nameplate crude
    const newUnits: ProductionUnit[] = [];
    let totalRate = 0;
    let nameplateTotal = 0;

    rows.forEach((row, i) => {
      const tag = row.tag || row.TAG || `UNIT-0${i + 1}`;
      const name = row.unit || row.UNIT || row.name || row.NAME || `Production Unit ${i + 1}`;
      const state = (row.state || row.STATE || 'RUNNING').toUpperCase() as any;
      const rate = parseInt(row.rate || row.RATE || '100000', 10);
      const maxRate = parseInt(row.max_rate || row.MAX_RATE || row.capacity || '120000', 10);
      const temp = parseInt(row.temp || row.TEMP || row.temperature || '350', 10);
      const load = Math.round((rate / (maxRate || 1)) * 100);

      newUnits.push({
        tag,
        unit: name,
        state: ['RUNNING', 'STANDBY', 'MAINTENANCE', 'OFFLINE'].includes(state) ? state : 'RUNNING',
        rate,
        load,
        temp,
        maxRate,
        pressureBar: parseFloat(row.pressure || row.PRESSURE || '2.5')
      });

      totalRate += rate;
      nameplateTotal += maxRate;
    });

    if (newUnits.length > 0) {
      this.state.units = newUnits;
    }

    // Generate 24-hour Trailing Throughput Trend
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const baseRate = totalRate || 342896;
    this.state.throughputHistory = hours.map((time, idx) => {
      const variance = (Math.sin(idx) * 0.05 + Math.cos(idx * 0.5) * 0.03);
      return {
        time,
        rate: Math.round(baseRate * (1 + variance)),
        target: Math.round(baseRate * 1.02),
      };
    });

    this.state.plant.complexName = 'GULF COAST REFINING COMPLEX';
    this.state.plant.plantId = 'PLANT-01';
    this.state.plant.nameplateCrude = nameplateTotal || 380000;
    this.state.plant.licence = 'TX-REF-8892-A';
    this.state.importedDepartments.production = true;
    this.state.isDataImported = true;
    this.state.lastImportTime = new Date().toISOString();

    this.recordUpload(
      'production',
      'production_units_telemetry.csv',
      newUnits.length,
      `Ingested ${newUnits.length} units; Nameplate capacity ${nameplateTotal.toLocaleString()} bbl/d`
    );

    this.updateCounts();
  }

  public loadMaintenanceCSV(rows: any[]) {
    const orders: MaintenanceOrder[] = rows.map((row, i) => {
      const status = (row.status || row.STATUS || 'OPEN').toUpperCase();
      const priority = (row.priority || row.PRIORITY || 'HIGH').toUpperCase();
      return {
        id: row.id || row.ID || `WO-${1000 + i}`,
        equipmentTag: row.equipment_tag || row.EQUIPMENT_TAG || row.tag || `EQUIP-${i + 1}`,
        unit: row.unit || row.UNIT || 'CDU-05',
        description: row.description || row.DESCRIPTION || 'Routine overhaul & seal inspection',
        priority: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority) ? priority : 'MEDIUM',
        status: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].includes(status) ? status : 'OPEN',
        scheduledDate: row.scheduled_date || row.SCHEDULED_DATE || '2026-10-10',
        overdue: row.overdue === 'true' || row.OVERDUE === 'TRUE' || row.overdue === '1',
        assignedTeam: row.assigned_team || row.ASSIGNED_TEAM || 'Mechanical Dept B',
      };
    });

    if (orders.length > 0) {
      this.state.maintenance = orders;
    }

    this.state.importedDepartments.maintenance = true;
    this.state.isDataImported = true;
    this.state.lastImportTime = new Date().toISOString();

    this.recordUpload(
      'maintenance',
      'reliability_work_orders.csv',
      orders.length,
      `Loaded ${orders.length} work orders (${orders.filter(o => o.status === 'BLOCKED').length} blocked)`
    );

    this.updateCounts();
  }

  public loadInspectionsCSV(rows: any[]) {
    const list: SafetyInspection[] = rows.map((row, i) => {
      const status = (row.status || row.STATUS || 'PASSED').toUpperCase();
      const category = (row.category || row.CATEGORY || 'PRESSURE_VESSEL').toUpperCase();
      return {
        id: row.id || row.ID || `INSP-${200 + i}`,
        unitTag: row.unit_tag || row.UNIT_TAG || row.unit || 'VDU-05',
        inspector: row.inspector || row.INSPECTOR || 'Chief Inspector H. Vance',
        category: ['PRESSURE_VESSEL', 'CORROSION', 'OSHA_SAFETY', 'HAZMAT', 'FIRE_SYSTEM'].includes(category) ? category : 'PRESSURE_VESSEL',
        status: ['PASSED', 'PENDING', 'OVERDUE', 'ACTION_REQUIRED'].includes(status) ? status : 'PASSED',
        inspectionDate: row.inspection_date || row.INSPECTION_DATE || '2026-09-28',
        nextDue: row.next_due || row.NEXT_DUE || '2026-11-15',
        notes: row.notes || row.NOTES || 'Ultrasonic thickness test completed within acceptable tolerance.',
      };
    });

    if (list.length > 0) {
      this.state.inspections = list;
    }

    // Populate alarms if inspections reveal action required or critical states
    const newAlarms: AlarmEvent[] = [];
    list.forEach(insp => {
      if (insp.status === 'ACTION_REQUIRED' || insp.status === 'OVERDUE') {
        newAlarms.push({
          id: `ALM-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          severity: insp.status === 'ACTION_REQUIRED' ? 'CRITICAL' : 'WARNING',
          tag: insp.unitTag,
          message: `Safety Inspection alert on ${insp.unitTag}: ${insp.notes}`,
          acknowledged: false,
        });
      }
    });

    if (newAlarms.length > 0) {
      this.state.alarms = [...newAlarms, ...this.state.alarms];
    }

    this.state.importedDepartments.inspections = true;
    this.state.isDataImported = true;
    this.state.lastImportTime = new Date().toISOString();

    this.recordUpload(
      'inspections',
      'safety_inspections_audit.csv',
      list.length,
      `Loaded ${list.length} safety audits (${newAlarms.length} alerts triggered)`
    );

    this.updateCounts();
  }

  public loadKpiCSV(rows: any[]) {
    const kpis: KpiMetric[] = rows.map((row, i) => {
      const category = (row.category || row.CATEGORY || 'YIELD').toUpperCase();
      const status = (row.status || row.STATUS || 'OPTIMAL').toUpperCase();
      return {
        key: row.key || row.KEY || `KPI_${i + 1}`,
        category: ['YIELD', 'SAFETY', 'ENERGY', 'FINANCIAL', 'ENVIRONMENTAL'].includes(category) ? category : 'YIELD',
        label: row.label || row.LABEL || 'Metric',
        value: parseFloat(row.value || row.VALUE || '92.4'),
        target: parseFloat(row.target || row.TARGET || '95.0'),
        unit: row.unit || row.UNIT || '%',
        status: ['OPTIMAL', 'WARNING', 'CRITICAL'].includes(status) ? status : 'OPTIMAL',
        changePercent: parseFloat(row.change_percent || row.CHANGE_PERCENT || '+1.5'),
      };
    });

    if (kpis.length > 0) {
      this.state.kpis = kpis;
    }

    // Set safe days from KPI data if present
    const safeDaysKpi = kpis.find(k => k.key.toLowerCase().includes('safe_days') || k.label.toLowerCase().includes('safe days'));
    if (safeDaysKpi) {
      this.state.plant.safeDays = Math.round(safeDaysKpi.value);
    } else {
      this.state.plant.safeDays = 428;
    }

    const continuousKpi = kpis.find(k => k.key.toLowerCase().includes('continuous') || k.label.toLowerCase().includes('continuous run'));
    if (continuousKpi) {
      this.state.plant.continuousRunDays = Math.round(continuousKpi.value);
    } else {
      this.state.plant.continuousRunDays = 142;
    }

    this.state.importedDepartments.kpis = true;
    this.state.isDataImported = true;
    this.state.lastImportTime = new Date().toISOString();

    this.recordUpload(
      'kpis',
      'refinery_kpis_board.csv',
      kpis.length,
      `Updated ${kpis.length} operational KPIs (${this.state.plant.safeDays} Safe Days without LTI)`
    );

    this.updateCounts();
  }
}

export const db = new RefineryDatabase();
