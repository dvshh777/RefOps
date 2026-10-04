import React, { useState, useEffect } from 'react';
import { Gauge, Radio, Cpu, User, LogOut } from 'lucide-react';
import { UserAccount } from '../types/refinery.js';

interface HeaderProps {
  activeTab: string;
  isApiConnected: boolean;
  currentUser?: UserAccount;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, isApiConnected, currentUser, onLogout }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [shiftInfo, setShiftInfo] = useState<{ name: string; hours: string }>({
    name: 'Shift C',
    hours: '22:00-06:00',
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${String(hours).padStart(2, '0')}:${mins}:${secs}`);

      // Calculate shift based on time of day
      if (hours >= 6 && hours < 14) {
        setShiftInfo({ name: 'Shift A', hours: '06:00-14:00' });
      } else if (hours >= 14 && hours < 22) {
        setShiftInfo({ name: 'Shift B', hours: '14:00-22:00' });
      } else {
        setShiftInfo({ name: 'Shift C', hours: '22:00-06:00' });
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return { title: 'OPERATIONS OVERVIEW', tag: 'OPS-00' };
      case 'units':
        return { title: 'PRODUCTION UNITS MONITOR', tag: 'UNIT-01' };
      case 'maintenance':
        return { title: 'EQUIPMENT RELIABILITY & MAINTENANCE', tag: 'MAINT-04' };
      case 'inspections':
        return { title: 'SAFETY & COMPLIANCE INSPECTIONS', tag: 'SAFE-02' };
      case 'kpis':
        return { title: 'OPERATIONAL KPI BOARD', tag: 'KPI-09' };
      case 'import':
        return { title: 'DEPARTMENT DATA IMPORT PORTAL', tag: 'DATA-03' };
      default:
        return { title: 'OPERATIONS OVERVIEW', tag: 'OPS-00' };
    }
  };

  const currentHeader = getTabTitle(activeTab);

  return (
    <header className="bg-[#0e1217] border-b border-[#1a2027] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
      {/* Left Title & Tag */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#f59e0b]/10 rounded border border-[#f59e0b]/30">
            <Gauge className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase tech-font flex items-center gap-1.5">
              <span>OROC</span>
              <span className="text-gray-600">•</span>
              <span className="text-amber-500/90">OPS CONTROL</span>
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">Centralized Refinery Dashboard</div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-gray-800 hidden md:block"></div>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-wider text-gray-100 uppercase tech-font">
            {currentHeader.title}
          </h1>
          <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 tech-font">
            {currentHeader.tag}
          </span>
        </div>
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center gap-2.5 text-xs font-mono">
        {/* Shift Badge */}
        <div className="bg-[#12171e] border border-gray-800 rounded px-2.5 py-1 flex items-center gap-2 text-gray-300">
          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span className="font-semibold text-gray-200">{shiftInfo.name}</span>
          <span className="text-gray-400 text-[11px] hidden sm:inline">{shiftInfo.hours}</span>
        </div>

        {/* Live Clock */}
        <div className="bg-black/40 border border-gray-800 rounded px-3 py-1 font-mono text-amber-400 font-bold tracking-widest min-w-[85px] text-center text-xs sm:text-sm">
          {timeStr || '22:16:33'}
        </div>

        {/* Operator / Account Badge & Logout */}
        <div className="flex items-center gap-2">
          <div className="bg-[#18202b] border border-amber-500/30 text-gray-200 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 shadow-xs">
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline font-bold">{currentUser?.name || 'OPERATOR'}</span>
            <span className="text-[9px] text-gray-400 font-normal hidden md:inline">({currentUser?.email})</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out / Switch Account"
              className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800 p-1.5 rounded cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
