import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { CsvUploadRecord, RefineryState } from '../types/refinery.js';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  History,
  Trash2,
  Search,
  Filter,
  Check,
  Clock,
  FileJson,
  FolderDown,
  Database,
  Save,
  Share2
} from 'lucide-react';

interface ImportDataTabProps {
  onUploadCsv: (department: string, csvContent: string) => Promise<void>;
  onLoadAllSamples: () => Promise<void>;
  onResetData: () => Promise<void>;
  onClearUploadHistory?: () => Promise<void>;
  uploadHistory?: CsvUploadRecord[];
  importedDepts: {
    production: boolean;
    maintenance: boolean;
    inspections: boolean;
    kpis: boolean;
  };
  refineryState?: RefineryState;
}

export const ImportDataTab: React.FC<ImportDataTabProps> = ({
  onUploadCsv,
  onLoadAllSamples,
  onResetData,
  onClearUploadHistory,
  uploadHistory = [],
  importedDepts,
  refineryState,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('production');
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = [
    {
      id: 'production',
      title: 'Production Units CSV',
      description: 'Unit tags, states (RUNNING/STANDBY), flow rates (bbl/d), operating temperatures, max capacities',
      imported: importedDepts.production,
      sampleFile: 'production_sample.csv',
    },
    {
      id: 'maintenance',
      title: 'Reliability & Maintenance CSV',
      description: 'Work order IDs, equipment tags, unit assignments, descriptions, priority levels, status, overdue flag',
      imported: importedDepts.maintenance,
      sampleFile: 'maintenance_sample.csv',
    },
    {
      id: 'inspections',
      title: 'Safety & Compliance CSV',
      description: 'Inspection IDs, unit tags, inspector name, category (Pressure Vessel/Corrosion), status, inspection dates',
      imported: importedDepts.inspections,
      sampleFile: 'inspections_sample.csv',
    },
    {
      id: 'kpis',
      title: 'Operational KPIs CSV',
      description: 'KPI keys, labels, category, numerical value, target benchmark, unit, trend status',
      imported: importedDepts.kpis,
      sampleFile: 'kpis_sample.csv',
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        parsePreview(content);
      }
    };
    reader.readAsText(file);
  };

  const parsePreview = (content: string) => {
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    if (parsed.data && parsed.data.length > 0) {
      setPreviewRows(parsed.data.slice(0, 5));
      setPreviewHeaders(Object.keys(parsed.data[0] as object));
      setMessage(null);
    } else {
      setPreviewRows([]);
      setPreviewHeaders([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    parsePreview(val);
  };

  const handleConfirmUpload = async () => {
    if (!rawText.trim()) {
      setMessage({ type: 'error', text: 'Please upload a CSV file or paste CSV content first.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      await onUploadCsv(selectedDept, rawText);
      setMessage({
        type: 'success',
        text: `Successfully ingested CSV data for '${selectedDept.toUpperCase()}' into Express + MongoDB REST API!`,
      });
      setRawText('');
      setPreviewRows([]);
      setPreviewHeaders([]);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to parse and upload CSV data.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = (deptId: string) => {
    window.open(`/api/sample-csv/${deptId}`, '_blank');
  };

  // Export Full Dashboard State as JSON
  const handleExportJson = () => {
    if (!refineryState) {
      setMessage({ type: 'error', text: 'Refinery state is currently unavailable for export.' });
      return;
    }

    const jsonString = JSON.stringify(refineryState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().replace('T', '_').slice(0, 19);
    const filename = `oroc_refinery_state_${dateStr}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({
      type: 'success',
      text: `Exported full dashboard state snapshot to local JSON file: ${filename}`,
    });
  };

  // Export specific department or combined CSV file
  const handleExportCsv = (type: 'production' | 'maintenance' | 'inspections' | 'kpis' | 'combined') => {
    if (!refineryState) {
      setMessage({ type: 'error', text: 'Refinery state is currently unavailable for export.' });
      return;
    }

    let csvContent = '';
    let filename = '';
    const dateStr = new Date().toISOString().slice(0, 10);

    if (type === 'production') {
      filename = `oroc_production_units_${dateStr}.csv`;
      csvContent = Papa.unparse(refineryState.units || []);
    } else if (type === 'maintenance') {
      filename = `oroc_maintenance_orders_${dateStr}.csv`;
      csvContent = Papa.unparse(refineryState.maintenance || []);
    } else if (type === 'inspections') {
      filename = `oroc_safety_inspections_${dateStr}.csv`;
      csvContent = Papa.unparse(refineryState.inspections || []);
    } else if (type === 'kpis') {
      filename = `oroc_kpis_${dateStr}.csv`;
      csvContent = Papa.unparse(refineryState.kpis || []);
    } else if (type === 'combined') {
      filename = `oroc_combined_telemetry_${dateStr}.csv`;
      const combinedData = [
        ...(refineryState.units || []).map((u) => ({ TYPE: 'PRODUCTION_UNIT', TAG: u.tag, NAME: u.unit, STATE: u.state, RATE: u.rate, LOAD: `${u.load}%`, TEMP: `${u.temp}°C` })),
        ...(refineryState.maintenance || []).map((m) => ({ TYPE: 'MAINTENANCE_ORDER', TAG: m.equipmentTag, NAME: m.description, STATE: m.status, PRIORITY: m.priority })),
        ...(refineryState.inspections || []).map((i) => ({ TYPE: 'SAFETY_INSPECTION', TAG: i.unitTag, NAME: i.category, STATE: i.status, INSPECTOR: i.inspector })),
        ...(refineryState.kpis || []).map((k) => ({ TYPE: 'KPI_METRIC', TAG: k.key, NAME: k.label, STATE: k.status, VALUE: `${k.value} ${k.unit}` })),
      ];
      csvContent = Papa.unparse(combinedData);
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({
      type: 'success',
      text: `Exported ${type.toUpperCase()} telemetry data to local CSV file: ${filename}`,
    });
  };

  const filteredHistory = uploadHistory.filter((item) => {
    const matchesFilter =
      historyFilter === 'ALL' || item.department.toUpperCase() === historyFilter;
    const matchesSearch =
      historySearch === '' ||
      item.filename.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.id.toLowerCase().includes(historySearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Top Title Banner */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              SECURE DEPARTMENT DATA IMPORT PORTAL
            </h2>
            <p className="text-gray-400 text-xs">
              Upload collected CSV files from each department separately to trigger real-time telemetry streaming & live tracking alerts
            </p>
          </div>
        </div>

        {/* Global Demo Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadAllSamples}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3.5 py-2 rounded transition-all cursor-pointer shadow-sm text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>LOAD ALL DEPARTMENTS (1-CLICK)</span>
          </button>

          <button
            onClick={onResetData}
            className="bg-gray-800 hover:bg-red-950 hover:text-red-300 text-gray-300 border border-gray-700 font-bold px-3 py-2 rounded transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="Reset register to empty state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO EMPTY</span>
          </button>
        </div>
      </div>

      {/* Message Feedback Banner */}
      {message && (
        <div
          className={`p-3.5 rounded border flex items-center gap-2.5 text-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
              : 'bg-red-950/80 border-red-700 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Department Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const isSelected = selectedDept === dept.id;
          return (
            <div
              key={dept.id}
              onClick={() => {
                setSelectedDept(dept.id);
                setRawText('');
                setPreviewRows([]);
                setPreviewHeaders([]);
              }}
              className={`p-4 rounded border cursor-pointer transition-all space-y-3 relative ${
                isSelected
                  ? 'bg-[#18202b] border-amber-500 text-white shadow-lg'
                  : 'bg-[#10141a] border-[#1e2631] text-gray-400 hover:border-gray-700 hover:bg-[#141a22]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                  {dept.id}
                </span>

                {dept.imported ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>LOADED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-500">
                    EMPTY
                  </span>
                )}
              </div>

              <div className="font-bold text-gray-100 text-xs tech-font">{dept.title}</div>
              <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                {dept.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSample(dept.id);
                  }}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Sample CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Zone & Editor */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-5 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-200 uppercase tracking-wider tech-font">
              UPLOAD CSV FOR <span className="text-amber-400">{selectedDept.toUpperCase()}</span> DEPARTMENT
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadSample(selectedDept)}
            className="text-amber-400 hover:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedDept.toUpperCase()} CSV Template</span>
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#232d3a] hover:border-amber-500/60 bg-[#0b0e11] rounded-lg p-8 text-center cursor-pointer transition-all space-y-2 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="p-3 bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-500 rounded-full w-12 h-12 mx-auto flex items-center justify-center transition-all">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <p className="text-gray-200 font-bold text-sm">
            Click to browse or drop your {selectedDept.toUpperCase()} CSV file here
          </p>
          <p className="text-gray-500 text-xs">
            Supports standard CSV format with headers. Instant validation and REST ingestion.
          </p>
        </div>

        {/* Raw CSV Text Paste Box */}
        <div className="space-y-2">
          <label className="text-gray-400 text-xs font-bold block">
            OR PASTE RAW CSV CONTENT:
          </label>
          <textarea
            value={rawText}
            onChange={handleTextChange}
            placeholder={`Paste raw ${selectedDept.toUpperCase()} CSV rows here...`}
            rows={5}
            className="w-full bg-[#0b0e11] border border-[#1a222c] focus:border-amber-500 rounded p-3 text-xs text-amber-300 font-mono focus:outline-none"
          ></textarea>
        </div>

        {/* Preview Table if rows parsed */}
        {previewRows.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#18202b]">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>CSV PREVIEW VALIDATED ({previewRows.length} sample rows)</span>
            </div>

            <div className="overflow-x-auto bg-[#0b0e11] border border-[#1a222c] rounded">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#1c2430] text-gray-400 uppercase">
                    {previewHeaders.map((h) => (
                      <th key={h} className="py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161c26]">
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {previewHeaders.map((h) => (
                        <td key={h} className="py-2 px-3 text-gray-300">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleConfirmUpload}
            disabled={isUploading || !rawText.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-2.5 rounded transition-colors cursor-pointer text-xs flex items-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isUploading ? 'INGESTING DATA...' : 'INGEST & RUN TELEMETRY'}</span>
          </button>
        </div>
      </div>

      {/* Export Section - Save Dashboard State Locally */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-5 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-200 uppercase tracking-wider tech-font flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-cyan-400" />
              <span>EXPORT LOCAL DASHBOARD STATE & TELEMETRY</span>
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Save live plant parameters, unit loads, shift logs, and KPIs to JSON or CSV
          </span>
        </div>

        {/* Export Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1: JSON Full State */}
          <div className="bg-[#0b0e11] border border-[#1e2632] hover:border-cyan-500/50 rounded p-4 space-y-3 flex flex-col justify-between transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5 tech-font">
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <span>FULL STATE SNAPSHOT</span>
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                  JSON FORMAT
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Export complete JSON bundle containing plant overview, production units, throughput history, alarms, shift logs, maintenance, and emissions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full bg-cyan-600/20 hover:bg-cyan-500 hover:text-black text-cyan-300 font-bold text-xs py-2 px-3 rounded border border-cyan-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT DASHBOARD STATE (JSON)</span>
            </button>
          </div>

          {/* Card 2: Combined Telemetry CSV */}
          <div className="bg-[#0b0e11] border border-[#1e2632] hover:border-amber-500/50 rounded p-4 space-y-3 flex flex-col justify-between transition-colors">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5 tech-font">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>COMBINED TELEMETRY</span>
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold">
                  CSV BUNDLE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Consolidated multi-department CSV dataset merging units, work orders, safety inspections, and KPI targets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCsv('combined')}
              className="w-full bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs py-2 px-3 rounded border border-amber-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT COMBINED BUNDLE (CSV)</span>
            </button>
          </div>

          {/* Card 3: Specific Department CSVs */}
          <div className="bg-[#0b0e11] border border-[#1e2632] rounded p-4 space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2430]">
              <span className="font-bold text-gray-200 text-xs flex items-center gap-1.5 tech-font">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>DEPARTMENT CSV EXPORTS</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">INDIVIDUAL FILES</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleExportCsv('production')}
                className="bg-[#141b24] hover:bg-[#1a2330] text-gray-300 hover:text-white px-2.5 py-1.5 rounded border border-[#232e3d] flex items-center justify-between text-[10px] cursor-pointer"
              >
                <span>Production Units</span>
                <Download className="w-3 h-3 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('maintenance')}
                className="bg-[#141b24] hover:bg-[#1a2330] text-gray-300 hover:text-white px-2.5 py-1.5 rounded border border-[#232e3d] flex items-center justify-between text-[10px] cursor-pointer"
              >
                <span>Maintenance Orders</span>
                <Download className="w-3 h-3 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('inspections')}
                className="bg-[#141b24] hover:bg-[#1a2330] text-gray-300 hover:text-white px-2.5 py-1.5 rounded border border-[#232e3d] flex items-center justify-between text-[10px] cursor-pointer"
              >
                <span>Safety Inspections</span>
                <Download className="w-3 h-3 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv('kpis')}
                className="bg-[#141b24] hover:bg-[#1a2330] text-gray-300 hover:text-white px-2.5 py-1.5 rounded border border-[#232e3d] flex items-center justify-between text-[10px] cursor-pointer"
              >
                <span>Operational KPIs</span>
                <Download className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV UPLOAD HISTORY LOGS SECTION */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-100 uppercase tracking-wider tech-font text-sm">
                CSV UPLOAD HISTORY & AUDIT LOGS
              </h3>
              <p className="text-[11px] text-gray-400">
                Persistent log of all departmental CSV uploads, ingested row counts, operator signatures, and analysis summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#18202b] text-amber-400 px-2.5 py-1 rounded text-xs font-bold border border-gray-700">
              {uploadHistory.length} LOGS RECORDED
            </span>

            {onClearUploadHistory && uploadHistory.length > 0 && (
              <button
                onClick={onClearUploadHistory}
                className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0e11] p-3 rounded border border-[#1a222c]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              DEPARTMENT:
            </span>
            {['ALL', 'PRODUCTION', 'MAINTENANCE', 'INSPECTIONS', 'KPIS'].map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  historyFilter === f
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#18202b] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search history by filename or summary..."
              className="w-full bg-[#10141a] border border-[#232d3a] focus:border-amber-500 rounded pl-8 pr-3 py-1 text-[11px] text-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {/* History Table */}
        {uploadHistory.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-gray-500 border border-dashed border-gray-800 rounded">
            <Clock className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-gray-400 font-medium text-xs">No CSV upload history recorded yet.</p>
            <p className="text-[11px] text-gray-500">
              Upload any department CSV above or click "LOAD ALL DEPARTMENTS (1-CLICK)" to populate history logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#0b0e11] border border-[#1a222c] rounded">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1c2430] text-[10px] text-gray-400 uppercase tracking-wider bg-[#10141a]">
                  <th className="py-2.5 px-3">LOG ID</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">FILE NAME</th>
                  <th className="py-2.5 px-3 text-right">ROWS</th>
                  <th className="py-2.5 px-3 text-right">SIZE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">SUMMARY & TELEMETRY RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c26]">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#151b24] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-400 tech-font">{item.id}</td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px]">{item.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18202b] text-gray-200 border border-gray-700 uppercase">
                        {item.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-200 font-semibold max-w-[180px] truncate">
                      {item.filename}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-300 font-bold tech-font">
                      {item.rowsIngested}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400 text-[11px]">
                      {item.fileSize}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <Check className="w-3 h-3" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300 text-[11px] max-w-md truncate">
                      {item.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
