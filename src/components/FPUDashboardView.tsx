import React, { useState } from 'react';
import { W2VLogo } from './W2VLogo';
import { StoredRegistration } from '../services/registrationStorage';
import { FPUPlanModule } from './fpu/FPUPlanModule';
import { FPUStorageModule } from './fpu/FPUStorageModule';
import { FPUMachineModule } from './fpu/FPUMachineModule';
import { FPUExpiryModule } from './fpu/FPUExpiryModule';
import { FPUImpactDashboardView } from './fpu/FPUImpactDashboardView';
import { RecoveryHubView } from './RecoveryHubView';
import { MapAnalyticsView } from './MapAnalyticsView';
import { FPUNotificationModal } from './fpu/FPUNotificationModal';
import { FPUProfileModal } from './fpu/FPUProfileModal';
import { HelpModal } from './HelpModal';
import { getFPUNotifications } from '../services/fpuStorage';
import { getRecoveryListings } from '../services/recoveryHubStorage';
import {
  Calculator,
  Thermometer,
  Cpu,
  Clock,
  Recycle,
  TrendingUp,
  Bell,
  User,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Building2,
  Navigation,
  ArrowRight,
  Boxes,
} from 'lucide-react';

export type FPUMainTab =
  | 'PLAN'
  | 'STORAGE'
  | 'MACHINE_MONITORING'
  | 'EXPIRY_DETECTION'
  | 'RECOVERY_HUB'
  | 'IMPACT_DASHBOARD'
  | 'MAP_ANALYTICS';

interface FPUDashboardViewProps {
  user: StoredRegistration;
  onLogout: () => void;
  onNavigateHome: () => void;
  initialTab?: FPUMainTab;
}

