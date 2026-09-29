import React from 'react';
import { X, Check, Building, Factory, Heart, ArrowRight } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSelectTier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-[#0C2D21]/15 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#0C2D21]/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F97316]">
              Institutional Deployment Plans
            </span>
            <h3 className="font-display text-2xl font-bold text-[#0C2D21]">
              Subscription & Partnership Tiers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#0C2D21]/60 hover:text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-lg transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tiers */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tier 1: Institutional Kitchens */}
          <div className="rounded-xl bg-white border-2 border-[#0C2D21]/15 p-6 flex flex-col justify-between hover:border-[#0C2D21] transition-all shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#0C2D21]/5 text-[#0C2D21] flex items-center justify-center mb-4">
                <Building className="w-5 h-5 text-[#0C2D21]" />
              </div>
              <h4 className="font-display text-lg font-bold text-[#0C2D21]">
                Institutional Kitchen
              </h4>
              <p className="text-xs text-[#121714]/70 mt-1">
                Colleges, universities, hospitals & corporate catering.
              </p>
              
              <div className="mt-4 pt-4 border-t border-[#0C2D21]/10">
                <span className="text-2xl font-display font-extrabold text-[#0C2D21]">
                  Campus Plan
                </span>
                <span className="text-xs text-[#121714]/60 block mt-0.5">Custom per meal volume</span>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-[#121714]/80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  AI Production & Headcount Planner
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Optical Daily Surplus Logging
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  NGO Cold-Chain Dispatch Connect
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Basic ESG Carbon Audit
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onClose();
                onSelectTier();
              }}
              className="mt-6 w-full py-2.5 rounded-lg bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164634] transition-colors"
            >
              Select Tier
            </button>
          </div>

          {/* Tier 2: Food Processing Units (FPU) */}
          <div className="rounded-xl bg-[#0C2D21] text-white border-2 border-[#10B981] p-6 flex flex-col justify-between relative shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Popular for Industry
            </div>

            <div>
              <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4">
                <Factory className="w-5 h-5 text-[#10B981]" />
              </div>
              <h4 className="font-display text-lg font-bold text-white">
                FPU Enterprise
              </h4>
              <p className="text-xs text-stone-300 mt-1">
                Industrial food processors, packaging plants & mills.
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-2xl font-display font-extrabold text-white">
                  Industrial Suite
                </span>
                <span className="text-xs text-stone-400 block mt-0.5">Scale-tiered licensing</span>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-stone-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Batch Residue & Byproduct Routing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Secondary Marketplace Matching
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Biomass Valorization Analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Automated ESG & Carbon Credits
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onClose();
                onSelectTier();
              }}
              className="mt-6 w-full py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Tier 3: Verified Community NGO */}
          <div className="rounded-xl bg-white border-2 border-[#0C2D21]/15 p-6 flex flex-col justify-between hover:border-[#0C2D21] transition-all shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 text-[#F97316] flex items-center justify-center mb-4">
                <Heart className="w-5 h-5 text-[#F97316]" />
              </div>
              <h4 className="font-display text-lg font-bold text-[#0C2D21]">
                Recipient Partner
              </h4>
              <p className="text-xs text-[#121714]/70 mt-1">
                Verified shelters, student food banks & charity kitchens.
              </p>
              
              <div className="mt-4 pt-4 border-t border-[#0C2D21]/10">
                <span className="text-2xl font-display font-extrabold text-[#059669]">
                  100% Free
                </span>
                <span className="text-xs text-[#121714]/60 block mt-0.5">Non-profit verification required</span>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-[#121714]/80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Instant Surplus Drop Alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Cold-Chain ETA Tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Digital Safety Handover Log
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  Zero Platform Fees
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onClose();
                onSelectTier();
              }}
              className="mt-6 w-full py-2.5 rounded-lg border border-[#0C2D21] text-[#0C2D21] hover:bg-[#0C2D21]/5 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Join Network
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-[#0C2D21]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#121714]/70">
          <span>Inquiries: waste2value@gmail.com · 6303990223</span>
          <span className="font-semibold text-[#0C2D21]">Smart India Hackathon 2026 Sandbox</span>
        </div>

      </div>
    </div>
  );
};
