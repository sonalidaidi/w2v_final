import React from 'react';
import { Calendar, Eye, RefreshCw, BarChart3, ArrowRight } from 'lucide-react';

interface ProductFeaturesProps {
  onGetStarted: () => void;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ onGetStarted }) => {
  const features = [
    {
      title: 'SMART PLANNING',
      description: 'AI-assisted demand and production planning.',
      icon: Calendar,
      accent: 'text-[#0C2D21]',
      borderHover: 'hover:border-[#0C2D21]',
      badgeColor: 'text-[#0C2D21] bg-[#0C2D21]/8',
    },
    {
      title: 'SURPLUS DETECTION',
      description: 'Identify eligible surplus using computer vision and sensor-assisted inputs.',
      icon: Eye,
      accent: 'text-[#F97316]',
      borderHover: 'hover:border-[#F97316]',
      badgeColor: 'text-[#EA580C] bg-[#F97316]/10',
    },
    {
      title: 'SMART RECOVERY',
      description: 'Connect suitable surplus with receivers and recovery partners.',
      icon: RefreshCw,
      accent: 'text-[#059669]',
      borderHover: 'hover:border-[#059669]',
      badgeColor: 'text-[#059669] bg-[#10B981]/10',
    },
    {
      title: 'IMPACT',
      description: 'Measure food saved, waste prevented and sustainability outcomes.',
      icon: BarChart3,
      accent: 'text-[#F97316]',
      borderHover: 'hover:border-[#F97316]',
      badgeColor: 'text-[#EA580C] bg-[#F97316]/10',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-t border-b border-[#0C2D21]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
            CORE CAPABILITIES
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0C2D21] tracking-tight">
            Make Surplus Count.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#161A18]/75 leading-relaxed font-normal">
            From smarter planning to responsible recovery, W2V turns avoidable food waste into measurable value.
          </p>
        </div>

        {/* Four Concise Feature Blocks: Simple Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`flex flex-col justify-between p-7 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/12 transition-all duration-200 shadow-xs hover:shadow-md ${feat.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#0C2D21]/10 flex items-center justify-center shadow-2xs">
                      <Icon className={`w-6 h-6 ${feat.accent}`} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${feat.badgeColor}`}>
                      SYSTEM MODULE
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#0C2D21] tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#161A18]/80 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#0C2D21]/8 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21]/60">
                    W2V Infrastructure
                  </span>
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0C2D21] hover:text-[#F97316] transition-colors"
                  >
                    <span>View Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
