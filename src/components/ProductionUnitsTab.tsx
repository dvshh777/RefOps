import React from 'react';
import { ProductionUnit } from '../types/refinery.js';
import { Factory, Flame, Gauge } from 'lucide-react';

interface ProductionUnitsTabProps {
  units: ProductionUnit[];
  highlightTag?: string;
}

export const ProductionUnitsTab: React.FC<ProductionUnitsTabProps> = ({ units, highlightTag }) => {
  const totalCapacity = units.reduce((acc, u) => acc + u.maxRate, 0);
  const totalProduction = units.reduce((acc, u) => acc + (u.state === 'RUNNING' ? u.rate : 0), 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalProduction / totalCapacity) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Header Summary */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              PRODUCTION UNITS MONITOR & TELEMETRY
            </h2>
            <p className="text-gray-400 text-xs">
              Live distillation throughput, thermal stress monitoring, and operating pressures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-[10px] text-gray-400 uppercase">TOTAL PROCESSING RATE</div>
            <div className="text-lg font-bold text-amber-400 tech-font">
              {totalProduction.toLocaleString()} <span className="text-xs text-gray-400">bbl/d</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-gray-800"></div>

          <div>
            <div className="text-[10px] text-gray-400 uppercase">OVERALL UTILIZATION</div>
            <div className="text-lg font-bold text-emerald-400 tech-font">{overallUtilization}%</div>
          </div>
        </div>
      </div>

      {/* Grid of Units Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {units.map((unit) => {
          const isHighlighted = highlightTag && highlightTag.toUpperCase().includes(unit.tag.toUpperCase());
          return (
            <div
              key={unit.tag}
              className={`rounded p-4 space-y-4 shadow-sm transition-all border ${
                isHighlighted
                  ? 'bg-[#18202b] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
                  : 'bg-[#10141a] border-[#1e2631] hover:border-amber-500/40'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-center justify-between pb-3 border-b border-[#18202b]">
                <div>
                  <div className="text-sm font-bold text-amber-400 tech-font flex items-center gap-2">
                    <span>{unit.tag}</span>
                    {isHighlighted && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded animate-bounce">
                        ALERT LOCATION
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 font-medium">{unit.unit}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  unit.state === 'RUNNING'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {unit.state}
                </span>
              </div>

              {/* Gauge Row: Temperature & Pressure */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#0b0e11] border border-[#1a222c] rounded space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>TEMPERATURE</span>
                  </div>
                  <div className="text-base font-bold text-gray-100 tech-font">
                    {unit.temp}°C
                  </div>
                </div>

                <div className="p-2.5 bg-[#0b0e11] border border-[#1a222c] rounded space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 uppercase">
                    <Gauge className="w-3 h-3 text-amber-500" />
                    <span>PRESSURE</span>
                  </div>
                  <div className="text-base font-bold text-gray-100 tech-font">
                    {unit.pressureBar || 2.5} <span className="text-[10px] text-gray-400">bar</span>
                  </div>
                </div>
              </div>

              {/* Throughput Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">THROUGHPUT RATE</span>
                  <span className="text-gray-200 font-bold tech-font">
                    {unit.rate.toLocaleString()} / {unit.maxRate.toLocaleString()} bbl/d
                  </span>
                </div>
                <div className="w-full bg-[#0b0e11] h-2.5 rounded overflow-hidden border border-gray-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      unit.load > 88 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${unit.load}%` }}
                  ></div>
                </div>
              </div>

              {/* Micro Live Signal Indicator */}
              <div className="pt-2 border-t border-[#18202b] flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>REST Telemetry Stream Active</span>
                </div>
                <span>MAX CAPACITY: {unit.maxRate.toLocaleString()} BPD</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
