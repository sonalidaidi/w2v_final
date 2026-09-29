export interface SavedEnergyAnalysis {
  id: string;
  planId?: string;
  recipeOrMenuName: string;
  quantity: number;
  quantityUnit: string;
  servings: number;
  energySource: 'Electricity' | 'LPG' | 'PNG' | 'Biomass / Firewood';
  selectedEquipment: string[];
  cookingRequirement?: string;
  
  // Recommended
  recommendedEquipment: string;
  recommendedCookingMethod: string;
  estimatedEnergyKWh: number;
  estimatedEnergyUnitLabel: string;
  estimatedCO2eKg: number;
  
  // Current / Typical
  currentMethodName: string;
  currentEquipmentName: string;
  currentEnergyKWh: number;
  currentCO2eKg: number;
  
  // Savings
  energySavingKWh: number;
  energySavingPercentage: number;
  co2eSavingKg: number;
  co2eSavingPercentage: number;
  
  explanation: string;
  hasReliableComparison: boolean;
  savedAt: string;
}

const SAVED_ENERGY_KEY = 'w2v_saved_energy_recommendations';

export const getSavedEnergyAnalyses = (): SavedEnergyAnalysis[] => {
  try {
    const raw = localStorage.getItem(SAVED_ENERGY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveEnergyAnalysis = (analysis: SavedEnergyAnalysis): void => {
  try {
    const all = getSavedEnergyAnalyses();
    all.unshift(analysis);
    localStorage.setItem(SAVED_ENERGY_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save energy analysis', err);
  }
};

// Institutional Kitchen standard emission factors:
// Electricity (Grid average India/regional): ~0.82 kg CO2e per kWh
// LPG: ~1.51 kg CO2e per kg of LPG, approx 0.23 kg CO2e per thermal kWh equivalent
export const EMISSION_FACTORS = {
  Electricity: 0.82, // kg CO2e per kWh
  LPG: 0.23,         // kg CO2e per kWh equivalent (commercial burner efficiency accounted)
  PNG: 0.20,         // kg CO2e per kWh equivalent
  'Biomass / Firewood': 0.38,
};

export const KITCHEN_EQUIPMENT_CATALOGUE = [
  'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)',
  'Commercial Pressure Boiling Steam Kettle',
  'Commercial Multi-Deck Steam Cooker',
  'Heavy-Duty Induction Wok / Boiling Range',
  'High-Pressure Atmospheric LPG Burner Bhatti',
  'Open Flame Cast-Iron Kadai / Degchi',
  'Combination Convection Steam Oven',
  'Direct-Fired Open Boiling Cauldron (Aluminium)',
  'Insulated Steam Rice Boiler Jacketed Pan',
  'Double-Jacketing Dal Simmering Vat',
  'Rotary Roti Puffer & Hotplate',
];
