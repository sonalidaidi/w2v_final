import React, { useState } from 'react';
import { W2VLogo } from './W2VLogo';
import { CheckCircle2, Upload, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';

export interface RegistrationFormData {
  orgType: string;
  orgName: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  location: string;
  govRegNumber: string;
  proofFileName?: string;
  fpuType?: string;
  productCategory?: string;
  industryType?: string;
  materialRequired?: string;
  status: 'PENDING';
  submittedAt: string;
}

interface RegistrationPageProps {
  selectedOrgType: string;
  onBack: () => void;
  onContinueAfterSubmission: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  selectedOrgType,
  onBack,
  onContinueAfterSubmission,
}) => {
  const [formData, setFormData] = useState({
    orgName: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    location: '',
    govRegNumber: '',
    proofFileName: '',
    // Conditional fields:
    fpuType: '',
    productCategory: '',
    industryType: '',
    materialRequired: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFPU = selectedOrgType === 'FOOD PROCESSING UNIT';
  const isSecondaryBuyer = selectedOrgType === 'SECONDARY BUYER / INDUSTRY';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, proofFileName: file.name }));
      if (errors.proofFileName) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.proofFileName;
          return updated;
        });
      }
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.orgName.trim()) errs.orgName = 'Organization / Institution Name is required';
    if (!formData.ownerName.trim()) errs.ownerName = 'Owner / Authorized Representative is required';
    
    if (!formData.contactNumber.trim()) {
      errs.contactNumber = 'Contact Number is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.contactNumber.trim())) {
      errs.contactNumber = 'Please enter a valid contact number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';
    if (!formData.pinCode.trim()) errs.pinCode = 'PIN Code is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.govRegNumber.trim()) errs.govRegNumber = 'Government Registration / Identification Number is required';

    if (!formData.proofFileName) {
      errs.proofFileName = 'Please upload Government / Organization Proof';
    }

    if (isFPU) {
      if (!formData.fpuType) errs.fpuType = 'FPU Type is required';
      if (!formData.productCategory) errs.productCategory = 'Product Category is required';
    }

    if (isSecondaryBuyer) {
      if (!formData.industryType) errs.industryType = 'Industry Type is required';
      if (!formData.materialRequired.trim()) errs.materialRequired = 'Material / Resource Required is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare registration payload with PENDING verification status
    const record: RegistrationFormData & { id: string; roleCategory: 'Provider' | 'Receiver' } = {
      id: `w2v-reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orgType: selectedOrgType,
      roleCategory:
        selectedOrgType === 'INSTITUTIONAL KITCHEN' || selectedOrgType === 'FOOD PROCESSING UNIT'
          ? 'Provider'
          : 'Receiver',
      orgName: formData.orgName,
      ownerName: formData.ownerName,
      contactNumber: formData.contactNumber,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
      location: formData.location,
      govRegNumber: formData.govRegNumber,
      proofFileName: formData.proofFileName,
      fpuType: isFPU ? formData.fpuType : undefined,
      productCategory: isFPU ? formData.productCategory : undefined,
      industryType: isSecondaryBuyer ? formData.industryType : undefined,
      materialRequired: isSecondaryBuyer ? formData.materialRequired : undefined,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    // Store in localStorage for persistence
    try {
      const existing = JSON.parse(localStorage.getItem('w2v_registered_organizations') || '[]');
      existing.push(record);
      localStorage.setItem('w2v_registered_organizations', JSON.stringify(existing));
      // Also keep legacy sync
      localStorage.setItem('w2v_pending_registrations', JSON.stringify(existing));
    } catch {
      // In case of any storage limits, safely fallback
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SUCCESS SUBMISSION SCREEN
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
        {/* Top Header */}
        <header className="w-full bg-white border-b border-[#0C2D21]/10 py-4 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <W2VLogo size="sm" />
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#0C2D21]/5 text-[#0C2D21]">
              REGISTRATION
            </span>
          </div>
        </header>

        {/* Success Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl bg-white border border-[#0C2D21]/15 rounded-3xl p-8 sm:p-12 shadow-xl text-center">
            
            <div className="w-16 h-16 bg-[#10B981]/15 text-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-[#F97316]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-3">
              Status: PENDING VERIFICATION
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight uppercase mb-4">
              REGISTRATION SUBMITTED
            </h1>

            <div className="space-y-3 text-sm text-[#161A18]/80 leading-relaxed max-w-md mx-auto mb-8">
              <p className="font-medium text-[#161A18]">
                Your registration has been submitted successfully.
              </p>
              <p>
                Your account is currently pending administrator verification.
              </p>
              <p className="text-xs text-[#161A18]/65 bg-[#FAF8F3] p-3 rounded-xl border border-[#0C2D21]/10">
                Organization: <strong className="text-[#0C2D21]">{formData.orgName}</strong>
                <br />
                Type: <strong className="text-[#0C2D21]">{selectedOrgType}</strong>
              </p>
            </div>

            <button
              onClick={onContinueAfterSubmission}
              className="w-full sm:w-auto px-10 py-4 rounded-xl text-sm font-bold tracking-wider uppercase text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md transition-all cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        </main>

        <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
          W2V — Waste2Value
        </footer>
      </div>
    );
  }

  // ACTIVE REGISTRATION FORM
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-4 px-4 sm:px-8 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:text-[#F97316] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <W2VLogo size="sm" />

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#0C2D21]/5 text-[#0C2D21] border border-[#0C2D21]/10">
              PAGE 4
            </span>
          </div>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Top Header Text */}
        <div className="text-center mb-10">
          <div className="font-display font-black text-2xl sm:text-3xl text-[#0C2D21] tracking-tight">
            W2V
          </div>
          <div className="font-display text-sm font-semibold text-[#166534] tracking-tight mb-4">
            Waste2Value
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0C2D21] tracking-tight uppercase">
            CREATE YOUR ACCOUNT
          </h1>

          {/* Dynamically displayed selected organization type */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C2D21] text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-xs">
            <Building2 className="w-4 h-4 text-[#F97316]" />
            <span>{selectedOrgType}</span>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-10 shadow-lg">
          
          {/* SECTION: COMMON REGISTRATION FIELDS */}
          <div className="space-y-6">
            <div className="border-b border-[#0C2D21]/10 pb-3">
              <h2 className="font-display text-base font-bold text-[#0C2D21] uppercase tracking-wider">
                Organization Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Organization / Institution Name */}
              <div id="orgName" className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Organization / Institution Name <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Hospitality Group / GreenHarvest Processing"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.orgName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.orgName && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.orgName}</span>
                  </p>
                )}
              </div>

              {/* Owner / Authorized Representative */}
              <div id="ownerName">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Owner / Authorized Representative <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Full name of representative"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.ownerName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.ownerName && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.ownerName}</span>
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div id="contactNumber">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Contact Number <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.contactNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.contactNumber}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div id="email" className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Email Address <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@organization.org"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div id="password">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Password <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div id="confirmPassword">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Confirm Password <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Address */}
              <div id="address" className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Address <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Plot/Premise No., Street, Industrial Area / Facility Campus"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* City */}
              <div id="city">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  City <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              {/* State */}
              <div id="state">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  State <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State / Region"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.state}</span>
                  </p>
                )}
              </div>

              {/* PIN Code */}
              <div id="pinCode">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  PIN Code <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="number"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.pinCode ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.pinCode && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.pinCode}</span>
                  </p>
                )}
              </div>

              {/* Location (location input / map location selector) */}
              <div id="location">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Location (GPS / Landmark Selector) <span className="text-[#F97316]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. 28.6139° N, 77.2090° E or Landmark"
                    className={`flex-1 px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                      errors.location ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                    } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormData((prev) => ({
                              ...prev,
                              location: `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
                            }));
                          },
                          () => {
                            setFormData((prev) => ({
                              ...prev,
                              location: 'Geo Coordinates Detected (Manual Override Available)',
                            }));
                          }
                        );
                      }
                    }}
                    className="px-3.5 py-3 rounded-xl bg-[#0C2D21]/8 hover:bg-[#0C2D21]/15 text-[#0C2D21] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    Detect
                  </button>
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.location}</span>
                  </p>
                )}
              </div>

              {/* Government Registration / Identification Number */}
              <div id="govRegNumber" className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Government Registration / Identification Number <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  name="govRegNumber"
                  value={formData.govRegNumber}
                  onChange={handleChange}
                  placeholder="FSSAI License / NGO Darpan ID / CIN / Registration Certificate No."
                  className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                    errors.govRegNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                  } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                />
                {errors.govRegNumber && (
                  <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.govRegNumber}</span>
                  </p>
                )}
              </div>

              {/* Upload Government / Organization Proof */}
              <div id="proofFileName" className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                  Upload Government / Organization Proof <span className="text-[#F97316]">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                    errors.proofFileName
                      ? 'border-red-400 bg-red-50/50'
                      : formData.proofFileName
                      ? 'border-[#10B981] bg-[#10B981]/5'
                      : 'border-[#0C2D21]/20 hover:border-[#0C2D21]/40 bg-[#FAF8F3]'
                  }`}
                >
                  <input
                    type="file"
                    id="govProofFile"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <label htmlFor="govProofFile" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0C2D21] mb-3">
                      <Upload className="w-6 h-6 text-[#F97316]" />
                    </div>
                    {formData.proofFileName ? (
                      <div>
                        <p className="text-sm font-bold text-[#0C2D21]">
                          {formData.proofFileName}
                        </p>
                        <p className="text-xs text-[#10B981] font-semibold mt-1">
                          File uploaded successfully. Click to replace.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-[#0C2D21]">
                          Click to browse and upload proof document
                        </p>
                        <p className="text-xs text-stone-500 mt-1">
                          Supported formats: PDF, PNG, JPG, JPEG (Max 15MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.proofFileName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.proofFileName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION: CONDITIONAL FIELDS */}
          {isFPU && (
            <div className="mt-8 pt-6 border-t border-[#0C2D21]/10 space-y-6">
              <div className="border-b border-[#0C2D21]/10 pb-3">
                <h2 className="font-display text-base font-bold text-[#0C2D21] uppercase tracking-wider">
                  Food Processing Unit Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* FPU Type */}
                <div id="fpuType">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                    FPU Type <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    name="fpuType"
                    value={formData.fpuType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                      errors.fpuType ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                    } text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                  >
                    <option value="">Select FPU Type</option>
                    <option value="Primary Agricultural Processing">Primary Agricultural Processing</option>
                    <option value="Dairy & Milk Processing Plant">Dairy & Milk Processing Plant</option>
                    <option value="Grain, Flour & Cereal Milling">Grain, Flour & Cereal Milling</option>
                    <option value="Fruit & Vegetable Canning / Pulping">Fruit & Vegetable Canning / Pulping</option>
                    <option value="Bakery, Confectionery & Snack Unit">Bakery, Confectionery & Snack Unit</option>
                    <option value="Beverage & Bottling Unit">Beverage & Bottling Unit</option>
                    <option value="Edible Oil Refinery / Packaging">Edible Oil Refinery / Packaging</option>
                    <option value="Ready-to-Eat (RTE) / Ready-to-Cook (RTC)">Ready-to-Eat (RTE) / Ready-to-Cook (RTC)</option>
                    <option value="Other Commercial Food Processing">Other Commercial Food Processing</option>
                  </select>
                  {errors.fpuType && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.fpuType}</span>
                    </p>
                  )}
                </div>

                {/* Product Category */}
                <div id="productCategory">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                    Product Category <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    name="productCategory"
                    value={formData.productCategory}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                      errors.productCategory ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                    } text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                  >
                    <option value="">Select Product Category</option>
                    <option value="Fresh Produce / Perishables">Fresh Produce / Perishables</option>
                    <option value="Grains, Pulses & Legumes">Grains, Pulses & Legumes</option>
                    <option value="Processed Liquids & Juices">Processed Liquids & Juices</option>
                    <option value="Dairy & Fermented Foods">Dairy & Fermented Foods</option>
                    <option value="Packaged Ambient Goods">Packaged Ambient Goods</option>
                    <option value="Baking Flours & Starches">Baking Flours & Starches</option>
                    <option value="Frozen Food Products">Frozen Food Products</option>
                    <option value="Oils, Fats & By-products">Oils, Fats & By-products</option>
                  </select>
                  {errors.productCategory && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.productCategory}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isSecondaryBuyer && (
            <div className="mt-8 pt-6 border-t border-[#0C2D21]/10 space-y-6">
              <div className="border-b border-[#0C2D21]/10 pb-3">
                <h2 className="font-display text-base font-bold text-[#0C2D21] uppercase tracking-wider">
                  Secondary Buyer & Industry Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Industry Type */}
                <div id="industryType">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                    Industry Type <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                      errors.industryType ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                    } text-sm text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                  >
                    <option value="">Select Industry Type</option>
                    <option value="Commercial Composting & Soil Enrichment">Commercial Composting & Soil Enrichment</option>
                    <option value="Biogas & Renewable Bioenergy Generation">Biogas & Renewable Bioenergy Generation</option>
                    <option value="Animal Feed & Livestock Nutrition">Animal Feed & Livestock Nutrition</option>
                    <option value="Organic Fertilizer Production">Organic Fertilizer Production</option>
                    <option value="Industrial Alcohol / Fermentation">Industrial Alcohol / Fermentation</option>
                    <option value="Upcycled Food Ingredient Manufacturing">Upcycled Food Ingredient Manufacturing</option>
                    <option value="Bio-Plastics & Biomaterial Formulation">Bio-Plastics & Biomaterial Formulation</option>
                  </select>
                  {errors.industryType && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.industryType}</span>
                    </p>
                  )}
                </div>

                {/* Material / Resource Required */}
                <div id="materialRequired">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                    Material / Resource Required <span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    type="text"
                    name="materialRequired"
                    value={formData.materialRequired}
                    onChange={handleChange}
                    placeholder="e.g. Spent grain, organic fruit peels, cooked meal scraps, whey"
                    className={`w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border ${
                      errors.materialRequired ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0C2D21]/15'
                    } text-sm text-[#0C2D21] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0C2D21]`}
                  />
                  {errors.materialRequired && (
                    <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.materialRequired}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION NOTICE BOX */}
          <div className="mt-8 p-5 rounded-2xl bg-[#0C2D21]/5 border border-[#0C2D21]/15">
            <p className="text-xs sm:text-sm text-[#0C2D21] font-semibold leading-relaxed">
              Your registration will be reviewed by the W2V administrator before your account is verified.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xs text-[#161A18]/70 font-medium">Registration Status:</span>
              <span className="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs uppercase tracking-wider bg-[#F97316]/20 text-[#EA580C]">
                PENDING VERIFICATION
              </span>
            </div>
          </div>

          {/* BUTTONS: [ CREATE ACCOUNT ] and [ BACK ] */}
          <div className="mt-8 pt-6 border-t border-[#0C2D21]/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white border border-[#0C2D21]/20 hover:bg-[#0C2D21]/5 transition-colors cursor-pointer"
            >
              BACK
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              CREATE ACCOUNT
            </button>
          </div>

        </form>

      </main>

      {/* Simple Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value
      </footer>
    </div>
  );
};
