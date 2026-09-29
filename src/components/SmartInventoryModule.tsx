import React, { useState, useEffect } from 'react';
import {
  SavedProductionPlan,
  getSavedProductionPlans,
  STANDARD_INSTITUTIONAL_FOODS,
} from '../services/smartPlanningStorage';
import {
  PantryItem,
  getPantryInventory,
  savePantryInventory,
  updateSinglePantryItem,
  InventoryCalculationRow,
  SavedInventoryRequirement,
  saveInventoryRequirement,
  RECIPE_BREAKDOWN_RULES,
} from '../services/smartInventoryStorage';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  Scale,
  Sparkles,
  Edit3,
  Save,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface SmartInventoryModuleProps {
  onRequirementSaved?: (req: SavedInventoryRequirement) => void;
}

export const SmartInventoryModule: React.FC<SmartInventoryModuleProps> = ({
  onRequirementSaved,
}) => {
  // 1. Load actual saved production plans from Smart Planning
  const [savedPlans, setSavedPlans] = useState<SavedProductionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('custom');

  // Input states
  const [recipeOrMenuName, setRecipeOrMenuName] = useState<string>('Basmati Steamed White Rice');
  const [productionQuantity, setProductionQuantity] = useState<number>(60);
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [servings, setServings] = useState<number>(650);

  // Active Pantry Stock loaded from database
  const [pantryStock, setPantryStock] = useState<PantryItem[]>([]);

  // Calculation Results
  const [calculatedRows, setCalculatedRows] = useState<InventoryCalculationRow[]>([]);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [savedRequirementSuccess, setSavedRequirementSuccess] = useState<boolean>(false);

  // Inline pantry update modal or edit row state
  const [isEditingPantry, setIsEditingPantry] = useState<boolean>(false);
  const [editableStock, setEditableStock] = useState<PantryItem[]>([]);
  const [pantryUpdatedNotice, setPantryUpdatedNotice] = useState<string | null>(null);

  // Load saved plans and live pantry stock on mount
  useEffect(() => {
    const plans = getSavedProductionPlans();
    setSavedPlans(plans);

    const stock = getPantryInventory();
    setPantryStock(stock);
    setEditableStock(stock);

    if (plans.length > 0) {
      const latest = plans[0];
      setSelectedPlanId(latest.id);
      applyPlanToInputs(latest);
    } else {
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
    setHasCalculated(false);
  };

  const handlePlanSelectChange = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId === 'custom') return;
    const match = savedPlans.find((p) => p.id === planId);
    if (match) {
      applyPlanToInputs(match);
    }
  };

  // Find matching available stock from the pantry database
  const getAvailableStockForIngredient = (ingName: string, currentStock: PantryItem[]): { qty: number; unit: string } => {
    const norm = ingName.toLowerCase();
    const match = currentStock.find((item) => {
      const itemNorm = item.name.toLowerCase();
      return itemNorm.includes(norm) || norm.includes(itemNorm) ||
        (norm.includes('rice') && itemNorm.includes('rice')) ||
        (norm.includes('dal') && itemNorm.includes('dal')) ||
        (norm.includes('oil') && itemNorm.includes('oil')) ||
        (norm.includes('spice') && itemNorm.includes('spice')) ||
        (norm.includes('curd') && itemNorm.includes('milk'));
    });

    if (match) {
      return { qty: match.availableQty, unit: match.unit };
    }
    return { qty: 0, unit: 'kg' };
  };

  // DYNAMIC REQUIREMENT CALCULATION
  const handleCalculateRequirements = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const currentStock = getPantryInventory();
    setPantryStock(currentStock);

    const nameLower = recipeOrMenuName.toLowerCase();
    const qty = productionQuantity || 1;

    // Check if the plan is an ENTER_RECIPE method with explicit custom ingredients
    const selectedPlan = savedPlans.find((p) => p.id === selectedPlanId);
    let rows: InventoryCalculationRow[] = [];

    if (selectedPlan && selectedPlan.recipeIngredients && selectedPlan.recipeIngredients.length > 0) {
      // Use exact saved recipe ingredient breakdown from Smart Planning
      rows = selectedPlan.recipeIngredients.map((ing) => {
        const requiredQty = Math.round((ing.totalRequired || (qty * (ing.quantity / 1000))) * 10) / 10;
        const stockData = getAvailableStockForIngredient(ing.name, currentStock);
        const availableQty = stockData.qty;
        const diff = Math.round((availableQty - requiredQty) * 10) / 10;

        let status: 'SHORTAGE' | 'SURPLUS' | 'EXACT' = 'EXACT';
        let shortage = 0;
        let surplus = 0;

        if (diff < 0) {
          status = 'SHORTAGE';
          shortage = Math.abs(diff);
        } else if (diff > 0) {
          status = 'SURPLUS';
          surplus = diff;
        }

        return {
          ingredient: ing.name,
          requiredQuantity: requiredQty,
          availableQuantity: availableQty,
          unit: 'kg',
          shortage,
          surplus,
          status,
        };
      });
    } else {
      // Use intelligent recipe breakdown rules based on recipe food name
      let ruleKey = 'generic';
      if (nameLower.includes('rice')) ruleKey = 'rice';
      else if (nameLower.includes('pulao') || nameLower.includes('biryani')) ruleKey = 'pulao';
      else if (nameLower.includes('dal') || nameLower.includes('sambar') || nameLower.includes('rasam')) ruleKey = 'dal';
      else if (nameLower.includes('chana') || nameLower.includes('chickpea')) ruleKey = 'chana';
      else if (nameLower.includes('curry') || nameLower.includes('aloo') || nameLower.includes('gobi')) ruleKey = 'curry';
      else if (nameLower.includes('paneer')) ruleKey = 'paneer';
      else if (nameLower.includes('roti') || nameLower.includes('chapati')) ruleKey = 'roti';
      else if (nameLower.includes('curd') || nameLower.includes('dahi')) ruleKey = 'curd';

      const breakdown = RECIPE_BREAKDOWN_RULES[ruleKey] || RECIPE_BREAKDOWN_RULES['generic'];

      rows = breakdown.map((item) => {
        const requiredQty = Math.round((qty * item.ratio) * 10) / 10;
        const stockData = getAvailableStockForIngredient(item.ingredient, currentStock);
        const availableQty = stockData.qty;
        const diff = Math.round((availableQty - requiredQty) * 10) / 10;

        let status: 'SHORTAGE' | 'SURPLUS' | 'EXACT' = 'EXACT';
        let shortage = 0;
        let surplus = 0;

        if (diff < 0) {
          status = 'SHORTAGE';
          shortage = Math.abs(diff);
        } else if (diff > 0) {
          status = 'SURPLUS';
          surplus = diff;
        }

        return {
          ingredient: item.ingredient,
          requiredQuantity: requiredQty,
          availableQuantity: availableQty,
          unit: item.unit,
          shortage,
          surplus,
          status,
        };
      });
    }

    setCalculatedRows(rows);
    setHasCalculated(true);
    setSavedRequirementSuccess(false);
  };

  // INVENTORY ACTION 1: SAVE REQUIREMENT
  const handleSaveRequirement = () => {
    if (calculatedRows.length === 0) return;

    const totalShortageCount = calculatedRows.filter((r) => r.status === 'SHORTAGE').length;
    const totalSurplusCount = calculatedRows.filter((r) => r.status === 'SURPLUS').length;

    const savedRecord: SavedInventoryRequirement = {
      id: `inv-req-${Date.now()}`,
      planId: selectedPlanId !== 'custom' ? selectedPlanId : undefined,
      recipeOrMenuName,
      productionQuantity,
      quantityUnit,
      servings,
      rows: calculatedRows,
      totalShortageCount,
      totalSurplusCount,
      savedAt: new Date().toISOString(),
    };

    saveInventoryRequirement(savedRecord);
    setSavedRequirementSuccess(true);
    if (onRequirementSaved) {
      onRequirementSaved(savedRecord);
    }
    setTimeout(() => setSavedRequirementSuccess(false), 4000);
  };

  // INVENTORY ACTION 2: UPDATE INVENTORY
  const handlePantryStockChange = (id: string, newQtyStr: string) => {
    const val = parseFloat(newQtyStr) || 0;
    setEditableStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, availableQty: val } : item))
    );
  };

  const handleSavePantryUpdates = () => {
    savePantryInventory(editableStock);
    setPantryStock(editableStock);
    setIsEditingPantry(false);
    setPantryUpdatedNotice('Inventory updated successfully in database.');
    setTimeout(() => setPantryUpdatedNotice(null), 3500);

    // Re-evaluate calculation if currently displayed
    if (hasCalculated) {
      handleCalculateRequirements();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Purpose Banner */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider mb-2">
              <Boxes className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Smart Inventory · Kitchen Resource Tracking</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] uppercase tracking-tight">
              SMART INVENTORY
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Use your saved recipe/menu and planned production quantity to tell the Institutional Kitchen exactly what ingredients are required, what is already available, what is short, and what is in excess.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingPantry(!isEditingPantry)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#0C2D21] text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white hover:bg-[#0C2D21] hover:text-white transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingPantry ? 'CLOSE INVENTORY EDITOR' : 'UPDATE INVENTORY'}</span>
          </button>
        </div>

        {pantryUpdatedNotice && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{pantryUpdatedNotice}</span>
          </div>
        )}

        {/* INVENTORY EDITOR PANEL (When UPDATE INVENTORY is toggled) */}
        {isEditingPantry && (
          <div className="mt-6 p-6 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/15 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-[#0C2D21] uppercase tracking-wider">
                  LIVE PANTRY STOCK DATABASE
                </h3>
                <p className="text-xs text-stone-600">
                  Update current physical pantry quantities. Changes are saved to database and used across all planning calculations.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSavePantryUpdates}
                className="px-5 py-2.5 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-[#10B981]" />
                <span>SAVE CHANGES TO DATABASE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {editableStock.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-white border border-[#0C2D21]/10 text-xs flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="font-bold text-[#0C2D21] block truncate">{item.name}</span>
                    <span className="text-[10px] text-stone-400 block">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.availableQty}
                      onChange={(e) => handlePantryStockChange(item.id, e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#0C2D21]/20 font-mono font-bold text-xs text-[#0C2D21] text-right"
                    />
                    <span className="text-[11px] font-semibold text-stone-500 w-8">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INPUT FORM: Saved Recipe / Menu & Production Quantity */}
        <form onSubmit={handleCalculateRequirements} className="mt-6 space-y-6">
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
                    <option value="custom">-- Custom Dish / Direct Entry --</option>
                  </optgroup>
                </select>

                <input
                  type="text"
                  value={recipeOrMenuName}
                  onChange={(e) => {
                    setRecipeOrMenuName(e.target.value);
                    setSelectedPlanId('custom');
                    setHasCalculated(false);
                  }}
                  placeholder="Recipe / Food Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0C2D21]/15 text-xs font-semibold text-[#0C2D21]"
                  required
                />
              </div>
            </div>

            {/* Production Quantity / Number of Servings */}
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
                  onChange={(e) => {
                    setProductionQuantity(parseFloat(e.target.value) || 0);
                    setHasCalculated(false);
                  }}
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

              <div className="mt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C2D21] mb-1">
                  Number of Servings
                </label>
                <input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => {
                    setServings(parseInt(e.target.value) || 0);
                    setHasCalculated(false);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/15 text-xs font-semibold text-[#0C2D21]"
                />
              </div>
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-[#10B981]" />
              <span>CALCULATE REQUIREMENTS</span>
            </button>
          </div>
        </form>

      </div>

      {/* RESULT TABLE: Ingredient, Required Quantity, Available Quantity, Shortage, Surplus */}
      {hasCalculated && calculatedRows.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-white border-2 border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0C2D21]/10 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Inventory Reconciliation Breakdown
                </span>
                <h2 className="font-display text-2xl font-extrabold text-[#0C2D21] mt-0.5">
                  {recipeOrMenuName} — {productionQuantity} {quantityUnit} ({servings} Servings)
                </h2>
              </div>

              {/* Status summary badges */}
              <div className="flex items-center gap-2">
                {calculatedRows.some((r) => r.status === 'SHORTAGE') && (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                    {calculatedRows.filter((r) => r.status === 'SHORTAGE').length} Item(s) Short
                  </span>
                )}
                {calculatedRows.some((r) => r.status === 'SURPLUS') && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider">
                    {calculatedRows.filter((r) => r.status === 'SURPLUS').length} Item(s) Surplus
                  </span>
                )}
              </div>
            </div>

            {/* Reconciliation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#0C2D21]/20 bg-[#FAF8F3]">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21]">Ingredient</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21] text-right">Required Quantity</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21] text-right">Available Quantity</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21] text-right">Shortage</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21] text-right">Surplus</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[#0C2D21] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0C2D21]/10">
                  {calculatedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-stone-50 transition-colors ${
                        row.status === 'SHORTAGE' ? 'bg-red-50/30' : row.status === 'SURPLUS' ? 'bg-green-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0C2D21]">
                        {row.ingredient}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0C2D21]">
                        {row.requiredQuantity} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-stone-700">
                        {row.availableQuantity} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-red-600">
                        {row.shortage > 0 ? (
                          <span>{row.shortage} {row.unit}</span>
                        ) : (
                          <span className="text-stone-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#059669]">
                        {row.surplus > 0 ? (
                          <span>+{row.surplus} {row.unit}</span>
                        ) : (
                          <span className="text-stone-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {row.status === 'SHORTAGE' && (
                          <span className="inline-block px-2.5 py-1 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                            SHORTAGE
                          </span>
                        )}
                        {row.status === 'SURPLUS' && (
                          <span className="inline-block px-2.5 py-1 rounded bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                            SURPLUS
                          </span>
                        )}
                        {row.status === 'EXACT' && (
                          <span className="inline-block px-2.5 py-1 rounded bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                            BALANCED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanation & Purpose Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-[#161A18]/80 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
              <div>
                <strong>Over-purchasing Prevention:</strong> Highlighted shortages indicate the minimum purchase requisitions needed for this production run. Surpluses indicate existing buffer in store—preventing duplicate purchasing and perishable spoilage.
              </div>
            </div>

            {/* Success Notification */}
            {savedRequirementSuccess && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>
                  <strong>Requirement Saved to Database!</strong> Sourcing shortages logged and made available to future planning cycles and procurement requisitions.
                </span>
              </div>
            )}

            {/* INVENTORY ACTIONS: [ UPDATE INVENTORY ] [ SAVE REQUIREMENT ] */}
            <div className="pt-4 border-t border-[#0C2D21]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPantry(true);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-[#FAF8F3] hover:bg-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#F97316]" />
                <span>UPDATE INVENTORY</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRequirement}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0C2D21] hover:bg-[#144432] active:bg-[#071C14] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>SAVE REQUIREMENT</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
