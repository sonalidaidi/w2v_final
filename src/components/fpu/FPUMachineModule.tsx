import React, { useState } from 'react';
import {
  FPUMachineItem,
  getFPUMachines,
  saveFPUMachines,
  addFPUNotification,
} from '../../services/fpuStorage';
import {
  Cpu,
  Zap,
  Activity,
  AlertOctagon,
  Clock,
  Play,
  Pause,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Gauge,
  CheckCircle2,
} from 'lucide-react';

export const FPUMachineModule: React.FC = () => {
  const [machines, setMachines] = useState<FPUMachineItem[]>(() => getFPUMachines());
  const [activeAlertMachine, setActiveAlertMachine] = useState<FPUMachineItem | null>(() => {
    return getFPUMachines().find((m) => m.status === 'FAULT') || null;
  });

  const handleSimulateStatusChange = (
    machineId: string,
    newStatus: FPUMachineItem['status'],
    faultEventText?: string
  ) => {
    const updated = machines.map((m) => {
      if (m.id === machineId) {
        let faultText = faultEventText;
        let power = m.powerKW;
        let rate = m.productionRatePerHour;

        if (newStatus === 'FAULT') {
          faultText = faultText || 'Abnormal overload detected by PLC thermal relay';
          power = 0.8;
          rate = 0;

          // Section 6: MACHINE ALERT notification
          addFPUNotification({
            type: 'MACHINE_ALERT',
            title: `Machine Alert: ${m.name} Fault`,
            message: `Machine ${m.name} has entered FAULT status. ${faultText}.`,
            severity: 'CRITICAL',
          });
        } else if (newStatus === 'RUNNING') {
          faultText = 'Optimal Operation · Continuous Cycle Steady';
          power = 18.2;
          rate = m.ratedCapacityPerHour * 0.85;
        } else if (newStatus === 'IDLE') {
          faultText = 'Standby · Awaiting next batch feed';
          power = 2.0;
          rate = 0;
        } else if (newStatus === 'MAINTENANCE') {
          faultText = 'Scheduled CIP (Clean-in-Place) Sanitation Cycle';
          power = 4.5;
          rate = 0;
        }

        return {
          ...m,
          status: newStatus,
          faultEventStatus: faultText || m.faultEventStatus,
          powerKW: power,
          productionRatePerHour: Math.round(rate),
          lastUpdate: 'Just now',
        };
      }
      return m;
    });

    setMachines(updated);
    saveFPUMachines(updated);
    setActiveAlertMachine(updated.find((m) => m.status === 'FAULT') || null);
  };

  const totalPowerKW = machines.reduce((acc, curr) => acc + (curr.status === 'RUNNING' ? curr.powerKW : 0), 0);
  const totalHourlyKWh = machines.reduce((acc, curr) => acc + curr.energyConsumptionKWh, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Factory Automation · Equipment Line Monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                MACHINE MONITORING
              </h2>
              {/* MANDATORY LABEL PER SPEC */}
              <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-300 text-[10px] font-mono font-bold text-stone-700 tracking-wider">
                SIMULATED PLC/SCADA DATA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Industrial telemetry dashboard tracking equipment runtime, motor draw, thermal pasteurization status, and automated packaging throughput.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-right">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Active Plant Load</span>
              <span className="font-mono text-base font-black text-[#0C2D21]">
                {Math.round(totalPowerKW * 10) / 10} kW
              </span>
            </div>
          </div>
        </div>

        {/* Section 6 MACHINE ALERT Active Banner */}
        {activeAlertMachine && (
          <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-red-200 text-red-900 uppercase">
                    MACHINE ALERT
                  </span>
                  <span className="font-bold text-[#0C2D21]">
                    {activeAlertMachine.name} has entered FAULT status.
                  </span>
                </div>
                <p className="text-red-900 text-[11px] mt-0.5 leading-relaxed">
                  Fault Event: <strong>{activeAlertMachine.faultEventStatus}</strong>. Line throughput stopped. Dispatched alert to maintenance roster.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSimulateStatusChange(activeAlertMachine.id, 'RUNNING')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer shrink-0 transition-colors shadow-2xs"
            >
              Reset Fault & Clear
            </button>
          </div>
        )}
      </div>

      {/* Machines SCADA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {machines.map((m) => {
          const isFault = m.status === 'FAULT';
          const isRunning = m.status === 'RUNNING';
          const isIdle = m.status === 'IDLE';
          const isMaint = m.status === 'MAINTENANCE';

          return (
            <div
              key={m.id}
              className={`p-6 rounded-3xl bg-white border-2 transition-all space-y-4 shadow-xs ${
                isFault
                  ? 'border-red-400 bg-red-50/10'
                  : isRunning
                  ? 'border-emerald-400/60'
                  : 'border-[#0C2D21]/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#0C2D21]/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {m.dataSourceLabel}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      Last update: {m.lastUpdate}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#0C2D21]">
                    {m.name}
                  </h3>
                  <span className="text-[11px] text-stone-500 block">{m.type}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    isFault
                      ? 'bg-red-100 text-red-800 animate-pulse'
                      : isRunning
                      ? 'bg-emerald-100 text-emerald-800'
                      : isMaint
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              {/* Status & Event Bar */}
              <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 text-xs flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Event Status:</span>
                <span className={`font-bold ${isFault ? 'text-red-700' : 'text-[#0C2D21]'}`}>
                  {m.faultEventStatus}
                </span>
              </div>

              {/* SCADA Telemetry 4-Pack */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                
                <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8">
                  <span className="text-[9px] uppercase font-bold text-stone-500 block">Runtime</span>
                  <div className="font-mono text-sm font-black text-[#0C2D21] mt-0.5">
                    {m.runtimeHours} hrs
                  </div>
                  <span className="text-[9px] text-stone-400 block">Downtime: {m.downtimeHours}h</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8">
                  <span className="text-[9px] uppercase font-bold text-stone-500 block">Power</span>
                  <div className="font-mono text-sm font-black text-[#0C2D21] mt-0.5">
                    {m.powerKW} kW
                  </div>
                  <span className="text-[9px] text-stone-400 block">Total: {m.energyConsumptionKWh} kWh</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8 col-span-2">
                  <span className="text-[9px] uppercase font-bold text-stone-500 block">Production Output Rate</span>
                  <div className="font-mono text-sm font-black text-[#059669] mt-0.5 flex items-center justify-between">
                    <span>{m.productionRatePerHour} {m.productionRateUnit}</span>
                    <span className="text-[9px] font-normal text-stone-500">Cap: {m.ratedCapacityPerHour} {m.productionRateUnit}</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#10B981] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((m.productionRatePerHour / m.ratedCapacityPerHour) * 100))}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Interactive SCADA State Override (to test Section 6 Machine Alert) */}
              <div className="pt-2 border-t border-[#0C2D21]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] font-mono text-stone-400">
                  Simulate Line Control:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateStatusChange(m.id, 'RUNNING')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateStatusChange(m.id, 'IDLE')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Idle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateStatusChange(m.id, 'FAULT', 'Overload Jam & Emergency E-Stop Tripped')}
                    className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Trigger Fault
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
