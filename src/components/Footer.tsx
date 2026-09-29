import React from 'react';
import { W2VLogo } from './W2VLogo';
import { Phone, Mail, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'who-are-you' | 'admin-login') => void;
  onOpenHelp: () => void;
  onOpenSubscription: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenHelp,
  onOpenSubscription,
  onOpenContact,
}) => {
  const scrollToAbout = () => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById('about-w2v');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-[#082118] text-stone-300 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-5 flex flex-col items-start">
            <W2VLogo size="lg" theme="dark" showTagline={true} />
            
            <p className="mt-4 text-xs text-stone-400 max-w-sm leading-relaxed">
              AI-Powered Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded bg-[#164634]/60 border border-[#10B981]/20 text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Smart India Hackathon 2026 Prototype</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={scrollToAbout}
                  className="hover:text-emerald-400 transition-colors focus:outline-none flex items-center gap-1"
                >
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-emerald-400 transition-colors focus:outline-none flex items-center gap-1"
                >
                  <span>Contact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenHelp}
                  className="hover:text-emerald-400 transition-colors focus:outline-none flex items-center gap-1"
                >
                  <span>Help</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSubscription}
                  className="hover:text-emerald-400 transition-colors focus:outline-none flex items-center gap-1"
                >
                  <span>Subscription</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact Information */}
          <div className="md:col-span-4" id="contact">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href="tel:6303990223"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-stone-200"
              >
                <div className="p-1.5 rounded bg-[#10B981]/20 text-[#10B981]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Phone Support</span>
                  <span className="font-mono font-semibold text-white">6303990223</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 ml-auto" />
              </a>

              <a
                href="mailto:waste2value@gmail.com"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-stone-200"
              >
                <div className="p-1.5 rounded bg-[#F97316]/20 text-[#F97316]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Email Inquiries</span>
                  <span className="font-mono font-semibold text-white">waste2value@gmail.com</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 ml-auto" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 W2V — Waste2Value. Reduce Waste. Create Value.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>SIH 2026 Innovation Prototype</span>
            <span>·</span>
            <span>Food Security & Circular Economy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
