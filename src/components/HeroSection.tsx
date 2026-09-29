import React from 'react';
import circleLogo from '../assets/images/w2v_circle_emblem_clean.png';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
}) => {
  return (
    <section className="relative overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center bg-[#FAF8F3]">
      
      {/* ======================================================== */}
      {/* FLOWING ORGANIC WAVY BACKGROUND (Ambient curves) */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-0">
        <svg
          viewBox="0 0 1440 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Top-Left Soft Sage Wave Gradient */}
            <linearGradient id="topLeftGradient" x1="0" y1="0" x2="300" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0" />
            </linearGradient>

            {/* Right Side Soft Ambient Green Glow */}
            <linearGradient id="rightGlowGrad" x1="1440" y1="200" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#D1FAE5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Top-Left Ambient Sage Curve */}
          <path
            d="M 0 0 L 0 380 C 140 340, 260 220, 220 120 C 190 40, 100 10, 0 0 Z"
            fill="url(#topLeftGradient)"
          />

          {/* Right Side Flowing Curve Behind Logo */}
          <path
            d="M 1440 80 C 1300 180, 1150 360, 1260 580 C 1320 680, 1380 720, 1440 740 L 1440 80 Z"
            fill="url(#rightGlowGrad)"
          />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* HERO FOREGROUND CONTENT */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex flex-row items-center justify-between gap-4 sm:gap-8 lg:gap-12">
          
          {/* LEFT SIDE: Bold Headline, Subtitle, and Pill Button */}
          <div className="flex-1 min-w-0 flex flex-col items-start text-left">
            
            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[82px] font-black tracking-tight leading-[1.04]">
              <span className="text-[#0C2D21] block">Reduce Waste.</span>
              <span className="text-[#FF6B00] block mt-1 sm:mt-2">Create Value.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-3 sm:mt-5 md:mt-6 text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#0C2D21]/90 max-w-xl leading-snug tracking-tight">
              AI-powered food recovery for institutional kitchens &amp; food processing units.
            </p>

            {/* Single CTA Button: [ GET STARTED → ] */}
            <div className="mt-6 sm:mt-8 md:mt-10">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-9 py-3 sm:py-3.5 md:py-4 rounded-full bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] text-white text-xs sm:text-sm md:text-base font-bold tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group shrink-0"
              >
                <span>GET STARTED</span>
                <span className="text-sm sm:text-base md:text-lg font-bold transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: Floating Circular Logo Emblem (ALWAYS ON THE RIGHT) */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <img
                src={circleLogo}
                alt="W2V Waste2Value Official Logo"
                style={{ height: '300px' }}
                className="h-[300px] w-auto max-w-none object-contain filter drop-shadow-[0_20px_35px_rgba(12,45,33,0.18)] select-none transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
