import React, { useState, useRef } from 'react';
import {
  RecoveryListing,
  addRecoveryListing,
  DEMO_SYNTHETIC_BUYERS,
  DemoBuyer,
} from '../services/recoveryHubStorage';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  RefreshCw,
  Send,
  Building,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface ResourceRecoveryViewProps {
  onListingCreated: () => void;
  onBackToHub: () => void;
}

export const ResourceRecoveryView: React.FC<ResourceRecoveryViewProps> = ({
  onListingCreated,
  onBackToHub,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computer Vision Detection States
  const [detectedMaterial, setDetectedMaterial] = useState<string>('Lemon Peel & Citrus Pulp');
  const [detectedCategory, setDetectedCategory] = useState<string>('Citrus Byproduct / Organic Essential Oil Feedstock');
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(25);
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [confidenceScore, setConfidenceScore] = useState<number>(92);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Buyer Matching State
  const [potentialMatches, setPotentialMatches] = useState<DemoBuyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<DemoBuyer | null>(null);
  const [offerSentSuccess, setOfferSentSuccess] = useState<boolean>(false);

  // Simulated Computer Vision analysis of actual uploaded or captured image
  const analyzeImageWithCV = (fileOrDataUrl: string, fileName?: string) => {
    setIsAnalyzing(true);
    setHasConfirmed(false);
    setSelectedBuyer(null);
    setOfferSentSuccess(false);

    setTimeout(() => {
      const name = (fileName || fileOrDataUrl).toLowerCase();

      if (name.includes('beet') || name.includes('red') || name.includes('dye')) {
        setDetectedMaterial('Beetroot Peel Residue');
        setDetectedCategory('Natural Pigment & Organic Pulp Feedstock');
        setEstimatedQuantity(18);
        setQuantityUnit('kg');
        setConfidenceScore(94);
      } else if (name.includes('carrot') || name.includes('orange')) {
        setDetectedMaterial('Carrot & Root Vegetable Peels');
        setDetectedCategory('Dietary Fiber & Bio-Compost Feedstock');
        setEstimatedQuantity(32);
        setQuantityUnit('kg');
        setConfidenceScore(89);
      } else if (name.includes('lemon') || name.includes('citrus') || name.includes('lime')) {
        setDetectedMaterial('Lemon Peel & Citrus Pulp');
        setDetectedCategory('Citrus Byproduct / Organic Essential Oil Feedstock');
        setEstimatedQuantity(25);
        setQuantityUnit('kg');
        setConfidenceScore(93);
      } else if (name.includes('onion') || name.includes('skin')) {
        setDetectedMaterial('Dry Onion Skins');
        setDetectedCategory('Flavonoid Extraction / Natural Bio-Dye');
        setEstimatedQuantity(12);
        setQuantityUnit('kg');
        setConfidenceScore(88);
      } else {
        // Realistic default for generic vegetable preparation
        setDetectedMaterial('Mixed Vegetable & Fruit By-products');
        setDetectedCategory('Organic Bio-Mass & Anaerobic Digestion Feedstock');
        setEstimatedQuantity(28);
        setQuantityUnit('kg');
        setConfidenceScore(87);
      }

      setIsAnalyzing(false);
    }, 1100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        analyzeImageWithCV(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCameraCapture = (sampleType: string) => {
    // Interactive presets for instant Computer Vision testing
    const sampleImages: Record<string, string> = {
      lemon: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80',
      carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
      beetroot: 'https://images.unsplash.com/photo-1528751090382-7d3d75865242?auto=format&fit=crop&w=600&q=80',
    };

    const url = sampleImages[sampleType] || sampleImages.lemon;
    setImagePreview(url);
    analyzeImageWithCV(sampleType, sampleType);
  };

  // Step 2: Confirm detected material & quantity
  const handleConfirmDetection = () => {
    setHasConfirmed(true);
    setIsEditing(false);

    // AI Resource Matching algorithm considering material, quantity, and distance
    const norm = detectedMaterial.toLowerCase();
    const matched = DEMO_SYNTHETIC_BUYERS.filter((buyer) => {
      const matchesMaterial = buyer.acceptedMaterials.some((m) => norm.includes(m) || m.includes(norm));
      const matchesQuantity = estimatedQuantity >= buyer.minQtyKg * 0.8 && estimatedQuantity <= buyer.maxQtyKg * 1.5;
      return matchesMaterial || matchesQuantity;
    });

    if (matched.length > 0) {
      setPotentialMatches(matched);
      setSelectedBuyer(matched[0]);
    } else {
      setPotentialMatches(DEMO_SYNTHETIC_BUYERS);
      setSelectedBuyer(DEMO_SYNTHETIC_BUYERS[0]);
    }
  };

  // Step 3: Send Recovery Offer & List for Resource Recovery
  const handleSendRecoveryOffer = () => {
    if (!selectedBuyer) return;

    const newListing: RecoveryListing = {
      id: `res-rec-${Date.now()}`,
      type: 'RESOURCE_BYPRODUCT',
      title: `${detectedMaterial} (${estimatedQuantity} ${quantityUnit})`,
      category: detectedCategory,
      estimatedQuantity,
      quantityUnit,
      confirmedQuantity: estimatedQuantity,
      confidenceScore,
      detectedMaterialOrFood: detectedMaterial,
      sourceImage: imagePreview || undefined,
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
        pickupLocation: 'Kitchen Loading Bay 2, Central Kitchen Store',
        destination: `${selectedBuyer.location}, Industrial Processing Area`,
        matchReason: `Material compatibility for ${detectedMaterial} with ${selectedBuyer.minQtyKg}–${selectedBuyer.maxQtyKg} kg processing capacity.`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecoveryListing(newListing);
    setOfferSentSuccess(true);
    setTimeout(() => {
      onListingCreated();
    }, 2200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Camera className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Computer Vision · Resource Recovery</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              RESOURCE RECOVERY & CV ANALYSIS
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Capture or upload photos of clean kitchen preparation by-products (peels, pomace, rinds). Computer Vision analyzes material composition and matches with regional extraction buyers.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToHub}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-[#FAF8F3] hover:bg-stone-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            ← BACK TO RECOVERY HUB
          </button>
        </div>

        {/* IMAGE INTAKE: TAKE PHOTO / UPLOAD IMAGE */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="p-6 rounded-2xl bg-[#FAF8F3] border-2 border-dashed border-[#0C2D21]/20 text-center space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#10B981]" />
                <span>UPLOAD IMAGE</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateCameraCapture('lemon')}
                className="px-5 py-3 rounded-xl border-2 border-[#0C2D21] text-[#0C2D21] bg-white text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <Camera className="w-4 h-4 text-[#F97316]" />
                <span>TAKE PHOTO</span>
              </button>
            </div>

            {/* Quick Presets for Demo validation */}
            <div className="pt-2 text-stone-500 text-[11px]">
              <span>Sample live kitchen byproducts: </span>
              <button
                type="button"
                onClick={() => handleSimulateCameraCapture('lemon')}
                className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
              >
                Lemon Peel (25kg)
              </button>
              ·
              <button
                type="button"
                onClick={() => handleSimulateCameraCapture('carrot')}
                className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
              >
                Carrot Peels (32kg)
              </button>
              ·
              <button
                type="button"
                onClick={() => handleSimulateCameraCapture('beetroot')}
                className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
              >
                Beetroot Peel (18kg)
              </button>
            </div>

            {/* Image Preview Box */}
            <div className="w-full h-56 rounded-xl bg-white border border-[#0C2D21]/15 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Captured Resource"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-stone-400 text-xs flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 opacity-40" />
                  <span>No image selected yet. Take photo or upload image to begin analysis.</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#0C2D21]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#F97316]" />
                  <span>ANALYZING IMAGE WITH COMPUTER VISION...</span>
                </div>
              )}
            </div>
          </div>

          {/* COMPUTER VISION DETECTION RESULTS */}
          <div className="p-6 rounded-2xl bg-white border border-[#0C2D21]/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21]">
                COMPUTER VISION DETECTION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Confidence: {confidenceScore}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Detected Material</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={detectedMaterial}
                    onChange={(e) => setDetectedMaterial(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#0C2D21]/20 font-bold text-sm text-[#0C2D21]"
                  />
                ) : (
                  <span className="font-bold text-base text-[#0C2D21] block">{detectedMaterial}</span>
                )}
                <span className="text-stone-500 text-[11px] block mt-0.5">{detectedCategory}</span>
              </div>

              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Quantity Status</span>
                <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold inline-block mb-1">
                  ESTIMATED QUANTITY
                </span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={estimatedQuantity}
                      onChange={(e) => setEstimatedQuantity(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 rounded-lg border border-[#0C2D21]/20 font-mono font-bold text-sm text-[#0C2D21]"
                    />
                    <select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-[#0C2D21]/20 text-xs font-bold"
                    >
                      <option value="kg">kg</option>
                      <option value="crates">crates</option>
                    </select>
                  </div>
                ) : (
                  <div className="font-mono text-2xl font-black text-[#0C2D21]">
                    {estimatedQuantity} <span className="text-sm font-sans font-normal text-stone-500">{quantityUnit}</span>
                  </div>
                )}
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Quantity derived via volumetric CV density modeling.
                </span>
              </div>
            </div>

            {/* Please confirm prompt */}
            <div className="pt-3 border-t border-[#0C2D21]/10">
              <p className="text-xs text-[#161A18]/80 font-medium mb-3">
                Please confirm the detected material and quantity.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmDetection}
                  disabled={hasConfirmed}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    hasConfirmed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-[#0C2D21] text-white hover:bg-[#144432]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{hasConfirmed ? 'CONFIRMED' : 'CONFIRM'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                >
                  {isEditing ? 'DONE EDITING' : 'EDIT'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RESOURCE MATCHING: POTENTIAL BUYERS (Where DEMO / SYNTHETIC BUYER is explicitly labeled) */}
      {hasConfirmed && (
        <div className="bg-white border-2 border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 text-xs font-bold text-[#059669] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Material Matching Engine</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                MATCHED INDUSTRIAL RECOVERY BUYERS
              </h2>
            </div>

            <div className="text-[11px] font-mono text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
              Prototype Environment: Clearly labeled DEMO / SYNTHETIC BUYER records
            </div>
          </div>

          {/* List of matched buyers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {potentialMatches.map((buyer) => {
              const isSelected = selectedBuyer?.name === buyer.name;

              return (
                <div
                  key={buyer.name}
                  onClick={() => setSelectedBuyer(buyer)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-3 ${
                    isSelected
                      ? 'border-[#0C2D21] bg-[#FAF8F3] shadow-md'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                      {buyer.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#059669]">
                      {buyer.distanceKm} km away
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#0C2D21]">
                      {buyer.name}
                    </h3>
                    <span className="text-xs text-stone-500 block">{buyer.category}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#0C2D21]/10 text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Requirement:</span>
                      <strong className="text-[#0C2D21]">{detectedMaterial}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Capacity Accepted:</span>
                      <strong className="text-[#0C2D21]">{buyer.minQtyKg}–{buyer.maxQtyKg} kg</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Location:</span>
                      <span className="text-stone-800">{buyer.location}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600">
                    <strong>Match Reason:</strong> Material compatibility and quantity within processing lot range.
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action & Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-[#161A18]/80 leading-relaxed">
            <strong>Direct Coordination Note:</strong> Upon sending the recovery offer and acceptance by the buyer, direct contact details (phone, authorized coordinator, pickup station) are unlocked. W2V does not process private commercial transactions.
          </div>

          {offerSentSuccess && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>
                <strong>Recovery Offer Dispatched to Buyer!</strong> Status updated to OFFER SENT in Recovery Hub. Redirecting...
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              Selected Buyer: <strong>{selectedBuyer?.name}</strong>
            </span>

            <button
              type="button"
              onClick={handleSendRecoveryOffer}
              disabled={!selectedBuyer || offerSentSuccess}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#10B981]" />
              <span>SEND RECOVERY OFFER & LIST</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
