import React from 'react';
import { X, HelpCircle, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRole: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onGoToRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#0C2D21]/15 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#0C2D21]/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0C2D21] text-white">
              <HelpCircle className="w-5 h-5 text-[#F97316]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[#0C2D21]">
                W2V Ecosystem Help & FAQ
              </h3>
              <p className="text-xs text-[#121714]/70">
                SIH 2026 Food Recovery Knowledge Base
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#0C2D21]/60 hover:text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-lg transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-5 text-xs text-[#121714]/80">
          
          <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/8">
            <h4 className="font-bold text-sm text-[#0C2D21] flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#10B981]" />
              What is W2V (Waste2Value)?
            </h4>
            <p className="leading-relaxed">
              W2V is an AI-powered smart food waste reduction and sustainable redistribution ecosystem engineered for institutional kitchens (universities, colleges, hospital canteens, corporate cafeterias) and industrial Food Processing Units (FPUs).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/8">
            <h4 className="font-bold text-sm text-[#0C2D21] flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#F97316]" />
              How does surplus food get handled safely?
            </h4>
            <p className="leading-relaxed">
              W2V enforces strict temperature, shelf-life, and optical food quality guidelines. Only unserved, freshly prepared food meeting national food safety standards is routed for human consumption. Other recoverable organic streams are routed to verified bio-processors, composters, or animal feed upcyclers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/8">
            <h4 className="font-bold text-sm text-[#0C2D21] flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              What are the 4 core steps?
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2 font-medium">
              <div className="p-2 rounded bg-[#FBF9F5] border border-[#0C2D21]/5">
                <span className="text-[#0C2D21] font-bold block">01. PLAN</span> AI menu & demand forecasting
              </div>
              <div className="p-2 rounded bg-[#FBF9F5] border border-[#0C2D21]/5">
                <span className="text-[#F97316] font-bold block">02. DETECT</span> Optical surplus logging & scanning
              </div>
              <div className="p-2 rounded bg-[#FBF9F5] border border-[#0C2D21]/5">
                <span className="text-[#059669] font-bold block">03. CONNECT</span> Cold-chain matching & dispatch
              </div>
              <div className="p-2 rounded bg-[#FBF9F5] border border-[#0C2D21]/5">
                <span className="text-[#0C2D21] font-bold block">04. MEASURE</span> ESG impact & carbon savings
              </div>
            </div>
          </div>

        </div>

        {/* Action button */}
        <div className="mt-8 pt-4 border-t border-[#0C2D21]/10 flex items-center justify-between">
          <span className="text-xs text-[#121714]/60">
            Helpline: 6303990223 · waste2value@gmail.com
          </span>
          <button
            onClick={() => {
              onClose();
              onGoToRole();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0C2D21] hover:bg-[#164634] text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Get Started
          </button>
        </div>

      </div>
    </div>
  );
};
