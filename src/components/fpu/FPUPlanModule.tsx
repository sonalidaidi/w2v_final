import React, { useState } from 'react';
import {
  FPUProductionPlan,
  getFPUProductionPlans,
  saveFPUProductionPlan,
  addFPUNotification,
} from '../../services/fpuStorage';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Boxes,
} from 'lucide-react';

export const FPUPlanModule: React.FC = () => {
  // Input States
  const [productName, setProductName] = useState<string>('Vacuum Packaged Paneer (200g)');
  const [productCategory, setProductCategory] = useState<string>('Dairy & Value-Added Milk Products');
  const [expectedDemandUnits, setExpectedDemandUnits] = useState<number>(1200);
  const [productionQuantityUnits, setProductionQuantityUnits] = useState<number>(1350);
  const [unitType, setUnitType] = useState<string>('Packs (200g)');
  const [productionDate, setProductionDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availableRawMaterials, setAvailableRawMaterials] = useState<string>(
    '2,800 L Standardized Whole Buffalo Milk (6.5% Fat, 9.0% SNF) + 40 kg Citric Acid Coagulant'
  );
  const [productionSchedule, setProductionSchedule] = useState<string>(
    'Shift A (06:00 - 14:00) · Vat Pasteurization & Hydraulic Pressing'
  );

  // Result & Calculation State
  // "Do not show the result before the user presses the action button."
  const [calculationResult, setCalculationResult] = useState<{
    recommendedProductionUnits: number;
    expectedDemand: number;
    productionBuffer: number;
    rawMaterialRequirementText: string;
    potentialExcessUnits: number;
    bufferPercentage: number;
    wasteRiskLevel: 'MINIMAL' | 'MODERATE' | 'ELEVATED';
  } | null>(null);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [planAcceptedSuccess, setPlanAcceptedSuccess] = useState<boolean>(false);
  const [recentPlans, setRecentPlans] = useState<FPUProductionPlan[]>(() => getFPUProductionPlans());

  // Quick Preset Selector for FPU Products
  const handleSelectPreset = (
    name: string,
    category: string,
    demand: number,
    targetQty: number,
    unit: string,
    rawMat: string,
    schedule: string
  ) => {
    setProductName(name);
    setProductCategory(category);
    setExpectedDemandUnits(demand);
    setProductionQuantityUnits(targetQty);
    setUnitType(unit);
    setAvailableRawMaterials(rawMat);
    setProductionSchedule(schedule);
    setCalculationResult(null);
    setPlanAcceptedSuccess(false);
  };

  // STEP 1: CALCULATE / PLAN PRODUCTION
  const handlePlanProduction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setPlanAcceptedSuccess(false);

    setTimeout(() => {
      // Production buffer calculation: 5-8% safe operational buffer against packaging defects
      const recommendedBuffer = Math.round(expectedDemandUnits * 0.06);
      const recommendedQty = expectedDemandUnits + recommendedBuffer;
      const plannedQuantity = Number(productionQuantityUnits);
      const potentialExcess = Math.max(0, plannedQuantity - recommendedQty);
      const bufferPct = Math.round(((plannedQuantity - expectedDemandUnits) / expectedDemandUnits) * 100);

      let wasteRisk: 'MINIMAL' | 'MODERATE' | 'ELEVATED' = 'MINIMAL';
      if (bufferPct > 15) {
        wasteRisk = 'ELEVATED';
      } else if (bufferPct > 8) {
        wasteRisk = 'MODERATE';
      }

      // Raw Material calculation
      let rawMatReq = '';
      if (productCategory.includes('Dairy')) {
        const litersRequired = Math.round(plannedQuantity * 2.1);
        rawMatReq = `${litersRequired.toLocaleString()} Liters of Standardized Raw Milk required (${plannedQuantity} ${unitType})`;
      } else if (productCategory.includes('Fruit') || productCategory.includes('Pulp')) {
        const kgFruit = Math.round(plannedQuantity * 1.6);
        rawMatReq = `${kgFruit.toLocaleString()} kg Fresh Sorted Whole Fruits required for pulp extraction`;
      } else {
        const kgFlour = Math.round(plannedQuantity * 1.05);
        rawMatReq = `${kgFlour.toLocaleString()} kg Cleaned Grain Stock required (allowing 5% milling husk separation)`;
      }

      setCalculationResult({
        recommendedProductionUnits: recommendedQty,
        expectedDemand: expectedDemandUnits,
        productionBuffer: recommendedBuffer,
        rawMaterialRequirementText: rawMatReq,
        potentialExcessUnits: potentialExcess,
        bufferPercentage: bufferPct,
        wasteRiskLevel: wasteRisk,
      });

      setIsCalculating(false);
    }, 400);
  };

  // STEP 2: ACCEPT PLAN
  // "Only an accepted plan is saved."
  const handleAcceptPlan = () => {
    if (!calculationResult) return;

    const newPlan: FPUProductionPlan = {
      id: `fpu-plan-${Date.now()}`,
      productName,
      productCategory,
      expectedDemandUnits,
      productionQuantityUnits,
      unitType,
      productionDate,
      availableRawMaterials,
      productionSchedule,
      recommendedProductionUnits: calculationResult.recommendedProductionUnits,
      productionBufferUnits: calculationResult.productionBuffer,
      rawMaterialRequirementText: calculationResult.rawMaterialRequirementText,
      potentialExcessUnits: calculationResult.potentialExcessUnits,
      createdAt: new Date().toISOString(),
      status: 'ACCEPTED',
    };

    saveFPUProductionPlan(newPlan);
    setRecentPlans(getFPUProductionPlans());
    setPlanAcceptedSuccess(true);

    addFPUNotification({
      type: 'INFO' as any,
      title: `Production Plan Accepted: ${productName}`,
      message: `Production schedule locked for ${productionDate} (${productionQuantityUnits} ${unitType}). Buffer calibrated at +${calculationResult.productionBuffer} units.`,
      severity: 'INFO',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5 text-[#F97316]" />
              <span>FPU Smart Planning · Production Optimization</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              SMART PRODUCTION PLANNING
            </h2>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Industrial batch sizing and raw material balancing engine. Align processing quotas directly with committed commercial demand to eliminate post-packaging expiration and factory surplus.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-stone-500 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 shrink-0">
            FPU Module 1 of 6
          </div>
        </div>

        {/* Quick Batch Presets */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Presets:</span>
          <button
            type="button"
            onClick={() =>
              handleSelectPreset(
                'Vacuum Packaged Paneer (200g)',
                'Dairy & Value-Added Milk Products',
                1200,
                1350,
                'Packs (200g)',
                '2,800 L Standardized Whole Milk (6.5% Fat, 9.0% SNF)',
                'Shift A (06:00 - 14:00) · Vat Pasteurization & Pressing'
              )
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            Paneer 200g
          </button>
          <button
            type="button"
            onClick={() =>
              handleSelectPreset(
                'Aseptic Mango Fruit Pulp Cans (850g)',
                'Fruit & Pulp Processing',
                800,
                880,
                'Cans (850g)',
                '1,450 kg Sorted Alphonso Mangoes + 15 kg Sugar Syrup',
                'Shift B (14:00 - 22:00) · Thermal Blanching & Canning'
              )
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            Mango Pulp Cans
          </button>
          <button
            type="button"
            onClick={() =>
              handleSelectPreset(
                'Concentrated Tomato Puree (500g Glass Jars)',
                'Vegetable & Condiment Processing',
                1500,
                1600,
                'Jars (500g)',
                '3,200 kg Red Country Tomatoes + Citric Regulator',
                'Shift A (08:00 - 16:00) · Vacuum Concentration Line'
              )
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF8F3] hover:bg-stone-200 border border-stone-200 text-[#0C2D21] cursor-pointer"
          >
            Tomato Puree Jars
          </button>
        </div>
      </div>

      {/* Main Planning Form & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INPUT FORM (Left / 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
            <h3 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
              BATCH PARAMETERS
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Step 1: Input Production Quotas</span>
          </div>

          <form onSubmit={handlePlanProduction} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  placeholder="e.g. Pasteurised Paneer (200g)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Product Category *
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                >
                  <option value="Dairy & Value-Added Milk Products">Dairy & Value-Added Milk Products</option>
                  <option value="Fruit & Pulp Processing">Fruit & Pulp Processing</option>
                  <option value="Vegetable & Condiment Processing">Vegetable & Condiment Processing</option>
                  <option value="Grain Milling & Packaged Flours">Grain Milling & Packaged Flours</option>
                  <option value="Ready-to-Cook Retort Foods">Ready-to-Cook Retort Foods</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Expected Demand / Orders *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expectedDemandUnits}
                  onChange={(e) => setExpectedDemandUnits(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-mono font-bold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Production Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={productionQuantityUnits}
                  onChange={(e) => setProductionQuantityUnits(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-mono font-bold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  placeholder="e.g. 1350"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Unit Type *
                </label>
                <input
                  type="text"
                  required
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  placeholder="Packs / Cans / kg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Production Date *
                </label>
                <input
                  type="date"
                  required
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Optional Production Schedule
                </label>
                <input
                  type="text"
                  value={productionSchedule}
                  onChange={(e) => setProductionSchedule(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                  placeholder="e.g. Shift 1 (08:00 - 16:00)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Available Raw Materials & Feedstock *
              </label>
              <textarea
                rows={2}
                required
                value={availableRawMaterials}
                onChange={(e) => setAvailableRawMaterials(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FAF8F3] text-xs font-semibold text-[#0C2D21] focus:outline-none focus:ring-2 focus:ring-[#0C2D21]"
                placeholder="Specify bulk materials in silo or ambient staging"
              />
            </div>

            {/* ACTION BUTTON: [ PLAN PRODUCTION ] */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-3.5 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] active:bg-[#071C14] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-[#10B981]" />
                <span>{isCalculating ? 'Calculating Production Quotas...' : 'PLAN PRODUCTION'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS & ACCEPTANCE PANEL (Right / 5 cols) */}
        {/* "Do not show the result before the user presses the action button." */}
        <div className="lg:col-span-5 space-y-4">
          
          {!calculationResult ? (
            <div className="p-8 rounded-3xl bg-white border border-[#0C2D21]/15 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0C2D21]/5 text-[#0C2D21] flex items-center justify-center mx-auto">
                <Calculator className="w-6 h-6 text-[#10B981]" />
              </div>
              <h4 className="font-display text-sm font-extrabold text-[#0C2D21] uppercase">
                AWAITING BATCH PLANNING
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Configure your product orders and press <strong>"PLAN PRODUCTION"</strong> to calculate optimal batch volume, raw material allocation, and surplus risk.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#10B981] rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] block">
                    Calculated Result
                  </span>
                  <h4 className="font-display text-base font-extrabold text-[#0C2D21]">
                    PRODUCTION QUOTA RECOMMENDATION
                  </h4>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                  calculationResult.wasteRiskLevel === 'MINIMAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : calculationResult.wasteRiskLevel === 'MODERATE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {calculationResult.wasteRiskLevel} SURPLUS RISK
                </span>
              </div>

              {/* 5 Required Calculation Displays */}
              <div className="space-y-3 text-xs">
                
                <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">Recommended Production Quantity:</span>
                  <span className="font-mono font-black text-base text-[#059669]">
                    {calculationResult.recommendedProductionUnits.toLocaleString()} {unitType}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-semibold">Expected Commercial Demand:</span>
                  <span className="font-mono font-bold text-[#0C2D21]">
                    {calculationResult.expectedDemand.toLocaleString()} {unitType}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-semibold">Production Buffer (Rejection allowance):</span>
                  <span className="font-mono font-bold text-[#0C2D21]">
                    +{calculationResult.productionBuffer} {unitType} (+{calculationResult.bufferPercentage}%)
                  </span>
                </div>

                <div className="py-1.5 border-b border-stone-100 space-y-1">
                  <span className="text-stone-500 font-semibold block">Raw-Material Requirement:</span>
                  <span className="font-semibold text-[#0C2D21] block leading-tight">
                    {calculationResult.rawMaterialRequirementText}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-semibold">Potential Excess Production:</span>
                  <span className={`font-mono font-bold ${calculationResult.potentialExcessUnits > 0 ? 'text-amber-700' : 'text-[#059669]'}`}>
                    {calculationResult.potentialExcessUnits > 0
                      ? `${calculationResult.potentialExcessUnits} ${unitType} (Requires inventory tracking)`
                      : '0 Units (Balanced perfectly with demand)'}
                  </span>
                </div>

              </div>

              {/* ACTION: [ ACCEPT PLAN ] */}
              {planAcceptedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Plan Accepted & Scheduled!</strong> Production logged into factory operational records.
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAcceptPlan}
                  className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACCEPT PLAN & LOCK SCHEDULE</span>
                </button>
              )}

            </div>
          )}

          {/* Recent Accepted Plans */}
          {recentPlans.length > 0 && (
            <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#0C2D21]/10 text-xs font-bold text-[#0C2D21]">
                <span>RECENT ACCEPTED PLANS</span>
                <span className="text-stone-400 font-mono text-[10px]">{recentPlans.length} active</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {recentPlans.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8 space-y-1">
                    <div className="flex justify-between font-bold text-[#0C2D21]">
                      <span>{p.productName}</span>
                      <span className="font-mono text-[#059669]">{p.productionQuantityUnits} {p.unitType}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Date: {p.productionDate}</span>
                      <span>Buffer: +{p.productionBufferUnits} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
