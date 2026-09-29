import React, { useState, useEffect } from 'react';
import {
  FPUStorageItem,
  getFPUStorageItems,
  saveFPUStorageItems,
  addFPUNotification,
} from '../../services/fpuStorage';
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  BellRing,
  Info,
  ShieldAlert,
} from 'lucide-react';

export const FPUStorageModule: React.FC = () => {
  const [items, setItems] = useState<FPUStorageItem[]>(() => getFPUStorageItems());
  const [activeAlertItem, setActiveAlertItem] = useState<FPUStorageItem | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync state and check for active alerts
  useEffect(() => {
    const alertFound = items.find((i) => i.status === 'ALERT' || i.status === 'CAUTION');
    setActiveAlertItem(alertFound || null);
  }, [items]);

  const handleRefreshSensors = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Add subtle real-time fluctuations to simulated readings
      const updated = items.map((item) => {
        const tempJitter = (Math.random() - 0.5) * 0.4;
        const humJitter = Math.round((Math.random() - 0.5) * 2);
        const newTemp = Math.round((item.temperatureC + tempJitter) * 10) / 10;
        const newHum = Math.min(100, Math.max(20, item.humidityPercent + humJitter));

        // Evaluate status against optimal ranges
        let newStatus: 'NORMAL' | 'CAUTION' | 'ALERT' = 'NORMAL';
        let alertReason: string | undefined = undefined;

        if (newTemp > item.optimalTempRange[1] + 2.5 || newTemp < item.optimalTempRange[0] - 2.5) {
          newStatus = 'ALERT';
          alertReason = `Severe temperature deviation: ${newTemp}°C (Optimal: ${item.optimalTempRange[0]}°C–${item.optimalTempRange[1]}°C). Requires immediate HVAC review.`;
        } else if (newTemp > item.optimalTempRange[1] || newTemp < item.optimalTempRange[0] || newHum > item.optimalHumidityRange[1]) {
          newStatus = 'CAUTION';
          alertReason = `Storage condition deviation: ${newTemp}°C / ${newHum}% RH outside control baseline. Flagged for QA review.`;
        }

        return {
          ...item,
          temperatureC: newTemp,
          humidityPercent: newHum,
          status: newStatus,
          alertReason,
          timestamp: new Date().toLocaleTimeString(),
        };
      });

      setItems(updated);
      saveFPUStorageItems(updated);
      setIsSimulating(false);
    }, 450);
  };

  // Interactive Sensor Deviation Simulator to test Section 4 STORAGE ALERT
  const handleSimulateTemperatureDeviation = (itemId: string, targetTemp: number) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const isOutOfRange = targetTemp > item.optimalTempRange[1] || targetTemp < item.optimalTempRange[0];
        const isSevere = targetTemp > item.optimalTempRange[1] + 2.5 || targetTemp < item.optimalTempRange[0] - 2.5;

        const status: 'NORMAL' | 'CAUTION' | 'ALERT' = isSevere ? 'ALERT' : isOutOfRange ? 'CAUTION' : 'NORMAL';
        const alertReason = isOutOfRange
          ? `Temperature condition requires attention for stored product (${targetTemp}°C in ${item.storageLocation}).`
          : undefined;

        if (isOutOfRange) {
          // Send alert through the existing W2V notification system per spec
          addFPUNotification({
            type: 'STORAGE_ALERT',
            title: `Storage Alert: ${item.productOrMaterial}`,
            message: `Temperature condition requires attention for stored product. Registered ${targetTemp}°C in ${item.storageLocation} (Optimal: ${item.optimalTempRange[0]}°C–${item.optimalTempRange[1]}°C). Flagged for review.`,
            severity: isSevere ? 'CRITICAL' : 'WARNING',
          });
        }

        return {
          ...item,
          temperatureC: targetTemp,
          status,
          alertReason,
          timestamp: new Date().toLocaleTimeString(),
        };
      }
      return item;
    });

    setItems(updated);
    saveFPUStorageItems(updated);
  };

  // Reset to optimal normal
  const handleResetToOptimal = (itemId: string) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const midTemp = (item.optimalTempRange[0] + item.optimalTempRange[1]) / 2;
        return {
          ...item,
          temperatureC: Math.round(midTemp * 10) / 10,
          humidityPercent: 62,
          status: 'NORMAL' as const,
          alertReason: undefined,
          timestamp: new Date().toLocaleTimeString(),
        };
      }
      return item;
    });

    setItems(updated);
    saveFPUStorageItems(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Thermometer className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Industrial Silos, Cold Vaults & Ambient Bays</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                STORAGE MONITORING
              </h2>
              {/* MANDATORY LABEL PER SPEC */}
              <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-300 text-[10px] font-mono font-bold text-stone-700 tracking-wider">
                SIMULATED IoT DATA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Real-time telemetry tracking bulk storage zones. Detects thermal drift and humidity deviations before micro-biological spoilage or shelf-life degradation occurs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshSensors}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>POLL SENSORS</span>
          </button>
        </div>

        {/* Section 4 STORAGE ALERT Active Banner */}
        {activeAlertItem && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                    STORAGE ALERT
                  </span>
                  <span className="font-bold text-[#0C2D21]">
                    {activeAlertItem.productOrMaterial} ({activeAlertItem.storageLocation})
                  </span>
                </div>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  {activeAlertItem.alertReason || 'Temperature condition requires attention for stored product. Condition flagged for review.'}
                </p>
                <div className="text-[10px] text-stone-500 italic mt-1">
                  * Notice: Condition flagged for facility review. Product is not automatically deemed unsafe from a single sensor deviation.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleResetToOptimal(activeAlertItem.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider text-[10px] cursor-pointer shrink-0 transition-colors"
            >
              Clear / Reset Alert
            </button>
          </div>
        )}
      </div>

      {/* Storage Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => {
          const isAlert = item.status === 'ALERT';
          const isCaution = item.status === 'CAUTION';
          const isNormal = item.status === 'NORMAL';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-white border-2 transition-all space-y-4 shadow-xs ${
                isAlert
                  ? 'border-red-400 bg-red-50/10'
                  : isCaution
                  ? 'border-amber-400 bg-amber-50/10'
                  : 'border-[#0C2D21]/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#0C2D21]/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {item.dataSourceLabel}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-extrabold text-[#0C2D21]">
                    {item.productOrMaterial}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#10B981]" />
                    <span>{item.storageLocation}</span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    isAlert
                      ? 'bg-red-100 text-red-800 animate-pulse'
                      : isCaution
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Sensor Telemetry Display Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                
                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Quantity</span>
                  <div className="font-mono text-base font-black text-[#0C2D21] mt-1">
                    {item.quantity.toLocaleString()} {item.unit}
                  </div>
                  <span className="text-[10px] text-stone-400 block">Staged stock</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Temperature</span>
                    <Thermometer className="w-3 h-3 text-[#F97316]" />
                  </div>
                  <div className={`font-mono text-base font-black mt-1 ${isAlert ? 'text-red-700' : isCaution ? 'text-amber-700' : 'text-[#0C2D21]'}`}>
                    {item.temperatureC}°C
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    Target {item.optimalTempRange[0]}–{item.optimalTempRange[1]}°C
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Humidity</span>
                    <Droplets className="w-3 h-3 text-[#10B981]" />
                  </div>
                  <div className="font-mono text-base font-black text-[#0C2D21] mt-1">
                    {item.humidityPercent}% RH
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    Target ≤ {item.optimalHumidityRange[1]}%
                  </span>
                </div>

              </div>

              {/* Interactive Simulation Controls to Test Alerts (Section 4) */}
              <div className="pt-2 border-t border-[#0C2D21]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[10px] font-mono text-stone-400">
                  Simulate Condition Drift:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleResetToOptimal(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Optimal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateTemperatureDeviation(item.id, item.optimalTempRange[1] + 1.2)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    +Warm Drift
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateTemperatureDeviation(item.id, item.optimalTempRange[1] + 4.0)}
                    className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                  >
                    Critical Alert
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
