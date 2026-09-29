import React, { useState, useEffect } from 'react';
import {
  RecoveryListing,
  getRecoveryListings,
  updateRecoveryListingStatus,
} from '../services/recoveryHubStorage';
import {
  Boxes,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Phone,
  MapPin,
  Building,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  RefreshCw,
  Navigation,
} from 'lucide-react';

interface RecoveryHubViewProps {
  onOpenResourceRecovery: () => void;
  onOpenMapAnalytics?: (listing?: RecoveryListing) => void;
  activeFilter?: 'ALL' | 'ACTIVE' | 'PENDING' | 'ACCEPTED' | 'COMPLETED';
}

export const RecoveryHubView: React.FC<RecoveryHubViewProps> = ({
  onOpenResourceRecovery,
  onOpenMapAnalytics,
  activeFilter: initialFilter = 'ALL',
}) => {
  const [listings, setListings] = useState<RecoveryListing[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'>(initialFilter);
  const [selectedListing, setSelectedListing] = useState<RecoveryListing | null>(null);

  const loadData = () => {
    const data = getRecoveryListings();
    setListings(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: RecoveryListing['status']) => {
    updateRecoveryListingStatus(id, newStatus);
    loadData();
    if (selectedListing && selectedListing.id === id) {
      setSelectedListing({ ...selectedListing, status: newStatus });
    }
  };

  // Group listings
  const activeListings = listings.filter((l) => l.status === 'LISTED' || l.status === 'MATCHED');
  const pendingRequests = listings.filter((l) => l.status === 'OFFER_SENT');
  const acceptedRecoveries = listings.filter(
    (l) => l.status === 'ACCEPTED' || l.status === 'PICKUP_INITIATED' || l.status === 'PICKED_UP'
  );
  const completedRecoveries = listings.filter((l) => l.status === 'COMPLETED');

  // Filtered view
  const displayedListings = listings.filter((l) => {
    if (filter === 'ACTIVE') return l.status === 'LISTED' || l.status === 'MATCHED';
    if (filter === 'PENDING') return l.status === 'OFFER_SENT';
    if (filter === 'ACCEPTED')
      return l.status === 'ACCEPTED' || l.status === 'PICKUP_INITIATED' || l.status === 'PICKED_UP';
    if (filter === 'COMPLETED') return l.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Boxes className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Waste Segregation & Recovery Hub</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              RECOVERY HUB
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Track and manage all recoverable kitchen byproducts, verified buyer matches, dispatch progress, and closed loop value transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenResourceRecovery}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] active:bg-[#071C14] transition-all cursor-pointer shadow-md shrink-0"
          >
            <span>+ NEW RESOURCE RECOVERY</span>
          </button>
        </div>

        {/* 4 Summary Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              filter === 'ACTIVE'
                ? 'bg-[#0C2D21] text-white border-[#0C2D21]'
                : 'bg-[#FAF8F3] border-[#0C2D21]/10 hover:border-[#0C2D21]/30'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${filter === 'ACTIVE' ? 'text-stone-300' : 'text-stone-500'}`}>
              Active Recovery Listings
            </span>
            <div className={`font-mono text-2xl font-black mt-1 ${filter === 'ACTIVE' ? 'text-white' : 'text-[#0C2D21]'}`}>
              {activeListings.length}
            </div>
            <span className={`text-[10px] mt-0.5 block ${filter === 'ACTIVE' ? 'text-stone-300' : 'text-stone-500'}`}>
              Ready for matching
            </span>
          </button>

          <button
            onClick={() => setFilter('PENDING')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              filter === 'PENDING'
                ? 'bg-[#0C2D21] text-white border-[#0C2D21]'
                : 'bg-[#FAF8F3] border-[#0C2D21]/10 hover:border-[#0C2D21]/30'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${filter === 'PENDING' ? 'text-stone-300' : 'text-stone-500'}`}>
              Pending Requests
            </span>
            <div className={`font-mono text-2xl font-black mt-1 ${filter === 'PENDING' ? 'text-white' : 'text-amber-700'}`}>
              {pendingRequests.length}
            </div>
            <span className={`text-[10px] mt-0.5 block ${filter === 'PENDING' ? 'text-stone-300' : 'text-stone-500'}`}>
              Awaiting buyer review
            </span>
          </button>

          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              filter === 'ACCEPTED'
                ? 'bg-[#0C2D21] text-white border-[#0C2D21]'
                : 'bg-[#FAF8F3] border-[#0C2D21]/10 hover:border-[#0C2D21]/30'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${filter === 'ACCEPTED' ? 'text-stone-300' : 'text-stone-500'}`}>
              Accepted Recoveries
            </span>
            <div className={`font-mono text-2xl font-black mt-1 ${filter === 'ACCEPTED' ? 'text-white' : 'text-[#059669]'}`}>
              {acceptedRecoveries.length}
            </div>
            <span className={`text-[10px] mt-0.5 block ${filter === 'ACCEPTED' ? 'text-stone-300' : 'text-stone-500'}`}>
              Contacts released & transit
            </span>
          </button>

          <button
            onClick={() => setFilter('COMPLETED')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-[#0C2D21] text-white border-[#0C2D21]'
                : 'bg-[#FAF8F3] border-[#0C2D21]/10 hover:border-[#0C2D21]/30'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${filter === 'COMPLETED' ? 'text-stone-300' : 'text-stone-500'}`}>
              Completed Recoveries
            </span>
            <div className={`font-mono text-2xl font-black mt-1 ${filter === 'COMPLETED' ? 'text-white' : 'text-[#0C2D21]'}`}>
              {completedRecoveries.length}
            </div>
            <span className={`text-[10px] mt-0.5 block ${filter === 'COMPLETED' ? 'text-stone-300' : 'text-stone-500'}`}>
              Successfully delivered
            </span>
          </button>

        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between pt-6 border-t border-[#0C2D21]/10 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'ACTIVE', 'PENDING', 'ACCEPTED', 'COMPLETED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === t
                    ? 'bg-[#0C2D21] text-white'
                    : 'bg-[#FAF8F3] text-stone-600 hover:text-[#0C2D21]'
                }`}
              >
                {t} ({t === 'ALL' ? listings.length : t === 'ACTIVE' ? activeListings.length : t === 'PENDING' ? pendingRequests.length : t === 'ACCEPTED' ? acceptedRecoveries.length : completedRecoveries.length})
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="text-xs text-stone-500 hover:text-[#0C2D21] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Listings Records Grid */}
      <div className="space-y-4">
        {displayedListings.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#0C2D21]/10 rounded-3xl text-stone-500 text-xs">
            No recovery listings found under this filter. Click "+ NEW RESOURCE RECOVERY" to analyze and list kitchen byproducts.
          </div>
        ) : (
          displayedListings.map((item) => {
            const hasMatched = !!item.matchedEntity;
            const isAccepted = item.status === 'ACCEPTED' || item.status === 'PICKUP_INITIATED' || item.status === 'PICKED_UP' || item.status === 'DELIVERED' || item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-[#0C2D21]/15 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0C2D21]/5 text-[#0C2D21]">
                        {item.type === 'RESOURCE_BYPRODUCT' ? 'Resource Byproduct' : 'Food Surplus'}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-[#0C2D21]">
                      {item.title} — {item.estimatedQuantity} {item.quantityUnit}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'ACCEPTED' || item.status === 'PICKUP_INITIATED' || item.status === 'PICKED_UP' || item.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'OFFER_SENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">Detected Material</span>
                    <span className="font-bold text-[#0C2D21] block mt-0.5">{item.detectedMaterialOrFood}</span>
                    <span className="text-stone-500 text-[11px]">Category: {item.category}</span>
                  </div>

                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">Estimated Quantity</span>
                    <span className="font-mono font-bold text-[#0C2D21] block mt-0.5">
                      {item.estimatedQuantity} {item.quantityUnit}
                    </span>
                    <span className="text-stone-500 text-[11px]">Computer Vision Confidence: {item.confidenceScore}%</span>
                  </div>

                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">Matched Entity</span>
                    {item.matchedEntity ? (
                      <div>
                        <span className="font-bold text-[#0C2D21] block mt-0.5 truncate">{item.matchedEntity.name}</span>
                        <span className="text-[#059669] text-[11px] font-semibold">{item.matchedEntity.location} ({item.matchedEntity.distanceKm} km away)</span>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic mt-0.5 block">Awaiting buyer / receiver match</span>
                    )}
                  </div>
                </div>

                {/* Buyer / Receiver Contact Information (Revealed AFTER Acceptance per spec) */}
                {isAccepted && item.matchedEntity && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0C2D21] pb-2 border-b border-[#0C2D21]/10">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#059669]">
                        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                        <span>Direct Coordination Info (Authorized After Acceptance)</span>
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {item.matchedEntity.isDemo ? 'DEMO / SYNTHETIC BUYER' : 'REGISTERED ENTITY'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Organization Name</span>
                        <span className="font-bold text-[#0C2D21] block">{item.matchedEntity.name}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Authorized Contact</span>
                        <span className="font-semibold text-stone-800 block">{item.matchedEntity.authorizedContact}</span>
                        <span className="text-[#0C2D21] font-mono font-bold block">{item.matchedEntity.contactNumber}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Pickup Location</span>
                        <span className="text-stone-700 block">{item.matchedEntity.pickupLocation}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Destination</span>
                        <span className="text-stone-700 block">{item.matchedEntity.destination}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 italic pt-1">
                      * Transportation and commercial/delivery terms are coordinated directly between parties. W2V does not process private transactions.
                    </div>
                  </div>
                )}

                {/* Progress Workflow Buttons: MATCHED -> ACCEPTED -> PICKUP -> DELIVERY -> COMPLETED */}
                <div className="pt-2 border-t border-[#0C2D21]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-stone-500 text-[11px] flex items-center gap-2">
                    <span>Workflow Stage: <strong>{item.status.replace('_', ' ')}</strong></span>
                    {isAccepted && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Route Ready
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Direct link to Map Analytics / Route Optimization */}
                    {isAccepted && onOpenMapAnalytics && (
                      <button
                        type="button"
                        onClick={() => onOpenMapAnalytics(item)}
                        className="px-3.5 py-2 rounded-xl bg-[#0C2D21] text-[#34D399] hover:text-white border border-[#10B981]/30 font-bold uppercase tracking-wider hover:bg-[#144432] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>VIEW OPTIMIZED ROUTE</span>
                      </button>
                    )}

                    {item.status === 'OFFER_SENT' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'ACCEPTED')}
                          className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer"
                        >
                          Simulate Buyer [ ACCEPT ]
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
                          className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold uppercase tracking-wider hover:bg-stone-200 cursor-pointer"
                        >
                          Simulate [ DECLINE ]
                        </button>
                      </>
                    )}

                    {item.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'PICKUP_INITIATED')}
                        className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>MARK PICKUP INITIATED</span>
                      </button>
                    )}

                    {item.status === 'PICKUP_INITIATED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'PICKED_UP')}
                        className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer"
                      >
                        MARK PICKED UP
                      </button>
                    )}

                    {item.status === 'PICKED_UP' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'DELIVERED')}
                        className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer"
                      >
                        MARK DELIVERED
                      </button>
                    )}

                    {item.status === 'DELIVERED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                        className="px-5 py-2 rounded-xl bg-[#10B981] text-white font-bold uppercase tracking-wider hover:bg-[#059669] cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>CONFIRM COMPLETED & UPDATE IMPACT</span>
                      </button>
                    )}

                    {item.status === 'COMPLETED' && (
                      <span className="text-[#059669] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Recovery Fulfilled & Logged</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
