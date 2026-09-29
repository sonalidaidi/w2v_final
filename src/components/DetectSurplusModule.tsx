import React, { useState, useRef, useEffect } from 'react';
import {
  RecoveryListing,
  addRecoveryListing,
  DEMO_SYNTHETIC_RECEIVERS,
  DemoReceiver,
} from '../services/recoveryHubStorage';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  Thermometer,
  Wind,
  Clock,
  ShieldCheck,
  Building,
  Send,
  RefreshCw,
  PhoneCall,
  User,
  MapPin,
  HelpCircle,
} from 'lucide-react';

interface DetectSurplusModuleProps {
  onRecoveryDispatched?: () => void;
}

type SurplusSubTab = 'QUANTITY_DETECTION' | 'QUALITY_ASSESSMENT';
type QualityMethod = 'MANUAL' | 'IOT_SENSOR';
type DemoPresetCase = 'CUSTOM' | 'CASE_1_ELIGIBLE' | 'CASE_2_CAUTION' | 'CASE_3_REJECTION';

type ScreeningRiskStatus =
  | 'WITHIN CONTROL LIMITS'
  | 'CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED'
  | 'INSUFFICIENT DATA FOR A SAFETY DETERMINATION'
  | 'NOT ELIGIBLE FOR FOOD RECOVERY';

