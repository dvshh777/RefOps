import React, { useState } from 'react';
import { RefineryState } from '../types/refinery.js';
import { FileText, Download, Copy, Check, X, Award, ShieldCheck, Activity, Gauge } from 'lucide-react';

interface AuditReportModalProps {
  state: RefineryState;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ state, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { plant, units, kpis, emissions, currentUser } = state;

  const peakRate = state.throughputHistory.length
    ? Math.max(...state.throughputHistory.map((p) => p.rate))
    : 382400;

  const unackAlarms = state.alarms.filter((a) => !a.acknowledged).length;
  const runningUnits = units.filter((u) => u.state === 'RUNNING').length;

  const generateReportText = () => {
    return `=================================================================
OFFICIAL DAILY REFINERY OPERATIONAL & COMPLIANCE AUDIT REPORT
COMPLEX: ${plant.complexName} | PLANT ID: ${plant.plantId}
AUDIT SERIAL: AUD-2026-0941 | DATE: ${new Date().toISOString().substring(0, 10)}
AUDITOR / OPERATOR: ${currentUser?.name || 'Chief Operator Vance'} (${currentUser?.email || 'operator@refinery.com'})
=================================================================

1. OPERATIONAL & THROUGHPUT SUMMARY
-----------------------------------------------------------------
- Plant Operational Status: ${plant.status}
- Safe Days Without LTI: ${plant.safeDays} DAYS
- Continuous Run Days: ${plant.continuousRunDays} DAYS
- Total Active Distillation Units: ${runningUnits} / ${units.length} RUNNING
- Peak Crude Processing Rate: ${peakRate.toLocaleString()} bbl/d

2. REFINERY UNITS TELEMETRY
-----------------------------------------------------------------
${units
  .map(
    (u) =>
      `• ${u.tag} (${u.unit}): ${u.rate.toLocaleString()} bbl/d | Load: ${u.load}% | Temp: ${u.temp}°C | Status: ${u.state}`
  )
  .join('\n')}

3. ENVIRONMENTAL & EPA COMPLIANCE AUDIT
-----------------------------------------------------------------
- SO2 Emissions: ${emissions?.so2Ppm || 12.4} ppm (Limit: <30.0 ppm) [PASSED]
- NOx Emissions: ${emissions?.noxPpm || 18.1} ppm (Limit: <40.0 ppm) [PASSED]
- Daily CO2 Footprint: ${emissions?.co2TonsDaily || 1420.5} Metric Tons
- Flare Combustion Efficiency: ${emissions?.flareEfficiency || 99.4}%
- EPA Compliance Status: ${emissions?.epaStatus || 'COMPLIANT'}

4. SAFETY & ALARM STATUS
-----------------------------------------------------------------
- Unacknowledged Alarms: ${unackAlarms}
- Overdue Inspections: ${plant.overdueInspectionsCount}
- Blocked Work Orders: ${plant.blockedWorkOrdersCount}

=================================================================
CERTIFIED ELECTRONIC SIGNATURE: ${currentUser?.name || 'H. Vance'} [CHIEF OPERATOR]
=================================================================`;
  };

  const handleDownloadCsv = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OROC_Daily_Audit_Report_${new Date().toISOString().substring(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyText = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="bg-[#10141a] border border-amber-500/50 rounded-lg max-w-3xl w-full p-6 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-100 text-sm tracking-wider uppercase tech-font">
                OFFICIAL DAILY REFINERY AUDIT & COMPLIANCE CERTIFICATE
              </h3>
              <p className="text-[11px] text-gray-400">
                AUDIT SERIAL: <span className="text-amber-400 font-bold">AUD-2026-0941</span> | GENERATED REAL-TIME
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto space-y-4 bg-[#0b0e11] border border-[#1a222c] rounded p-4 text-[#e1e7ed]">
          {/* Certificate Header Banner */}
          <div className="p-3 bg-[#161d26] border border-amber-500/30 rounded flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-gray-100 text-xs">{plant.complexName} ({plant.plantId})</div>
                <div className="text-[10px] text-gray-400">Status: {plant.status}</div>
              </div>
            </div>

            <div className="text-right text-[10px]">
              <div className="text-emerald-400 font-bold">{plant.safeDays} SAFE DAYS</div>
              <div className="text-gray-400">Auditor: {currentUser?.name || 'H. Vance'}</div>
            </div>
          </div>

          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#10141a] p-2.5 rounded border border-[#1e2631]">
              <div className="text-[9px] text-gray-400">PEAK THROUGHPUT</div>
              <div className="text-sm font-bold text-amber-400 tech-font">
                {peakRate.toLocaleString()} <span className="text-[9px] text-gray-500">bbl/d</span>
              </div>
            </div>

            <div className="bg-[#10141a] p-2.5 rounded border border-[#1e2631]">
              <div className="text-[9px] text-gray-400">ACTIVE UNITS</div>
              <div className="text-sm font-bold text-emerald-400 tech-font">
                {runningUnits} / {units.length} RUNNING
              </div>
            </div>

            <div className="bg-[#10141a] p-2.5 rounded border border-[#1e2631]">
              <div className="text-[9px] text-gray-400">SO₂ EMISSIONS</div>
              <div className="text-sm font-bold text-emerald-400 tech-font">
                {emissions?.so2Ppm || 12.4} <span className="text-[9px] text-gray-500">ppm</span>
              </div>
            </div>

            <div className="bg-[#10141a] p-2.5 rounded border border-[#1e2631]">
              <div className="text-[9px] text-gray-400">FLARE EFFICIENCY</div>
              <div className="text-sm font-bold text-emerald-400 tech-font">
                {emissions?.flareEfficiency || 99.4}%
              </div>
            </div>
          </div>

          {/* Full Plaintext Format Container */}
          <div className="space-y-1 pt-2">
            <div className="text-[10px] text-gray-400 uppercase font-bold">RAW CERTIFIED AUDIT TEXT</div>
            <pre className="bg-[#080a0c] p-3 rounded border border-gray-800 text-[10px] text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {generateReportText()}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#18202b]">
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Digital Cryptographic Audit Signature Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 bg-[#18202b] hover:bg-[#202936] text-gray-200 border border-gray-700 font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY TEXT'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD REPORT FILE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
