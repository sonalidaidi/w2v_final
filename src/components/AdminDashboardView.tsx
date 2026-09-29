import React, { useState, useEffect } from 'react';
import { W2VLogo } from './W2VLogo';
import {
  StoredRegistration,
  getStoredRegistrations,
  approveRegistration,
  rejectRegistration,
} from '../services/registrationStorage';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  LogOut,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Check,
  X,
} from 'lucide-react';

interface AdminDashboardViewProps {
  adminEmail: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminEmail,
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'Pending Verifications'>('Pending Verifications');
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [selectedReviewItem, setSelectedReviewItem] = useState<StoredRegistration | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);

  // Load registrations from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = getStoredRegistrations();
    setRegistrations(list);
  };

  const pendingList = registrations.filter((r) => r.status === 'PENDING');

  const handleOpenReview = (item: StoredRegistration) => {
    setSelectedReviewItem(item);
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectionError(null);
  };

  const handleCloseReview = () => {
    setSelectedReviewItem(null);
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectionError(null);
  };

  const handleApprove = (id: string) => {
    const updated = approveRegistration(id, adminEmail);
    if (updated) {
      loadData();
      setSelectedReviewItem(updated);
      setNotificationBanner({
        type: 'success',
        message: `Approved ${updated.orgName}. Status updated to VERIFIED. User notification created.`,
      });
      setTimeout(() => {
        setNotificationBanner(null);
      }, 5000);
    }
  };

  const handleInitiateReject = () => {
    setShowRejectModal(true);
    setRejectionReason('');
    setRejectionError(null);
  };

  const handleConfirmReject = () => {
    if (!selectedReviewItem) return;
    if (!rejectionReason.trim()) {
      setRejectionError('Please enter a rejection reason.');
      return;
    }

    const updated = rejectRegistration(selectedReviewItem.id, adminEmail, rejectionReason.trim());
    if (updated) {
      loadData();
      setSelectedReviewItem(updated);
      setShowRejectModal(false);
      setNotificationBanner({
        type: 'danger',
        message: `Rejected ${updated.orgName}. Status updated to REJECTED with logged reason.`,
      });
      setTimeout(() => {
        setNotificationBanner(null);
      }, 5000);
    }
  };

  const navSections = [
    'Pending Verifications',
    'Users',
    'Organizations',
    'Receivers',
    'Listings',
    'Subscriptions',
    'Platform Impact',
    'ESG',
    'Reports',
    'Audit Logs',
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#161A18] flex flex-col justify-between selection:bg-[#0C2D21] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full bg-white border-b border-[#0C2D21]/10 py-3.5 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="focus:outline-none cursor-pointer"
              title="Return to Home"
            >
              <W2VLogo size="sm" />
            </button>
            <div className="h-6 w-px bg-stone-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold text-[#0C2D21] tracking-tight uppercase">
                ADMIN DASHBOARD
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Operator: {adminEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notificationBanner && (
        <div
          className={`w-full py-2.5 px-4 text-xs font-semibold text-center transition-all ${
            notificationBanner.type === 'success'
              ? 'bg-[#10B981] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {notificationBanner.message}
        </div>
      )}

      {/* Main Body with Sidebar Navigation */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR SECTIONS */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-[#0C2D21]/12 rounded-2xl p-4 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#161A18]/60 px-3 mb-2">
              System Modules
            </h2>
            <nav className="space-y-1">
              {navSections.map((sec) => {
                const isPendingTab = sec === 'Pending Verifications';
                const isActive = activeTab === sec;

                return (
                  <button
                    key={sec}
                    onClick={() => {
                      if (isPendingTab) {
                        setActiveTab('Pending Verifications');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-tight text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0C2D21] text-white'
                        : isPendingTab
                        ? 'text-[#0C2D21] hover:bg-[#FAF8F3]'
                        : 'text-stone-400 hover:text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{sec}</span>
                    {isPendingTab && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-[#F97316] text-white'
                            : 'bg-[#F97316]/20 text-[#EA580C]'
                        }`}
                      >
                        {pendingList.length}
                      </span>
                    )}
                    {!isPendingTab && (
                      <span className="text-[10px] text-stone-300 uppercase font-mono">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN SECTION: PAGE 8 — PENDING VERIFICATIONS */}
        <main className="flex-1">
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {/* Header of Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#0C2D21]/10 gap-4">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  Pending Verifications
                </h1>
                <p className="text-xs text-[#161A18]/70 mt-1">
                  Submitted registrations awaiting administrator compliance audit and verification.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F3] border border-[#0C2D21]/15 text-xs font-semibold text-[#0C2D21]">
                <span>Awaiting Review:</span>
                <span className="font-mono font-bold text-[#EA580C]">{pendingList.length}</span>
              </div>
            </div>

            {/* List of Registrations */}
            <div className="mt-6 space-y-4">
              {pendingList.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#0C2D21]/5 text-[#0C2D21] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0C2D21]">
                    No Pending Registrations
                  </h3>
                  <p className="text-xs text-[#161A18]/65 max-w-sm mx-auto mt-1">
                    All organization submissions have been reviewed, verified, or actioned.
                  </p>
                </div>
              ) : (
                pendingList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 hover:border-[#0C2D21]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Organization Summary Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-bold text-[#0C2D21]">
                          {item.orgName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0C2D21] text-white">
                          {item.orgType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.roleCategory === 'Provider'
                              ? 'bg-[#F97316]/20 text-[#EA580C]'
                              : 'bg-[#10B981]/20 text-[#059669]'
                          }`}
                        >
                          {item.roleCategory}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-[#161A18]/75">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Rep: <strong>{item.ownerName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{item.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{item.contactNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{item.city}, {item.state} ({item.location || item.pinCode})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString()
                              : 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            Proof: {item.proofFileName || 'Document Attached'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-stone-500">Status:</span>
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider bg-[#F97316]/20 text-[#EA580C]">
                          PENDING
                        </span>
                      </div>
                    </div>

                    {/* Action Button: [ REVIEW ] */}
                    <div className="shrink-0 flex items-center">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="w-full md:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>REVIEW</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      {/* REVIEW MODAL: Displays Complete Submitted Registration Info & Proof */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-[#0C2D21]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-[#0C2D21]/20 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-[#0C2D21]/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0C2D21] text-white">
                    {selectedReviewItem.orgType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedReviewItem.roleCategory === 'Provider'
                        ? 'bg-[#F97316]/20 text-[#EA580C]'
                        : 'bg-[#10B981]/20 text-[#059669]'
                    }`}
                  >
                    {selectedReviewItem.roleCategory}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider ${
                      selectedReviewItem.status === 'VERIFIED'
                        ? 'bg-[#10B981]/20 text-[#059669]'
                        : selectedReviewItem.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#F97316]/20 text-[#EA580C]'
                    }`}
                  >
                    STATUS: {selectedReviewItem.status}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-extrabold text-[#0C2D21]">
                  {selectedReviewItem.orgName}
                </h2>
              </div>

              <button
                onClick={handleCloseReview}
                className="p-2 rounded-xl text-stone-400 hover:text-[#0C2D21] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complete Submitted Registration Information */}
            <div className="py-6 space-y-6 text-xs text-[#161A18]">
              
              {/* Grid of Standard Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F3] p-5 rounded-2xl border border-[#0C2D21]/10">
                <div>
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Owner / Authorized Representative
                  </span>
                  <span className="font-bold text-sm text-[#0C2D21] mt-0.5 block">
                    {selectedReviewItem.ownerName}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Contact Number
                  </span>
                  <span className="font-bold text-sm text-[#0C2D21] mt-0.5 block">
                    {selectedReviewItem.contactNumber}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Email Address
                  </span>
                  <span className="font-semibold text-sm text-[#0C2D21] mt-0.5 block">
                    {selectedReviewItem.email}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Govt Registration / Identification Number
                  </span>
                  <span className="font-mono font-bold text-sm text-[#0C2D21] mt-0.5 block">
                    {selectedReviewItem.govRegNumber}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Physical Address
                  </span>
                  <span className="font-medium text-xs text-[#161A18] mt-0.5 block">
                    {selectedReviewItem.address}, {selectedReviewItem.city}, {selectedReviewItem.state} — PIN {selectedReviewItem.pinCode}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Location Coordinates / Landmark
                  </span>
                  <span className="font-medium text-xs text-[#161A18] mt-0.5 block">
                    {selectedReviewItem.location}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                    Submission Timestamp
                  </span>
                  <span className="text-xs text-stone-600 mt-0.5 block font-mono">
                    {selectedReviewItem.submittedAt
                      ? new Date(selectedReviewItem.submittedAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Conditional FPU Details */}
              {selectedReviewItem.orgType === 'FOOD PROCESSING UNIT' && (
                <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-2xl space-y-3">
                  <h4 className="font-display font-bold text-[#0C2D21] text-xs uppercase tracking-wider">
                    FPU Specific Attributes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">
                        FPU Type
                      </span>
                      <span className="font-semibold text-xs text-[#0C2D21]">
                        {selectedReviewItem.fpuType || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">
                        Product Category
                      </span>
                      <span className="font-semibold text-xs text-[#0C2D21]">
                        {selectedReviewItem.productCategory || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Secondary Buyer Details */}
              {selectedReviewItem.orgType === 'SECONDARY BUYER / INDUSTRY' && (
                <div className="bg-teal-50/50 border border-teal-200/80 p-5 rounded-2xl space-y-3">
                  <h4 className="font-display font-bold text-[#0C2D21] text-xs uppercase tracking-wider">
                    Secondary Buyer & Industrial Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">
                        Industry Type
                      </span>
                      <span className="font-semibold text-xs text-[#0C2D21]">
                        {selectedReviewItem.industryType || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">
                        Material / Resource Required
                      </span>
                      <span className="font-semibold text-xs text-[#0C2D21]">
                        {selectedReviewItem.materialRequired || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Proof Section */}
              <div className="p-5 rounded-2xl border border-[#0C2D21]/15 bg-white space-y-2">
                <span className="text-stone-500 uppercase tracking-wider block text-[10px] font-bold">
                  Uploaded Government / Organization Proof Document
                </span>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/10">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#F97316]" />
                    <div>
                      <span className="font-bold text-xs text-[#0C2D21] block">
                        {selectedReviewItem.proofFileName || 'Proof_Document_Verified.pdf'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Official verification attachment
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-[#0C2D21]/5 text-[#0C2D21] font-mono text-[10px] font-bold uppercase">
                    Document Attached
                  </span>
                </div>
              </div>

              {/* Rejection / Approval History if already actioned */}
              {selectedReviewItem.status === 'VERIFIED' && (
                <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#0C2D21]">
                  <p className="font-bold text-[#059669] flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Registration Verified
                  </p>
                  <p>Reviewed By: {selectedReviewItem.reviewedBy || adminEmail}</p>
                  <p>Timestamp: {new Date(selectedReviewItem.reviewedAt || Date.now()).toLocaleString()}</p>
                  <p className="mt-1 italic text-stone-600">"{selectedReviewItem.notification}"</p>
                </div>
              )}

              {selectedReviewItem.status === 'REJECTED' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                  <p className="font-bold text-red-700 flex items-center gap-1.5 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Registration Rejected
                  </p>
                  <p>Reason: <strong className="text-red-950">{selectedReviewItem.rejectionReason}</strong></p>
                  <p>Reviewed By: {selectedReviewItem.reviewedBy || adminEmail}</p>
                  <p>Timestamp: {new Date(selectedReviewItem.reviewedAt || Date.now()).toLocaleString()}</p>
                  <p className="mt-1 italic text-stone-600">"{selectedReviewItem.notification}"</p>
                </div>
              )}

              {/* REJECTION REASON INPUT FORM (when REJECT button is clicked) */}
              {showRejectModal && selectedReviewItem.status === 'PENDING' && (
                <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 animate-in fade-in space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Rejection Reason</span>
                  </div>
                  <p className="text-xs text-stone-700">
                    Specify the discrepancy or compliance reason for declining this organization's onboarding:
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Invalid FSSAI certificate number / Mismatched premise proof / Incomplete registration identity."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white border border-red-200 text-xs text-[#161A18] focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-stone-400"
                  />
                  {rejectionError && (
                    <p className="text-xs text-red-600 font-medium">{rejectionError}</p>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                    >
                      CONFIRM REJECTION
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions: [ APPROVE ] and [ REJECT ] */}
            {selectedReviewItem.status === 'PENDING' && !showRejectModal && (
              <div className="pt-5 border-t border-[#0C2D21]/10 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleInitiateReject}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>REJECT</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedReviewItem.id)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>APPROVE</span>
                </button>
              </div>
            )}

            {selectedReviewItem.status !== 'PENDING' && (
              <div className="pt-5 border-t border-[#0C2D21]/10 flex items-center justify-end">
                <button
                  onClick={handleCloseReview}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-[#FAF8F3] hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-[#0C2D21]/8 text-center text-xs text-[#161A18]/60 bg-white">
        W2V — Waste2Value · Administrator Control Panel
      </footer>
    </div>
  );
};
