import React, { useState } from 'react';
import { ProductionUnit } from '../types/refinery.js';
import {
  GitCommit,
  Flame,
  Gauge,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

interface ProcessFlowTabProps {
  units: ProductionUnit[];
  onGoToImport: () => void;
}

export const ProcessFlowTab: React.FC<ProcessFlowTabProps> = ({ units, onGoToImport }) => {
  const [selectedUnitTag, setSelectedUnitTag] = useState<string>('CDU-05');

  const cdu = units.find((u) => u.tag === 'CDU-05') || {
    tag: 'CDU-05',
    unit: 'Atmospheric Crude Distillation',
    state: 'RUNNING',
    rate: 176461,
    load: 88,
    temp: 362,
    maxRate: 200000,
    pressureBar: 3.2,
  };

  const vdu = units.find((u) => u.tag === 'VDU-05') || {
    tag: 'VDU-05',
    unit: 'Vacuum Distillation',
    state: 'RUNNING',
    rate: 94246,
    load: 86,
    temp: 415,
    maxRate: 110000,
    pressureBar: 0.15,
  };

  const fcc = units.find((u) => u.tag === 'FCC-05') || {
    tag: 'FCC-05',
    unit: 'Fluid Catalytic Cracking',
    state: 'RUNNING',
    rate: 72189,
    load: 90,
    temp: 543,
    maxRate: 80000,
    pressureBar: 2.8,
  };

  const selectedUnit =
    units.find((u) => u.tag === selectedUnitTag) ||
    (selectedUnitTag === 'CDU-05' ? cdu : selectedUnitTag === 'VDU-05' ? vdu : fcc);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Title Header */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <GitCommit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              INTERACTIVE REFINERY PROCESS FLOW DIAGRAM (P&ID)
            </h2>
            <p className="text-gray-400 text-xs">
              Live piping & instrumentation schematic for crude feed fractionation, distillation, and catalytic cracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HYDRAULIC FLOW ACTIVE</span>
          </span>
        </div>
      </div>

      {/* P&ID SCHEMATIC CANVAS / SVG SCHEMATIC */}
      <div className="bg-[#0b0e11] border border-[#1e2631] rounded-lg p-6 space-y-6 relative overflow-hidden shadow-xl">
        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#18202b] pb-2">
          <span>CRUDE FEED INLET (100% HEAVY ARAB)</span>
          <span>REFINERY FRACTIONATION TRAIN 05</span>
          <span>REFINED PRODUCT TANK FARM</span>
        </div>

        {/* Process Flow Diagram Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center relative py-4">
          {/* Node 1: Tank Farm / Feed Inlet */}
          <div className="bg-[#10141a] border border-gray-800 rounded p-4 space-y-2 text-center relative z-10 shadow-md">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full mx-auto flex items-center justify-center text-amber-500 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div className="font-bold text-gray-200 text-xs tech-font">CRUDE TANK FARM</div>
            <div className="text-[10px] text-gray-400">Tank T-101 / T-102</div>
            <div className="text-amber-400 font-bold text-sm tech-font">
              {(cdu.rate * 1.05).toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">
              DESALTED FEED
            </span>
          </div>

          {/* Node 2: CDU-05 */}
          <div
            onClick={() => setSelectedUnitTag('CDU-05')}
            className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 text-center relative z-10 shadow-lg ${
              selectedUnitTag === 'CDU-05'
                ? 'bg-[#18202b] border-amber-500 shadow-amber-500/10'
                : 'bg-[#10141a] border-[#1e2631] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-400 font-bold">CDU-05</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="w-12 h-16 bg-[#161c24] border-2 border-amber-500/60 rounded mx-auto flex flex-col justify-between p-1.5 items-center">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-[8px] text-gray-400 font-mono">COLUMN</div>
            </div>

            <div className="font-bold text-gray-100 text-xs tech-font">Crude Distillation</div>
            <div className="text-amber-400 font-bold text-sm tech-font">
              {cdu.rate.toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Temp: <span className="text-gray-200 font-bold">{cdu.temp}°C</span> | Load: <span className="text-emerald-400 font-bold">{cdu.load}%</span>
            </div>
          </div>

          {/* Node 3: VDU-05 */}
          <div
            onClick={() => setSelectedUnitTag('VDU-05')}
            className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 text-center relative z-10 shadow-lg ${
              selectedUnitTag === 'VDU-05'
                ? 'bg-[#18202b] border-amber-500 shadow-amber-500/10'
                : 'bg-[#10141a] border-[#1e2631] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-400 font-bold">VDU-05</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="w-12 h-16 bg-[#161c24] border-2 border-amber-500/60 rounded mx-auto flex flex-col justify-between p-1.5 items-center">
              <Gauge className="w-4 h-4 text-amber-400" />
              <div className="text-[8px] text-gray-400 font-mono">VACUUM</div>
            </div>

            <div className="font-bold text-gray-100 text-xs tech-font">Vacuum Tower</div>
            <div className="text-amber-400 font-bold text-sm tech-font">
              {vdu.rate.toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Temp: <span className="text-gray-200 font-bold">{vdu.temp}°C</span> | Pressure: <span className="text-emerald-400 font-bold">{vdu.pressureBar || 0.15} bar</span>
            </div>
          </div>

          {/* Node 4: FCC-05 */}
          <div
            onClick={() => setSelectedUnitTag('FCC-05')}
            className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 text-center relative z-10 shadow-lg ${
              selectedUnitTag === 'FCC-05'
                ? 'bg-[#18202b] border-amber-500 shadow-amber-500/10'
                : 'bg-[#10141a] border-[#1e2631] hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-400 font-bold">FCC-05</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="w-12 h-16 bg-[#161c24] border-2 border-amber-500/60 rounded mx-auto flex flex-col justify-between p-1.5 items-center">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="text-[8px] text-gray-400 font-mono">CRACKER</div>
            </div>

            <div className="font-bold text-gray-100 text-xs tech-font">Fluid Catalytic Cracking</div>
            <div className="text-amber-400 font-bold text-sm tech-font">
              {fcc.rate.toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
            </div>
            <div className="text-[10px] text-gray-400">
              Temp: <span className="text-gray-200 font-bold">{fcc.temp}°C</span> | Load: <span className="text-emerald-400 font-bold">{fcc.load}%</span>
            </div>
          </div>

          {/* Node 5: Product Storage */}
          <div className="bg-[#10141a] border border-gray-800 rounded p-4 space-y-2 text-center relative z-10 shadow-md">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-full mx-auto flex items-center justify-center text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-gray-200 text-xs tech-font">FINISHED PRODUCTS</div>
            <div className="text-[10px] text-gray-400">Gasoline, Diesel, Jet Fuel</div>
            <div className="text-emerald-400 font-bold text-sm tech-font">
              {((cdu.rate + vdu.rate + fcc.rate) * 0.98).toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">
              SPEC COMPLIANT
            </span>
          </div>
        </div>
      </div>

      {/* SELECTED UNIT DETAILED INSPECTOR DRAWER */}
      {selectedUnit && (
        <div className="bg-[#10141a] border border-amber-500/40 rounded p-5 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#18202b]">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-amber-500 text-black font-bold text-xs rounded tech-font">
                {selectedUnit.tag}
              </span>
              <div>
                <h3 className="font-bold text-gray-100 text-sm tech-font uppercase">
                  {selectedUnit.unit} DETAILED P&ID SCHEMATIC INSPECTOR
                </h3>
                <p className="text-[11px] text-gray-400">
                  Real-time hydraulic telemetry and operating parameters for {selectedUnit.tag}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>HYDRAULIC PARAMETERS OPTIMAL</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0e11] p-3.5 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase font-bold">CURRENT FLOW RATE</div>
              <div className="text-xl font-bold text-amber-400 tech-font">
                {selectedUnit.rate.toLocaleString()} <span className="text-xs text-gray-400">bbl/d</span>
              </div>
              <div className="text-[10px] text-gray-500">Max Capacity: {selectedUnit.maxRate.toLocaleString()} bbl/d</div>
            </div>

            <div className="bg-[#0b0e11] p-3.5 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase font-bold">OPERATING TEMPERATURE</div>
              <div className="text-xl font-bold text-emerald-400 tech-font">
                {selectedUnit.temp} <span className="text-xs text-gray-400">°C</span>
              </div>
              <div className="text-[10px] text-gray-500">Normal Range: 300°C - 580°C</div>
            </div>

            <div className="bg-[#0b0e11] p-3.5 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase font-bold">OPERATING LOAD</div>
              <div className="text-xl font-bold text-amber-400 tech-font">
                {selectedUnit.load}%
              </div>
              <div className="text-[10px] text-gray-500">Nameplate Efficiency Index: 0.98</div>
            </div>

            <div className="bg-[#0b0e11] p-3.5 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase font-bold">COLUMN PRESSURE</div>
              <div className="text-xl font-bold text-blue-400 tech-font">
                {selectedUnit.pressureBar || 2.4} <span className="text-xs text-gray-400">bar</span>
              </div>
              <div className="text-[10px] text-gray-500">Safety Relief Setpoint: 12.0 bar</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
