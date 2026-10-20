import React, { useState, useEffect } from 'react';
import { RefineryState } from './types/refinery.js';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { OverviewTab } from './components/OverviewTab.tsx';
import { ProductionUnitsTab } from './components/ProductionUnitsTab.tsx';
import { MaintenanceTab } from './components/MaintenanceTab.tsx';
import { InspectionsTab } from './components/InspectionsTab.tsx';
import { KpiBoardTab } from './components/KpiBoardTab.tsx';
import { ImportDataTab } from './components/ImportDataTab.tsx';
import { ProcessFlowTab } from './components/ProcessFlowTab.tsx';
import { ShiftLogTab } from './components/ShiftLogTab.tsx';
import { AuthPage } from './components/AuthPage.tsx';
import { AnalysisHistoryTab } from './components/AnalysisHistoryTab.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [highlightedUnitTag, setHighlightedUnitTag] = useState<string | undefined>();
  const [isApiConnected, setIsApiConnected] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const [refineryState, setRefineryState] = useState<RefineryState>({
    isDataImported: false,
    plant: {
      complexName: 'UNNAMED COMPLEX',
      plantId: 'PLANT-01',
      status: 'NORMAL OPERATIONS',
      nameplateCrude: 0,
      continuousRunDays: 0,
      safeDays: 0,
      licence: '',
      unackAlarmsCount: 0,
      overdueInspectionsCount: 0,
      blockedWorkOrdersCount: 0,
    },
    units: [
      { tag: 'CDU-05', unit: 'Atmospheric Crude Distillation', state: 'RUNNING', rate: 176461, load: 88, temp: 362, maxRate: 200000 },
      { tag: 'VDU-05', unit: 'Vacuum Distillation', state: 'RUNNING', rate: 94246, load: 86, temp: 415, maxRate: 110000 },
      { tag: 'FCC-05', unit: 'Fluid Catalytic Cracking', state: 'RUNNING', rate: 72189, load: 90, temp: 543, maxRate: 80000 },
    ],
    throughputHistory: [],
    alarms: [],
    maintenance: [],
    inspections: [],
    kpis: [],
    uploadHistory: [],
    importedDepartments: {
      production: false,
      maintenance: false,
      inspections: false,
      kpis: false,
    },
  });

  // Fetch state on mount
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setRefineryState(data.state);
        setIsApiConnected(true);
      }
    } catch (err) {
      console.warn('Backend API connection warning:', err);
      setIsApiConnected(false);
    }
  };

  useEffect(() => {
    fetchState();

    if (!autoRefresh) return;

    // Subscribe to SSE Live Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (event) => {
        try {
          const newState = JSON.parse(event.data);
          setRefineryState(newState);
        } catch (e) {
          // ignore parse error
        }
      };
      eventSource.onerror = () => {
        // SSE fallback
        eventSource?.close();
      };
    } catch (e) {
      console.warn('SSE stream unavailable');
    }

    return () => {
      eventSource?.close();
    };
  }, [autoRefresh]);

  const handleUploadCsv = async (department: string, csvContent: string) => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department, csvContent }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload CSV');
    }

    const data = await res.json();
    setRefineryState(data.state);
  };

  const handleLoadAllSamples = async () => {
    const res = await fetch('/api/load-samples', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(prev => ({
        ...data.state,
        currentUser: data.state.currentUser || prev.currentUser,
        analysisHistory: data.state.analysisHistory?.length ? data.state.analysisHistory : prev.analysisHistory,
      }));
    }
  };

  const handleResetData = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(prev => ({
        ...data.state,
        currentUser: data.state.currentUser || prev.currentUser,
        analysisHistory: data.state.analysisHistory?.length ? data.state.analysisHistory : prev.analysisHistory,
      }));
    }
  };

  const handleClearUploadHistory = async () => {
    const res = await fetch('/api/upload-history/clear', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(prev => ({
        ...data.state,
        currentUser: data.state.currentUser || prev.currentUser,
        analysisHistory: data.state.analysisHistory?.length ? data.state.analysisHistory : prev.analysisHistory,
      }));
    }
  };

  const handleAcknowledgeAlarm = async (alarmId: string) => {
    const res = await fetch('/api/alarms/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alarmId }),
    });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(data.state);
    }
  };

  const handleAddShiftLog = async (logData: any) => {
    const res = await fetch('/api/shift-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(data.state);
    }
  };

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(data.state);
    }
  };

  const handleSaveAnalysis = async (title: string, summary: string) => {
    const res = await fetch('/api/analysis/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary }),
    });
    if (res.ok) {
      const data = await res.json();
      setRefineryState(data.state);
    }
  };

  const importedDeptsCount = Object.values(refineryState.importedDepartments).filter(Boolean).length;

  // If not logged in, show AuthPage authenticator screen
  if (!refineryState.currentUser) {
    return (
      <AuthPage
        onLoginSuccess={(_user, newState) => {
          setRefineryState(newState);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0b0e11] text-[#e1e7ed] flex flex-col font-mono selection:bg-amber-500/30 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        isApiConnected={isApiConnected}
        currentUser={refineryState.currentUser}
        onLogout={handleLogout}
      />

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          importedDeptsCount={importedDeptsCount}
        />

        {/* Tab Content Area (Independently Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-[#0b0e11] pb-12 h-full">
          {activeTab === 'overview' && (
            <OverviewTab
              state={refineryState}
              onAcknowledgeAlarm={handleAcknowledgeAlarm}
              onGoToImport={() => setActiveTab('import')}
              onLoadSampleData={handleLoadAllSamples}
              onNavigateToTab={(tab, tag) => {
                setActiveTab(tab);
                setHighlightedUnitTag(tag);
              }}
            />
          )}

          {activeTab === 'process' && (
            <ProcessFlowTab
              units={refineryState.units}
              onGoToImport={() => setActiveTab('import')}
            />
          )}

          {activeTab === 'units' && (
            <ProductionUnitsTab
              units={refineryState.units}
              highlightTag={highlightedUnitTag}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceTab
              maintenance={refineryState.maintenance}
              onGoToImport={() => setActiveTab('import')}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionsTab
              inspections={refineryState.inspections}
              onGoToImport={() => setActiveTab('import')}
            />
          )}

          {activeTab === 'logs' && (
            <ShiftLogTab
              shiftLogs={refineryState.shiftLogs || []}
              onAddShiftLog={handleAddShiftLog}
            />
          )}

          {activeTab === 'kpis' && (
            <KpiBoardTab
              kpiMetrics={refineryState.kpis}
              throughputHistory={refineryState.throughputHistory}
              safeDays={refineryState.plant.safeDays}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
              onGoToImport={() => setActiveTab('import')}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisHistoryTab
              currentUser={refineryState.currentUser}
              analysisHistory={refineryState.analysisHistory || []}
              refineryState={refineryState}
              onSaveAnalysis={handleSaveAnalysis}
            />
          )}

          {activeTab === 'import' && (
            <ImportDataTab
              onUploadCsv={handleUploadCsv}
              onLoadAllSamples={handleLoadAllSamples}
              onResetData={handleResetData}
              onClearUploadHistory={handleClearUploadHistory}
              uploadHistory={refineryState.uploadHistory}
              importedDepts={refineryState.importedDepartments}
              refineryState={refineryState}
            />
          )}
        </main>
      </div>
    </div>
  );
}
