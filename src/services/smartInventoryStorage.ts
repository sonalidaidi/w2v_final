export interface PantryItem {
  id: string;
  name: string;
  category: 'Grains & Pulses' | 'Vegetables & Perishables' | 'Oils & Spices' | 'Dairy & Essentials';
  availableQty: number;
  unit: string;
  minThreshold: number;
  lastUpdated: string;
}

export interface InventoryCalculationRow {
  ingredient: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  shortage: number; // > 0 if shortage
  surplus: number;  // > 0 if surplus
  status: 'SHORTAGE' | 'SURPLUS' | 'EXACT';
}

export interface SavedInventoryRequirement {
  id: string;
  planId?: string;
  recipeOrMenuName: string;
  productionQuantity: number;
  quantityUnit: string;
  servings: number;
  rows: InventoryCalculationRow[];
  totalShortageCount: number;
  totalSurplusCount: number;
  savedAt: string;
}

const PANTRY_STORAGE_KEY = 'w2v_pantry_inventory_records';
const SAVED_REQUIREMENTS_KEY = 'w2v_saved_inventory_requirements';

// Standard baseline real inventory records for an Institutional Kitchen facility
export const INITIAL_PANTRY_STOCK: PantryItem[] = [
  { id: 'pantry-1', name: 'Raw Basmati Rice', category: 'Grains & Pulses', availableQty: 45, unit: 'kg', minThreshold: 20, lastUpdated: new Date().toISOString() },
  { id: 'pantry-2', name: 'Toor Dal (Split Pigeon Pea)', category: 'Grains & Pulses', availableQty: 20, unit: 'kg', minThreshold: 10, lastUpdated: new Date().toISOString() },
  { id: 'pantry-3', name: 'Yellow Moong Dal', category: 'Grains & Pulses', availableQty: 18, unit: 'kg', minThreshold: 8, lastUpdated: new Date().toISOString() },
  { id: 'pantry-4', name: 'Whole Wheat Atta', category: 'Grains & Pulses', availableQty: 85, unit: 'kg', minThreshold: 30, lastUpdated: new Date().toISOString() },
  { id: 'pantry-5', name: 'Desi Chickpeas (Chana)', category: 'Grains & Pulses', availableQty: 32, unit: 'kg', minThreshold: 15, lastUpdated: new Date().toISOString() },
  { id: 'pantry-6', name: 'Onions & Country Tomatoes', category: 'Vegetables & Perishables', availableQty: 25, unit: 'kg', minThreshold: 15, lastUpdated: new Date().toISOString() },
  { id: 'pantry-7', name: 'Potatoes (Aloo)', category: 'Vegetables & Perishables', availableQty: 40, unit: 'kg', minThreshold: 20, lastUpdated: new Date().toISOString() },
  { id: 'pantry-8', name: 'Mixed Seasonal Vegetables (Cauliflower, Peas, Carrots)', category: 'Vegetables & Perishables', availableQty: 28, unit: 'kg', minThreshold: 15, lastUpdated: new Date().toISOString() },
  { id: 'pantry-9', name: 'Fresh Milk / Curd Base', category: 'Dairy & Essentials', availableQty: 35, unit: 'litres', minThreshold: 15, lastUpdated: new Date().toISOString() },
  { id: 'pantry-10', name: 'Cold Pressed Cooking Oil & Ghee', category: 'Oils & Spices', availableQty: 18, unit: 'litres', minThreshold: 10, lastUpdated: new Date().toISOString() },
  { id: 'pantry-11', name: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', category: 'Oils & Spices', availableQty: 14, unit: 'kg', minThreshold: 5, lastUpdated: new Date().toISOString() },
  { id: 'pantry-12', name: 'Paneer (Cottage Cheese)', category: 'Dairy & Essentials', availableQty: 12, unit: 'kg', minThreshold: 6, lastUpdated: new Date().toISOString() },
];

export const getPantryInventory = (): PantryItem[] => {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(INITIAL_PANTRY_STOCK));
      return INITIAL_PANTRY_STOCK;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PANTRY_STOCK;
  }
};

export const savePantryInventory = (items: PantryItem[]): void => {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pantry inventory', err);
  }
};

