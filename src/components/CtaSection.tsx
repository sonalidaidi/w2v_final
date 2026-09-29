import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onGetStarted: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-[#0C2D21] relative overflow-hidden text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -z-0 w-80 h-80 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 -z-0 w-80 h-80 bg-[#F97316]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Smart India Hackathon 2026 Initiative</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to turn surplus into value?
        </h2>

        <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed">
          Join universities, hospitals, corporate canteens, and food processors pioneering zero-waste kitchen intelligence.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold tracking-wider uppercase text-[#0C2D21] bg-white hover:bg-stone-100 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0C2D21] active:scale-[0.99]"
          >
            <span>GET STARTED</span>
            <ArrowRight className="w-4 h-4 text-[#F97316]" />
          </button>
        </div>

      </div>
    </section>
  );
};
