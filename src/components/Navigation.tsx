import React, { useState } from 'react';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { AppView } from '../App';

interface NavigationProps {
  onNavigate: (view: AppView) => void;
  onOpenHelp: () => void;
  onOpenSubscription: () => void;
  onOpenContact: () => void;
  currentView: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  onNavigate,
  onOpenHelp,
  onOpenSubscription,
  onOpenContact,
  currentView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#0C2D21]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: EXACT Waste2Value Wordmark (matching mockup) */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="focus:outline-none text-left cursor-pointer transition-transform hover:opacity-95"
              aria-label="Waste2Value Home"
            >
              <span className="font-display text-2xl sm:text-[28px] font-black tracking-tight text-[#0C2D21]">
                Waste<span className="text-[#FF6B00]">2</span>Value
              </span>
            </button>
          </div>

          {/* Right: MAP ANALYTICS, ABOUT US, CONTACT US, HELP, SUBSCRIPTION, and [ 👤 ADMIN ∨ ] */}
          <div className="hidden md:flex items-center gap-7 lg:gap-8">
            <nav className="flex items-center gap-6 lg:gap-7" aria-label="Main Navigation">
              <button
                onClick={() => onNavigate('map-analytics')}
                className="text-xs uppercase tracking-wider font-bold text-[#161A18]/80 hover:text-[#0C2D21] transition-colors focus:outline-none cursor-pointer"
              >
                MAP ANALYTICS
              </button>
              <button
                onClick={() => handleNavClick('about-w2v')}
                className="text-xs uppercase tracking-wider font-bold text-[#161A18]/80 hover:text-[#0C2D21] transition-colors focus:outline-none cursor-pointer"
              >
                ABOUT US
              </button>
              <button
                onClick={() => handleNavClick('contact-w2v')}
                className="text-xs uppercase tracking-wider font-bold text-[#161A18]/80 hover:text-[#0C2D21] transition-colors focus:outline-none cursor-pointer"
              >
                CONTACT US
              </button>
              <button
                onClick={onOpenHelp}
                className="text-xs uppercase tracking-wider font-bold text-[#161A18]/80 hover:text-[#0C2D21] transition-colors focus:outline-none cursor-pointer"
              >
                HELP
              </button>
              <button
                onClick={onOpenSubscription}
                className="text-xs uppercase tracking-wider font-bold text-[#161A18]/80 hover:text-[#0C2D21] transition-colors focus:outline-none cursor-pointer"
              >
                SUBSCRIPTION
              </button>
            </nav>

            {/* Distinct Dark Forest Green Pill-Shaped Button: [ 👤 ADMIN ∨ ] */}
            <button
              onClick={() => onNavigate('admin-login')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] rounded-full shadow-xs hover:shadow-md transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <User className="w-3.5 h-3.5 fill-current" />
              <span>ADMIN</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2.5">
            <button
              onClick={() => onNavigate('admin-login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase text-white bg-[#0C2D21] hover:bg-[#144432] rounded-full shadow-xs"
            >
              <User className="w-3 h-3 fill-current" />
              <span>ADMIN</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#0C2D21]/10 bg-[#FAF8F3] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('map-analytics');
            }}
            className="block w-full text-left py-2 px-3 text-xs font-bold tracking-wide uppercase text-[#059669] hover:bg-[#0C2D21]/5 rounded-md"
          >
            MAP ANALYTICS / ROUTE OPTIMIZATION
          </button>
          <button
            onClick={() => handleNavClick('about-w2v')}
            className="block w-full text-left py-2 px-3 text-xs font-bold tracking-wide uppercase text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-md"
          >
            ABOUT US
          </button>
          <button
            onClick={() => handleNavClick('contact-w2v')}
            className="block w-full text-left py-2 px-3 text-xs font-bold tracking-wide uppercase text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-md"
          >
            CONTACT US
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenHelp();
            }}
            className="block w-full text-left py-2 px-3 text-xs font-bold tracking-wide uppercase text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-md"
          >
            HELP
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSubscription();
            }}
            className="block w-full text-left py-2 px-3 text-xs font-bold tracking-wide uppercase text-[#0C2D21] hover:bg-[#0C2D21]/5 rounded-md"
          >
            SUBSCRIPTION
          </button>
          <div className="pt-2 border-t border-[#0C2D21]/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('who-are-you');
              }}
              className="w-full py-3 px-4 bg-[#F97316] text-white rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-[#EA580C]"
            >
              GET STARTED
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
