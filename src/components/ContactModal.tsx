import React, { useState } from 'react';
import { X, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#0C2D21]/15 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#0C2D21]/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F97316]">
              Direct Assistance
            </span>
            <h3 className="font-display text-2xl font-bold text-[#0C2D21]">
              Contact W2V Team
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

        {/* Direct Phone & Email Badges */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:6303990223"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#0C2D21]/10 hover:border-[#10B981] transition-colors"
          >
            <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#059669]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#121714]/60 block font-semibold">Phone</span>
              <span className="text-xs font-mono font-bold text-[#0C2D21]">6303990223</span>
            </div>
          </a>

          <a
            href="mailto:waste2value@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#0C2D21]/10 hover:border-[#F97316] transition-colors"
          >
            <div className="p-2 rounded-lg bg-[#F97316]/15 text-[#F97316]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#121714]/60 block font-semibold">Email</span>
              <span className="text-xs font-mono font-bold text-[#0C2D21]">waste2value@gmail.com</span>
            </div>
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1">
              Your Name / Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rajesh / Kitchen Supervisor"
              className="w-full px-3 py-2 rounded-lg border border-[#0C2D21]/15 bg-white text-xs text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1">
              Institution / Kitchen / FPU Name
            </label>
            <input
              type="text"
              required
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. University Dining Hall / Agro-Processing Ltd."
              className="w-full px-3 py-2 rounded-lg border border-[#0C2D21]/15 bg-white text-xs text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1">
              Brief Inquiry
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Inquiry about pilot testing, AI surplus scanning, or institutional integration..."
              className="w-full px-3 py-2 rounded-lg border border-[#0C2D21]/15 bg-white text-xs text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
            />
          </div>

          {submitted ? (
            <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center gap-2 text-xs text-[#065F46] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Thank you! Your message has been routed to the W2V coordination desk.</span>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0C2D21] hover:bg-[#164634] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>SEND INQUIRY</span>
              <Send className="w-3.5 h-3.5 text-[#F97316]" />
            </button>
          )}
        </form>

      </div>
    </div>
  );
};
