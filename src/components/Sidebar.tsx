import React from 'react';
import {
  LayoutDashboard,
  Factory,
  Wrench,
  ShieldCheck,
  BarChart3,
  Upload,
  Gauge,
  Database,
  ArrowUpRight,
  CheckCircle2,
  GitCommit,
  BookOpen,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  importedDeptsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  importedDeptsCount,
}) => {
  const navSections = [
    {
      groupLabel: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, tag: 'OPS-00' },
        { id: 'process', label: 'P&ID FLOW SCHEMATIC', icon: GitCommit, tag: 'PID-FLOW' },
        { id: 'units', label: 'PRODUCTION UNITS', icon: Factory, tag: 'UNIT-GRID' },
      ],
    },
    {
      groupLabel: 'RELIABILITY',
      items: [
        { id: 'maintenance', label: 'MAINTENANCE & RUL', icon: Wrench, tag: 'WO-88' },
      ],
    },
    {
      groupLabel: 'SAFETY & SHIFT',
      items: [
        { id: 'inspections', label: 'INSPECTIONS', icon: ShieldCheck, tag: 'INSP-12' },
        { id: 'logs', label: 'SHIFT LOGBOOK', icon: BookOpen, tag: 'HANDOVER' },
      ],
    },
    {
      groupLabel: 'PERFORMANCE & RECORDS',
      items: [
        { id: 'kpis', label: 'KPI BOARD', icon: BarChart3, tag: 'KPI-99' },
        { id: 'analysis', label: 'SAVED ANALYSIS', icon: History, tag: 'RECORDS' },
      ],
    },
    {
      groupLabel: 'DATA',
      items: [
        { id: 'import', label: 'IMPORT DATA', icon: Upload, tag: 'CSV-PORTAL' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0e1217] border-r border-[#1a2027] flex flex-col justify-between shrink-0 h-full select-none">
      {/* Brand Logo Header on Sidebar */}
      <div className="p-4 border-b border-[#181d24] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-widest text-gray-100 tech-font">OROC</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">CENTRALIZED REFINERY DASHBOARD</div>
          </div>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="py-3 px-2 flex-1 overflow-y-auto space-y-5">
        {navSections.map((section) => (
          <div key={section.groupLabel} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-gray-400 tracking-wider uppercase tech-font">
              {section.groupLabel}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e2631] text-amber-400 border-l-2 border-amber-500 font-semibold shadow-inner'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#151a21]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Register Status & Quick Upload Trigger */}
      <div className="p-3 border-t border-[#1a2027] bg-[#0b0e11]">
        <div className="hazard-stripe-muted rounded p-0.5 mb-2"></div>
        <div className="text-[10px] text-gray-400 font-mono tracking-wide uppercase mb-1 flex items-center justify-between">
          <span>REGISTER STATE</span>
          <span className="text-amber-400 font-bold">{importedDeptsCount}/4 DEPTS</span>
        </div>
        <button
          onClick={() => setActiveTab('import')}
          className="w-full bg-[#181d24] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 font-mono text-xs font-bold py-2 px-3 rounded flex items-center justify-between transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-amber-400 group-hover:text-black transition-colors" />
            <span className="tracking-wider">LOAD YOUR DATA</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
        </button>
      </div>
    </aside>
  );
};
