import React from 'react';
import { KpiMetric, ThroughputPoint } from '../types/refinery.js';
import { BarChart3, TrendingUp, Award, RefreshCw, Activity, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface KpiBoardTabProps {
  kpiMetrics: KpiMetric[];
  throughputHistory: ThroughputPoint[];
  safeDays: number;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onGoToImport: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b0e11] border border-amber-500/50 p-3 rounded shadow-xl font-mono text-xs space-y-1">
        <div className="text-amber-400 font-bold border-b border-gray-800 pb-1">
          Time Index: {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}:
            </span>
            <span className="text-gray-100 font-bold">
              {Number(entry.value).toLocaleString()} bbl/d
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const KpiBoardTab: React.FC<KpiBoardTabProps> = ({
  kpiMetrics,
  throughputHistory,
  safeDays,
  autoRefresh,
  onToggleAutoRefresh,
  onGoToImport,
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Hero Header Banner with Auto Refresh Toggle */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              EXECUTIVE OPERATIONAL KPI BOARD & TREND ANALYTICS
            </h2>
            <p className="text-gray-400 text-xs">
              Live throughput performance trend curves, Solomon Energy Index, and refinery margins
            </p>
          </div>
        </div>

        {/* Right Action Controls: Auto Refresh & Safe Days */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Refresh Toggle Switch */}
          <div className="flex items-center gap-2.5 bg-[#0b0e11] px-3 py-1.5 rounded border border-[#1a222c]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`}></span>
              <span className="text-gray-300 font-bold text-[11px]">AUTO REFRESH</span>
            </div>
            <button
              onClick={onToggleAutoRefresh}
              className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{autoRefresh ? 'LIVE (1.5S)' : 'PAUSED'}</span>
            </button>
          </div>

          {/* Hero Safe Days Stat */}
          <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/40 rounded flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                SAFE DAYS
              </div>
              <div className="text-base font-bold text-emerald-400 tech-font">
                {safeDays} <span className="text-[10px] text-emerald-300 font-normal">DAYS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS THROUGHPUT HISTORY VISUALIZATION SECTION */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-100 uppercase tracking-wider tech-font text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>24-HOUR CRUDE THROUGHPUT PERFORMANCE TREND (RECHARTS ENGINE)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#f59e0b] rounded"></span>
              <span>Actual (bbl/d)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#10b981] rounded"></span>
              <span>Target Benchmark (380,000 bbl/d)</span>
            </span>
          </div>
        </div>

        {throughputHistory.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-gray-500 border border-dashed border-gray-800 rounded">
            <Activity className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-gray-400 font-medium text-xs">No throughput history data available for trend chart.</p>
            <p className="text-[11px] text-gray-500">
              Upload production unit CSV in the Import Data tab to stream live hourly throughput curves.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputHistory} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="throughputAreaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.6} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={380000}
                  label={{ value: 'Target: 380k', fill: '#10b981', fontSize: 10, position: 'top' }}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Actual Throughput"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#throughputAreaColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      {kpiMetrics.length === 0 ? (
        <div className="bg-[#10141a] border border-[#1e2631] rounded p-10 text-center space-y-3">
          <p className="text-gray-400 text-sm">No KPI metric cards loaded in current register.</p>
          <button
            onClick={onGoToImport}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded transition-colors text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Import Operational KPIs CSV</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpiMetrics.map((kpi) => (
            <div
              key={kpi.key}
              className="bg-[#10141a] border border-[#1e2631] hover:border-amber-500/40 rounded p-4 space-y-3 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#18202b] px-2 py-0.5 rounded font-bold">
                  {kpi.category}
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  kpi.status === 'OPTIMAL'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {kpi.status}
                </span>
              </div>

              <div className="text-gray-200 font-bold text-sm">{kpi.label}</div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-bold text-amber-400 tech-font">
                  {kpi.value}{' '}
                  <span className="text-xs text-gray-400 font-normal">{kpi.unit}</span>
                </div>

                <div className="text-xs text-gray-400">
                  Target: <span className="text-gray-200 font-semibold">{kpi.target} {kpi.unit}</span>
                </div>
              </div>

              {/* Progress bar vs Target */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-[#0b0e11] h-2 rounded overflow-hidden border border-gray-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (kpi.value / (kpi.target || 1)) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>0</span>
                  <span>Target: {kpi.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