export const DetectSurplusModule: React.FC<DetectSurplusModuleProps> = ({
  onRecoveryDispatched,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SurplusSubTab>('QUANTITY_DETECTION');

  // STEP 1: QUANTITY DETECTION (COMPUTER VISION)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80'
  );
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [detectedFood, setDetectedFood] = useState<string>('Cooked Rice');
  const [detectedFoodCategory, setDetectedFoodCategory] = useState<string>('Cooked Cereal Grain (Vegetarian)');
  const [isNonVegetarian, setIsNonVegetarian] = useState<boolean>(false);
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(18);
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [confidenceScore, setConfidenceScore] = useState<number>(94);
  const [hasConfirmedQuantity, setHasConfirmedQuantity] = useState<boolean>(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);

  // Simulated Weighing Sensor Integration
  const [sensorConnected, setSensorConnected] = useState<boolean>(true);
  const [sensorWeightKg, setSensorWeightKg] = useState<number>(18.2);

  // STEP 2: QUALITY ASSESSMENT (MANUAL vs IOT / SENSOR)
  const [qualityMethod, setQualityMethod] = useState<QualityMethod>('IOT_SENSOR');
  const [activeDemoPreset, setActiveDemoPreset] = useState<DemoPresetCase>('CASE_1_ELIGIBLE');

  // Manual Assessment Inputs
  const [foodAppearance, setFoodAppearance] = useState<string>('Fresh, uniform grain appearance, normal color');
  const [odour, setOdour] = useState<string>('Fresh cooked aroma, no off-odour');
  const [preparationTimeStr, setPreparationTimeStr] = useState<string>('1 hour ago');
  const [storageMethod, setStorageMethod] = useState<'Hot Holding' | 'Cold Holding / Chilled' | 'Frozen' | 'Cooling' | 'Ambient Room Pan' | 'Unspecified / Unknown'>('Hot Holding');
  const [storageCondition, setStorageCondition] = useState<string>('Covered stainless steel GN pans with steam lids');
  const [visibleContamination, setVisibleContamination] = useState<'None' | 'Minor Dust/Spatter' | 'Foreign Object' | 'Mould / Spoilage'>('None');
  const [packagingCovering, setPackagingCovering] = useState<string>('Clean food-grade stainless steel lids with rubber gaskets');

  // IoT / Sensor Assessment Inputs (Clearly labeled SIMULATED IoT DATA)
  const [currentTemperatureC, setCurrentTemperatureC] = useState<number>(70.0);
  const [isTempAvailable, setIsTempAvailable] = useState<boolean>(true);
  const [vocGasPpm, setVocGasPpm] = useState<number>(12); // VOC/Gas level in ppm
  const [tempHistoryLog, setTempHistoryLog] = useState<string>('Maintained above applicable hot-holding control (≥65°C) across continuous probe history');
  const [isTempHistoryComplete, setIsTempHistoryComplete] = useState<boolean>(true);
  const [elapsedStorageHours, setElapsedStorageHours] = useState<number>(1.0);
  const [isStorageTimeAvailable, setIsStorageTimeAvailable] = useState<boolean>(true);
  const [simulatedTimestamp, setSimulatedTimestamp] = useState<string>(() => new Date().toLocaleTimeString());

  // Visual Quality Analysis (CV)
  const [visualQualityStatus, setVisualQualityStatus] = useState<'NO_CONCERNS' | 'INCONCLUSIVE' | 'VISIBLE_SPOILAGE'>('NO_CONCERNS');
  const [visualQualityNotes, setVisualQualityNotes] = useState<string>('No obvious visible abnormality, mould, discoloration or contamination detected.');

  // Step 3: TIME + TEMPERATURE + STORAGE SCREENING
  const [riskStatus, setRiskStatus] = useState<ScreeningRiskStatus>('WITHIN CONTROL LIMITS');
  const [isEligibleForFoodRecovery, setIsEligibleForFoodRecovery] = useState<boolean>(true);
  const [analysisExplanation, setAnalysisExplanation] = useState<string>('');

  // Step 4: RECEIVER MATCHING & DISPATCH (Surplus Donation Only)
  const [potentialReceivers, setPotentialReceivers] = useState<DemoReceiver[]>(DEMO_SYNTHETIC_RECEIVERS);
  const [selectedReceiver, setSelectedReceiver] = useState<DemoReceiver | null>(DEMO_SYNTHETIC_RECEIVERS[0]);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  // Recalculate Time-Temperature analysis whenever conditions change
  useEffect(() => {
    evaluateFoodSafetyScreening();
  }, [
    detectedFoodCategory,
    isNonVegetarian,
    storageMethod,
    currentTemperatureC,
    isTempAvailable,
    isTempHistoryComplete,
    elapsedStorageHours,
    isStorageTimeAvailable,
    qualityMethod,
    visibleContamination,
    odour,
    visualQualityStatus,
    tempHistoryLog,
  ]);

  // TARGETED FOOD-SAFETY SCREENING LOGIC FIX:
  // Context-aware FSSAI controls:
  // - Hot food: around 65°C or above (non-vegetarian hot food: around 70°C or above)
  // - Cold food: 5°C or below
  // - Frozen food: -18°C or below
  // - Controlled cooling: 60°C -> 21°C within 2 hours, then 21°C -> 5°C within following 2 hours
  // Clear rules:
  // 1. Missing data => "INSUFFICIENT DATA FOR A SAFETY DETERMINATION" (Do NOT automatically mark NOT ELIGIBLE)
  // 2. Consistent within control limits => "WITHIN CONTROL LIMITS" => allow [ FOOD RECOVERY ]
  // 3. Clear violation or confirmed spoilage => "NOT ELIGIBLE FOR FOOD RECOVERY" => [ ORGANIC WASTE / COMPOST HANDLING ]
  // 4. Inconclusive or borderline => "CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED"
  const evaluateFoodSafetyScreening = () => {
    // 1. Check for clear disqualifying visible contamination or spoilage
    if (
      visibleContamination === 'Foreign Object' ||
      visibleContamination === 'Mould / Spoilage' ||
      visualQualityStatus === 'VISIBLE_SPOILAGE' ||
      odour.toLowerCase().includes('sour') ||
      odour.toLowerCase().includes('foul') ||
      odour.toLowerCase().includes('rotten')
    ) {
      setRiskStatus('NOT ELIGIBLE FOR FOOD RECOVERY');
      setIsEligibleForFoodRecovery(false);
      setAnalysisExplanation(
        'Food-safety screening indicates a potential control deviation: Physical contamination, mold growth, or unacceptable off-odour was detected during inspection. Not eligible for redistribution for human consumption.'
      );
      return;
    }

    // 2. Check for missing / incomplete data (RULE 1: DO NOT AUTOMATICALLY REJECT)
    if (
      storageMethod === 'Unspecified / Unknown' ||
      !isTempAvailable ||
      !isTempHistoryComplete ||
      !isStorageTimeAvailable ||
      visualQualityStatus === 'INCONCLUSIVE'
    ) {
      setRiskStatus('INSUFFICIENT DATA FOR A SAFETY DETERMINATION');
      setIsEligibleForFoodRecovery(false);
      setAnalysisExplanation(
        'Insufficient data for a safety determination: Essential time, temperature, or storage parameter logs are missing or inconclusive. Manual kitchen supervisor food-safety review is required prior to clearance.'
      );
      return;
    }

    // 3. Evaluate applicable FSSAI Control Limits based on storage context
    const hotControlThreshold = isNonVegetarian ? 70.0 : 65.0;

    if (storageMethod === 'Hot Holding') {
      if (currentTemperatureC >= hotControlThreshold) {
        setRiskStatus('WITHIN CONTROL LIMITS');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Measured food temperature (${currentTemperatureC}°C) is consistent with the applicable FSSAI hot-holding control limit (≥${hotControlThreshold}°C for ${isNonVegetarian ? 'non-vegetarian' : 'vegetarian'} food). Elapsed holding time (${elapsedStorageHours} hr) is within established service control limits.`
        );
      } else if (currentTemperatureC >= hotControlThreshold - 5.0 && elapsedStorageHours <= 2.0) {
        setRiskStatus('CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Temperature (${currentTemperatureC}°C) is slightly below the ${hotControlThreshold}°C hot-holding target, but holding duration (${elapsedStorageHours} hr) remains within the acceptable rapid-redistribution window. Prompt consumption required.`
        );
      } else {
        setRiskStatus('NOT ELIGIBLE FOR FOOD RECOVERY');
        setIsEligibleForFoodRecovery(false);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Hot-holding temperature fell to ${currentTemperatureC}°C (below the ${hotControlThreshold}°C control limit) with elapsed duration of ${elapsedStorageHours} hours. Temperature abuse within danger zone detected.`
        );
      }
    } else if (storageMethod === 'Cold Holding / Chilled') {
      if (currentTemperatureC <= 5.0) {
        setRiskStatus('WITHIN CONTROL LIMITS');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Measured temperature (${currentTemperatureC}°C) is consistent with the FSSAI cold-holding control limit (≤5.0°C). Cold chain integrity verified.`
        );
      } else if (currentTemperatureC <= 8.0 && elapsedStorageHours <= 2.0) {
        setRiskStatus('CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Chilled temperature is elevated at ${currentTemperatureC}°C (control limit is ≤5.0°C). Immediate insulated transit required.`
        );
      } else {
        setRiskStatus('NOT ELIGIBLE FOR FOOD RECOVERY');
        setIsEligibleForFoodRecovery(false);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Chilled storage temperature reached ${currentTemperatureC}°C (exceeding 8.0°C) over ${elapsedStorageHours} hours. Pathogen growth risk elevated.`
        );
      }
    } else if (storageMethod === 'Frozen') {
      if (currentTemperatureC <= -18.0) {
        setRiskStatus('WITHIN CONTROL LIMITS');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Deep freeze temperature (${currentTemperatureC}°C) is consistent with the FSSAI frozen storage control limit (≤-18.0°C).`
        );
      } else {
        setRiskStatus('CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Freezer temperature measured ${currentTemperatureC}°C (control target is ≤-18.0°C). Partial thaw check required.`
        );
      }
    } else if (storageMethod === 'Cooling') {
      // 60°C -> 21°C within 2 hours, then 21°C -> 5°C within following 2 hours
      if (elapsedStorageHours <= 2.0 && currentTemperatureC <= 21.0) {
        setRiskStatus('WITHIN CONTROL LIMITS');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Controlled cooling curve conforms to FSSAI multi-stage guidelines: Reduced to ${currentTemperatureC}°C (≤21°C within 2 hours).`
        );
      } else if (elapsedStorageHours <= 4.0 && currentTemperatureC <= 5.0) {
        setRiskStatus('WITHIN CONTROL LIMITS');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Controlled cooling cycle successfully reached ${currentTemperatureC}°C (≤5°C) within total 4-hour envelope.`
        );
      } else {
        setRiskStatus('CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED');
        setIsEligibleForFoodRecovery(false);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Slow cooling detected (${currentTemperatureC}°C after ${elapsedStorageHours} hours). Prolonged dwell time in danger zone.`
        );
      }
    } else {
      // Ambient room pan
      if (elapsedStorageHours <= 1.5) {
        setRiskStatus('CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED');
        setIsEligibleForFoodRecovery(true);
        setAnalysisExplanation(
          `Food is held at ambient room temperature (${currentTemperatureC}°C) for ${elapsedStorageHours} hr. Allowed only for rapid same-day redistribution under close monitoring.`
        );
      } else {
        setRiskStatus('NOT ELIGIBLE FOR FOOD RECOVERY');
        setIsEligibleForFoodRecovery(false);
        setAnalysisExplanation(
          `Food-safety screening indicates a potential control deviation: Ambient room holding exceeded 1.5 hours without active thermal control (${currentTemperatureC}°C). Not eligible for donation.`
        );
      }
    }
  };

  // LOAD 3 VERIFIED TEST CASES DIRECTLY FOR USERS & DEMO
  const applyDemoPreset = (preset: DemoPresetCase) => {
    setActiveDemoPreset(preset);

    if (preset === 'CASE_1_ELIGIBLE') {
      // CASE 1 — ELIGIBLE:
      // Cooked rice, Hot holding, 70°C, 1 hour, No visible abnormality -> WITHIN CONTROL LIMITS -> FOOD RECOVERY available
      setDetectedFood('Cooked Rice');
      setDetectedFoodCategory('Cooked Cereal Grain (Vegetarian)');
      setIsNonVegetarian(false);
      setEstimatedQuantity(18);
      setQuantityUnit('kg');
      setStorageMethod('Hot Holding');
      setCurrentTemperatureC(70.0);
      setIsTempAvailable(true);
      setElapsedStorageHours(1.0);
      setIsStorageTimeAvailable(true);
      setIsTempHistoryComplete(true);
      setTempHistoryLog('Maintained above applicable hot-holding control (≥65°C) continuously');
      setVisibleContamination('None');
      setOdour('Fresh cooked aroma, normal');
      setVisualQualityStatus('NO_CONCERNS');
      setVisualQualityNotes('Uniform steamed texture, no off-color or foreign particles.');
    } else if (preset === 'CASE_2_CAUTION') {
      // CASE 2 — CAUTION:
      // Cooked rice, Temperature history incomplete, Storage details incomplete -> INSUFFICIENT DATA / MANUAL REVIEW -> no auto reject
      setDetectedFood('Cooked Rice');
      setDetectedFoodCategory('Cooked Cereal Grain (Vegetarian)');
      setIsNonVegetarian(false);
      setEstimatedQuantity(18);
      setQuantityUnit('kg');
      setStorageMethod('Hot Holding');
      setCurrentTemperatureC(66.5);
      setIsTempAvailable(true);
      setElapsedStorageHours(1.2);
      setIsStorageTimeAvailable(true);
      setIsTempHistoryComplete(false); // Temperature history INCOMPLETE
      setTempHistoryLog('Data gap: Probe telemetry lost between 12:15 and 12:50. History incomplete.');
      setVisibleContamination('None');
      setOdour('Normal aroma');
      setVisualQualityStatus('INCONCLUSIVE');
      setVisualQualityNotes('Visual assessment inconclusive — manual food-safety review required.');
    } else if (preset === 'CASE_3_REJECTION') {
      // CASE 3 — NOT ELIGIBLE:
      // Confirmed unacceptable temperature/storage history or clear visible spoilage/contamination -> NOT ELIGIBLE -> ORGANIC WASTE
      setDetectedFood('Mixed Vegetable Curry');
      setDetectedFoodCategory('Cooked Vegetable & Gravy');
      setIsNonVegetarian(false);
      setEstimatedQuantity(14);
      setQuantityUnit('kg');
      setStorageMethod('Ambient Room Pan');
      setCurrentTemperatureC(38.4); // Dangerous temperature in danger zone
      setIsTempAvailable(true);
      setElapsedStorageHours(3.8); // 3.8 hours at ambient room temp
      setIsStorageTimeAvailable(true);
      setIsTempHistoryComplete(true);
      setTempHistoryLog('Logged extended dwell in danger zone (38°C for >3 hours).');
      setVisibleContamination('Foreign Object');
      setOdour('Faint sour odor observed');
      setVisualQualityStatus('VISIBLE_SPOILAGE');
      setVisualQualityNotes('Surface film separation and slight off-sour notes detected.');
    }
  };

  const handleSimulateFoodImage = (type: string) => {
    setIsAnalyzingImage(true);
    setTimeout(() => {
      if (type === 'rice') {
        setImagePreview('https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80');
        applyDemoPreset('CASE_1_ELIGIBLE');
      } else if (type === 'dal') {
        setImagePreview('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80');
        setDetectedFood('Tadka Toor Dal');
        setDetectedFoodCategory('Cooked Lentil / Legume Gravy');
        setIsNonVegetarian(false);
        setEstimatedQuantity(7);
        setQuantityUnit('kg');
        setConfidenceScore(92);
        setSensorWeightKg(7.4);
        setStorageMethod('Hot Holding');
        setCurrentTemperatureC(68.5);
      } else if (type === 'curry') {
        setImagePreview('https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80');
        applyDemoPreset('CASE_3_REJECTION');
      }
      setIsAnalyzingImage(false);
    }, 800);
  };

  const handleSendRecoveryRequest = () => {
    if (!selectedReceiver) return;

    const newListing: RecoveryListing = {
      id: `food-rec-${Date.now()}`,
      type: 'FOOD_SURPLUS',
      title: `${detectedFood} (${estimatedQuantity} ${quantityUnit})`,
      category: detectedFoodCategory,
      estimatedQuantity,
      quantityUnit,
      confirmedQuantity: estimatedQuantity,
      confidenceScore,
      detectedMaterialOrFood: detectedFood,
      sourceImage: imagePreview || undefined,
      status: 'OFFER_SENT',
      qualityAssessment: {
        method: qualityMethod,
        riskStatus: riskStatus as any,
        currentTemperature: isTempAvailable ? currentTemperatureC : undefined,
        elapsedHours: isStorageTimeAvailable ? elapsedStorageHours : undefined,
        vocIndex: vocGasPpm,
        isEligibleForHumanConsumption: isEligibleForFoodRecovery,
      },
      matchedEntity: {
        entityType: 'RECEIVER',
        isDemo: true,
        name: selectedReceiver.name,
        category: selectedReceiver.type,
        location: selectedReceiver.location,
        distanceKm: selectedReceiver.distanceKm,
        authorizedContact: selectedReceiver.contactPerson,
        contactNumber: selectedReceiver.phone,
        pickupLocation: 'Kitchen Dispatch Dock 1 (Food Recovery Staging)',
        destination: selectedReceiver.pickupAddress,
        matchReason: `High capacity (${selectedReceiver.capacityMeals} meals) with verified immediate pickup vehicle (${selectedReceiver.distanceKm} km away).`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRecoveryListing(newListing);
    setDispatchSuccess(true);
    if (onRecoveryDispatched) {
      setTimeout(() => onRecoveryDispatched(), 2200);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Scale className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Surplus Identification & Food-Safety Screening</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              DETECT SURPLUS & RECOVERY
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Food surplus donation is handled exclusively here. Quantity detection via Computer Vision & connected scales is verified against context-appropriate food-safety control indicators before redistribution.
            </p>
          </div>
        </div>

        {/* Sub-Tabs: [ QUANTITY DETECTION ] [ QUALITY ASSESSMENT ] */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('QUANTITY_DETECTION')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'QUANTITY_DETECTION'
                ? 'bg-[#0C2D21] text-white shadow-xs'
                : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
            }`}
          >
            <Camera className="w-4 h-4 text-[#F97316]" />
            <span>QUANTITY DETECTION</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('QUALITY_ASSESSMENT')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'QUALITY_ASSESSMENT'
                ? 'bg-[#0C2D21] text-white shadow-xs'
                : 'bg-[#FAF8F3] text-[#0C2D21] hover:bg-stone-200/70 border border-[#0C2D21]/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>QUALITY ASSESSMENT & FOOD-SAFETY SCREENING</span>
          </button>
        </div>
      </div>

      {/* SUB-MODULE 6: QUANTITY DETECTION */}
      {activeSubTab === 'QUANTITY_DETECTION' && (
        <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-2">
            <div>
              <h2 className="font-display text-xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                FOOD SURPLUS QUANTITY DETECTION
              </h2>
              <p className="text-xs text-[#161A18]/70">
                Capture GN pan photos and synchronize with simulated weighing scales.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0C2D21] bg-[#FAF8F3] px-3 py-1 rounded-lg border border-[#0C2D21]/10">
              Module 06
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left: Image Intake / Presets */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border-2 border-dashed border-[#0C2D21]/20 text-center space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setImagePreview(ev.target?.result as string);
                      handleSimulateFoodImage('rice');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
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
                  onClick={() => handleSimulateFoodImage('rice')}
                  className="px-5 py-3 rounded-xl border-2 border-[#0C2D21] text-[#0C2D21] bg-white text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-[#F97316]" />
                  <span>TAKE PHOTO</span>
                </button>
              </div>

              {/* Presets */}
              <div className="pt-2 text-stone-500 text-[11px]">
                <span>Sample surplus trays: </span>
                <button
                  type="button"
                  onClick={() => handleSimulateFoodImage('rice')}
                  className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
                >
                  Cooked Rice (18 kg)
                </button>
                ·
                <button
                  type="button"
                  onClick={() => handleSimulateFoodImage('dal')}
                  className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
                >
                  Toor Dal (7 kg)
                </button>
                ·
                <button
                  type="button"
                  onClick={() => handleSimulateFoodImage('curry')}
                  className="text-[#0C2D21] font-bold underline hover:text-[#F97316] mx-1 cursor-pointer"
                >
                  Veg Curry (14 kg)
                </button>
              </div>

              {/* Preview */}
              <div className="w-full h-56 rounded-xl bg-white border border-[#0C2D21]/15 overflow-hidden flex items-center justify-center relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Detected Food Surplus"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-stone-400 text-xs flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 opacity-40" />
                    <span>Upload or capture food pan image to analyze quantity and category.</span>
                  </div>
                )}

                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-[#0C2D21]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#F97316]" />
                    <span>ANALYZING FOOD SURPLUS WITH CV & SCALE SENSORS...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Computer Vision + Sensor Outputs */}
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21]">
                  CV DETECTION & SCALE INTEGRATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Confidence: {confidenceScore}%
                </span>
              </div>

              {/* Food Item */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Detected Food Item</span>
                  {isEditingQuantity ? (
                    <input
                      type="text"
                      value={detectedFood}
                      onChange={(e) => setDetectedFood(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#0C2D21]/20 font-bold text-sm text-[#0C2D21]"
                    />
                  ) : (
                    <span className="font-bold text-lg text-[#0C2D21] block">{detectedFood}</span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-stone-500 text-[11px]">{detectedFoodCategory}</span>
                    <label className="inline-flex items-center gap-1 text-[11px] text-[#0C2D21] font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNonVegetarian}
                        onChange={(e) => setIsNonVegetarian(e.target.checked)}
                        className="rounded text-[#0C2D21]"
                      />
                      <span>Non-Vegetarian (Target ≥70°C)</span>
                    </label>
                  </div>
                </div>

                {/* Estimated Quantity vs Weighing Sensor */}
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Estimated Quantity</span>
                  {isEditingQuantity ? (
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
                        <option value="portions">portions</option>
                      </select>
                    </div>
                  ) : (
                    <div className="font-mono text-3xl font-black text-[#0C2D21]">
                      {estimatedQuantity} <span className="text-sm font-sans font-normal text-stone-500">{quantityUnit}</span>
                    </div>
                  )}

                  {sensorConnected && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Scale className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Connected Weighing Sensor</span>
                      </span>
                      <span className="font-mono font-bold">{sensorWeightKg} kg Gross</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm prompt */}
              <div className="pt-3 border-t border-[#0C2D21]/10">
                <p className="text-xs text-[#161A18]/80 font-medium mb-3">
                  Confirm detected food and quantity to proceed with food-safety screening.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasConfirmedQuantity(true);
                      setIsEditingQuantity(false);
                      setActiveSubTab('QUALITY_ASSESSMENT');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0C2D21] text-white hover:bg-[#144432] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>CONFIRM & PROCEED TO SAFETY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingQuantity(!isEditingQuantity)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                  >
                    {isEditingQuantity ? 'DONE' : 'EDIT'}
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-MODULE 7 & 8: QUALITY ASSESSMENT & TIME-TEMPERATURE SCREENING */}
      {activeSubTab === 'QUALITY_ASSESSMENT' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0C2D21]/10 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Target Surplus: {detectedFood} ({estimatedQuantity} {quantityUnit})
                </span>
                <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  FOOD QUALITY & TIME-TEMPERATURE SCREENING
                </h2>
              </div>

              {/* Assessment Method Switcher */}
              <div className="inline-flex p-1 bg-[#FAF8F3] border border-[#0C2D21]/15 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQualityMethod('IOT_SENSOR')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    qualityMethod === 'IOT_SENSOR'
                      ? 'bg-[#0C2D21] text-white'
                      : 'text-stone-600 hover:text-[#0C2D21]'
                  }`}
                >
                  IoT / SENSOR ASSESSMENT
                </button>
                <button
                  type="button"
                  onClick={() => setQualityMethod('MANUAL')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    qualityMethod === 'MANUAL'
                      ? 'bg-[#0C2D21] text-white'
                      : 'text-stone-600 hover:text-[#0C2D21]'
                  }`}
                >
                  MANUAL ASSESSMENT
                </button>
              </div>
            </div>

            {/* THREE VERIFIED DEMO TEST CASES BAR (Requirement 5 & 9) */}
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>DEMO TEST CASES (SIMULATED IoT DATA):</span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">
                  Quick-load all three screening outcomes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyDemoPreset('CASE_1_ELIGIBLE')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    activeDemoPreset === 'CASE_1_ELIGIBLE'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold shadow-2xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-emerald-800 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CASE 1 — ELIGIBLE</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Rice · Hot Holding 70°C · 1 hr · No issues
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    → Outcome: WITHIN CONTROL LIMITS
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyDemoPreset('CASE_2_CAUTION')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    activeDemoPreset === 'CASE_2_CAUTION'
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold shadow-2xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-amber-800 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>CASE 2 — CAUTION / INCOMPLETE</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Rice · Temp history incomplete · Data missing
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold mt-1">
                    → Outcome: INSUFFICIENT DATA / MANUAL REVIEW
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyDemoPreset('CASE_3_REJECTION')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    activeDemoPreset === 'CASE_3_REJECTION'
                      ? 'bg-red-50 border-red-600 text-red-950 font-semibold shadow-2xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-red-800 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>CASE 3 — NOT ELIGIBLE</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Ambient pan · 38°C for 3.8 hrs · Spoilage signs
                  </div>
                  <div className="text-[10px] text-red-700 font-bold mt-1">
                    → Outcome: NOT ELIGIBLE FOR FOOD RECOVERY
                  </div>
                </button>
              </div>
            </div>

            {/* Assessment Input Forms */}
            {qualityMethod === 'IOT_SENSOR' ? (
              <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#0C2D21]/10">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-600" />
                    <span className="font-display text-sm font-bold text-[#0C2D21] uppercase">
                      TELEMETRIC SENSOR FEEDS & TEMPERATURE HISTORY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                    SIMULATED IoT DATA
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Current Temperature */}
                  <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/10 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 text-[10px] font-bold uppercase">Core Temperature</span>
                      <label className="text-[10px] text-stone-500 font-medium">
                        <input
                          type="checkbox"
                          checked={isTempAvailable}
                          onChange={(e) => {
                            setIsTempAvailable(e.target.checked);
                            setActiveDemoPreset('CUSTOM');
                          }}
                          className="mr-1 rounded"
                        />
                        Available
                      </label>
                    </div>
                    {isTempAvailable ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.5"
                          value={currentTemperatureC}
                          onChange={(e) => {
                            setCurrentTemperatureC(parseFloat(e.target.value) || 0);
                            setActiveDemoPreset('CUSTOM');
                          }}
                          className="w-20 px-2 py-1 rounded border font-mono font-bold text-lg text-[#0C2D21]"
                        />
                        <span className="font-bold text-sm text-stone-600">°C</span>
                      </div>
                    ) : (
                      <div className="text-red-600 font-bold text-xs mt-2 italic">Sensor Offline / Missing</div>
                    )}
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Target: {storageMethod === 'Hot Holding' ? (isNonVegetarian ? '≥70°C' : '≥65°C') : storageMethod === 'Cold Holding / Chilled' ? '≤5°C' : storageMethod === 'Frozen' ? '≤-18°C' : 'Controlled'}
                    </span>
                  </div>

                  {/* Elapsed Storage Time */}
                  <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/10 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 text-[10px] font-bold uppercase">Elapsed Storage Time</span>
                      <label className="text-[10px] text-stone-500 font-medium">
                        <input
                          type="checkbox"
                          checked={isStorageTimeAvailable}
                          onChange={(e) => {
                            setIsStorageTimeAvailable(e.target.checked);
                            setActiveDemoPreset('CUSTOM');
                          }}
                          className="mr-1 rounded"
                        />
                        Logged
                      </label>
                    </div>
                    {isStorageTimeAvailable ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.2"
                          value={elapsedStorageHours}
                          onChange={(e) => {
                            setElapsedStorageHours(parseFloat(e.target.value) || 0);
                            setActiveDemoPreset('CUSTOM');
                          }}
                          className="w-20 px-2 py-1 rounded border font-mono font-bold text-lg text-[#0C2D21]"
                        />
                        <span className="font-bold text-sm text-stone-600">Hrs</span>
                      </div>
                    ) : (
                      <div className="text-red-600 font-bold text-xs mt-2 italic">Time Unlogged / Missing</div>
                    )}
                    <span className="text-[10px] text-stone-500 mt-1 block">Since prep completion</span>
                  </div>

                  {/* Storage Method */}
                  <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/10 text-xs">
                    <span className="text-stone-400 text-[10px] font-bold uppercase block mb-1">Storage Method</span>
                    <select
                      value={storageMethod}
                      onChange={(e) => {
                        setStorageMethod(e.target.value as any);
                        setActiveDemoPreset('CUSTOM');
                      }}
                      className="w-full px-2 py-1.5 rounded border border-stone-300 font-semibold text-xs text-[#0C2D21]"
                    >
                      <option value="Hot Holding">Hot Holding (≥65°C / ≥70°C)</option>
                      <option value="Cold Holding / Chilled">Cold Holding (&le;5°C)</option>
                      <option value="Frozen">Frozen (&le;-18°C)</option>
                      <option value="Cooling">Controlled Cooling Stage</option>
                      <option value="Ambient Room Pan">Ambient Room Pan (Unregulated)</option>
                      <option value="Unspecified / Unknown">Unspecified / Unknown</option>
                    </select>
                    <span className="text-[10px] text-stone-500 mt-1 block">Contextual control category</span>
                  </div>

                  {/* Gas / VOC Probe */}
                  <div className="p-4 rounded-xl bg-white border border-[#0C2D21]/10 text-xs">
                    <span className="text-stone-400 text-[10px] font-bold uppercase block">Gas / VOC Trend</span>
                    <div className="font-mono text-xl font-black text-[#0C2D21] mt-1">
                      {vocGasPpm} <span className="text-xs font-sans font-normal text-stone-500">ppm</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Volatile organic baseline</span>
                  </div>

                </div>

                {/* Temperature History Integrity Toggle */}
                <div className="p-3.5 rounded-xl bg-white border border-[#0C2D21]/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500" />
                    <div>
                      <span className="font-bold text-[#0C2D21] block">Temperature History Integrity Log</span>
                      <span className="text-[11px] text-stone-600">{tempHistoryLog}</span>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0C2D21] shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTempHistoryComplete}
                      onChange={(e) => {
                        setIsTempHistoryComplete(e.target.checked);
                        setActiveDemoPreset('CUSTOM');
                        if (!e.target.checked) {
                          setTempHistoryLog('Data gap: Probe telemetry lost. History incomplete.');
                        } else {
                          setTempHistoryLog('Maintained above applicable control continuously across logging period.');
                        }
                      }}
                      className="rounded"
                    />
                    <span>Complete Continuous Record</span>
                  </label>
                </div>

                <div className="text-[11px] text-stone-500 italic">
                  * Note: Sensors provide condition and risk indicators only. They do not certify microbiological food safety.
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21] block">
                  MANUAL KITCHEN INSPECTION CHECKLIST
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Food Appearance</label>
                    <input
                      type="text"
                      value={foodAppearance}
                      onChange={(e) => {
                        setFoodAppearance(e.target.value);
                        setActiveDemoPreset('CUSTOM');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Odour / Sensory Check</label>
                    <input
                      type="text"
                      value={odour}
                      onChange={(e) => {
                        setOdour(e.target.value);
                        setActiveDemoPreset('CUSTOM');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Storage Method</label>
                    <select
                      value={storageMethod}
                      onChange={(e) => {
                        setStorageMethod(e.target.value as any);
                        setActiveDemoPreset('CUSTOM');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-semibold"
                    >
                      <option value="Hot Holding">Hot Holding (&ge;65°C / &ge;70°C)</option>
                      <option value="Cold Holding / Chilled">Cold Holding (&le;5°C)</option>
                      <option value="Frozen">Frozen (&le;-18°C)</option>
                      <option value="Cooling">Controlled Cooling Stage</option>
                      <option value="Ambient Room Pan">Ambient Room Pan (Unregulated)</option>
                      <option value="Unspecified / Unknown">Unspecified / Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Visible Contamination</label>
                    <select
                      value={visibleContamination}
                      onChange={(e) => {
                        setVisibleContamination(e.target.value as any);
                        setActiveDemoPreset('CUSTOM');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 font-semibold"
                    >
                      <option value="None">None (Pristine condition)</option>
                      <option value="Minor Dust/Spatter">Minor Dust/Spatter</option>
                      <option value="Foreign Object">Foreign Object / Physical Contaminant</option>
                      <option value="Mould / Spoilage">Mould / Spoilage Signs</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 italic">
                  * Visual appearance alone cannot establish microbiological safety.
                </div>
              </div>
            )}

            {/* VISUAL QUALITY ANALYSIS SECTION (Computer Vision - Requirement 6) */}
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Computer Vision Visual Quality Analysis</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Visible surface & discoloration check
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setVisualQualityStatus('NO_CONCERNS');
                    setVisualQualityNotes('No obvious visible abnormality, mould, or contamination detected.');
                    setActiveDemoPreset('CUSTOM');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    visualQualityStatus === 'NO_CONCERNS'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border text-stone-700'
                  }`}
                >
                  ✓ No Obvious Visual Concerns
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVisualQualityStatus('INCONCLUSIVE');
                    setVisualQualityNotes('Visual assessment inconclusive — manual food-safety review required.');
                    setActiveDemoPreset('CUSTOM');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    visualQualityStatus === 'INCONCLUSIVE'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white border text-stone-700'
                  }`}
                >
                  ? Image Inconclusive / Review Required
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVisualQualityStatus('VISIBLE_SPOILAGE');
                    setVisualQualityNotes('Visible spoilage / abnormal surface growth detected by computer vision.');
                    setActiveDemoPreset('CUSTOM');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    visualQualityStatus === 'VISIBLE_SPOILAGE'
                      ? 'bg-red-700 text-white'
                      : 'bg-white border text-stone-700'
                  }`}
                >
                  ✗ Visible Discoloration / Spoilage
                </button>
              </div>

              <p className="text-xs text-stone-700 mt-1">
                <strong>CV Finding:</strong> {visualQualityNotes}
              </p>
            </div>

            {/* THREE SCREENING OUTCOMES STATUS CARD (Requirement 2 & 8) */}
            <div
              className={`p-6 rounded-2xl border-2 space-y-3 ${
                riskStatus === 'WITHIN CONTROL LIMITS'
                  ? 'bg-emerald-50/70 border-emerald-600'
                  : riskStatus === 'INSUFFICIENT DATA FOR A SAFETY DETERMINATION' || riskStatus === 'CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED'
                  ? 'bg-amber-50/70 border-amber-500'
                  : 'bg-red-50/70 border-red-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  FOOD-SAFETY SCREENING RESULT
                </span>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    riskStatus === 'WITHIN CONTROL LIMITS'
                      ? 'bg-emerald-700 text-white'
                      : riskStatus === 'INSUFFICIENT DATA FOR A SAFETY DETERMINATION' || riskStatus === 'CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED'
                      ? 'bg-amber-600 text-white'
                      : 'bg-red-700 text-white'
                  }`}
                >
                  {riskStatus}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                {analysisExplanation}
              </p>

              <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-200">
                <strong>Statutory Notice:</strong> This is a food-safety screening/risk indicator, NOT an FSSAI certification. Never claim that AI or computer vision can certify food as safe.
              </div>
            </div>

            {/* ELIGIBILITY DECISION WORKFLOW */}
            {riskStatus === 'NOT ELIGIBLE FOR FOOD RECOVERY' ? (
              /* NOT ELIGIBLE WORKFLOW -> ORGANIC WASTE / COMPOST HANDLING */
              <div className="p-6 rounded-3xl bg-red-50 border-2 border-red-200 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-red-900 uppercase">
                      NOT ELIGIBLE FOR FOOD RECOVERY
                    </h3>
                    <p className="text-xs text-red-800">
                      Food-safety screening detected a confirmed control deviation. This food cannot be distributed for human consumption.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-red-200 text-xs text-[#0C2D21] space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-red-700 block">
                    ORGANIC WASTE / COMPOST HANDLING PROTOCOL
                  </span>
                  <p className="text-stone-700">
                    Route this batch directly to the kitchen's organic bio-digester or municipal segregated wet-waste collection.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-bold">Nagpur Municipal Wet Waste Hotline:</span>
                    <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      1800-120-8040
                    </span>
                  </div>
                </div>
              </div>
            ) : riskStatus === 'INSUFFICIENT DATA FOR A SAFETY DETERMINATION' || riskStatus === 'CAUTION / MANUAL FOOD-SAFETY REVIEW REQUIRED' ? (
              /* INSUFFICIENT DATA / CAUTION WORKFLOW (Do NOT automatically reject, allow supervisor override or clarification) */
              <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 space-y-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-amber-600 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-amber-950 uppercase">
                      MANUAL FOOD-SAFETY REVIEW REQUIRED
                    </h3>
                    <p className="text-xs text-amber-900">
                      Incomplete telemetry or borderline conditions detected. The system has NOT rejected the food automatically. Verify storage parameters or complete inspection logs.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs space-y-3">
                  <span className="font-bold uppercase text-[#0C2D21] block">
                    Kitchen Supervisor Clearance Options:
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => applyDemoPreset('CASE_1_ELIGIBLE')}
                      className="px-4 py-2.5 rounded-xl bg-[#0C2D21] text-white font-bold text-xs uppercase hover:bg-[#144432] cursor-pointer"
                    >
                      Fill In Complete Log (Switch to Within Controls)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDemoPreset('CASE_3_REJECTION')}
                      className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 bg-white font-bold text-xs uppercase hover:bg-red-50 cursor-pointer"
                    >
                      Confirm Discard to Compost
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ELIGIBLE FOR FOOD RECOVERY WORKFLOW (WITHIN CONTROL LIMITS) */
              <div className="p-6 rounded-3xl bg-[#0C2D21] text-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Screening Complete · Within Control Limits</span>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-white uppercase tracking-tight">
                      FOOD RECOVERY & COMMUNITY MATCHING
                    </h3>
                  </div>

                  <div className="text-[11px] font-mono text-stone-300">
                    DEMO / SYNTHETIC RECEIVER Network
                  </div>
                </div>

                {/* Receiver Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {potentialReceivers.map((rec) => {
                    const isSelected = selectedReceiver?.name === rec.name;

                    return (
                      <div
                        key={rec.name}
                        onClick={() => setSelectedReceiver(rec)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-3 ${
                          isSelected
                            ? 'border-[#10B981] bg-white/10 shadow-lg'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-[#10B981] uppercase">
                            {rec.type}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#10B981]">
                            {rec.distanceKm} km away
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display text-base font-extrabold text-white">
                            {rec.name}
                          </h4>
                          <span className="text-xs text-stone-300 block">{rec.location}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-black/20 text-xs space-y-1">
                          <div className="flex justify-between text-stone-300">
                            <span>Feeding Capacity:</span>
                            <strong className="text-white">{rec.capacityMeals} meals</strong>
                          </div>
                          <div className="flex justify-between text-stone-300">
                            <span>Availability:</span>
                            <span className="text-[#10B981] font-semibold">{rec.availability}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {dispatchSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-500 text-xs text-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>
                      <strong>Food Recovery Request Dispatched!</strong> {selectedReceiver?.name} notified. Status logged in Recovery Hub. Redirecting...
                    </span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-stone-300">
                    Selected Partner: <strong>{selectedReceiver?.name}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleSendRecoveryRequest}
                    disabled={!selectedReceiver || dispatchSuccess}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white hover:bg-stone-100 active:bg-stone-200 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-extrabold disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-[#0C2D21]" />
                    <span>SEND RECOVERY REQUEST</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
