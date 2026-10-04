import React, { useState } from 'react';
import { UserAccount, AnalysisRecord, RefineryState } from '../types/refinery.js';
import { History, Save, User, CheckCircle2, TrendingUp, AlertTriangle, Activity, Calendar, Shield } from 'lucide-react';

interface AnalysisHistoryTabProps {
  currentUser?: UserAccount;
  analysisHistory?: AnalysisRecord[];
  refineryState: RefineryState;
  onSaveAnalysis: (title: string, summary: string) => Promise<void>;
}

export const AnalysisHistoryTab: React.FC<AnalysisHistoryTabProps> = ({
  currentUser,
  analysisHistory = [],
  refineryState,
  onSaveAnalysis,
}) => {
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSaveAnalysis(title, summary);
      setTitle('');
      setSummary('');
      setShowSaveModal(false);
    } catch (err) {
      console.error('Failed to save analysis record:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const peakRate = refineryState.throughputHistory.length
    ? Math.max(...refineryState.throughputHistory.map((p) => p.rate))
    : 342896;

  const runningUnits = refineryState.units.filter((u) => u.state === 'RUNNING').length;
  const activeAlarms = refineryState.alarms.filter((a) => !a.acknowledged).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              LIVE & HISTORICAL ACCOUNT ANALYSIS RECORDS
            </h2>
            <p className="text-gray-400 text-xs">
              Saved telemetry analysis snapshots, run history, and operational audits for account{' '}
              <span className="text-amber-400 font-bold">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSaveModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded transition-all cursor-pointer text-xs flex items-center gap-2 shadow-md"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>SAVE CURRENT ANALYSIS SNAPSHOT</span>
        </button>
      </div>

      {/* Account Info & Current Live Analysis Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User Account Profile Box */}
        <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <span className="font-bold text-gray-200 uppercase tech-font text-xs flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              AUTHENTICATED ACCOUNT PROFILE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              SESSION ACTIVE
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">OPERATOR NAME</div>
              <div className="text-sm font-bold text-amber-400 tech-font">{currentUser?.name}</div>
            </div>

            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">REGISTERED EMAIL</div>
              <div className="text-xs font-semibold text-gray-200">{currentUser?.email}</div>
            </div>

            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">ACCOUNT CREATED</div>
              <div className="text-xs text-gray-400">{currentUser?.createdAt}</div>
            </div>
          </div>
        </div>

        {/* Live Analysis Telemetry Snapshot Card */}
        <div className="lg:col-span-2 bg-[#10141a] border border-[#1e2631] rounded p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#18202b]">
            <span className="font-bold text-gray-200 uppercase tech-font text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              LIVE REAL-TIME TELEMETRY SNAPSHOT
            </span>
            <span className="text-[10px] text-gray-400">AUTOMATICALLY SYNCED TO ACCOUNT</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">THROUGHPUT PEAK</div>
              <div className="text-base font-bold text-amber-400 tech-font">
                {peakRate.toLocaleString()} <span className="text-[10px] text-gray-400">bbl/d</span>
              </div>
            </div>

            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">ACTIVE UNITS</div>
              <div className="text-base font-bold text-emerald-400 tech-font">
                {runningUnits} / {refineryState.units.length} RUNNING
              </div>
            </div>

            <div className="bg-[#0b0e11] p-3 rounded border border-[#1a222c] space-y-1">
              <div className="text-[10px] text-gray-400 uppercase">ACTIVE ALARMS</div>
              <div className="text-base font-bold text-red-400 tech-font">
                {activeAlarms} UNACKNOWLEDGED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Analysis Records Table */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-100 uppercase tracking-wider tech-font text-xs">
              PAST SAVED ANALYSIS RECORDS ({analysisHistory.length} ARCHIVED)
            </h3>
          </div>
        </div>

        {analysisHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500 space-y-2">
            <p>No past analysis records saved for this account yet.</p>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded cursor-pointer text-xs"
            >
              Save Your First Analysis Snapshot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#0b0e11] border border-[#1a222c] rounded">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1c2430] text-[10px] text-gray-400 uppercase tracking-wider bg-[#10141a]">
                  <th className="py-2.5 px-3">RECORD ID</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ANALYSIS TITLE</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">PEAK RATE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">ANALYSIS SUMMARY & NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c26]">
                {analysisHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#151b24] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-400 tech-font">{rec.id}</td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px]">{rec.timestamp}</td>
                    <td className="py-2.5 px-3 text-gray-100 font-bold">{rec.title}</td>
                    <td className="py-2.5 px-3 text-gray-400 font-semibold uppercase">{rec.department}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400 tech-font">
                      {rec.throughputPeakBbl ? rec.throughputPeakBbl.toLocaleString() : '380,000'} bbl/d
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300 text-[11px] max-w-md">{rec.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAVE ANALYSIS SNAPSHOT MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#10141a] border border-amber-500/50 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#18202b]">
              <h3 className="font-bold text-gray-100 uppercase tracking-wider text-sm tech-font">
                SAVE ANALYSIS RECORD TO ACCOUNT
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">ANALYSIS RECORD TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Crude Fractionation & Catalyst Health Audit"
                  required
                  className="w-full bg-[#0b0e11] border border-[#1a222c] focus:border-amber-500 rounded p-2.5 text-xs text-gray-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">ANALYSIS SUMMARY NOTES</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize key findings, column load observations, and yields..."
                  rows={4}
                  className="w-full bg-[#0b0e11] border border-[#1a222c] focus:border-amber-500 rounded p-2.5 text-xs text-gray-200 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded font-bold hover:bg-gray-700 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !title.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'SAVING...' : 'SAVE RECORD'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
