import React from 'react';
import { W2VLogo } from './W2VLogo';
import { StoredRegistration } from '../services/registrationStorage';
import { ArrowLeft, Building2, CheckCircle2, LogOut, ShieldCheck, User } from 'lucide-react';

interface RoleDashboardRedirectProps {
  user: StoredRegistration;
  dashboardTitle: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const RoleDashboardRedirectView: React.FC<RoleDashboardRedirectProps> = ({
  user,
  dashboardTitle,
  onLogout,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40">
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
              <span className="font-display text-sm font-extrabold text-[#0C2D21] tracking-tight uppercase">
                {dashboardTitle}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {user.orgName} · {user.orgType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-12 shadow-xl text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981]/20 text-[#059669] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED VIA DYNAMIC OTP</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#0C2D21] tracking-tight uppercase mb-2">
            {dashboardTitle}
          </h1>

          <p className="text-sm text-[#161A18]/75 max-w-lg mx-auto mb-8">
            You have successfully completed multi-factor authentication. Routing has been established for your verified organization account.
          </p>

          {/* Account Profile Summary */}
          <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 text-xs text-[#0C2D21] space-y-3 text-left mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                  Organization
                </span>
                <span className="font-bold text-sm text-[#0C2D21] block">
                  {user.orgName}
                </span>
              </div>
              <div>
                <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                  Organization Type
                </span>
                <span className="font-bold text-sm text-[#0C2D21] block">
                  {user.orgType}
                </span>
              </div>
              <div>
                <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                  Role Category
                </span>
                <span className="font-mono font-bold text-xs uppercase text-[#F97316] block">
                  {user.roleCategory}
                </span>
              </div>
              <div>
                <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                  Authorized Contact
                </span>
                <span className="font-medium text-xs text-[#161A18] block">
                  {user.ownerName} ({user.contactNumber})
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-500 italic">
            * Dashboard workspace features for this role will be loaded in the upcoming iteration as specified.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value
      </footer>
    </div>
  );
};
