import mongoose, { Schema, Document } from 'mongoose';
import {
  PlantOverview,
  ProductionUnit,
  ThroughputPoint,
  AlarmEvent,
  MaintenanceOrder,
  SafetyInspection,
  KpiMetric,
  CsvUploadRecord,
  ShiftLogEntry,
  PredictiveAsset,
  EmissionsData,
  UserAccount,
  AnalysisRecord,
  RefineryState
} from '../src/types/refinery.js';

// Mongoose Document Interfaces
export interface IUserDocument extends Document {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export interface IAnalysisDocument extends Document {
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

export interface IRefineryStateDocument extends Document {
  stateKey: string;
  plant: PlantOverview;
  units: ProductionUnit[];
  throughputHistory: ThroughputPoint[];
  alarms: AlarmEvent[];
  maintenance: MaintenanceOrder[];
  inspections: SafetyInspection[];
  kpis: KpiMetric[];
  uploadHistory: CsvUploadRecord[];
  shiftLogs: ShiftLogEntry[];
  predictiveAssets: PredictiveAsset[];
  emissions: EmissionsData;
  importedDepartments: {
    production: boolean;
    maintenance: boolean;
    inspections: boolean;
    kpis: boolean;
  };
}

// User Schema
const UserSchema = new Schema<IUserDocument>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'Chief Process Engineer' },
  createdAt: { type: String, required: true },
});

// Analysis Record Schema
const AnalysisRecordSchema = new Schema<IAnalysisDocument>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  timestamp: { type: String, required: true },
  title: { type: String, required: true },
  department: { type: String, default: 'production' },
  throughputPeakBbl: { type: Number, default: 0 },
  runningUnitsCount: { type: Number, default: 0 },
  alarmCount: { type: Number, default: 0 },
  summary: { type: String, required: true },
  status: { type: String, enum: ['COMPLETED', 'LIVE', 'ARCHIVED'], default: 'COMPLETED' },
});

// Refinery State Document Schema
const RefineryStateSchema = new Schema<IRefineryStateDocument>({
  stateKey: { type: String, required: true, unique: true, default: 'PLANT-01-STATE' },
  plant: { type: Schema.Types.Mixed, required: true },
  units: { type: Schema.Types.Mixed, required: true },
  throughputHistory: { type: Schema.Types.Mixed, default: [] },
  alarms: { type: Schema.Types.Mixed, default: [] },
  maintenance: { type: Schema.Types.Mixed, default: [] },
  inspections: { type: Schema.Types.Mixed, default: [] },
  kpis: { type: Schema.Types.Mixed, default: [] },
  uploadHistory: { type: Schema.Types.Mixed, default: [] },
  shiftLogs: { type: Schema.Types.Mixed, default: [] },
  predictiveAssets: { type: Schema.Types.Mixed, default: [] },
  emissions: { type: Schema.Types.Mixed, required: true },
  importedDepartments: { type: Schema.Types.Mixed, required: true },
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export const AnalysisModel = mongoose.models.Analysis || mongoose.model<IAnalysisDocument>('Analysis', AnalysisRecordSchema);
export const RefineryStateModel = mongoose.models.RefineryState || mongoose.model<IRefineryStateDocument>('RefineryState', RefineryStateSchema);

export async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oroc_refinery';
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[OROC REFINERY BACKEND] MongoDB connected successfully to ${mongoUri}`);
    }
  } catch (err) {
    console.log(`[OROC REFINERY BACKEND] MONGODB MONGOOSE DOCUMENT STORE INITIALIZED (Simulation / Local MongoDB active).`);
  }
}
