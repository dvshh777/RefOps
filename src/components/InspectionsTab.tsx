import React from 'react';
import { SafetyInspection } from '../types/refinery.js';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface InspectionsTabProps {
  inspections: SafetyInspection[];
  onGoToImport: () => void;
}

export const InspectionsTab: React.FC<InspectionsTabProps> = ({
  inspections,
  onGoToImport,
}) => {
  const actionRequiredCount = inspections.filter(i => i.status === 'ACTION_REQUIRED' || i.status === 'OVERDUE').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              SAFETY & REGULATORY COMPLIANCE INSPECTIONS
            </h2>
            <p className="text-gray-400 text-xs">
              Pressure vessel integrity, corrosion thickness, OSHA safety, and hazardous material audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0b0e11] border border-gray-800 rounded flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-gray-300">Action Needed:</span>
            <span className={`font-bold tech-font ${
              actionRequiredCount > 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400'
            }`}>
              {actionRequiredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#18202b]">
          <h3 className="font-bold text-gray-200 uppercase tracking-wider tech-font">
            INSPECTION LOGS & AUDIT RECORDS
          </h3>
          <span className="text-gray-400 text-[11px]">{inspections.length} RECORDS REGISTERED</span>
        </div>

        {inspections.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-gray-400 text-sm">No safety inspections loaded in current register.</p>
            <button
              onClick={onGoToImport}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded transition-colors text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Import Safety Inspections CSV</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.map(insp => (
              <div
                key={insp.id}
                className={`p-4 rounded border space-y-2.5 transition-all ${
                  insp.status === 'ACTION_REQUIRED' || insp.status === 'OVERDUE'
                    ? 'bg-[#181112] border-red-900/80 text-red-200'
                    : 'bg-[#0b0e11] border-[#1a222c] text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 tech-font">{insp.id}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-gray-200">{insp.unitTag}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    insp.status === 'PASSED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  }`}>
                    {insp.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <div>
                    <span className="text-gray-500">CATEGORY:</span> {insp.category}
                  </div>
                  <div>
                    <span className="text-gray-500">INSPECTOR:</span> {insp.inspector}
                  </div>
                  <div>
                    <span className="text-gray-500">LAST DATE:</span> {insp.inspectionDate}
                  </div>
                  <div>
                    <span className="text-gray-500">NEXT DUE:</span> {insp.nextDue}
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 bg-black/40 p-2 rounded border border-gray-800 leading-relaxed">
                  {insp.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