export const updateSinglePantryItem = (name: string, newAvailableQty: number, unit?: string): void => {
  const all = getPantryInventory();
  const normalized = name.trim().toLowerCase();
  const index = all.findIndex((item) => item.name.toLowerCase().includes(normalized) || normalized.includes(item.name.toLowerCase()));
  if (index !== -1) {
    all[index].availableQty = Math.max(0, newAvailableQty);
    all[index].lastUpdated = new Date().toISOString();
    if (unit) all[index].unit = unit;
  } else {
    // Add new pantry entry
    all.push({
      id: `pantry-${Date.now()}`,
      name: name.trim(),
      category: 'Grains & Pulses',
      availableQty: Math.max(0, newAvailableQty),
      unit: unit || 'kg',
      minThreshold: 5,
      lastUpdated: new Date().toISOString(),
    });
  }
  savePantryInventory(all);
};

export const getSavedInventoryRequirements = (): SavedInventoryRequirement[] => {
  try {
    const raw = localStorage.getItem(SAVED_REQUIREMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveInventoryRequirement = (req: SavedInventoryRequirement): void => {
  try {
    const all = getSavedInventoryRequirements();
    all.unshift(req);
    localStorage.setItem(SAVED_REQUIREMENTS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save inventory requirement', err);
  }
};

// Ingredient breakdown knowledge base for institutional recipes
// Yields raw ingredient ratios per 1 kg (or portion) of finished cooked food
export const RECIPE_BREAKDOWN_RULES: Record<string, Array<{ ingredient: string; ratio: number; unit: string }>> = {
  'rice': [
    { ingredient: 'Raw Basmati Rice', ratio: 0.85, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.04, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.02, unit: 'kg' },
  ],
  'pulao': [
    { ingredient: 'Raw Basmati Rice', ratio: 0.75, unit: 'kg' },
    { ingredient: 'Mixed Seasonal Vegetables (Cauliflower, Peas, Carrots)', ratio: 0.25, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.06, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.03, unit: 'kg' },
  ],
  'dal': [
    { ingredient: 'Toor Dal (Split Pigeon Pea)', ratio: 0.65, unit: 'kg' },
    { ingredient: 'Yellow Moong Dal', ratio: 0.25, unit: 'kg' },
    { ingredient: 'Onions & Country Tomatoes', ratio: 0.35, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.08, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.04, unit: 'kg' },
  ],
  'chana': [
    { ingredient: 'Desi Chickpeas (Chana)', ratio: 0.70, unit: 'kg' },
    { ingredient: 'Onions & Country Tomatoes', ratio: 0.40, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.08, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.05, unit: 'kg' },
  ],
  'curry': [
    { ingredient: 'Potatoes (Aloo)', ratio: 0.45, unit: 'kg' },
    { ingredient: 'Mixed Seasonal Vegetables (Cauliflower, Peas, Carrots)', ratio: 0.45, unit: 'kg' },
    { ingredient: 'Onions & Country Tomatoes', ratio: 0.30, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.07, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.04, unit: 'kg' },
  ],
  'paneer': [
    { ingredient: 'Paneer (Cottage Cheese)', ratio: 0.60, unit: 'kg' },
    { ingredient: 'Onions & Country Tomatoes', ratio: 0.40, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.08, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.04, unit: 'kg' },
  ],
  'roti': [
    { ingredient: 'Whole Wheat Atta', ratio: 0.04, unit: 'kg' }, // per portion
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.003, unit: 'litres' },
  ],
  'curd': [
    { ingredient: 'Fresh Milk / Curd Base', ratio: 1.0, unit: 'litres' },
  ],
  'generic': [
    { ingredient: 'Grains & Main Staple', ratio: 0.60, unit: 'kg' },
    { ingredient: 'Vegetables & Secondary Ingredients', ratio: 0.35, unit: 'kg' },
    { ingredient: 'Cold Pressed Cooking Oil & Ghee', ratio: 0.05, unit: 'litres' },
    { ingredient: 'Whole & Ground Spices (Cumin, Mustard, Turmeric, Salt)', ratio: 0.03, unit: 'kg' },
  ],
};
