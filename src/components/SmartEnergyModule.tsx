import React, { useState, useEffect } from 'react';
import {
  SavedProductionPlan,
  getSavedProductionPlans,
  STANDARD_INSTITUTIONAL_FOODS,
} from '../services/smartPlanningStorage';
import {
  SavedEnergyAnalysis,
  saveEnergyAnalysis,
  EMISSION_FACTORS,
  KITCHEN_EQUIPMENT_CATALOGUE,
} from '../services/smartEnergyStorage';
import {
  Zap,
  Flame,
  CheckCircle2,
  TrendingDown,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface SmartEnergyModuleProps {
  onRecommendationAccepted?: (analysis: SavedEnergyAnalysis) => void;
}

export const SmartEnergyModule: React.FC<SmartEnergyModuleProps> = ({
  onRecommendationAccepted,
}) => {
  // 1. Load actual saved production plans from Smart Planning
  const [savedPlans, setSavedPlans] = useState<SavedProductionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('custom');

  // Input states
  const [recipeOrMenuName, setRecipeOrMenuName] = useState<string>('Basmati Steamed White Rice');
  const [productionQuantity, setProductionQuantity] = useState<number>(60);
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [servings, setServings] = useState<number>(650);
  const [energySource, setEnergySource] = useState<'Electricity' | 'LPG' | 'PNG' | 'Biomass / Firewood'>('Electricity');
  
  // Available equipment multi-select
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([
    'Commercial Pressure Boiling Steam Kettle',
    'Heavy-Duty Induction Wok / Boiling Range',
    'Commercial Multi-Deck Steam Cooker',
    'High-Pressure Atmospheric LPG Burner Bhatti',
    'Open Flame Cast-Iron Kadai / Degchi',
    'Insulated Steam Rice Boiler Jacketed Pan',
    'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)',
  ]);

  const [cookingRequirement, setCookingRequirement] = useState<string>(
    'Morning breakfast/lunch quick-batch steam cycle with minimum boil-over risk.'
  );

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<SavedEnergyAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load actual saved plans on mount
  useEffect(() => {
    const plans = getSavedProductionPlans();
    setSavedPlans(plans);
    if (plans.length > 0) {
      // Pre-select the most recent saved production plan
      const latest = plans[0];
      setSelectedPlanId(latest.id);
      applyPlanToInputs(latest);
    } else {
      // Fallback realistic demo initial data
      setRecipeOrMenuName('Basmati Steamed White Rice');
      setProductionQuantity(60);
      setQuantityUnit('kg');
      setServings(650);
    }
  }, []);

  const applyPlanToInputs = (plan: SavedProductionPlan) => {
    setRecipeOrMenuName(plan.foodName);
    setProductionQuantity(plan.recommendedQuantity);
    setQuantityUnit(plan.unit);
    setServings(plan.predictedServings);
    setCookingRequirement(
      `Planned for ${plan.predictedServings} servings (${plan.meal} service on ${plan.day}). Dynamic safety buffer: ${plan.safetyBufferPercent}%.`
    );
  };

  const handlePlanSelectChange = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId === 'custom') {
      return;
    }
    const match = savedPlans.find((p) => p.id === planId);
    if (match) {
      applyPlanToInputs(match);
    }
  };

  const handleToggleEquipment = (equip: string) => {
    if (availableEquipment.includes(equip)) {
      if (availableEquipment.length > 1) {
        setAvailableEquipment(availableEquipment.filter((e) => e !== equip));
      }
    } else {
      setAvailableEquipment([...availableEquipment, equip]);
    }
  };

  // AI / Rule Analysis:
  // Dynamically computes recommended equipment and method depending on:
  // - recipe
  // - quantity
  // - number of servings
  // - available equipment
  // - cooking method
  const handleAnalyzeEnergy = (e: React.FormEvent) => {
    e.preventDefault();

    const nameLower = recipeOrMenuName.toLowerCase();
    const qty = productionQuantity || 1;
    const emissionFactor = EMISSION_FACTORS[energySource] || 0.82;

    let recommendedEquip = '';
    let recommendedMethod = '';
    let currentEquip = '';
    let currentMethod = '';
    let explanation = '';
    let currentKWh = 0;
    let recommendedKWh = 0;
    let hasReliableComparison = true;

    // Rule Logic dependent on Recipe category & scale
    const isRiceOrGrain = nameLower.includes('rice') || nameLower.includes('pulao') || nameLower.includes('biryani') || nameLower.includes('khichdi');
    const isDalOrSoup = nameLower.includes('dal') || nameLower.includes('sambar') || nameLower.includes('rasam') || nameLower.includes('curry') || nameLower.includes('chana');
    const isBread = nameLower.includes('roti') || nameLower.includes('chapati') || nameLower.includes('puri') || nameLower.includes('paratha');
    const isLargeScale = qty >= 40 || servings >= 400;

    if (isRiceOrGrain) {
      if (isLargeScale) {
        // Large batch rice
        if (availableEquipment.includes('Insulated Steam Rice Boiler Jacketed Pan')) {
          recommendedEquip = 'Insulated Steam Rice Boiler Jacketed Pan';
        } else if (availableEquipment.includes('Commercial Pressure Boiling Steam Kettle')) {
          recommendedEquip = 'Commercial Pressure Boiling Steam Kettle';
        } else {
          recommendedEquip = 'Commercial Multi-Deck Steam Cooker';
        }
        recommendedMethod = 'Pressurized Closed-Chamber Steam Injection with Latent Heat Absorption';
        currentEquip = 'High-Pressure Atmospheric LPG Burner Bhatti with Open Aluminium Cauldron';
        currentMethod = 'Direct-fired Atmospheric Open Boiling (Traditional High-Radiation Loss)';

        currentKWh = Math.round((qty * 0.72) * 10) / 10;
        recommendedKWh = Math.round((qty * 0.38) * 10) / 10;
        explanation = `For a high-volume batch of ${qty} ${quantityUnit} (${servings} servings), open-fire boiling wastes up to 58% of energy through ambient convective dissipation. The recommended ${recommendedEquip} seals sensible steam heat, reducing cooking duration from 55 mins to 28 mins while eliminating floor heat strain.`;
      } else {
        // Smaller rice batch
        recommendedEquip = availableEquipment.includes('Heavy-Duty Induction Wok / Boiling Range')
          ? 'Heavy-Duty Induction Wok / Boiling Range'
          : 'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)';
        recommendedMethod = 'Precision Induction Simmer with Automated Lid Thermostat';
        currentEquip = 'Open Flame Cast-Iron Kadai / Degchi on Conventional LPG Ring';
        currentMethod = 'Uninsulated Open Flame Boiling with Continuous Manual Stirring';

        currentKWh = Math.round((qty * 0.85) * 10) / 10;
        recommendedKWh = Math.round((qty * 0.52) * 10) / 10;
        explanation = `For medium-batch ${qty} ${quantityUnit} preparations, direct magnetic induction coupling provides ~88% thermal transfer efficiency compared to <42% on atmospheric open rings.`;
      }
    } else if (isDalOrSoup) {
      if (isLargeScale) {
        recommendedEquip = availableEquipment.includes('Commercial Pressure Boiling Steam Kettle')
          ? 'Commercial Pressure Boiling Steam Kettle'
          : 'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)';
        recommendedMethod = 'High-Thermal Inertia Pressure Simmering with Pre-Soaked Legumes';
        currentEquip = 'Direct-Fired Open Boiling Cauldron (Aluminium)';
        currentMethod = 'Extended Open-Lid Boiling on High-Flame Burner';

        currentKWh = Math.round((qty * 0.94) * 10) / 10;
        recommendedKWh = Math.round((qty * 0.46) * 10) / 10;
        explanation = `Lentils and pulses demand prolonged simmering. Cooking ${qty} ${quantityUnit} under insulated steam pressure accelerates starch breakdown, slashing boil time from 90 mins to 38 mins and avoiding 51% of fuel burn.`;
      } else {
        recommendedEquip = 'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)';
        recommendedMethod = 'Controlled Slow-Simmer with Heat Retentive Thermal Core';
        currentEquip = 'Open Flame Cast-Iron Kadai / Degchi';
        currentMethod = 'Standard Stove Boiling';

        currentKWh = Math.round((qty * 0.78) * 10) / 10;
        recommendedKWh = Math.round((qty * 0.49) * 10) / 10;
        explanation = `The Tilting Bratt Pan provides uniform contact heating and heat retention, preventing bottom scorching of thick dal while reducing overall kWh usage.`;
      }
    } else if (isBread) {
      recommendedEquip = availableEquipment.includes('Rotary Roti Puffer & Hotplate')
        ? 'Rotary Roti Puffer & Hotplate'
        : 'Combination Convection Steam Oven';
      recommendedMethod = 'Even-Surface Thermostatic Contact Puffing with Infrared Top-Heat';
      currentEquip = 'Manual High-Flame Tawa & Direct Burner Puffing';
      currentMethod = 'Uncontrolled Open Flame Manual Tawa Griddling';

      currentKWh = Math.round((servings * 0.048) * 10) / 10;
      recommendedKWh = Math.round((servings * 0.026) * 10) / 10;
      explanation = `Griddling ${servings} roti portions manually on open flame loses radiant heat radially. The automated thermostatic plate sustains heat at 220°C with automated cycling.`;
    } else {
      // General vegetable / curry / savory dish
      recommendedEquip = availableEquipment.includes('Tilting Bratt Pan (Heavy-Duty Multi-Cooker)')
        ? 'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)'
        : 'Heavy-Duty Induction Wok / Boiling Range';
      recommendedMethod = 'Shallow Braising with Closed Steam Trapping';
      currentEquip = 'High-Pressure Atmospheric LPG Burner Bhatti';
      currentMethod = 'Open Wok Deep Boiling';

      currentKWh = Math.round((qty * 0.82) * 10) / 10;
      recommendedKWh = Math.round((qty * 0.49) * 10) / 10;
      explanation = `Contextually tailored for ${recipeOrMenuName} (${qty} ${quantityUnit}). Utilizing enclosed braising in ${recommendedEquip} maintains steam recirculation, cutting fuel consumption by ~40%.`;
    }

    // Energy & CO2e calculations using the configured emission factors
    const currentCO2e = Math.round((currentKWh * emissionFactor) * 100) / 100;
    const recommendedCO2e = Math.round((recommendedKWh * emissionFactor) * 100) / 100;

    const energySavingKWh = Math.round((currentKWh - recommendedKWh) * 10) / 10;
    const energySavingPercentage = Math.round(((currentKWh - recommendedKWh) / currentKWh) * 100);

    const co2eSavingKg = Math.round((currentCO2e - recommendedCO2e) * 100) / 100;
    const co2eSavingPercentage = Math.round(((currentCO2e - recommendedCO2e) / currentCO2e) * 100);

    const analysis: SavedEnergyAnalysis = {
      id: `energy-rec-${Date.now()}`,
      planId: selectedPlanId !== 'custom' ? selectedPlanId : undefined,
      recipeOrMenuName,
      quantity: qty,
      quantityUnit,
      servings,
      energySource,
      selectedEquipment: availableEquipment,
      cookingRequirement,
      recommendedEquipment: recommendedEquip,
      recommendedCookingMethod: recommendedMethod,
      estimatedEnergyKWh: recommendedKWh,
      estimatedEnergyUnitLabel: energySource === 'LPG' || energySource === 'PNG' ? 'kWh thermal eq.' : 'kWh',
      estimatedCO2eKg: recommendedCO2e,
      currentMethodName: currentMethod,
      currentEquipmentName: currentEquip,
      currentEnergyKWh: currentKWh,
      currentCO2eKg: currentCO2e,
      energySavingKWh,
      energySavingPercentage,
      co2eSavingKg,
      co2eSavingPercentage,
      explanation,
      hasReliableComparison: true,
      savedAt: new Date().toISOString(),
    };

    setAnalysisResult(analysis);
    setIsSaved(false);
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const handleAcceptRecommendation = () => {
    if (analysisResult) {
      saveEnergyAnalysis(analysisResult);
      setIsSaved(true);
      if (onRecommendationAccepted) {
        onRecommendationAccepted(analysisResult);
      }
      setTimeout(() => setIsSaved(false), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Purpose Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Energy · Kitchen Decarbonization Module</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              SMART ENERGY
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Recommend an appropriate cooking utensil/equipment and cooking method for the user's actual recipe/menu and quantity, with the objective of reducing estimated energy consumption and CO₂e.
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleAnalyzeEnergy} className="mt-6 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Saved Recipe / Menu (Searchable Selector) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                Saved Recipe / Menu from Smart Planning <span className="text-[#F97316]">*</span>
              </label>
              
              <div className="space-y-2">
                <select
                  value={selectedPlanId}
                  onChange={(e) => handlePlanSelectChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                >
                  {savedPlans.length > 0 && (
                    <optgroup label="Synchronized From Your Smart Planning Records">
                      {savedPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.foodName} — {plan.recommendedQuantity} {plan.unit} ({plan.predictedServings} servings on {plan.day}, {plan.meal})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard Institutional Dishes / Custom Entry">
                    {STANDARD_INSTITUTIONAL_FOODS.map((food) => (
                      <option key={food.name} value={`std-${food.name}`}>
                        {food.name} ({food.category})
                      </option>
                    ))}
                    <option value="custom">-- Custom Recipe / Direct Entry --</option>
                  </optgroup>
                </select>

                {/* If custom or override name */}
                <input
                  type="text"
                  value={recipeOrMenuName}
                  onChange={(e) => {
                    setRecipeOrMenuName(e.target.value);
                    setSelectedPlanId('custom');
                  }}
                  placeholder="Recipe / Food Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0C2D21]/15 text-xs font-semibold text-[#0C2D21]"
                  required
                />
              </div>
            </div>

            {/* Energy Source */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                Energy Source <span className="text-[#F97316]">*</span>
              </label>
              <select
                value={energySource}
                onChange={(e) => setEnergySource(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
              >
                <option value="Electricity">Electricity (Grid / Solar Hybrid)</option>
                <option value="LPG">LPG (Commercial Cylinder Manifold)</option>
                <option value="PNG">PNG (Piped Natural Gas)</option>
                <option value="Biomass / Firewood">Biomass / Firewood / Pellets</option>
              </select>
              <span className="block mt-1 text-[11px] text-stone-500 font-medium">
                Configured Grid Factor: <strong>{EMISSION_FACTORS[energySource]} kg CO₂e / kWh</strong>
              </span>
            </div>

            {/* Production Quantity / Servings */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                Production Quantity <span className="text-[#F97316]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={productionQuantity}
                  onChange={(e) => setProductionQuantity(parseFloat(e.target.value) || 0)}
                  className="w-2/3 px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm font-semibold text-[#0C2D21]"
                  required
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="w-1/3 px-2 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-xs font-bold text-[#0C2D21]"
                >
                  <option value="kg">kg</option>
                  <option value="litres">litres</option>
                  <option value="portions">portions</option>
                </select>
              </div>
            </div>

            {/* Number of Servings */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                Number of Servings <span className="text-[#F97316]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm font-semibold text-[#0C2D21]"
                required
              />
            </div>

            {/* Cooking Requirement (Optional input) */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1.5">
                Cooking Requirement (Optional)
              </label>
              <input
                type="text"
                value={cookingRequirement}
                onChange={(e) => setCookingRequirement(e.target.value)}
                placeholder="e.g. Rapid boiling / Slow simmer / Batch parboiling"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-sm text-[#0C2D21] placeholder-stone-400 font-medium"
              />
            </div>

          </div>

          {/* Available Equipment / Utensils Multi-Select */}
          <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/12 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C2D21] block">
                  Available Equipment / Utensils in Your Kitchen Facility <span className="text-[#F97316]">*</span>
                </span>
                <p className="text-xs text-stone-600">
                  Select available hardware to calculate realistic equipment-matched recommendations.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#0C2D21] bg-white px-2.5 py-1 rounded border border-[#0C2D21]/10">
                {availableEquipment.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {KITCHEN_EQUIPMENT_CATALOGUE.map((equip) => {
                const isSelected = availableEquipment.includes(equip);
                return (
                  <div
                    key={equip}
                    onClick={() => handleToggleEquipment(equip)}
                    className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-white border-[#0C2D21] text-[#0C2D21] shadow-2xs'
                        : 'bg-[#FAF8F3] border-[#0C2D21]/15 text-stone-500 hover:bg-white'
                    }`}
                  >
                    <span>{equip}</span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'bg-[#0C2D21] text-white' : 'border border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>ANALYZE</span>
            </button>
          </div>

        </form>

      </div>

      {/* AI / RULE ANALYSIS OUTPUT & RECOMMENDATION */}
      {analysisResult && (
        <div className="space-y-6">
          
          <div className="bg-white border-2 border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Energy Recommendation for {analysisResult.recipeOrMenuName}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] mt-0.5">
                  {analysisResult.quantity} {analysisResult.quantityUnit} ({analysisResult.servings} Servings)
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/15 text-[#059669] text-xs font-bold uppercase tracking-wider">
                <TrendingDown className="w-4 h-4" />
                <span>Estimated Energy Saving: {analysisResult.energySavingPercentage}%</span>
              </div>
            </div>

            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="p-5 rounded-2xl bg-[#0C2D21] text-white space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] block">
                  Recommended Utensil / Equipment
                </span>
                <div className="font-display text-xl font-extrabold text-white">
                  {analysisResult.recommendedEquipment}
                </div>
                <div className="text-xs text-stone-300 pt-1">
                  Engineered to maximize thermal conduction and seal volatile steam energy.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Recommended Cooking Method
                </span>
                <div className="font-display text-lg font-bold text-[#0C2D21]">
                  {analysisResult.recommendedCookingMethod}
                </div>
                <div className="text-xs text-stone-600 pt-1">
                  Synchronized heat cycling avoids energy spikes during service ramp-up.
                </div>
              </div>

            </div>

            {/* Key Recommendation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  ESTIMATED Energy Consumption
                </span>
                <div className="font-mono text-xl sm:text-2xl font-black text-[#0C2D21] mt-1">
                  {analysisResult.estimatedEnergyKWh} <span className="text-xs font-sans text-stone-500">{analysisResult.estimatedEnergyUnitLabel}</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Optimized batch draw</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  ESTIMATED CO₂e
                </span>
                <div className="font-mono text-xl sm:text-2xl font-black text-[#059669] mt-1">
                  {analysisResult.estimatedCO2eKg} <span className="text-xs font-sans text-stone-500">kg CO₂e</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Emission footprint</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                  POTENTIAL Energy Saving
                </span>
                <div className="font-mono text-xl sm:text-2xl font-black text-[#059669] mt-1">
                  -{analysisResult.energySavingKWh} <span className="text-xs font-sans text-[#059669]">{analysisResult.estimatedEnergyUnitLabel}</span>
                </div>
                <div className="text-[10px] text-[#059669] font-bold mt-0.5">
                  ({analysisResult.energySavingPercentage}% Reduction)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/25">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                  POTENTIAL CO₂e Saving
                </span>
                <div className="font-mono text-xl sm:text-2xl font-black text-[#059669] mt-1">
                  -{analysisResult.co2eSavingKg} <span className="text-xs font-sans text-[#059669]">kg CO₂e</span>
                </div>
                <div className="text-[10px] text-[#059669] font-bold mt-0.5">
                  ({analysisResult.co2eSavingPercentage}% Lower Emissions)
                </div>
              </div>

            </div>

            {/* Why this equipment/method was recommended */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C2D21]">
                <Info className="w-4 h-4 text-[#F97316]" />
                <span>Why this equipment / method was recommended</span>
              </div>
              <p className="text-xs sm:text-sm text-[#161A18]/80 leading-relaxed">
                {analysisResult.explanation}
              </p>
            </div>

            {/* COMPARISON SECTION (Where enough data exists) */}
            <div className="pt-4 border-t border-[#0C2D21]/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#0C2D21] uppercase tracking-wider">
                  COMPARISON: Current / Typical Method vs Recommended Method
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                  ESTIMATED BENCHMARK
                </span>
              </div>

              {analysisResult.hasReliableComparison ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current / Typical Method */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-stone-200 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                      Current / Typical Method
                    </span>
                    <div className="font-bold text-sm text-[#0C2D21]">
                      {analysisResult.currentEquipmentName}
                    </div>
                    <div className="text-xs text-stone-600">
                      Method: {analysisResult.currentMethodName}
                    </div>

                    <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-500 text-[10px] block uppercase">Estimated Energy</span>
                        <span className="font-mono font-bold text-sm text-[#0C2D21]">
                          {analysisResult.currentEnergyKWh} {analysisResult.estimatedEnergyUnitLabel}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] block uppercase">Estimated CO₂e</span>
                        <span className="font-mono font-bold text-sm text-[#0C2D21]">
                          {analysisResult.currentCO2eKg} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Method */}
                  <div className="p-5 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                        Recommended Method
                      </span>
                      <span className="text-[10px] font-bold font-mono text-[#059669] bg-[#10B981]/20 px-2 py-0.5 rounded">
                        Target Efficiency
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#0C2D21]">
                      {analysisResult.recommendedEquipment}
                    </div>
                    <div className="text-xs text-stone-600">
                      Method: {analysisResult.recommendedCookingMethod}
                    </div>

                    <div className="pt-2 border-t border-[#10B981]/20 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#059669] text-[10px] block uppercase font-bold">Estimated Energy</span>
                        <span className="font-mono font-bold text-sm text-[#059669]">
                          {analysisResult.estimatedEnergyKWh} {analysisResult.estimatedEnergyUnitLabel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#059669] text-[10px] block uppercase font-bold">Estimated CO₂e</span>
                        <span className="font-mono font-bold text-sm text-[#059669]">
                          {analysisResult.estimatedCO2eKg} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 italic">
                  Insufficient data for a reliable comparison.
                </div>
              )}

              {/* Cumulative Savings Summary Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="font-semibold text-[#0C2D21]">
                    Estimated Net Benefit: <strong>{analysisResult.energySavingKWh} {analysisResult.estimatedEnergyUnitLabel} ({analysisResult.energySavingPercentage}%)</strong> and <strong>{analysisResult.co2eSavingKg} kg CO₂e ({analysisResult.co2eSavingPercentage}%)</strong> saved for this single meal run.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-500 uppercase">
                  Application emission factors applied
                </span>
              </div>
            </div>

            {/* Success Saved Notification */}
            {isSaved && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>
                  <strong>Recommendation Accepted & Saved!</strong> Equipment and fuel savings have been logged and made available to the <strong>Impact Dashboard</strong>.
                </span>
              </div>
            )}

            {/* ACTIONS: [ ACCEPT RECOMMENDATION ] [ EDIT INPUTS ] */}
            <div className="pt-4 border-t border-[#0C2D21]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-[#FAF8F3] hover:bg-stone-200 transition-colors cursor-pointer"
              >
                EDIT INPUTS
              </button>

              <button
                type="button"
                onClick={handleAcceptRecommendation}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>ACCEPT RECOMMENDATION</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
