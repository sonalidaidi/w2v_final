import React, { useState } from 'react';
import { 
  ArrowLeft, User, Shield, CheckCircle, ArrowRight, Building, Factory, Heart, 
  Warehouse, Home, Utensils, Briefcase, Sparkles, Leaf, Recycle, Award
} from 'lucide-react';
import { W2VLogo } from './W2VLogo';

export type UserCategory = 'none' | 'user-select' | 'donor' | 'receiver';

interface WhoAreYouViewProps {
  onBackToHome: () => void;
  onSelectAdmin: () => void;
  onSelectUserLogin?: () => void;
  onSelectInstitutionalKitchen?: () => void;
  onSelectFPU?: () => void;
  onSelectReceiverType?: (type: string) => void;
  initialStep?: UserCategory;
}

export const WhoAreYouView: React.FC<WhoAreYouViewProps> = ({
  onBackToHome,
  onSelectAdmin,
  onSelectUserLogin,
  onSelectInstitutionalKitchen,
  onSelectFPU,
  onSelectReceiverType,
  initialStep = 'none',
}) => {
  const [currentStep, setCurrentStep] = useState<UserCategory>(initialStep);
  const [selectedFlowMessage, setSelectedFlowMessage] = useState<string | null>(null);

  const handleInstitutionalKitchen = () => {
    if (onSelectInstitutionalKitchen) {
      onSelectInstitutionalKitchen();
    } else {
      setSelectedFlowMessage('Opening Institutional Kitchen Registration & Smart Intake Portal...');
    }
  };

  const handleFPU = () => {
    if (onSelectFPU) {
      onSelectFPU();
    } else {
      setSelectedFlowMessage('Opening Food Processing Unit (FPU) Byproduct & Batch Hub...');
    }
  };

  const handleReceiverSelection = (type: string) => {
    if (onSelectReceiverType) {
      onSelectReceiverType(type);
    } else {
      setSelectedFlowMessage(`Opening ${type} Redistribution Network & Verified Allocation...`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F3] via-[#F3EFE6] to-[#E9F3ED] flex flex-col justify-between text-[#161A18] relative overflow-hidden">
      {/* Decorative colored glow orbs in background */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-[#F97316]/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#0C2D21]/10 py-4 px-4 sm:px-8 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep === 'donor' || currentStep === 'receiver') {
                setCurrentStep('user-select');
                setSelectedFlowMessage(null);
              } else if (currentStep === 'user-select') {
                setCurrentStep('none');
                setSelectedFlowMessage(null);
              } else {
                onBackToHome();
              }
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:text-[#F97316] transition-colors focus:outline-none cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#0C2D21]/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 'none' ? 'Back to Home' : 'Back'}</span>
          </button>

          {/* Logo prominently at top center with solid clean background */}
          <button
            onClick={onBackToHome}
            className="focus:outline-none cursor-pointer transition-transform hover:scale-105"
            aria-label="W2V Home"
          >
            <W2VLogo size="sm" />
          </button>

          {/* Pill indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#10B981]/15 to-[#F97316]/15 border border-[#10B981]/25 text-[11px] font-bold text-[#0C2D21]">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="hidden sm:inline">SIH 2026 Ecosystem</span>
            <span className="sm:hidden">W2V</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-3xl mx-auto py-8">

          {/* STEP 1: WHO ARE YOU? */}
          {currentStep === 'none' && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C2D21] text-white text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Step 1 · Identification</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0C2D21] mb-3">
                WHO ARE YOU?
              </h1>

              <p className="text-base text-[#161A18]/80 max-w-lg mb-10 leading-relaxed">
                Choose your portal access level to enter the W2V Smart Circular Recovery System.
              </p>

              {/* Colorful Dual Choice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                
                {/* ADMIN CARD */}
                <div
                  onClick={onSelectAdmin}
                  className="group relative flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-[#0C2D21] via-[#113B2C] to-[#082017] text-white shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-[#F97316] transition-all duration-300 cursor-pointer text-left hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#F97316]" />
                  
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/15">
                      <Shield className="w-8 h-8 text-[#F97316]" />
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#F97316]/20 text-[#F97316] text-[10px] font-bold tracking-wider uppercase mb-2">
                      Governance
                    </div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-white mb-2">
                      ADMIN
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                      Institutional directors, audit controllers, and compliance teams managing facilities, policies, and system-wide verification.
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F97316] group-hover:underline">
                      Enter Admin Login
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* USER CARD */}
                <div
                  onClick={() => {
                    if (onSelectUserLogin) {
                      onSelectUserLogin();
                    } else {
                      setCurrentStep('user-select');
                    }
                  }}
                  className="group relative flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-white via-[#F5FCF8] to-[#E9F8F0] border-2 border-[#10B981]/30 hover:border-[#10B981] shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer text-left hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#10B981]" />

                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[#10B981]/25">
                      <User className="w-8 h-8 text-[#059669]" />
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#10B981]/20 text-[#059669] text-[10px] font-bold tracking-wider uppercase mb-2">
                      Operations & Redistribution
                    </div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-[#0C2D21] mb-2">
                      USER
                    </h2>

                    <p className="text-xs sm:text-sm text-[#161A18]/75 leading-relaxed">
                      Commercial & campus kitchens, food processing factories, verified NGOs, food banks, shelters, and bio-industrial secondary buyers.
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#10B981]/20 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#059669] group-hover:underline">
                      Enter User Login
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#059669] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: SELECT ACCOUNT TYPE (PROVIDER / RECEIVER) */}
          {currentStep === 'user-select' && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981] text-white text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <Recycle className="w-3.5 h-3.5" />
                <span>Step 2 · Select Account Type</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0C2D21] mb-3">
                SELECT ACCOUNT TYPE
              </h2>

              <p className="text-base text-[#161A18]/80 max-w-lg mb-10 leading-relaxed">
                Do you produce surplus food assets or redistribute them to feed communities and supply industries?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                
                {/* PROVIDER BUTTON */}
                <div
                  onClick={() => setCurrentStep('donor')}
                  className="group p-8 rounded-3xl bg-gradient-to-br from-white to-[#FDF8F0] border-2 border-[#F97316]/30 hover:border-[#F97316] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer text-left hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F97316]/15 text-[#EA580C] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Building className="w-7 h-7" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded bg-[#F97316]/20 text-[#EA580C] text-[10px] font-bold uppercase tracking-wider mb-2">
                    Surplus Generator
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#0C2D21] mb-2">
                    PROVIDER
                  </h3>
                  <p className="text-xs text-[#161A18]/70 leading-relaxed mb-6">
                    Institutional kitchens, college messes, hospital kitchens, and industrial food processing units.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                    <span>Continue as Provider</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* RECEIVER BUTTON */}
                <div
                  onClick={() => setCurrentStep('receiver')}
                  className="group p-8 rounded-3xl bg-gradient-to-br from-white to-[#F0FAF4] border-2 border-[#10B981]/30 hover:border-[#10B981] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer text-left hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#059669] text-[10px] font-bold uppercase tracking-wider mb-2">
                    Nutritional & Value Recovery
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#0C2D21] mb-2">
                    RECEIVER
                  </h3>
                  <p className="text-xs text-[#161A18]/70 leading-relaxed mb-6">
                    Verified NGOs, food relief banks, community kitchens, emergency shelters, and commercial upcyclers.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669]">
                    <span>Continue as Receiver</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3A: PROVIDER */}
          {currentStep === 'donor' && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EA580C] text-white text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <Building className="w-3.5 h-3.5" />
                <span>Step 3 · Provider Categorization</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0C2D21] mb-3">
                PROVIDER
              </h2>

              <p className="text-base text-[#161A18]/80 max-w-lg mb-8 leading-relaxed">
                Select your facility type to configure prep forecasts and surplus handoff routes.
              </p>

              <div className="flex flex-col gap-4 w-full max-w-lg">
                
                {/* Option 1: INSTITUTIONAL KITCHEN */}
                <div
                  onClick={handleInstitutionalKitchen}
                  className="group p-5 rounded-2xl bg-white border-2 border-[#0C2D21]/15 hover:border-[#0C2D21] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-xl bg-[#0C2D21] text-[#F97316] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-display text-base sm:text-lg font-bold text-[#0C2D21]">
                        INSTITUTIONAL KITCHEN
                      </div>
                      <div className="text-xs text-[#161A18]/65 mt-0.5">
                        University campuses, hostels, corporate cafeterias, and hospital kitchens
                      </div>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#FAF8F3] group-hover:bg-[#0C2D21] group-hover:text-white transition-colors flex items-center justify-center text-[#0C2D21]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Option 2: FOOD PROCESSING UNIT */}
                <div
                  onClick={handleFPU}
                  className="group p-5 rounded-2xl bg-white border-2 border-[#10B981]/30 hover:border-[#10B981] shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-xl bg-[#10B981] text-[#0C2D21] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Factory className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-display text-base sm:text-lg font-bold text-[#0C2D21]">
                        FOOD PROCESSING UNIT
                      </div>
                      <div className="text-xs text-[#161A18]/65 mt-0.5">
                        Food manufacturing plants, packaging side-streams, and agricultural packhouses
                      </div>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#FAF8F3] group-hover:bg-[#10B981] group-hover:text-white transition-colors flex items-center justify-center text-[#0C2D21]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </div>

              {selectedFlowMessage && (
                <div className="mt-8 p-4 rounded-2xl bg-white border-2 border-[#10B981] text-xs sm:text-sm text-[#0C2D21] font-semibold flex items-center gap-3 shadow-lg animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
                  <span>{selectedFlowMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3B: RECEIVER */}
          {currentStep === 'receiver' && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#059669] text-white text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                <Heart className="w-3.5 h-3.5" />
                <span>Step 3 · Recipient Allocation</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0C2D21] mb-3">
                RECEIVER
              </h2>

              <p className="text-base text-[#161A18]/80 max-w-lg mb-8 leading-relaxed">
                Connect your organization to real-time edible recovery batches and organic resource streams.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xl">
                
                {/* 1. NGO */}
                <div
                  onClick={() => handleReceiverSelection('NGO')}
                  className="group p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#F97316] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F97316]/15 text-[#EA580C] flex items-center justify-center font-bold">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#0C2D21]">NGO</div>
                      <div className="text-xs text-[#161A18]/60">Registered charities and humanitarian aid organizations</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" />
                </div>

                {/* 2. FOOD BANK */}
                <div
                  onClick={() => handleReceiverSelection('FOOD BANK')}
                  className="group p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#10B981] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#10B981]/15 text-[#059669] flex items-center justify-center font-bold">
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#0C2D21]">FOOD BANK</div>
                      <div className="text-xs text-[#161A18]/60">Bulk storage, cold-chain preservation, and regional sorting hubs</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#10B981] group-hover:translate-x-1 transition-all" />
                </div>

                {/* 3. SHELTER */}
                <div
                  onClick={() => handleReceiverSelection('SHELTER')}
                  className="group p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#0C2D21] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#0C2D21]/10 text-[#0C2D21] flex items-center justify-center font-bold">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#0C2D21]">SHELTER</div>
                      <div className="text-xs text-[#161A18]/60">Night shelters, welfare homes, and emergency transit accommodations</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#0C2D21] group-hover:translate-x-1 transition-all" />
                </div>

                {/* 4. COMMUNITY KITCHEN */}
                <div
                  onClick={() => handleReceiverSelection('COMMUNITY KITCHEN')}
                  className="group p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#F97316] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#0C2D21]">COMMUNITY KITCHEN</div>
                      <div className="text-xs text-[#161A18]/60">Public soup kitchens, langars, and direct daily meal providers</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* 5. SECONDARY BUYER / INDUSTRY */}
                <div
                  onClick={() => handleReceiverSelection('SECONDARY BUYER / INDUSTRY')}
                  className="group p-4 rounded-2xl bg-white border-2 border-stone-200 hover:border-[#059669] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-800 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-[#0C2D21]">SECONDARY BUYER / INDUSTRY</div>
                      <div className="text-xs text-[#161A18]/60">Composting plants, bio-gas digesters, animal feed, and circular upcyclers</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
                </div>

              </div>

              {selectedFlowMessage && (
                <div className="mt-8 p-4 rounded-2xl bg-white border-2 border-[#10B981] text-xs sm:text-sm text-[#0C2D21] font-semibold flex items-center gap-3 shadow-lg animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
                  <span>{selectedFlowMessage}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Trust & Guarantee Banner */}
      <div className="w-full bg-white/70 backdrop-blur-xs py-3 border-t border-[#0C2D21]/8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-[#0C2D21]/70">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#F97316]" />
            <span>FSSAI Hygiene & Cold-Chain Aligned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span>Encrypted Institutional Authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Recycle className="w-4 h-4 text-[#0C2D21]" />
            <span>Zero Landfill Mission 2026</span>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-3 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white/40">
        W2V — Waste2Value · SIH 2026 Sustainable Innovation
      </footer>
    </div>
  );
};
