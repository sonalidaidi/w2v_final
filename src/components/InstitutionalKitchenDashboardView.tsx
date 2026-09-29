import React, { useState } from 'react';
import { W2VLogo } from './W2VLogo';
import { StoredRegistration } from '../services/registrationStorage';
import { PlanFoodQuantity } from './PlanFoodQuantity';
import { SmartMenuOptimization } from './SmartMenuOptimization';
import { SmartEnergyModule } from './SmartEnergyModule';
import { SmartInventoryModule } from './SmartInventoryModule';
import { RecoveryHubView } from './RecoveryHubView';
import { ResourceRecoveryView } from './ResourceRecoveryView';
import { DetectSurplusModule } from './DetectSurplusModule';
import { MapAnalyticsView } from './MapAnalyticsView';
import { ImpactDashboardView } from './ImpactDashboardView';
import { SavedProductionPlan, getSavedProductionPlans } from '../services/smartPlanningStorage';
import { SavedEnergyAnalysis, getSavedEnergyAnalyses } from '../services/smartEnergyStorage';
import { RecoveryListing, getRecoveryListings } from '../services/recoveryHubStorage';
import {
  CalendarDays,
  ShoppingCart,
  TrendingUp,
  Zap,
  Boxes,
  Trash2,
  ScanSearch,
  BookOpen,
  Award,
  Crown,
  CheckCircle,
  LogOut,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Layers,
  Recycle,
  MapPin,
  Navigation as NavIcon,
} from 'lucide-react';

interface InstitutionalKitchenDashboardViewProps {
  user: StoredRegistration;
  initialTab?: MainDashboardTab;
  onLogout: () => void;
  onNavigateHome: () => void;
}

type MainDashboardTab = 'PLAN' | 'BUY' | 'IMPACT DASHBOARD' | 'RECOVERY_HUB' | 'MAP_ANALYTICS';
type PlanSubModule =
  | 'SMART PLANNING'
  | 'SMART ENERGY'
  | 'SMART INVENTORY'
  | 'WASTE SEGREGATION'
  | 'DETECT SURPLUS';

type SmartPlanningViewOption = 'PLAN_FOOD_QUANTITY' | 'SMART_MENU';
type WasteSegregationOption = 'RECOVERY_HUB' | 'RESOURCE_RECOVERY';

