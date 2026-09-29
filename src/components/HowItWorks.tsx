import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'PLAN',
      tagline: 'Predictive production & demand planning.',
      detail: 'Anticipate daily meal requirements to reduce overproduction before prep begins.',
    },
    {
      num: '02',
      title: 'DETECT',
      tagline: 'Surplus food & resource identification.',
      detail: 'Log unserved prepared food and processing byproducts with shelf-life inputs.',
    },
    {
      num: '03',
      title: 'RECOVER',
      tagline: 'Rapid sorting & redistribution routing.',
      detail: 'Direct edible surplus to recipient partners and organic streams to upcycling processors.',
    },
    {
      num: '04',
      title: 'MEASURE',
      tagline: 'Verifiable impact & resource accounting.',
      detail: 'Track food saved, avoided waste volumes, and sustainability performance.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-2">
              WORKFLOW PIPELINE
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0C2D21] tracking-tight">
              How It Works
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#161A18]/70 max-w-md font-normal">
            A structured four-step operational flow designed for institutional kitchens and food processing units.
          </p>
        </div>

        {/* 4-Step Product Section: Horizontal Grid with Clean Editorial Numbering */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#0C2D21]/12 flex flex-col justify-between shadow-2xs hover:border-[#0C2D21]/30 transition-colors"
            >
              <div>
                {/* Large Editorial Number */}
                <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0C2D21] mb-5">
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0C2D21] mb-2">
                  {step.title}
                </h3>

                {/* Tagline */}
                <p className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-3">
                  {step.tagline}
                </p>

                {/* Detail */}
                <p className="text-xs text-[#161A18]/75 leading-relaxed font-normal">
                  {step.detail}
                </p>
              </div>

              {/* Step indicator bar */}
              <div className="mt-8 pt-4 border-t border-[#0C2D21]/8 flex items-center justify-between text-[11px] font-mono font-semibold text-[#0C2D21]/50">
                <span>STAGE {index + 1}</span>
                <span className="w-2 h-2 rounded-full bg-[#0C2D21]/30" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
