import React, { useState } from 'react';
import { ShiftLogEntry } from '../types/refinery.js';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  Send,
  Filter,
  Check,
  FileSignature
} from 'lucide-react';

interface ShiftLogTabProps {
  shiftLogs: ShiftLogEntry[];
  onAddShiftLog: (log: Omit<ShiftLogEntry, 'id' | 'timestamp' | 'signedOff'>) => Promise<void>;
}

export const ShiftLogTab: React.FC<ShiftLogTabProps> = ({ shiftLogs = [], onAddShiftLog }) => {
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [shift, setShift] = useState<'Shift A (00:00 - 08:00)' | 'Shift B (08:00 - 16:00)' | 'Shift C (16:00 - 24:00)'>('Shift B (08:00 - 16:00)');
  const [operator, setOperator] = useState<string>('Operator OP-402');
  const [unitTag, setUnitTag] = useState<string>('CDU-05');
  const [category, setCategory] = useState<'OPERATIONAL' | 'SAFETY' | 'MAINTENANCE' | 'ENVIRONMENTAL'>('OPERATIONAL');
  const [note, setNote] = useState<string>('');
  const [severity, setSeverity] = useState<'NORMAL' | 'ATTENTION' | 'CRITICAL'>('NORMAL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddShiftLog({
        shift,
        operator,
        unitTag,
        category,
        note,
        severity,
      });
      setNote('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to submit log entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = shiftLogs.filter(
    (item) => shiftFilter === 'ALL' || item.shift.includes(shiftFilter)
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto select-none font-mono text-xs">
      {/* Hero Banner */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded border border-amber-500/30 text-amber-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 uppercase tracking-wider tech-font">
              DIGITAL SHIFT HANDOVER & OPERATOR LOGBOOK
            </h2>
            <p className="text-gray-400 text-xs">
              Continuous operator logbook, shift change handovers, unit bypasses, and safety sign-offs
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded transition-all cursor-pointer text-xs flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NEW SHIFT LOG ENTRY</span>
        </button>
      </div>

      {/* Filter and Logbook Table Section */}
      <div className="bg-[#10141a] border border-[#1e2631] rounded p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#18202b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-xs"></span>
            <h3 className="font-bold text-gray-100 uppercase tracking-wider tech-font text-xs">
              SHIFT HANDOVER CHRONOLOGICAL AUDIT LOG ({shiftLogs.length} RECORDED)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              SHIFT FILTER:
            </span>
            {['ALL', 'Shift A', 'Shift B', 'Shift C'].map((f) => (
              <button
                key={f}
                onClick={() => setShiftFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  shiftFilter === f
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#18202b] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto bg-[#0b0e11] border border-[#1a222c] rounded">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c2430] text-[10px] text-gray-400 uppercase tracking-wider bg-[#10141a]">
                <th className="py-2.5 px-3">ENTRY ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">SHIFT</th>
                <th className="py-2.5 px-3">OPERATOR</th>
                <th className="py-2.5 px-3">UNIT</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">OPERATOR LOG NOTE & HANDOVER DETAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161c26]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#151b24] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-amber-400 tech-font">{log.id}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-gray-300 font-semibold text-[11px]">
                    {log.shift}
                  </td>
                  <td className="py-2.5 px-3 text-gray-200 font-bold">{log.operator}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18202b] text-amber-400 border border-gray-700">
                      {log.unitTag}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-400 text-[11px] font-bold">{log.category}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : log.severity === 'ATTENTION'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-200 text-[11px] max-w-lg">
                    {log.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SHIFT LOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#10141a] border border-amber-500/50 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#18202b]">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-100 uppercase tracking-wider text-sm tech-font">
                  RECORD OPERATOR SHIFT LOG & HANDOVER
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">SHIFT</label>
                  <select
                    value={shift}
                    onChange={(e: any) => setShift(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Shift A (00:00 - 08:00)">Shift A (00:00 - 08:00)</option>
                    <option value="Shift B (08:00 - 16:00)">Shift B (08:00 - 16:00)</option>
                    <option value="Shift C (16:00 - 24:00)">Shift C (16:00 - 24:00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">OPERATOR NAME</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">UNIT TAG</label>
                  <select
                    value={unitTag}
                    onChange={(e) => setUnitTag(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="CDU-05">CDU-05</option>
                    <option value="VDU-05">VDU-05</option>
                    <option value="FCC-05">FCC-05</option>
                    <option value="PLANT-WIDE">PLANT-WIDE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">SEVERITY LEVEL</label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-[#1a222c] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="ATTENTION">ATTENTION</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">LOG ENTRY DETAIL & HANDOVER NOTES</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe unit adjustments, alarms acknowledged, or shift instructions..."
                  rows={4}
                  required
                  className="w-full bg-[#0b0e11] border border-[#1a222c] focus:border-amber-500 rounded p-3 text-xs text-gray-200 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded font-bold hover:bg-gray-700 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !note.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'SIGNING OFF...' : 'SIGN OFF & SUBMIT'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