export const InstitutionalKitchenDashboardView: React.FC<InstitutionalKitchenDashboardViewProps> = ({
  user,
  initialTab = 'PLAN',
  onLogout,
  onNavigateHome,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainDashboardTab>(initialTab);
  const [activePlanModule, setActivePlanModule] = useState<PlanSubModule>('SMART PLANNING');
  
  // When SMART PLANNING is selected: show TWO options [ PLAN FOOD QUANTITY ] and [ SMART MENU ]
  const [smartPlanningOption, setSmartPlanningOption] = useState<SmartPlanningViewOption>('PLAN_FOOD_QUANTITY');

  // When WASTE SEGREGATION is selected: show ONLY [ RECOVERY HUB ] and [ RESOURCE RECOVERY ]
  const [wasteSegregationOption, setWasteSegregationOption] = useState<WasteSegregationOption>('RECOVERY_HUB');

  // Track accepted production plans, energy analyses, and recovery records
  const [recentPlans, setRecentPlans] = useState<SavedProductionPlan[]>(() => getSavedProductionPlans());
  const [recentEnergyAnalyses, setRecentEnergyAnalyses] = useState<SavedEnergyAnalysis[]>(() => getSavedEnergyAnalyses());
  const [recoveryListings, setRecoveryListings] = useState(() => getRecoveryListings());

  // Map Analytics specific parameters
  const [mapAnalyticsInitialListingId, setMapAnalyticsInitialListingId] = useState<string | undefined>(undefined);
  const [mapAnalyticsFlow, setMapAnalyticsFlow] = useState<'FOOD_RECOVERY' | 'RESOURCE_RECOVERY'>('FOOD_RECOVERY');

  const handlePlanAccepted = (newPlan: SavedProductionPlan) => {
    setRecentPlans((prev) => [newPlan, ...prev]);
  };

  const reloadRecoveryData = () => {
    setRecoveryListings(getRecoveryListings());
  };

  const handleOpenMapAnalyticsFromListing = (listing?: RecoveryListing) => {
    reloadRecoveryData();
    if (listing) {
      setMapAnalyticsInitialListingId(listing.id);
      setMapAnalyticsFlow(listing.type === 'FOOD_SURPLUS' ? 'FOOD_RECOVERY' : 'RESOURCE_RECOVERY');
    }
    setActiveMainTab('MAP_ANALYTICS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalEnergySavedKWh = recentEnergyAnalyses.reduce((acc, curr) => acc + curr.energySavingKWh, 0);
  const totalEnergyCO2eSavedKg = recentEnergyAnalyses.reduce((acc, curr) => acc + curr.co2eSavingKg, 0);

  // Strict W2V rule (Section 7): 10 kg FOOD SAVED = 1 IMPACT POINT
  // Points are calculated exclusively from successfully completed food recovery.
  // No points for creating plans, detecting surplus, listing, matching, or accepting.
  const completedFoodRecoveries = recoveryListings.filter((l) => l.status === 'COMPLETED' && l.type === 'FOOD_SURPLUS');
  const totalKgFoodRescued = completedFoodRecoveries.reduce((acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0), 0);
  const impactPoints = Math.floor(totalKgFoodRescued / 10);
  const leaderboardRank = impactPoints > 0 ? `Tier Verified · ${impactPoints} pts` : 'Pending completed dispatches';
  const subscriptionStatus = 'Active · Institutional Tier';

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="focus:outline-none cursor-pointer"
              title="Return to Home"
            >
              <W2VLogo size="sm" />
            </button>
            <div className="h-6 w-px bg-stone-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-display text-xs font-bold text-[#0C2D21] tracking-tight">
                Institutional Kitchen
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Provider Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#059669] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Provider</span>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome & Organization Identity Banner */}
        <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-2">
                <span>Welcome, {user.ownerName || 'Authorized Representative'}</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-[#0C2D21] tracking-tight">
                {user.orgName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold text-[#161A18]/70">
                <span className="px-2.5 py-0.5 rounded-md bg-[#0C2D21] text-white">
                  Institutional Kitchen
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#F97316]/20 text-[#EA580C]">
                  Provider
                </span>
                <span className="text-stone-400">·</span>
                <span>{user.city}, {user.state}</span>
              </div>
            </div>

            {/* Impact & Status Highlights */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-[#FAF8F3] p-4 rounded-2xl border border-[#0C2D21]/10">
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Impact Points
                </div>
                <div className="font-mono text-lg sm:text-xl font-black text-[#0C2D21] mt-0.5 flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#F97316] inline" />
                  <span>{impactPoints}</span>
                </div>
              </div>

              <div className="text-center sm:text-left border-x border-[#0C2D21]/10 px-3 sm:px-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Leaderboard Rank
                </div>
                <div className="font-mono text-sm sm:text-base font-black text-[#059669] mt-1 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-500 inline" />
                  <span>{leaderboardRank}</span>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Subscription Status
                </div>
                <div className="text-xs font-bold text-[#0C2D21] mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981] inline" />
                  <span>{subscriptionStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Tabs: [ PLAN ] | [ BUY ] | [ IMPACT DASHBOARD ] | [ RECOVERY HUB ] */}
          <div className="mt-8 pt-6 border-t border-[#0C2D21]/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveMainTab('PLAN')}
              className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'PLAN'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-[#F97316]" />
              <span>PLAN</span>
            </button>

            <button
              onClick={() => setActiveMainTab('BUY')}
              className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'BUY'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-[#10B981]" />
              <span>BUY</span>
            </button>

            <button
              onClick={() => {
                reloadRecoveryData();
                setActiveMainTab('RECOVERY_HUB');
              }}
              className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'RECOVERY_HUB'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Recycle className="w-4 h-4 text-[#10B981]" />
              <span>RECOVERY HUB</span>
            </button>

            <button
              onClick={() => {
                reloadRecoveryData();
                setActiveMainTab('MAP_ANALYTICS');
              }}
              className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'MAP_ANALYTICS'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <NavIcon className="w-4 h-4 text-[#10B981]" />
              <span>MAP ANALYTICS</span>
            </button>

            <button
              onClick={() => setActiveMainTab('IMPACT DASHBOARD')}
              className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'IMPACT DASHBOARD'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#F97316]" />
              <span>IMPACT DASHBOARD</span>
            </button>
          </div>
        </div>

        {/* SECTION: PLAN SUBMODULES (When PLAN is open) */}
        {activeMainTab === 'PLAN' && (
          <div className="space-y-6">
            
            {/* PLAN Navigation Strip:
                [ SMART PLANNING ] [ SMART ENERGY ] [ SMART INVENTORY ] [ WASTE SEGREGATION ] [ DETECT SURPLUS ] */}
            <div className="bg-white border border-[#0C2D21]/12 rounded-2xl p-3 shadow-xs flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActivePlanModule('SMART PLANNING')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePlanModule === 'SMART PLANNING'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#F97316]" />
                <span>SMART PLANNING</span>
              </button>

              <button
                onClick={() => setActivePlanModule('SMART ENERGY')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePlanModule === 'SMART ENERGY'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>SMART ENERGY</span>
              </button>

              <button
                onClick={() => setActivePlanModule('SMART INVENTORY')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePlanModule === 'SMART INVENTORY'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                }`}
              >
                <Boxes className="w-4 h-4 text-[#10B981]" />
                <span>SMART INVENTORY</span>
              </button>

              <button
                onClick={() => setActivePlanModule('WASTE SEGREGATION')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePlanModule === 'WASTE SEGREGATION'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                }`}
              >
                <Trash2 className="w-4 h-4 text-[#059669]" />
                <span>WASTE SEGREGATION</span>
              </button>

              <button
                onClick={() => setActivePlanModule('DETECT SURPLUS')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePlanModule === 'DETECT SURPLUS'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                }`}
              >
                <ScanSearch className="w-4 h-4 text-[#F97316]" />
                <span>DETECT SURPLUS</span>
              </button>
            </div>

            {/* SUBMODULE 1: SMART PLANNING */}
            {activePlanModule === 'SMART PLANNING' && (
              <div className="space-y-6">
                
                {/* Two options inside SMART PLANNING: [ PLAN FOOD QUANTITY ] and [ SMART MENU ] */}
                <div className="bg-white border border-[#0C2D21]/15 rounded-2xl p-2.5 shadow-2xs flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => setSmartPlanningOption('PLAN_FOOD_QUANTITY')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      smartPlanningOption === 'PLAN_FOOD_QUANTITY'
                        ? 'bg-[#0C2D21] text-white shadow-xs'
                        : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-[#F97316]" />
                    <span>PLAN FOOD QUANTITY</span>
                  </button>

                  <button
                    onClick={() => setSmartPlanningOption('SMART_MENU')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      smartPlanningOption === 'SMART_MENU'
                        ? 'bg-[#0C2D21] text-white shadow-xs'
                        : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#10B981]" />
                    <span>SMART MENU</span>
                  </button>
                </div>

                {/* OPTION 1A: PLAN FOOD QUANTITY */}
                {smartPlanningOption === 'PLAN_FOOD_QUANTITY' && (
                  <PlanFoodQuantity onPlanAccepted={handlePlanAccepted} />
                )}

                {/* OPTION 1B: SMART MENU */}
                {smartPlanningOption === 'SMART_MENU' && (
                  <SmartMenuOptimization />
                )}

              </div>
            )}

            {/* SUBMODULE 2: SMART ENERGY (Connected with Accepted Production Plans from Smart Planning) */}
            {activePlanModule === 'SMART ENERGY' && (
              <SmartEnergyModule />
            )}

            {/* SUBMODULE 3: SMART INVENTORY (Connected with Accepted Production Plans from Smart Planning) */}
            {activePlanModule === 'SMART INVENTORY' && (
              <SmartInventoryModule />
            )}

            {/* SUBMODULE 4: WASTE SEGREGATION — STRICT SPEC: SHOW ONLY [ RECOVERY HUB ] AND [ RESOURCE RECOVERY ] */}
            {activePlanModule === 'WASTE SEGREGATION' && (
              <div className="space-y-6">
                
                {/* Waste Segregation Options Switcher: Show ONLY [ RECOVERY HUB ] and [ RESOURCE RECOVERY ] */}
                <div className="bg-white border border-[#0C2D21]/15 rounded-2xl p-2.5 shadow-2xs flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => setWasteSegregationOption('RECOVERY_HUB')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      wasteSegregationOption === 'RECOVERY_HUB'
                        ? 'bg-[#0C2D21] text-white shadow-xs'
                        : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-[#10B981]" />
                    <span>RECOVERY HUB</span>
                  </button>

                  <button
                    onClick={() => setWasteSegregationOption('RESOURCE_RECOVERY')}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                      wasteSegregationOption === 'RESOURCE_RECOVERY'
                        ? 'bg-[#0C2D21] text-white shadow-xs'
                        : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
                    }`}
                  >
                    <Recycle className="w-4 h-4 text-[#F97316]" />
                    <span>RESOURCE RECOVERY</span>
                  </button>
                </div>

                {wasteSegregationOption === 'RECOVERY_HUB' && (
                  <RecoveryHubView
                    onOpenResourceRecovery={() => setWasteSegregationOption('RESOURCE_RECOVERY')}
                    onOpenMapAnalytics={handleOpenMapAnalyticsFromListing}
                  />
                )}

                {wasteSegregationOption === 'RESOURCE_RECOVERY' && (
                  <ResourceRecoveryView
                    onListingCreated={() => {
                      reloadRecoveryData();
                      setWasteSegregationOption('RECOVERY_HUB');
                    }}
                    onBackToHub={() => setWasteSegregationOption('RECOVERY_HUB')}
                  />
                )}

              </div>
            )}

            {/* SUBMODULE 5: DETECT SURPLUS — FOOD DONATION IS HANDLED ONLY HERE */}
            {activePlanModule === 'DETECT SURPLUS' && (
              <DetectSurplusModule
                onRecoveryDispatched={() => {
                  reloadRecoveryData();
                  setActiveMainTab('RECOVERY_HUB');
                }}
              />
            )}

          </div>
        )}

        {/* SECTION: BUY TAB */}
        {activeMainTab === 'BUY' && (
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#0C2D21]/10">
              <div>
                <h2 className="font-display text-xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  BUY — BULK COMMODITY HUB
                </h2>
                <p className="text-xs text-[#161A18]/70">
                  Direct group procurement from certified food processing units & sustainable suppliers.
                </p>
              </div>
              <ShoppingCart className="w-6 h-6 text-[#10B981]" />
            </div>
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-xs text-[#0C2D21]">
              <p className="font-bold">Institutional procurement marketplace module ready for batch ordering.</p>
              <p className="text-stone-600 mt-1">Aggregated wholesale rates and direct-from-FPU surplus staples.</p>
            </div>
          </div>
        )}

        {/* SECTION: RECOVERY HUB TAB (Directly on Dashboard Profile) */}
        {activeMainTab === 'RECOVERY_HUB' && (
          <RecoveryHubView
            onOpenResourceRecovery={() => {
              setActiveMainTab('PLAN');
              setActivePlanModule('WASTE SEGREGATION');
              setWasteSegregationOption('RESOURCE_RECOVERY');
            }}
            onOpenMapAnalytics={handleOpenMapAnalyticsFromListing}
          />
        )}

        {/* SECTION: MAP ANALYTICS & ROUTE OPTIMIZATION TAB */}
        {activeMainTab === 'MAP_ANALYTICS' && (
          <MapAnalyticsView
            user={user}
            initialListingId={mapAnalyticsInitialListingId}
            initialFlow={mapAnalyticsFlow}
            onBackToDashboard={() => setActiveMainTab('PLAN')}
          />
        )}

        {/* SECTION: IMPACT DASHBOARD TAB */}
        {activeMainTab === 'IMPACT DASHBOARD' && (
          <ImpactDashboardView
            user={user}
            onNavigateToModule={(mod) => {
              if (mod === 'RECOVERY_HUB') {
                setActiveMainTab('RECOVERY_HUB');
              } else if (mod === 'SMART_ENERGY') {
                setActiveMainTab('PLAN');
                setActivePlanModule('SMART ENERGY');
              } else {
                setActiveMainTab('PLAN');
              }
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value · Institutional Kitchen Workspace
      </footer>
    </div>
  );
};
