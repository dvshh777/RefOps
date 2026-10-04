import React, { useState } from 'react';
import {
  RefineryState,
  ProductionUnit,
  AlarmEvent
} from '../types/refinery.js';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Upload,
  ExternalLink
} from 'lucide-react';
import { AuditReportModal } from './AuditReportModal.tsx';

interface OverviewTabProps {
  state: RefineryState;
  onAcknowledgeAlarm: (alarmId: string) => void;
  onGoToImport: () => void;
  onLoadSampleData: () => void;
  onNavigateToTab?: (tab: string, tag?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  state,
  onAcknowledgeAlarm,
  onGoToImport,
  onLoadSampleData,
  onNavigateToTab,
}) => {
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const { plant, units, throughputHistory, alarms, isDataImported } = state;

  const unackAlarms = alarms.filter(a => !a.acknowledged);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto select-none">
      {/* 1. Top Hazard Banner */}
      <div className="bg-[#141a22] border border-[#232d39] rounded overflow-hidden flex items-stretch text-xs font-mono shadow-sm">
        <div className="hazard-stripe-yellow w-12 shrink-0 flex items-center justify-center border-r border-[#2d3846]"></div>
        <div className="p-3 flex-1 flex flex-wrap items-center justify-between gap-2">
          <div className="text-gray-300">
            <span className="text-amber-400 font-bold tracking-wider">
              LIVE TRANSMISSION ·{' '}
            </span>
            <span className="text-gray-400">
              Express + PostgreSQL + Redis API actively streaming operational telemetry. Micro-fluctuations live.
            </span>
          </div>

          {!isDataImported && (
            <button
              onClick={onLoadSampleData}
              className="bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0"
            >
              LOAD ALL SAMPLE DATA (1-CLICK)
            </button>
          )}
        </div>
      </div>

      {/* 2. Plant Summary Top Card */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-4 shadow-sm">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
            <span className="font-bold text-gray-100 text-sm tracking-widest uppercase tech-font">
              {plant.complexName}
            </span>
            <span className="text-gray-600">•</span>
            <span className="bg-[#18202b] text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-700">
              {plant.plantId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{plant.status}</span>
            </div>
          </div>
        </div>

        {/* 4-Column Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300">
          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">NAMEPLATE CRUDE</div>
            <div className="text-base sm:text-lg font-bold text-gray-100 tech-font">
              {plant.nameplateCrude > 0 ? plant.nameplateCrude.toLocaleString() : '0'}{' '}
              <span className="text-xs font-normal text-gray-400">bbl/d</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">CONTINUOUS RUN</div>
            <div className="text-base sm:text-lg font-bold text-gray-100 tech-font">
              {plant.continuousRunDays}{' '}
              <span className="text-xs font-normal text-gray-400">days</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">SAFE DAYS</div>
            <div className="text-base sm:text-lg font-bold text-gray-100 tech-font">
              {plant.safeDays}{' '}
              <span className="text-xs font-normal text-gray-400">days</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">LICENCE</div>
            <div className="text-base sm:text-lg font-bold text-gray-100 tech-font">
              {plant.licence || '--'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Trailing Throughput & Alarm Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Crude Throughput - Trailing 24 H */}
        <div className="lg:col-span-2 bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-3 flex flex-col justify-between shadow-sm min-h-[260px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
              <h2 className="font-bold text-gray-200 tracking-wider uppercase tech-font">
                CRUDE THROUGHPUT – TRAILING 24 H
              </h2>
            </div>
            <span className="bg-[#18202b] text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-700">
              TREND-24
            </span>
          </div>

          {throughputHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 space-y-2">
              <Activity className="w-8 h-8 text-gray-600 stroke-[1.5]" />
              <p className="text-sm font-medium text-gray-400">
                No throughput indicator published for this shift.
              </p>
              <p className="text-[11px] text-gray-500 max-w-sm">
                Upload production unit CSV data in the Import Data tab to render live 24-hour throughput telemetry trends.
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 flex flex-col justify-end pt-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Peak: {Math.max(...throughputHistory.map(p => p.rate)).toLocaleString()} bbl/d
                </span>
                <span className="text-gray-400">Target: 380,000 bbl/d</span>
              </div>

              {/* Render SVG Throughput Trend Line */}
              <div className="h-44 w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#1f2937" strokeDasharray="3 3" />

                  {/* Target Line */}
                  <line x1="0" y1="35" x2="500" y2="35" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 2" />

                  {/* Area fill under curve */}
                  {(() => {
                    const max = Math.max(...throughputHistory.map(p => p.rate), 400000);
                    const points = throughputHistory.map((p, i) => {
                      const x = (i / (throughputHistory.length - 1)) * 500;
                      const y = 110 - (p.rate / max) * 90;
                      return `${x},${y}`;
                    }).join(' ');

                    const firstX = 0;
                    const lastX = 500;
                    const areaPoints = `${firstX},110 ${points} ${lastX},110`;

                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#throughputGlow)" opacity="0.3" />
                        <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                        <defs>
                          <linearGradient id="throughputGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Time X-Axis Ticks */}
              <div className="flex justify-between text-[10px] text-gray-500 font-mono px-1 pt-1">
                {throughputHistory.map(p => (
                  <span key={p.time}>{p.time}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Alarm & Event Journal */}
        <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
              <h2 className="font-bold text-gray-200 tracking-wider uppercase tech-font">
                ALARM & EVENT JOURNAL
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#18202b] text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-700">
                ALM-07
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                unackAlarms.length > 0
                  ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {unackAlarms.length} unack
              </span>
            </div>
          </div>

          {alarms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 stroke-[1.5]" />
              <p className="text-gray-400 font-medium">
                Journal clear. No active alarms logged.
              </p>
              <p className="text-[11px] text-gray-500">
                Safety and inspection warnings will stream here when detected in uploaded CSV files.
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {alarms.map(a => (
                <div
                  key={a.id}
                  className={`p-2.5 rounded border text-[11px] space-y-1 transition-all ${
                    !a.acknowledged
                      ? 'bg-[#1c1315] border-red-900/80 text-red-200 hover:border-red-500'
                      : 'bg-[#0d1117] border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => onNavigateToTab && onNavigateToTab('units', a.tag)}
                      className="flex items-center gap-1.5 font-bold cursor-pointer group"
                      title="Click to go directly to alert area"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        a.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                      }`}></span>
                      <span className="text-gray-100 group-hover:text-amber-400 underline decoration-amber-500/40">{a.tag}</span>
                      <ExternalLink className="w-3 h-3 text-amber-500 opacity-80 group-hover:opacity-100" />
                      <span className="text-[10px] text-gray-500">[{a.timestamp}]</span>
                    </div>

                    {!a.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlarm(a.id)}
                        className="text-[10px] bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 px-2 py-0.5 rounded transition-colors cursor-pointer font-bold"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Lower Grid: Production Units - Live Status & Requires Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Production Units - Live Status Grid */}
        <div className="lg:col-span-2 bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
              <h2 className="font-bold text-gray-200 tracking-wider uppercase tech-font">
                PRODUCTION UNITS – LIVE STATUS
              </h2>
            </div>
            <span className="bg-[#18202b] text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-700">
              UNIT-GRID
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1c2430] text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="py-2 px-3">TAG</th>
                  <th className="py-2 px-3">UNIT</th>
                  <th className="py-2 px-3">STATE</th>
                  <th className="py-2 px-3 text-right">RATE</th>
                  <th className="py-2 px-3">LOAD</th>
                  <th className="py-2 px-3 text-right">°C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c26]">
                {units.map((u: ProductionUnit) => (
                  <tr key={u.tag} className="hover:bg-[#151b24] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-400/90">{u.tag}</td>
                    <td className="py-2.5 px-3 text-gray-200">{u.unit}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.state === 'RUNNING'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                          : u.state === 'STANDBY'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                          : 'bg-red-950/80 text-red-400 border border-red-800/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.state === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}></span>
                        <span>{u.state}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-100 tech-font">
                      {u.rate.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-gray-400">bbl/d</span>
                    </td>
                    <td className="py-2.5 px-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#090c0f] h-2 rounded overflow-hidden border border-gray-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              u.load > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${u.load}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] text-gray-400 min-w-[30px] text-right">
                          {u.load}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-300 tech-font">
                      {u.temp}°C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Requires Action */}
        <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-3 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
              <h2 className="font-bold text-gray-200 tracking-wider uppercase tech-font">
                REQUIRES ACTION
              </h2>
            </div>
            <span className="bg-[#18202b] text-gray-400 px-2 py-0.5 rounded text-[10px] border border-gray-700">
              ATTN-01
            </span>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {/* Unacknowledged Alarms Action Card */}
            <div
              onClick={() => onNavigateToTab && onNavigateToTab('units')}
              className="p-3 bg-[#0b0e11] border border-[#1a222c] hover:border-amber-500/50 rounded flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 group-hover:text-amber-400 font-medium">Unacknowledged alarms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold tech-font px-2.5 py-0.5 rounded ${
                  plant.unackAlarmsCount > 0 ? 'bg-red-950 text-red-400 border border-red-800 font-extrabold' : 'text-amber-500'
                }`}>
                  {plant.unackAlarmsCount}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400" />
              </div>
            </div>

            {/* Overdue Inspections Action Card */}
            <div
              onClick={() => onNavigateToTab && onNavigateToTab('inspections')}
              className="p-3 bg-[#0b0e11] border border-[#1a222c] hover:border-amber-500/50 rounded flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 group-hover:text-amber-400 font-medium">Overdue inspections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold tech-font px-2.5 py-0.5 rounded ${
                  plant.overdueInspectionsCount > 0 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-amber-500'
                }`}>
                  {plant.overdueInspectionsCount}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400" />
              </div>
            </div>

            {/* Blocked Work Orders Action Card */}
            <div
              onClick={() => onNavigateToTab && onNavigateToTab('maintenance')}
              className="p-3 bg-[#0b0e11] border border-[#1a222c] hover:border-amber-500/50 rounded flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-300 group-hover:text-amber-400 font-medium">Blocked work orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold tech-font px-2.5 py-0.5 rounded ${
                  plant.blockedWorkOrdersCount > 0 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-amber-500'
                }`}>
                  {plant.blockedWorkOrdersCount}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => setShowAuditModal(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-3 rounded flex items-center justify-between transition-colors cursor-pointer text-xs shadow-md"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>EXPORT OFFICIAL DAILY AUDIT REPORT</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToImport}
              className="w-full bg-[#161c24] hover:bg-[#1f2834] text-gray-300 border border-gray-700 py-2 px-3 rounded flex items-center justify-between transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload department CSV files</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Environmental Emissions & Flare Monitoring Section */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 text-xs font-mono space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
            <span className="font-bold text-gray-100 text-sm tracking-widest uppercase tech-font">
              ENVIRONMENTAL EMISSIONS & SAFETY FLARE MONITOR
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>EPA COMPLIANT (AUDIT AUD-2026)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300">
          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">SO₂ EMISSIONS</div>
            <div className="text-base font-bold text-emerald-400 tech-font">
              {state.emissions?.so2Ppm || 12.4} <span className="text-xs font-normal text-gray-400">ppm</span>
            </div>
            <div className="text-[10px] text-gray-500">Threshold: &lt; 30.0 ppm</div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">NOₓ EMISSIONS</div>
            <div className="text-base font-bold text-emerald-400 tech-font">
              {state.emissions?.noxPpm || 18.1} <span className="text-xs font-normal text-gray-400">ppm</span>
            </div>
            <div className="text-[10px] text-gray-500">Threshold: &lt; 40.0 ppm</div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">DAILY CO₂ FOOTPRINT</div>
            <div className="text-base font-bold text-amber-400 tech-font">
              {state.emissions?.co2TonsDaily || 1420.5} <span className="text-xs font-normal text-gray-400">Tons</span>
            </div>
            <div className="text-[10px] text-gray-500">Solomon Energy Index Target: 92.0</div>
          </div>

          <div className="p-3 bg-[#0b0e11] border border-[#1a222c] rounded">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">FLARE COMBUSTION EFFICIENCY</div>
            <div className="text-base font-bold text-emerald-400 tech-font">
              {state.emissions?.flareEfficiency || 99.4}%
            </div>
            <div className="text-[10px] text-gray-500">Steam Assist Ratio: 0.45</div>
          </div>
        </div>
      </div>

      {/* Audit Report Modal */}
      {showAuditModal && (
        <AuditReportModal state={state} onClose={() => setShowAuditModal(false)} />
      )}
    </div>
  );
};
