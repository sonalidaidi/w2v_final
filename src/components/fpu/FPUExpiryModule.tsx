import React, { useState, useRef } from 'react';
import {
  FPUExpiryItem,
  getFPUExpiryItems,
  saveFPUExpiryItems,
  addFPUExpiryItem,
  addFPUNotification,
} from '../../services/fpuStorage';
import {
  RecoveryListing,
  addRecoveryListing,
  DEMO_SYNTHETIC_BUYERS,
  DemoBuyer,
} from '../../services/recoveryHubStorage';
import {
  Camera,
  Upload,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Send,
  Truck,
  RotateCcw,
  Edit3,
  Check,
  Building,
  MapPin,
  Phone,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Info,
} from 'lucide-react';

interface FPUExpiryModuleProps {
  onOpenMapAnalytics?: (listingId?: string) => void;
  onOpenRecoveryHub?: () => void;
}

export const FPUExpiryModule: React.FC<FPUExpiryModuleProps> = ({
  onOpenMapAnalytics,
  onOpenRecoveryHub,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INTAKE STATES
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  // CV Extracted fields
  const [productName, setProductName] = useState<string>('Vacuum Packaged Paneer Blocks');
  const [productCategory, setProductCategory] = useState<string>('Dairy Products');
  const [packagingType, setPackagingType] = useState<string>('Multi-layer Barrier Vacuum Pouch');
  const [batchNumber, setBatchNumber] = useState<string>('LOT-DAIRY-26B');
  const [manufacturingDate, setManufacturingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split('T')[0];
  });
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5); // 5 days remaining
    return d.toISOString().split('T')[0];
  });
  const [quantity, setQuantity] = useState<number>(75);
  const [unit, setUnit] = useState<string>('kg');
  const [confidenceScore, setConfidenceScore] = useState<number>(93);
  const [isDateLegible, setIsDateLegible] = useState<boolean>(true);

  // Edit & Confirmation States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [confirmedItem, setConfirmedItem] = useState<FPUExpiryItem | null>(null);

  // Recovery Matching States
  const [isMatchingOpen, setIsMatchingOpen] = useState<boolean>(false);
  const [selectedBuyer, setSelectedBuyer] = useState<DemoBuyer | null>(null);
  const [offerSentListing, setOfferSentListing] = useState<RecoveryListing | null>(null);
  const [buyerAccepted, setBuyerAccepted] = useState<boolean>(false);

  // Stored items
  const [storedItems, setStoredItems] = useState<FPUExpiryItem[]>(() => getFPUExpiryItems());

  // Test Presets for instant evaluation
  const handleSelectPreset = (presetType: 'EXPIRING_PANEER' | 'SAFE_MANGO_PULP' | 'UNCLEAR_DATE' | 'EXPIRED_SAUCE') => {
    setHasAnalyzed(false);
    setConfirmedItem(null);
    setIsMatchingOpen(false);
    setOfferSentListing(null);
    setBuyerAccepted(false);

    if (presetType === 'EXPIRING_PANEER') {
      setImagePreview('https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80');
      setProductName('Commercial Vacuum Paneer Blocks (200g)');
      setProductCategory('Dairy Products');
      setPackagingType('Vacuum Sealed Barrier Film');
      setBatchNumber('LOT-PNR-88C');
      const mDate = new Date();
      mDate.setDate(mDate.getDate() - 11);
      setManufacturingDate(mDate.toISOString().split('T')[0]);
      const eDate = new Date();
      eDate.setDate(eDate.getDate() + 4); // Expiring soon in 4 days
      setExpiryDate(eDate.toISOString().split('T')[0]);
      setQuantity(85);
      setUnit('kg');
      setConfidenceScore(94);
      setIsDateLegible(true);
    } else if (presetType === 'SAFE_MANGO_PULP') {
      setImagePreview('https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80');
      setProductName('Aseptic Canned Mango Puree (850g)');
      setProductCategory('Fruit & Pulp Processing');
      setPackagingType('Hermetic Food-Grade Tin Can');
      setBatchNumber('LOT-MGO-104A');
      const mDate = new Date();
      mDate.setDate(mDate.getDate() - 45);
      setManufacturingDate(mDate.toISOString().split('T')[0]);
      const eDate = new Date();
      eDate.setDate(eDate.getDate() + 180); // Long shelf life
      setExpiryDate(eDate.toISOString().split('T')[0]);
      setQuantity(320);
      setUnit('cans');
      setConfidenceScore(98);
      setIsDateLegible(true);
    } else if (presetType === 'UNCLEAR_DATE') {
      setImagePreview('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80');
      setProductName('Milled Whole Wheat Flour Sack (50kg)');
      setProductCategory('Grain Milling');
      setPackagingType('Woven Polypropylene Bag');
      setBatchNumber('LOT-FLOUR-XX');
      setManufacturingDate('');
      setExpiryDate('');
      setQuantity(200);
      setUnit('kg');
      setConfidenceScore(62);
      setIsDateLegible(false); // Section 7: Unclear date rule
    } else if (presetType === 'EXPIRED_SAUCE') {
      setImagePreview('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80');
      setProductName('Seasoned Tomato Pulp Base (Bulk Drum)');
      setProductCategory('Vegetable & Condiment Processing');
      setPackagingType('HDPE Barrel Liner');
      setBatchNumber('LOT-TOM-902');
      const mDate = new Date();
      mDate.setDate(mDate.getDate() - 90);
      setManufacturingDate(mDate.toISOString().split('T')[0]);
      const eDate = new Date();
      eDate.setDate(eDate.getDate() - 5); // Already expired 5 days ago!
      setExpiryDate(eDate.toISOString().split('T')[0]);
      setQuantity(140);
      setUnit('kg');
      setConfidenceScore(96);
      setIsDateLegible(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setHasAnalyzed(false);
        setConfirmedItem(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 1: ANALYZE PRODUCT
  // "Do NOT automatically produce a result immediately after uploading. First show: [ ANALYZE PRODUCT ]"
  const handleAnalyzeProduct = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
    }, 750);
  };

  // Calculate shelf life & status
  const calculateShelfLifeStatus = (expDateStr?: string, legible: boolean = true) => {
    if (!legible || !expDateStr) {
      return {
        status: 'MANUAL REVIEW REQUIRED' as const,
        daysRemaining: undefined,
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expDateStr);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return {
        status: 'EXPIRED' as const,
        daysRemaining: diffDays,
      };
    } else if (diffDays <= 7) {
      return {
        status: 'EXPIRING SOON' as const,
        daysRemaining: diffDays,
      };
    } else {
      return {
        status: 'SAFE / WITHIN RECORDED SHELF LIFE' as const,
        daysRemaining: diffDays,
      };
    }
  };

  // STEP 2: CONFIRM RESULT
  // "Only after confirmation should the product be saved."
  const handleConfirmResult = () => {
    const { status, daysRemaining } = calculateShelfLifeStatus(expiryDate, isDateLegible);

    const newItem: FPUExpiryItem = {
      id: `exp-${Date.now()}`,
      productName,
      productCategory,
      packagingType,
      batchNumber: batchNumber || 'UNASSIGNED-BATCH',
      manufacturingDate: manufacturingDate || undefined,
      expiryDate: isDateLegible ? expiryDate : undefined,
      quantity,
      unit,
      confidenceScore,
      isDateLegible,
      manualConfirmationRequired: !isDateLegible,
      shelfLifeStatus: status,
      daysRemaining,
      confirmedAt: new Date().toISOString(),
      imagePreview: imagePreview || undefined,
    };

    addFPUExpiryItem(newItem);
    setConfirmedItem(newItem);
    setStoredItems(getFPUExpiryItems());

    // Section 9: Expiring Soon Alert
    if (status === 'EXPIRING SOON') {
      addFPUNotification({
        type: 'EXPIRY_ALERT',
        title: `Expiry Alert: ${productName} Approaching Shelf-Life Limit`,
        message: `Product is approaching its recorded expiry date (${daysRemaining} days remaining for ${batchNumber}). Review rapid circular recovery options.`,
        severity: 'WARNING',
      });
    }
  };

  // STEP 3: SEND FOR RECOVERY
  // "Then use AI matching. For FPU recovery, match primarily with: SECONDARY BUYERS, INDUSTRIES, LOCAL/SMALL BUYERS"
  const handleOpenRecoveryMatching = () => {
    setIsMatchingOpen(true);
    // Auto select optimal secondary buyer
    setSelectedBuyer(DEMO_SYNTHETIC_BUYERS[0]);
  };

  // STEP 4: SEND OFFER TO BUYER
  const handleSendOffer = () => {
    if (!confirmedItem || !selectedBuyer) return;

    const newListing: RecoveryListing = {
      id: `fpu-rec-${Date.now()}`,
      type: confirmedItem.shelfLifeStatus === 'EXPIRED' ? 'RESOURCE_BYPRODUCT' : 'FOOD_SURPLUS',
      title: `${confirmedItem.productName} (${confirmedItem.quantity} ${confirmedItem.unit})`,
      category: confirmedItem.productCategory,
      estimatedQuantity: confirmedItem.quantity,
      quantityUnit: confirmedItem.unit,
      confirmedQuantity: confirmedItem.quantity,
      confidenceScore: confirmedItem.confidenceScore,
      detectedMaterialOrFood: confirmedItem.productName,
      sourceImage: confirmedItem.imagePreview,
      status: 'OFFER_SENT',
      matchedEntity: {
        entityType: 'BUYER',
        isDemo: true,
        name: `${selectedBuyer.name} (${selectedBuyer.label})`,
        category: selectedBuyer.category,
        location: selectedBuyer.location,
        distanceKm: selectedBuyer.distanceKm,
        authorizedContact: selectedBuyer.contactName,
        contactNumber: selectedBuyer.phone,
        pickupLocation: 'FPU Finished Goods Loading Bay 1, MIDC Hingna',
        destination: `${selectedBuyer.location}, Industrial Processing Area`,
        matchReason: `Batch match for ${confirmedItem.productName} (${confirmedItem.quantity} ${confirmedItem.unit}). Urgent recovery within ${confirmedItem.daysRemaining || 5} days window.`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecoveryListing(newListing);
    setOfferSentListing(newListing);

    addFPUNotification({
      type: 'RECOVERY_MATCH',
      title: `Recovery Offer Dispatched to ${selectedBuyer.name}`,
      message: `Offer sent for ${confirmedItem.quantity} ${confirmedItem.unit} of ${confirmedItem.productName}. Awaiting buyer response.`,
      severity: 'INFO',
    });
  };

  // Simulate Buyer ACCEPT / DECLINE
  const handleBuyerResponse = (accept: boolean) => {
    if (!offerSentListing) return;

    if (accept) {
      setBuyerAccepted(true);
      offerSentListing.status = 'ACCEPTED';
      addFPUNotification({
        type: 'BUYER_ACCEPTED',
        title: `Offer Accepted by ${offerSentListing.matchedEntity?.name}`,
        message: `Buyer accepted recovery request. Authorized coordination details released. Route is now ROUTE READY.`,
        severity: 'INFO',
      });
    } else {
      setOfferSentListing(null);
      setSelectedBuyer(null);
    }
  };

  const currentShelfLife = confirmedItem
    ? calculateShelfLifeStatus(confirmedItem.expiryDate, confirmedItem.isDateLegible)
    : calculateShelfLifeStatus(expiryDate, isDateLegible);

  const isExpired = currentShelfLife.status === 'EXPIRED';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Computer Vision Package & Batch OCR</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              EXPIRY DETECTION & SHELF-LIFE INTELLIGENCE
            </h2>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Optical recognition of packaged foods, factory lot stamps, and printed expiry dates. Accurately calculates remaining shelf life and connects approaching-expiry batches to industrial secondary buyers before waste occurs.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-stone-500 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 shrink-0">
            FPU Module 4 of 6
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Sample Packages:</span>
          <button
            type="button"
            onClick={() => handleSelectPreset('EXPIRING_PANEER')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            🧀 Expiring Soon (Paneer)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('SAFE_MANGO_PULP')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            🥫 Within Shelf Life (Mango Pulp)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('UNCLEAR_DATE')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            ⚠️ Blurred / Unclear Date
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('EXPIRED_SAUCE')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            🚫 Expired (Resource Recovery Only)
          </button>
        </div>
      </div>

      {/* Image Intake & OCR Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: UPLOAD / CAMERA & PREVIEW */}
        <div className="lg:col-span-5 bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
              PACKAGE INTAKE
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Step 1: Capture Lot Stamp</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-black/5 aspect-4/3 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Packaged product"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setHasAnalyzed(false);
                  setConfirmedItem(null);
                }}
                className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs cursor-pointer"
                title="Remove image"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#FAF8F3] border-2 border-dashed border-[#0C2D21]/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0C2D21]/5 text-[#0C2D21] flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0C2D21]">Capture or upload packaged food image</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Ensure printed lot code and expiry date are visible</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-[#10B981]" />
                  <span>UPLOAD IMAGE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('EXPIRING_PANEER')}
                  className="px-4 py-2.5 rounded-xl border border-[#0C2D21] text-[#0C2D21] bg-white text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-[#F97316]" />
                  <span>TAKE PHOTO</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTION BUTTON: [ ANALYZE PRODUCT ] */}
          {/* "Do NOT automatically produce a result immediately after uploading. First show: [ ANALYZE PRODUCT ]" */}
          {imagePreview && !hasAnalyzed && (
            <button
              type="button"
              onClick={handleAnalyzeProduct}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-xl bg-[#0C2D21] hover:bg-[#144432] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <span>{isAnalyzing ? 'Extracting Printed Lot & Expiry Data...' : 'ANALYZE PRODUCT'}</span>
            </button>
          )}

          {hasAnalyzed && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('EXPIRING_PANEER')}
                className="flex-1 py-2 rounded-xl border border-stone-300 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer text-center"
              >
                RETAKE / UPLOAD AGAIN
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OCR RESULTS & CONFIRMATION */}
        <div className="lg:col-span-7 space-y-4">
          
          {!hasAnalyzed ? (
            <div className="p-8 rounded-3xl bg-white border border-[#0C2D21]/15 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0C2D21]/5 text-[#0C2D21] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-[#10B981]" />
              </div>
              <h4 className="font-display text-sm font-extrabold text-[#0C2D21] uppercase">
                AWAITING PACKAGE ANALYSIS
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">
                Upload or capture an image of a packaged production item, then click <strong>"ANALYZE PRODUCT"</strong> to scan printed batch numbers, manufacturing dates, and expiration timestamps.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#0C2D21]/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Computer Vision OCR Extraction
                  </span>
                  <h4 className="font-display text-base font-extrabold text-[#0C2D21]">
                    {productName}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {confidenceScore}% CONFIDENCE
                  </span>
                  {!isEditing && !confirmedItem && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs cursor-pointer flex items-center gap-1"
                      title="Edit detected values"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase">EDIT</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 7: UNCLEAR DATE WARNING (NEVER INVENT AN EXPIRY DATE) */}
              {!isDateLegible && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs uppercase tracking-wide">
                      EXPIRY DATE NOT CLEAR — MANUAL CONFIRMATION REQUIRED
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-7">
                    The printed timestamp on this container is obscured or blurred. Per strict W2V data safety regulations, an expiration date is <strong>never invented</strong>. Please inspect the physical stamp and enter the verified date manually.
                  </p>
                </div>
              )}

              {/* Detected Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Product Category</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-stone-300 bg-white font-semibold text-xs"
                    />
                  ) : (
                    <span className="font-bold text-[#0C2D21] block">{productCategory}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Batch / Lot Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-stone-300 bg-white font-mono font-bold text-xs"
                    />
                  ) : (
                    <span className="font-mono font-bold text-[#0C2D21] block">{batchNumber || 'Not Readable'}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Manufacturing Date</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={manufacturingDate}
                      onChange={(e) => setManufacturingDate(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-stone-300 bg-white text-xs font-mono"
                    />
                  ) : (
                    <span className="font-mono text-[#0C2D21] block">{manufacturingDate || 'N/A'}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Expiry / Best-Before Date *</span>
                  {isEditing || !isDateLegible ? (
                    <div className="space-y-1">
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => {
                          setExpiryDate(e.target.value);
                          setIsDateLegible(true);
                        }}
                        className="w-full px-2 py-1 rounded border border-stone-300 bg-white text-xs font-mono font-bold text-[#0C2D21]"
                      />
                      <span className="text-[10px] text-stone-400 block italic">Manually confirmed by QA operator</span>
                    </div>
                  ) : (
                    <span className="font-mono font-black text-[#0C2D21] block">{expiryDate}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Quantity Staged</span>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded border border-stone-300 bg-white font-mono text-xs"
                      />
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-20 px-2 py-1 rounded border border-stone-300 bg-white text-xs"
                      />
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-[#0C2D21] block">{quantity} {unit}</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Packaging Barrier</span>
                  <span className="text-stone-700 block truncate">{packagingType}</span>
                </div>

              </div>

              {/* SECTION 8: SHELF LIFE STATUS BADGE */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    CALCULATED SHELF-LIFE STATUS:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider ${
                      currentShelfLife.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-800'
                        : currentShelfLife.status === 'EXPIRING SOON'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : currentShelfLife.status === 'SAFE / WITHIN RECORDED SHELF LIFE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {currentShelfLife.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600">
                  {currentShelfLife.daysRemaining !== undefined && (
                    <span className="font-bold text-[#0C2D21]">
                      {currentShelfLife.daysRemaining > 0
                        ? `${currentShelfLife.daysRemaining} days remaining until recorded expiry.`
                        : `Recorded expiry date passed ${Math.abs(currentShelfLife.daysRemaining)} days ago.`}
                    </span>
                  )}
                  <p className="text-[11px] text-stone-500 mt-1 italic">
                    * Protocol Notice: A printed date alone does not determine biological safety. Storage temperature, vacuum seal integrity, and moisture control remain critical factors.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS: [ CONFIRM RESULT ] / [ EDIT RESULT ] */}
              {!confirmedItem ? (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-3 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer"
                    >
                      Save Edits
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleConfirmResult}
                    disabled={!isDateLegible && !expiryDate}
                    className="flex-1 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM RESULT & SAVE LOT DATA</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span><strong>Batch Confirmed & Saved:</strong> {confirmedItem.productName} ({confirmedItem.batchNumber}).</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700">Logged</span>
                  </div>

                  {/* SECTION 14: EXPIRED / UNFIT PRODUCT PATHWAY */}
                  {isExpired ? (
                    <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-xs text-red-950 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-red-800">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="text-xs uppercase tracking-wide">
                          NOT ELIGIBLE FOR HUMAN-CONSUMPTION RECOVERY
                        </span>
                      </div>
                      <p className="text-red-900 text-xs leading-relaxed">
                        Recorded expiry date has passed. In compliance with food safety regulations, this product cannot be offered to secondary human food buyers or charities.
                      </p>

                      <div className="p-3 rounded-xl bg-white border border-red-200 space-y-1">
                        <strong className="text-[#0C2D21] block">APPROPRIATE RESOURCE RECOVERY PATHWAY:</strong>
                        <span className="text-stone-700 block">
                          • Transferred to Industrial Anaerobic Digestion / Bio-Gas Feedstock Hub
                        </span>
                        <span className="text-stone-700 block">
                          • Or Clean Organic Vermicomposting & Soil Nutrient Processing
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenRecoveryMatching}
                        className="px-5 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        DISPATCH TO INDUSTRIAL BIOMASS RECOVERY
                      </button>
                    </div>
                  ) : (
                    /* SECTION 10: ELIGIBLE RECOVERY ACTION */
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong className="text-xs text-[#0C2D21] block">
                          {confirmedItem.shelfLifeStatus === 'EXPIRING SOON' ? 'Approaching Expiry Dispatch' : 'Surplus Batch Allocation'}
                        </strong>
                        <p className="text-[11px] text-stone-500">
                          Transfer directly to commercial secondary buyers or extraction industries before shelf life expires.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenRecoveryMatching}
                        className="px-5 py-2.5 rounded-xl bg-[#0C2D21] hover:bg-[#144432] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>SEND FOR RECOVERY</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* SECTION 11 & 12: AI RECOVERY MATCHING & BUYER ACCEPTANCE PANEL */}
      {isMatchingOpen && confirmedItem && (
        <div className="bg-white border-2 border-[#10B981] rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 text-xs font-bold text-[#059669] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recovery Matching Engine</span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                MATCHED BUYERS & RECOVERY PARTNERS
              </h3>
              <p className="text-xs text-stone-600">
                Matched primarily with verified secondary buyers, extraction industries, and local regional processors.
              </p>
            </div>

            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-stone-100 text-stone-600 font-bold uppercase">
              Target Payload: {confirmedItem.quantity} {confirmedItem.unit}
            </span>
          </div>

          {/* Matched Buyer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_SYNTHETIC_BUYERS.map((buyer) => {
              const isSelected = selectedBuyer?.name === buyer.name;

              return (
                <div
                  key={buyer.name}
                  onClick={() => setSelectedBuyer(buyer)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'border-[#10B981] bg-emerald-50/20 shadow-md'
                      : 'border-[#0C2D21]/10 bg-[#FAF8F3] hover:border-[#0C2D21]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      Secondary Buyer
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                      {buyer.label}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-sm font-extrabold text-[#0C2D21]">
                      {buyer.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 block">{buyer.category}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#0C2D21]/10 text-xs space-y-1">
                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>Requirement:</span>
                      <strong className="text-[#0C2D21]">{buyer.minQtyKg}–{buyer.maxQtyKg} kg batches</strong>
                    </div>
                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>Location:</span>
                      <span className="text-[#059669] font-semibold">{buyer.location} ({buyer.distanceKm} km)</span>
                    </div>
                    <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                      Match: Immediate procurement demand for processed batches.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 12: SEND OFFER & BUYER ACCEPTANCE INTERACTION */}
          <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-4">
            
            {!offerSentListing ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Selected Partner</span>
                  <span className="font-bold text-sm text-[#0C2D21]">{selectedBuyer?.name}</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Clicking "SEND OFFER" notifies the buyer. Contact coordinates unlock upon mutual acceptance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendOffer}
                  disabled={!selectedBuyer}
                  className="px-6 py-3 rounded-xl bg-[#0C2D21] hover:bg-[#144432] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4 text-[#10B981]" />
                  <span>SEND OFFER TO BUYER</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Offer Sent Notice */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0C2D21]/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <div>
                      <span className="font-bold text-sm text-[#0C2D21]">
                        Offer Dispatched to {offerSentListing.matchedEntity?.name}
                      </span>
                      <span className="text-stone-500 text-xs block">
                        Awaiting buyer acceptance. Status: <strong>{offerSentListing.status}</strong>
                      </span>
                    </div>
                  </div>

                  {!buyerAccepted && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBuyerResponse(true)}
                        className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] cursor-pointer"
                      >
                        Simulate Buyer [ ACCEPT ]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBuyerResponse(false)}
                        className="px-3 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-300 cursor-pointer"
                      >
                        [ DECLINE ]
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 12 & 13: REVEALED CONTACT INFO AFTER ACCEPTANCE */}
                {buyerAccepted && offerSentListing.matchedEntity && (
                  <div className="p-5 rounded-2xl bg-white border-2 border-[#10B981] space-y-4 animate-in fade-in">
                    
                    <div className="flex items-center justify-between pb-2 border-b border-[#0C2D21]/10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                        <span className="font-bold text-xs uppercase tracking-wider text-[#059669]">
                          AUTHORIZED COORDINATION DETAILS (UNLOCKED AFTER ACCEPTANCE)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                        ROUTE READY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold block">Organization Name</span>
                        <span className="font-bold text-[#0C2D21] block">{offerSentListing.matchedEntity.name}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold block">Authorized Representative</span>
                        <span className="font-semibold text-stone-800 block">{offerSentListing.matchedEntity.authorizedContact}</span>
                        <span className="font-mono text-[#0C2D21] font-bold block">{offerSentListing.matchedEntity.contactNumber}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold block">Pickup Location</span>
                        <span className="text-stone-700 block">{offerSentListing.matchedEntity.pickupLocation}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold block">Destination</span>
                        <span className="text-stone-700 block">{offerSentListing.matchedEntity.destination}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#0C2D21]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-stone-500 italic text-[11px]">
                        * Commercial terms and payment are coordinated directly between parties. W2V does not process private transactions.
                      </span>

                      {/* Section 13: Direct Route to MAP ANALYTICS / ROUTE OPTIMIZATION */}
                      {onOpenMapAnalytics && (
                        <button
                          type="button"
                          onClick={() => onOpenMapAnalytics(offerSentListing.id)}
                          className="px-5 py-2.5 rounded-xl bg-[#0C2D21] hover:bg-[#144432] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>OPEN MAP ANALYTICS & ROUTE</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* Confirmed Lot Inventory Log */}
      {storedItems.length > 0 && (
        <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <div>
              <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                CONFIRMED LOT LOG
              </h3>
              <p className="text-xs text-stone-500">
                Audited package batches recorded in FPU inventory database.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500">
              {storedItems.length} records
            </span>
          </div>

          <div className="space-y-3">
            {storedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[#0C2D21] text-xs">
                      {item.batchNumber}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        item.shelfLifeStatus === 'EXPIRED'
                          ? 'bg-red-100 text-red-800'
                          : item.shelfLifeStatus === 'EXPIRING SOON'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.shelfLifeStatus}
                    </span>
                  </div>
                  <strong className="text-sm text-[#0C2D21] block">{item.productName}</strong>
                  <span className="text-[11px] text-stone-500">
                    Expiry: {item.expiryDate || 'Manual review required'} · Quantity: {item.quantity} {item.unit}
                  </span>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-mono text-stone-400 block">
                    Logged: {new Date(item.confirmedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
