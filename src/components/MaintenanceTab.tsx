import React, { useState } from 'react';
import { MaintenanceOrder } from '../types/refinery.js';
import { Wrench, AlertCircle, Clock, CheckCircle2, Filter } from 'lucide-react';

interface MaintenanceTabProps {
  maintenance: MaintenanceOrder[];
  onGoToImport: () => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenance,
  onGoToImport,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredOrders = maintenance.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'BLOCKED') return m.status === 'BLOCKED';
    if (filter === 'OPEN') return m.status === 'OPEN';
    if (filter === 'OVERDUE') return m.overdue;
    return true;
  });

  const blockedCount = maintenance.filter(m => m.status === 'BLOCKED').length;
  const overdueCount = maintenance.filter(m => m.overdue).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              EQUIPMENT RELIABILITY & MAINTENANCE WORK ORDERS
            </h2>
            <p className="text-gray-400 text-xs">
              Preventative maintenance schedules, pumps, compressors, and turnaround work orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0b0e11] border border-gray-800 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-gray-300">Blocked:</span>
            <span className="font-bold text-amber-400 tech-font">{blockedCount}</span>
          </div>

          <div className="px-3 py-1.5 bg-[#0b0e11] border border-gray-800 rounded flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-gray-300">Overdue:</span>
            <span className="font-bold text-red-400 tech-font">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* PREDICTIVE MAINTENANCE & REMAINING USEFUL LIFE (RUL) CARDS */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-100 uppercase tracking-wider tech-font text-xs">
              PREDICTIVE ASSET HEALTH & REMAINING USEFUL LIFE (RUL MODEL)
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 bg-[#18202b] px-2 py-0.5 rounded font-bold border border-gray-700">
            VIBRATION & THERMAL DEGRADATION MODEL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: 'P-101A', name: 'Crude Charge Pump A', unit: 'CDU-05', health: 94, vib: 1.8, temp: 68, rul: 142, status: 'HEALTHY', rec: 'Routine lube oil check at PM window.' },
            { tag: 'C-201B', name: 'FCC Wet Gas Compressor', unit: 'FCC-05', health: 68, vib: 4.2, temp: 88, rul: 18, status: 'DEGRADING', rec: 'Elevated bearing vibration. Overhaul seal in 14 days.' },
            { tag: 'E-304C', name: 'Vacuum Overhead Exchanger', unit: 'VDU-05', health: 88, vib: 2.1, temp: 74, rul: 95, status: 'HEALTHY', rec: 'Fouling trend normal. Delta-P normal.' },
            { tag: 'H-501', name: 'Crude Preheat Furnace', unit: 'CDU-05', health: 52, vib: 5.6, temp: 96, rul: 7, status: 'CRITICAL', rec: 'CRITICAL: Tube wall skin temp elevated. Inspect burners.' },
          ].map((asset) => (
            <div key={asset.tag} className="bg-[#0b0e11] border border-[#1a222c] rounded p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs tech-font">{asset.tag}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  asset.status === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : asset.status === 'DEGRADING'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {asset.status}
                </span>
              </div>

              <div>
                <div className="font-bold text-gray-200 text-xs truncate">{asset.name}</div>
                <div className="text-[10px] text-gray-400">{asset.unit}</div>
              </div>

              {/* Health Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">Health Index</span>
                  <span className="font-bold text-gray-200">{asset.health}%</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded overflow-hidden">
                  <div
                    className={`h-full ${asset.health < 60 ? 'bg-red-500' : asset.health < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${asset.health}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#161c24]">
                <div>
                  <span className="text-gray-500 block">VIBRATION</span>
                  <span className="font-bold text-gray-200">{asset.vib} mm/s</span>
                </div>
                <div>
                  <span className="text-gray-500 block">ESTIMATED RUL</span>
                  <span className="font-bold text-amber-400">{asset.rul} Days</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 bg-[#12171f] p-2 rounded border border-gray-800/80 leading-snug">
                {asset.rec}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Work Orders Card */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-4 shadow-sm">
        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>FILTER WORK ORDERS:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {['ALL', 'OPEN', 'BLOCKED', 'OVERDUE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  filter === f
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#18202b] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Work Orders Table */}
        {maintenance.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-gray-400 text-sm">No maintenance work orders loaded in current session register.</p>
            <button
              onClick={onGoToImport}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded transition-colors text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Import Maintenance CSV File</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c2430] text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">WO ID</th>
                  <th className="py-2.5 px-3">EQUIPMENT TAG</th>
                  <th className="py-2.5 px-3">UNIT</th>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">ASSIGNED TEAM</th>
                  <th className="py-2.5 px-3 text-right">SCHEDULED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c26]">
                {filteredOrders.map(m => (
                  <tr key={m.id} className="hover:bg-[#151b24] transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-400 tech-font">{m.id}</td>
                    <td className="py-3 px-3 font-semibold text-gray-100">{m.equipmentTag}</td>
                    <td className="py-3 px-3 text-gray-400">{m.unit}</td>
                    <td className="py-3 px-3 text-gray-300 max-w-xs">{m.description}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.priority === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : m.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-gray-800 text-gray-300'
                      }`}>
                        {m.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'BLOCKED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : m.status === 'IN_PROGRESS'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{m.assignedTeam}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-400">
                      {m.scheduledDate}
                      {m.overdue && (
                        <span className="ml-2 text-[9px] bg-red-950 text-red-400 px-1 py-0.5 rounded border border-red-800 font-bold">
                          OVERDUE
                        </span>
                      )}
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
