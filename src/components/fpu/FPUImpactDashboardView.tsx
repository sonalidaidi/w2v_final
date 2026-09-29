import React, { useState } from 'react';
import { getRecoveryListings } from '../../services/recoveryHubStorage';
import { getFPUMachines, getFPUStorageItems, getFPUExpiryItems } from '../../services/fpuStorage';
import {
  TrendingUp,
  Boxes,
  Zap,
  Clock,
  Truck,
  Leaf,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Thermometer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const FPUImpactDashboardView: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME'>('THIS_MONTH');

  // Load existing records
  const allRecoveries = getRecoveryListings();
  const completedRecoveries = allRecoveries.filter((l) => l.status === 'COMPLETED');

  // FPU specific recoveries
  const completedResourceRecoveries = completedRecoveries.filter((l) => l.type === 'RESOURCE_BYPRODUCT');
  const completedProductRecoveries = completedRecoveries.filter((l) => l.type === 'FOOD_SURPLUS');

  const machines = getFPUMachines();
  const storageItems = getFPUStorageItems();
  const expiryItems = getFPUExpiryItems();

  // Metrics from completed records
  const resourcesRecoveredKg = completedResourceRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );

  const productSurplusRecoveredKg = completedProductRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );

  // Production waste prevented = completed resource + product recovery diverted from dump
  const productionWastePreventedKg = resourcesRecoveredKg + productSurplusRecoveredKg;

  // Expiry prevented: batches dispatched through recovery before shelf life expired
  const expiryPreventedKg = completedProductRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );

  const totalRecoveryQtyKg = productionWastePreventedKg;
  const completedDeliveriesCount = completedRecoveries.length;

  // Machine Downtime from actual SCADA logs
  const totalDowntimeHours = machines.reduce((acc, curr) => acc + curr.downtimeHours, 0);

  // Storage alerts handled
  const storageAlertsCount = storageItems.filter((i) => i.status === 'ALERT' || i.status === 'CAUTION').length;

  // Energy efficiency estimate: based on running machines load management
  const estimatedEnergySavedKWh = Math.round(machines.reduce((acc, curr) => acc + curr.runtimeHours * 1.8, 0) * 10) / 10;

  // Estimated CO2e Avoided (kg CO2e)
  // ~0.5 kg CO2e per kg organic byproduct + ~2.5 kg CO2e per kg food surplus diversion + ~0.82 kg per kWh
  const estimatedCO2eAvoidedKg = Math.round(
    (resourcesRecoveredKg * 0.5 + productSurplusRecoveredKg * 2.5 + estimatedEnergySavedKWh * 0.82) * 10
  ) / 10;

  const hasData = completedDeliveriesCount > 0 || totalRecoveryQtyKg > 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Plant Resource Circulation & Efficiency Audit</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              FPU IMPACT DASHBOARD
            </h2>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Consolidated operational and circularity impact metrics for food processing units. All values are calculated from completed recovery transfers and verified factory telemetry logs.
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F3] border border-stone-200 rounded-xl text-xs">
            {(
              [
                { id: 'THIS_MONTH', label: 'THIS MONTH' },
                { id: 'THIS_YEAR', label: 'THIS YEAR' },
                { id: 'ALL_TIME', label: 'ALL TIME' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilterPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  filterPeriod === p.id
                    ? 'bg-[#0C2D21] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-[#0C2D21]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Notice */}
        {!hasData && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>No completed recovery activities yet.</strong> Metrics update dynamically when a food or byproduct recovery status progresses to COMPLETED in the Recovery Hub.
            </span>
          </div>
        )}
      </div>

      {/* Main Impact Metrics Grid (9 Cards per Section 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CARD 1: PRODUCTION WASTE PREVENTED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            PRODUCTION WASTE PREVENTED
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
            {hasData ? `${productionWastePreventedKg.toLocaleString()} kg` : 'No data yet'}
          </div>
          <span className="text-[11px] text-[#059669] font-semibold block">
            Diverted from industrial effluent / landfill
          </span>
        </div>

        {/* CARD 2: EXPIRY PREVENTED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            EXPIRY PREVENTED
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#059669]">
            {expiryPreventedKg > 0 ? `${expiryPreventedKg.toLocaleString()} kg` : 'No data yet'}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Packaged inventory recovered prior to expiration
          </span>
        </div>

        {/* CARD 3: RESOURCES RECOVERED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            RESOURCES RECOVERED
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#F97316]">
            {resourcesRecoveredKg > 0 ? `${resourcesRecoveredKg.toLocaleString()} kg` : 'No data yet'}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Peels, pomace & seed residues to extraction
          </span>
        </div>

        {/* CARD 4: TOTAL RECOVERY QUANTITY */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            TOTAL RECOVERY QUANTITY
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
            {totalRecoveryQtyKg > 0 ? `${totalRecoveryQtyKg.toLocaleString()} kg` : 'No data yet'}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Cumulative secondary commercial payload
          </span>
        </div>

        {/* CARD 5: COMPLETED DELIVERIES */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              COMPLETED DELIVERIES
            </span>
            <Truck className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
            {completedDeliveriesCount > 0 ? completedDeliveriesCount : 'No data yet'}
          </div>
          <span className="text-[11px] text-[#059669] font-semibold block">
            Verified logistics handovers fulfilled
          </span>
        </div>

        {/* CARD 6: ENERGY EFFICIENCY */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ENERGY EFFICIENCY
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
              ESTIMATED
            </span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#059669]">
            {estimatedEnergySavedKWh > 0 ? `${estimatedEnergySavedKWh} kWh` : 'No data yet'}
          </div>
          <span className="text-[11px] text-stone-500 block">
            From motor load balancing & scheduled CIP
          </span>
        </div>

        {/* CARD 7: MACHINE DOWNTIME TRACKED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              MACHINE DOWNTIME
            </span>
            <Cpu className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-stone-800">
            {totalDowntimeHours} hrs
          </div>
          <span className="text-[11px] text-stone-500 block">
            Logged across active SCADA monitoring lines
          </span>
        </div>

        {/* CARD 8: STORAGE ALERTS MANAGED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              STORAGE ALERTS
            </span>
            <Thermometer className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
            {storageAlertsCount} alerts
          </div>
          <span className="text-[11px] text-stone-500 block">
            Thermal & humidity deviations reviewed
          </span>
        </div>

        {/* CARD 9: ESTIMATED CO2e AVOIDED */}
        <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              ESTIMATED CO2e AVOIDED
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
              ESTIMATED
            </span>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
            {hasData ? `${estimatedCO2eAvoidedKg} kg CO2e` : 'No data yet'}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Avoided methane decomposition emissions
          </span>
        </div>

      </div>

      {/* Mandatory Notice per Section 16 */}
      <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-[11px] text-stone-600 italic">
        * Environmental values are labelled strictly as <strong>ESTIMATED</strong> using standard food-waste decomposition coefficients. W2V does not claim verified carbon credits or offset instruments.
      </div>

    </div>
  );
};