export const FPUDashboardView: React.FC<FPUDashboardViewProps> = ({
  user,
  onLogout,
  onNavigateHome,
  initialTab = 'PLAN',
}) => {
  const [activeTab, setActiveTab] = useState<FPUMainTab>(initialTab);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  // Map Analytics parameter
  const [mapAnalyticsListingId, setMapAnalyticsListingId] = useState<string | undefined>(undefined);

  const notifications = getFPUNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const allRecoveries = getRecoveryListings();
  const completedRecoveries = allRecoveries.filter((l) => l.status === 'COMPLETED');
  const totalRescuedKg = completedRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );

  const handleOpenMapAnalytics = (listingId?: string) => {
    setMapAnalyticsListingId(listingId);
    setActiveTab('MAP_ANALYTICS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & FPU Badge */}
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
              <span className="font-display text-xs font-bold text-[#0C2D21] tracking-tight uppercase">
                Food Processing Unit
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Factory & Circular Recovery Hub
              </span>
            </div>
          </div>

          {/* Right Action Icons: Notifications, Profile, Help, Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Notification Button */}
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-[#0C2D21] transition-colors cursor-pointer"
              title="FPU Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-[#0C2D21] transition-colors cursor-pointer"
              title="FPU Profile"
            >
              <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden sm:inline">PROFILE</span>
            </button>

            {/* Help Button */}
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-[#0C2D21] transition-colors cursor-pointer"
              title="Help & Guidelines"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-stone-200 hidden sm:block mx-1" />

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome & Organization Identity Card */}
        <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-2">
                <span>Welcome, {user.ownerName || 'Plant Authorized Representative'}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight">
                {user.orgName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold text-[#161A18]/70">
                <span className="px-2.5 py-0.5 rounded-md bg-[#0C2D21] text-white">
                  Food Processing Unit
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#F97316]/20 text-[#EA580C]">
                  Industrial Facility
                </span>
                <span className="text-stone-400">·</span>
                <span>{user.city}, {user.state}</span>
              </div>
            </div>

            {/* Plant Operational Stats Card */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 bg-[#FAF8F3] p-4 rounded-2xl border border-[#0C2D21]/10 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Circularity Total
                </span>
                <div className="font-mono text-lg sm:text-xl font-black text-[#059669] mt-0.5">
                  {totalRescuedKg.toLocaleString()} kg
                </div>
                <span className="text-[10px] text-stone-400">Byproducts diverted</span>
              </div>

              <div className="border-l border-[#0C2D21]/10 pl-3 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Active Alerts
                </span>
                <div className="font-mono text-lg sm:text-xl font-black text-amber-700 mt-0.5">
                  {unreadCount} alerts
                </div>
                <span className="text-[10px] text-stone-400">Storage & machinery</span>
              </div>
            </div>
          </div>

          {/* 6 MAIN MODULE TABS PER SECTION 1 SPEC:
              [ PLAN ] [ STORAGE ] [ MACHINE MONITORING ] [ EXPIRY DETECTION ] [ RECOVERY HUB ] [ IMPACT DASHBOARD ] */}
          <div className="mt-8 pt-6 border-t border-[#0C2D21]/10 flex flex-wrap items-center gap-2.5">
            
            <button
              onClick={() => setActiveTab('PLAN')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'PLAN'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Calculator className="w-4 h-4 text-[#F97316]" />
              <span>PLAN</span>
            </button>

            <button
              onClick={() => setActiveTab('STORAGE')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'STORAGE'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Thermometer className="w-4 h-4 text-[#10B981]" />
              <span>STORAGE</span>
            </button>

            <button
              onClick={() => setActiveTab('MACHINE_MONITORING')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'MACHINE_MONITORING'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-500" />
              <span>MACHINE MONITORING</span>
            </button>

            <button
              onClick={() => setActiveTab('EXPIRY_DETECTION')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'EXPIRY_DETECTION'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Clock className="w-4 h-4 text-[#F97316]" />
              <span>EXPIRY DETECTION</span>
            </button>

            <button
              onClick={() => setActiveTab('RECOVERY_HUB')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'RECOVERY_HUB'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <Recycle className="w-4 h-4 text-[#10B981]" />
              <span>RECOVERY HUB</span>
            </button>

            <button
              onClick={() => setActiveTab('IMPACT_DASHBOARD')}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'IMPACT_DASHBOARD'
                  ? 'bg-[#0C2D21] text-white shadow-md'
                  : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#F97316]" />
              <span>IMPACT DASHBOARD</span>
            </button>

          </div>
        </div>

        {/* TAB 1: PLAN (Smart Production Planning) */}
        {activeTab === 'PLAN' && <FPUPlanModule />}

        {/* TAB 2: STORAGE (Storage Monitoring & Alerts) */}
        {activeTab === 'STORAGE' && <FPUStorageModule />}

        {/* TAB 3: MACHINE MONITORING (PLC / SCADA Operational Telemetry) */}
        {activeTab === 'MACHINE_MONITORING' && <FPUMachineModule />}

        {/* TAB 4: EXPIRY DETECTION & SECONDARY RECOVERY */}
        {activeTab === 'EXPIRY_DETECTION' && (
          <FPUExpiryModule
            onOpenMapAnalytics={handleOpenMapAnalytics}
            onOpenRecoveryHub={() => setActiveTab('RECOVERY_HUB')}
          />
        )}

        {/* TAB 5: RECOVERY HUB (Using existing W2V Recovery Hub) */}
        {activeTab === 'RECOVERY_HUB' && (
          <RecoveryHubView
            onOpenResourceRecovery={() => setActiveTab('EXPIRY_DETECTION')}
            onOpenMapAnalytics={(listing) => handleOpenMapAnalytics(listing?.id)}
          />
        )}

        {/* TAB 6: IMPACT DASHBOARD (FPU Specific Impact View) */}
        {activeTab === 'IMPACT_DASHBOARD' && <FPUImpactDashboardView />}

        {/* TAB 7: MAP ANALYTICS / ROUTE OPTIMIZATION (When linked from accepted recoveries) */}
        {activeTab === 'MAP_ANALYTICS' && (
          <MapAnalyticsView
            user={user}
            initialListingId={mapAnalyticsListingId}
            initialFlow="RESOURCE_RECOVERY"
            onBackToDashboard={() => setActiveTab('EXPIRY_DETECTION')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value · Food Processing Unit Industrial Workspace
      </footer>

      {/* Modals */}
      <FPUNotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab as FPUMainTab)}
      />

      <FPUProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        impactMetrics={{
          totalRescuedKg: totalRescuedKg,
          deliveriesCount: completedRecoveries.length,
        }}
      />

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onGoToRole={() => {}}
      />

    </div>
  );
};
