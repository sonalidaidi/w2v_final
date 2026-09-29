import React from 'react';
import { StoredRegistration } from '../../services/registrationStorage';
import {
  Building2,
  X,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Award,
  Layers,
  FileText,
} from 'lucide-react';

interface FPUProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StoredRegistration;
  impactMetrics: {
    totalRescuedKg: number;
    deliveriesCount: number;
  };
}

export const FPUProfileModal: React.FC<FPUProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  impactMetrics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white border border-[#0C2D21]/20 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#0C2D21]/10 flex items-center justify-between bg-[#FAF8F3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0C2D21] text-white flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#059669] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Food Processing Unit</span>
              </div>
              <h3 className="font-display text-lg font-extrabold text-[#0C2D21]">
                FPU ORGANIZATION PROFILE
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Main Entity Card */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">FPU Organization</span>
                <h4 className="font-display text-base font-extrabold text-[#0C2D21]">{user.orgName}</h4>
                <span className="text-stone-500 text-[11px] block mt-0.5">{user.fpuType || 'Industrial Packaged Food Processor'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                {user.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Authorized Representative</span>
                <span className="font-bold text-[#0C2D21] block mt-0.5">{user.ownerName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Government Reg / FSSAI License</span>
                <span className="font-mono font-bold text-[#0C2D21] block mt-0.5">{user.govRegNumber}</span>
              </div>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
              FACILITY LOCATION & COORDINATION COORDINATES:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                <span className="text-stone-400 text-[10px] font-bold block">Facility Address</span>
                <div className="flex items-start gap-1.5 text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{user.address}, {user.city}, {user.state} — {user.pinCode}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                <span className="text-stone-400 text-[10px] font-bold block">Direct Contact</span>
                <div className="flex items-center gap-1.5 text-stone-800 font-mono font-bold">
                  <Phone className="w-3.5 h-3.5 text-[#0C2D21] shrink-0" />
                  <span>{user.contactNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Impact Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Subscription Tier</span>
              <div className="font-bold text-sm text-[#0C2D21] mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Active · FPU Industrial Tier</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/10">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Recovery Circularity</span>
              <div className="font-bold text-sm text-[#059669] mt-1 font-mono">
                {impactMetrics.totalRescuedKg} kg recovered
              </div>
            </div>
          </div>

          {/* Data Privacy Notice per Section 18 */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 leading-relaxed italic">
            * Data Privacy Guarantee: Facility phone numbers, batch schedules, and private commercial coordinates are strictly protected and never disclosed to other organizations prior to mutual offer acceptance.
          </div>

        </div>

      </div>
    </div>
  );
};
