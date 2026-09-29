import React from 'react';
import { Building2, Factory } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-w2v" className="py-20 bg-white border-t border-[#0C2D21]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading & Text */}
          <div className="lg:col-span-7">
            <div className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
              ABOUT W2V
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0C2D21] tracking-tight">
              From Waste to Value
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#161A18]/85 leading-relaxed font-normal">
              W2V is designed to help institutional kitchens and food processing units reduce avoidable waste, identify surplus, enable responsible redistribution and recovery, and measure their sustainability impact.
            </p>
          </div>

          {/* Right Column: Two Restrained Clean Sector Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#0C2D21] text-white flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="font-display text-base font-bold text-[#0C2D21]">
                Institutional Kitchens
              </h3>
              <p className="mt-2 text-xs text-[#161A18]/70 leading-relaxed font-normal">
                University dining halls, hospital canteens, and enterprise catering facilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-[#0C2D21] text-white flex items-center justify-center mb-4">
                <Factory className="w-5 h-5 text-[#F97316]" />
              </div>
              <h3 className="font-display text-base font-bold text-[#0C2D21]">
                Food Processing Units
              </h3>
              <p className="mt-2 text-xs text-[#161A18]/70 leading-relaxed font-normal">
                Packaging plants, industrial kitchens, and agricultural byproduct processors.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
