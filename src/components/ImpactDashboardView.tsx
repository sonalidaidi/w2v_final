import React, { useState, useEffect } from 'react';
import {
  ImpactDateFilter,
  DateFilterRange,
  ImpactDashboardData,
  calculateImpactDashboardData,
} from '../services/impactDashboardService';
import { StoredRegistration } from '../services/registrationStorage';
import {
  TrendingUp,
  Award,
  Calendar,
  RefreshCw,
  Scale,
  Sparkles,
  Zap,
  Truck,
  Leaf,
  IndianRupee,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Flame,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface ImpactDashboardViewProps {
  user?: StoredRegistration | null;
  onNavigateToModule?: (moduleName: string) => void;
}

export const ImpactDashboardView: React.FC<ImpactDashboardViewProps> = ({
  user,
  onNavigateToModule,
}) => {
  // Date Filter State
  const [filterPeriod, setFilterPeriod] = useState<ImpactDateFilter>('THIS_MONTH');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [dashboardData, setDashboardData] = useState<ImpactDashboardData>(() =>
    calculateImpactDashboardData(
      {
        filter: 'THIS_MONTH',
      },
      user?.email
    )
  );

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load and refresh data
  const loadData = () => {
    setIsRefreshing(true);
    const range: DateFilterRange = {
      filter: filterPeriod,
      customStartDate: filterPeriod === 'CUSTOM' ? customStart : undefined,
      customEndDate: filterPeriod === 'CUSTOM' ? customEnd : undefined,
    };
    const freshData = calculateImpactDashboardData(range, user?.email);
    setDashboardData(freshData);
    setTimeout(() => setIsRefreshing(false), 200);
  };

  useEffect(() => {
    loadData();
  }, [filterPeriod, customStart, customEnd, user]);

  const {
    summary,
    foodRecovery,
    resourceRecovery,
    energyImpact,
    leaderboardRank,
    sustainabilitySummary,
    recentActivities,
    hasAnyCompletedActivity,
  } = dashboardData;

  // Max value calculation for simple timeline chart
  const maxFoodRescuedOnChart = Math.max(
    ...foodRecovery.timelineChartData.map((d) => d.foodRescuedKg),
    1
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & DATE RANGE FILTER BAR */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0C2D21]/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Real-Time Environmental & Economic Metrics</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              IMPACT DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Verified sustainability impact generated exclusively by <strong>completed</strong> W2V recovery dispatches and confirmed energy-saving results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              title="Refresh impact calculations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: DATE FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0C2D21]" />
              <span>PERIOD:</span>
            </span>

            {(
              [
                { id: 'TODAY', label: 'TODAY' },
                { id: 'THIS_MONTH', label: 'THIS MONTH' },
                { id: 'THIS_YEAR', label: 'THIS YEAR' },
                { id: 'CUSTOM', label: 'CUSTOM RANGE' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterPeriod(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterPeriod === item.id
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'bg-[#FAF8F3] text-stone-700 hover:text-[#0C2D21] border border-[#0C2D21]/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Pickers (Visible when CUSTOM is selected) */}
          {filterPeriod === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-semibold text-[10px] uppercase">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#0C2D21]/20 bg-[#FAF8F3] text-[#0C2D21] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0C2D21]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-semibold text-[10px] uppercase">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#0C2D21]/20 bg-[#FAF8F3] text-[#0C2D21] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0C2D21]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DEMO / SYNTHETIC DATA NOTICE BANNER */}
      {/* ======================================================== */}
      {dashboardData.isUsingDemoData && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-200 text-amber-900 font-mono font-black text-[11px] uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0">
              DEMO / SYNTHETIC
            </span>
            <div>
              <p className="text-xs sm:text-sm text-amber-950 font-bold leading-snug">
                {dashboardData.demoNoticeText || 'DEMO DATA — Replace with verified organizational activity records'}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Calculated dynamically from completed synthetic demo records (Cooked Rice 25 kg, Dal 15 kg, Lemon Peel 20 kg, Smart Energy 6.0 kWh). Live organizational logs will replace these figures once operational handovers are completed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {onNavigateToModule && (
              <button
                type="button"
                onClick={() => onNavigateToModule('recovery-hub')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-900 transition-colors cursor-pointer shadow-xs"
              >
                <span>Recovery Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Global Notice if No Completed Activity Across Whole Selected Period */}
      {!hasAnyCompletedActivity && !dashboardData.isUsingDemoData && (
        <div className="p-6 rounded-3xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-[#0C2D21] space-y-2">
          <div className="flex items-center gap-2 text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-sm">
              No completed impact activities yet for this period.
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed pl-6">
            In accordance with W2V strict data verification protocols, impact metrics are calculated only after a recovery request progresses through delivery to <strong>COMPLETED</strong> status, or when an energy optimization analysis is accepted and saved. Listings in listed, matched, or pending transit states are not credited until successfully fulfilled.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN IMPACT CARDS (8 Exact Required Cards per Spec) */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              VERIFIED IMPACT SUMMARY
            </span>
            {dashboardData.isUsingDemoData && (
              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                DEMO DATA
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Calculated from completed records only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: FOOD RESCUED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                FOOD RESCUED
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-400">kg</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
              {summary.hasFoodRescuedData ? `${summary.foodRescuedKg.toLocaleString()} kg` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasFoodRescuedData ? 'Clean edible food prevented from landfill' : 'Awaiting completed food recoveries'}
            </p>
          </div>

          {/* CARD 2: FOOD DONATED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                FOOD DONATED
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-400">kg</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#059669]">
              {summary.hasFoodDonatedData ? `${summary.foodDonatedKg.toLocaleString()} kg` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasFoodDonatedData ? 'Delivered to verified shelters & community kitchens' : 'No donations completed yet'}
            </p>
          </div>

          {/* CARD 3: DELIVERIES COMPLETED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                DELIVERIES COMPLETED
              </span>
              <Truck className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
              {summary.hasDeliveriesData ? `${summary.deliveriesCompletedCount}` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasDeliveriesData ? 'Total verified recovery handovers completed' : 'No handovers completed yet'}
            </p>
          </div>

          {/* CARD 4: WASTE PREVENTED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                WASTE PREVENTED
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-400">kg</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
              {summary.hasWastePreventedData ? `${summary.wastePreventedKg.toLocaleString()} kg` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasWastePreventedData ? 'Food surplus + recovered resource byproducts' : 'Zero diversion recorded'}
            </p>
          </div>

          {/* CARD 5: RESOURCES RECOVERED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                RESOURCES RECOVERED
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-400">kg</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#F97316]">
              {summary.hasResourcesRecoveredData ? `${summary.resourcesRecoveredKg.toLocaleString()} kg` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasResourcesRecoveredData ? 'Clean kitchen byproducts transferred to industry' : 'No resource recovery completed'}
            </p>
          </div>

          {/* CARD 6: ENERGY SAVED (ESTIMATED) */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                ENERGY SAVED
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                {dashboardData.isUsingDemoData ? 'ESTIMATED / DEMO DATA' : 'ESTIMATED'}
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#059669]">
              {summary.hasEnergySavedData ? `${summary.energySavedKWh.toLocaleString()} kWh` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasEnergySavedData ? 'Cooking energy saved via Smart Energy guidance' : 'No energy savings recorded yet'}
            </p>
          </div>

          {/* CARD 7: ESTIMATED CO2e AVOIDED */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                ESTIMATED CO2e AVOIDED
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                {dashboardData.isUsingDemoData ? 'ESTIMATED / DEMO DATA' : 'ESTIMATED'}
              </span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
              {summary.hasCO2eData ? `${summary.estimatedCO2eAvoidedKg.toLocaleString()} kg CO2e` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasCO2eData ? 'Estimated cooking energy emissions avoided' : 'No avoided emissions yet'}
            </p>
          </div>

          {/* CARD 8: MONEY SAVED (₹) */}
          <div className="p-5 rounded-2xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                MONEY SAVED
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-400">₹</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-[#0C2D21]">
              {summary.hasMoneySavedData ? `₹ ${summary.moneySavedInr.toLocaleString()}` : 'No data yet'}
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              {summary.hasMoneySavedData ? 'Energy bill reduction and optimized menu ingredient savings' : 'No cost savings recorded yet'}
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION 7 & 8: IMPACT POINTS & LEADERBOARD RANK */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* IMPACT POINTS (10 kg FOOD SAVED = 1 IMPACT POINT from completed recovery only) */}
        <div className="p-6 rounded-3xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                IMPACT POINTS
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
              Official W2V Calculation
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="font-mono text-4xl font-black text-[#0C2D21]">
              {summary.impactPoints}
            </div>
            <span className="text-xs font-bold text-stone-500 uppercase">
              Points Earned (Selected Period)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-xs text-stone-700 space-y-1">
            <div className="font-bold text-[#0C2D21] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Standard Rule: 10 kg FOOD SAVED = 1 IMPACT POINT</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Impact points are awarded <strong>only after successful completion</strong> of verified food recovery. Points are never issued for planning, detecting surplus, listing, matching, or accepting requests.
            </p>
          </div>
        </div>

        {/* LEADERBOARD RANK (Section 8) */}
        <div className="p-6 rounded-3xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                LEADERBOARD
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
              Verified Rankings
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              LEADERBOARD RANK
            </span>
            {leaderboardRank.hasEnoughData ? (
              <div className="font-mono text-xl sm:text-2xl font-black text-[#059669]">
                {leaderboardRank.rankText}
              </div>
            ) : (
              <div className="text-sm font-semibold text-stone-600 bg-[#FAF8F3] p-3 rounded-xl border border-stone-200">
                Leaderboard will appear after completed impact activities.
              </div>
            )}
          </div>

          <p className="text-[11px] text-stone-500">
            Rankings reflect actual cumulative completed food recovery points across registered institutional kitchens. No simulated or artificial standings are shown.
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. SECTION 4: FOOD RECOVERY IMPACT & TIMELINE CHART */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-2">
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#0C2D21] uppercase tracking-tight">
              FOOD RECOVERY IMPACT
            </h3>
            <p className="text-xs text-stone-600">
              Calculated exclusively from <strong>completed</strong> food recovery deliveries.
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-500 self-start sm:self-auto">
            Completed Food Deliveries: <strong>{foodRecovery.completedFoodDeliveriesCount}</strong>
          </span>
        </div>

        {/* 5 Food Metrics Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Food Rescued</span>
            <span className="font-mono font-extrabold text-base text-[#0C2D21] block mt-1">
              {foodRecovery.hasCompletedData ? `${foodRecovery.totalFoodRescuedKg} kg` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Food Donated</span>
            <span className="font-mono font-extrabold text-base text-[#059669] block mt-1">
              {foodRecovery.hasCompletedData ? `${foodRecovery.totalFoodDonatedKg} kg` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Waste Prevented</span>
            <span className="font-mono font-extrabold text-base text-[#0C2D21] block mt-1">
              {foodRecovery.hasCompletedData ? `${foodRecovery.wastePreventedKg} kg` : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Completed Deliveries</span>
            <span className="font-mono font-extrabold text-base text-[#0C2D21] block mt-1">
              {foodRecovery.hasCompletedData ? foodRecovery.completedFoodDeliveriesCount : 'No data yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Completed Recoveries</span>
            <span className="font-mono font-extrabold text-base text-[#0C2D21] block mt-1">
              {foodRecovery.hasCompletedData ? foodRecovery.completedRecoveriesCount : 'No data yet'}
            </span>
          </div>
        </div>

        {/* Food Recovery Over Time Chart (Section 4) */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#10B981]" />
              <span>Food Recovery Over Time</span>
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              Daily kg rescued (completed records)
            </span>
          </div>

          {foodRecovery.timelineChartData.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#FAF8F3] border border-dashed border-stone-200 text-stone-500 text-xs">
              No completed food recoveries to display in timeline for this period.
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 space-y-4">
              <div className="flex items-end gap-3 h-44 pt-6 px-2 overflow-x-auto">
                {foodRecovery.timelineChartData.map((item, idx) => {
                  const barHeightPct = Math.round((item.foodRescuedKg / maxFoodRescuedOnChart) * 100);
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[48px] flex flex-col items-center justify-end h-full group"
                    >
                      <span className="text-[10px] font-mono font-bold text-[#0C2D21] mb-1 opacity-80 group-hover:opacity-100">
                        {item.foodRescuedKg} kg
                      </span>
                      <div
                        className="w-full max-w-[36px] bg-[#10B981] hover:bg-[#059669] rounded-t-lg transition-all"
                        style={{ height: `${Math.max(barHeightPct, 12)}%` }}
                        title={`${item.dateLabel}: ${item.foodRescuedKg} kg rescued`}
                      />
                      <span className="text-[10px] text-stone-500 font-semibold mt-2 whitespace-nowrap">
                        {item.dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SECTION 5 & 6: RESOURCE RECOVERY & ENERGY IMPACT */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RESOURCE RECOVERY (Section 5) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <div>
              <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                RESOURCE RECOVERY
              </h3>
              <p className="text-xs text-stone-500">
                Completed byproduct transfers for industrial circularity.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#F97316]">
              {resourceRecovery.completedResourceRecoveriesCount} completed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Resources Recovered</span>
              <span className="font-mono font-black text-xl text-[#0C2D21] block mt-1">
                {resourceRecovery.hasCompletedData ? `${resourceRecovery.totalResourcesRecoveredKg} kg` : 'No data yet'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <span className="text-[10px] font-bold uppercase text-stone-500 block">Completed Recoveries</span>
              <span className="font-mono font-black text-xl text-[#0C2D21] block mt-1">
                {resourceRecovery.hasCompletedData ? resourceRecovery.completedResourceRecoveriesCount : 'No data yet'}
              </span>
            </div>
          </div>

          {/* Quantity by resource/material category */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Quantity by Resource / Material Category:
            </span>

            {resourceRecovery.categories.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-[#FAF8F3] border border-dashed border-stone-200 text-stone-500 text-xs">
                No completed resource recoveries recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {resourceRecovery.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#0C2D21] block">{cat.category}</span>
                      <span className="text-stone-500 text-[10px]">
                        {cat.deliveriesCount} delivery · {cat.percentage}% of recovered total
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#0C2D21]">
                      {cat.quantityKg} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ENERGY IMPACT (Section 6) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  ENERGY IMPACT
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                  ESTIMATED
                </span>
              </div>
              <p className="text-xs text-stone-500">
                From accepted and saved Smart Energy kitchen analyses.
              </p>
            </div>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Energy Saved</span>
                <span className="text-[9px] font-mono text-stone-400">ESTIMATED</span>
              </div>
              <span className="font-mono font-black text-xl text-[#059669] block mt-1">
                {energyImpact.hasRecordedData ? `${energyImpact.estimatedEnergySavedKWh} kWh` : 'No data yet'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">CO2e Avoided</span>
                <span className="text-[9px] font-mono text-stone-400">ESTIMATED</span>
              </div>
              <span className="font-mono font-black text-xl text-[#0C2D21] block mt-1">
                {energyImpact.hasRecordedData ? `${energyImpact.estimatedCO2eAvoidedKg} kg` : 'No data yet'}
              </span>
            </div>
          </div>

          {/* Breakdown by source */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
              Savings by Energy Source:
            </span>

            {energyImpact.bySource.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-[#FAF8F3] border border-dashed border-stone-200 text-stone-500 text-xs">
                No energy-saving data recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {energyImpact.bySource.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#0C2D21] block">{src.source}</span>
                      <span className="text-stone-500 text-[10px]">
                        Estimated ~{src.savedCO2eKg} kg CO2e emissions prevented
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#059669]">
                      {src.savedKWh} kWh
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-stone-500 italic">
            * Environmental values are calculated using standard grid and thermal emission factors. Labelled strictly as <strong>ESTIMATED</strong> without unverified carbon offset claims.
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 6. SECTION 9: SUSTAINABILITY IMPACT SUMMARY */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0C2D21] text-white shadow-md space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-widest block mb-1">
            CONSOLIDATED ECOLOGICAL AUDIT
          </span>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            SUSTAINABILITY IMPACT
          </h3>
          <p className="text-xs text-stone-300 max-w-2xl mt-1">
            Aggregated diversion and efficiency metrics across all operational W2V modules for this facility.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-300 block">Food Waste Prevented</span>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#34D399]">
              {sustainabilitySummary.hasAnyData ? `${sustainabilitySummary.foodWastePreventedKg} kg` : 'No data yet'}
            </div>
            <span className="text-[10px] text-stone-400 block">Zero landfill transfer</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-300 block">Resources Recovered</span>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#F97316]">
              {sustainabilitySummary.hasAnyData ? `${sustainabilitySummary.resourcesRecoveredKg} kg` : 'No data yet'}
            </div>
            <span className="text-[10px] text-stone-400 block">Industrial feedstock</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-300 block">Energy Saved (Estimated)</span>
            <div className="font-mono text-xl sm:text-2xl font-black text-amber-400">
              {sustainabilitySummary.hasAnyData ? `${sustainabilitySummary.estimatedEnergySavedKWh} kWh` : 'No data yet'}
            </div>
            <span className="text-[10px] text-stone-400 block">Cooking efficiency</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-300 block">Estimated CO2e Avoided</span>
            <div className="font-mono text-xl sm:text-2xl font-black text-white">
              {sustainabilitySummary.hasAnyData ? `${sustainabilitySummary.estimatedCO2eAvoidedKg} kg` : 'No data yet'}
            </div>
            <span className="text-[10px] text-stone-400 block">Methane + energy</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-300 block">Completed Recovery Activities</span>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#10B981]">
              {sustainabilitySummary.hasAnyData ? sustainabilitySummary.completedRecoveryActivitiesCount : 'No data yet'}
            </div>
            <span className="text-[10px] text-stone-400 block">Fulfilled dispatches</span>
          </div>
        </div>

        <div className="text-[11px] text-stone-300 italic pt-2 border-t border-white/10">
          * Environmental values are reported as estimated savings based on primary kitchen logs and standard IPCC emission coefficients. W2V does not claim formal ESG certifications or tradeable carbon credits.
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. SECTION 10: RECENT IMPACT ACTIVITY */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
          <div>
            <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
              RECENT IMPACT ACTIVITY
            </h3>
            <p className="text-xs text-stone-500">
              Chronological log of verified completed activities from actual database records.
            </p>
          </div>
          <Clock className="w-4 h-4 text-stone-400" />
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FAF8F3] border border-dashed border-stone-200 text-stone-500 text-xs">
            No completed impact activities yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => {
              const isFood = act.type === 'FOOD_RECOVERY_COMPLETED';
              const isResource = act.type === 'RESOURCE_RECOVERY_COMPLETED';
              const isEnergy = act.type === 'ENERGY_SAVING_RECORDED';

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isFood
                          ? 'bg-[#10B981]/20 text-[#059669]'
                          : isResource
                          ? 'bg-[#F97316]/20 text-[#EA580C]'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isFood ? '🍲' : isResource ? '🍋' : '⚡'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                            isFood
                              ? 'bg-emerald-100 text-emerald-800'
                              : isResource
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {act.title}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#0C2D21] mt-1">
                        {act.subtitle}
                      </div>
                      {act.partnerOrTarget && (
                        <span className="text-stone-600 text-[11px] block">
                          {act.partnerOrTarget}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-mono font-bold text-[#0C2D21] block">
                      {act.quantityOrMetric}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono block">
                      {new Date(act.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
