export interface SavedProductionPlan {
  id: string;
  method: 'MENU_SELECTION' | 'ENTER_RECIPE';
  date: string;
  day: string;
  meal: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  foodName: string;
  expectedPeople: number;
  eventOccasion?: string;
  predictedServings: number;
  recommendedQuantity: number;
  unit: 'kg' | 'litres' | 'portions';
  safetyBufferPercent: number;
  expectedSurplusRisk: 'Low' | 'Moderate' | 'High';
  expectedWasteRisk: 'Minimal' | 'Moderate' | 'Elevated';
  recommendationExplanation: string;
  recipeIngredients?: Array<{
    name: string;
    quantity: number;
    unit: string;
    totalRequired: number;
  }>;
  quantityPerPerson?: number;
  createdAt: string;
  syncedToInventory: boolean;
  syncedToEnergy: boolean;
}

export interface OptimizedMenuResult {
  id: string;
  date: string;
  day: string;
  meal: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  budgetPerPerson: number;
  dietaryPreference?: string;
  availableIngredients: string[];
  suggestions: Array<{
    id: string;
    currentItem: string;
    suggestedAlternative: string;
    currentCostPerPerson: number;
    suggestedCostPerPerson: number;
    costDifference: number; // negative means saved
    currentNutritionSummary: string;
    suggestedNutritionSummary: string;
    currentCO2eKg: number;
    suggestedCO2eKg: number;
    reasonForSuggestion: string;
    accepted: boolean;
  }>;
  totalCostDifference: number;
  totalCO2eDifference: number;
  analyzedAt: string;
}

const PRODUCTION_PLANS_KEY = 'w2v_saved_production_plans';
const OPTIMIZED_MENUS_KEY = 'w2v_saved_optimized_menus';

export const getSavedProductionPlans = (): SavedProductionPlan[] => {
  try {
    const raw = localStorage.getItem(PRODUCTION_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveProductionPlan = (plan: SavedProductionPlan): void => {
  try {
    const all = getSavedProductionPlans();
    // Prepend new plan
    all.unshift(plan);
    localStorage.setItem(PRODUCTION_PLANS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save production plan', err);
  }
};

export const getSavedOptimizedMenus = (): OptimizedMenuResult[] => {
  try {
    const raw = localStorage.getItem(OPTIMIZED_MENUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveOptimizedMenu = (menu: OptimizedMenuResult): void => {
  try {
    const all = getSavedOptimizedMenus();
    all.unshift(menu);
    localStorage.setItem(OPTIMIZED_MENUS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save optimized menu', err);
  }
};

// Available standard institutional menu items catalogue for Method A
export const STANDARD_INSTITUTIONAL_FOODS = [
  { name: 'Basmati Steamed White Rice', unit: 'kg' as const, basePerPerson: 0.08, category: 'Grain' },
  { name: 'Jeera Pulao', unit: 'kg' as const, basePerPerson: 0.09, category: 'Grain' },
  { name: 'Tadka Toor Dal', unit: 'kg' as const, basePerPerson: 0.045, category: 'Legume' },
  { name: 'Yellow Moong Dal', unit: 'kg' as const, basePerPerson: 0.04, category: 'Legume' },
  { name: 'Chana Masala', unit: 'kg' as const, basePerPerson: 0.065, category: 'Curry' },
  { name: 'Aloo Gobi Matar Curry', unit: 'kg' as const, basePerPerson: 0.075, category: 'Curry' },
  { name: 'Mixed Vegetable Curry', unit: 'kg' as const, basePerPerson: 0.07, category: 'Curry' },
  { name: 'Paneer Butter Masala', unit: 'kg' as const, basePerPerson: 0.06, category: 'Curry' },
  { name: 'Whole Wheat Chapati / Roti', unit: 'portions' as const, basePerPerson: 2.2, category: 'Bread' },
  { name: 'Puri', unit: 'portions' as const, basePerPerson: 2.5, category: 'Bread' },
  { name: 'Vegetable Upma', unit: 'kg' as const, basePerPerson: 0.09, category: 'Breakfast' },
  { name: 'Idli with Sambar', unit: 'portions' as const, basePerPerson: 3, category: 'Breakfast' },
  { name: 'Poha with Peanuts', unit: 'kg' as const, basePerPerson: 0.085, category: 'Breakfast' },
  { name: 'Fresh Set Curd / Dahi', unit: 'litres' as const, basePerPerson: 0.05, category: 'Dairy' },
  { name: 'Vegetable Raita', unit: 'litres' as const, basePerPerson: 0.06, category: 'Side' },
  { name: 'Tomato Vegetable Rasam', unit: 'litres' as const, basePerPerson: 0.08, category: 'Soup' },
];

export const INVENTORY_AVAILABLE_INGREDIENTS = [
  'Local Pearl Millet (Bajra)',
  'Finger Millet (Ragi)',
  'Foxtail Millet',
  'Organic Brown Rice',
  'Yellow Moong Dal',
  'Whole Green Moong',
  'Soybean Chunks',
  'Seasonal Bottle Gourd (Lauki)',
  'Spinach & Local Greens',
  'Country Tomatoes',
  'Desi Carrots',
  'Fresh Curd Starter',
  'Whole Wheat Grain',
  'Mustard Seed Oil',
  'Cold Pressed Sunflower Oil',
  'Jaggery Powder',
  'Rock Salt',
  'Turmeric & Whole Spices',
];
