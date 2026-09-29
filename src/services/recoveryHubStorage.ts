export interface RecoveryListing {
  id: string;
  type: 'RESOURCE_BYPRODUCT' | 'FOOD_SURPLUS';
  title: string;
  category: string;
  estimatedQuantity: number;
  quantityUnit: string;
  confirmedQuantity?: number;
  confidenceScore: number;
  detectedMaterialOrFood: string;
  sourceImage?: string;
  status: 'LISTED' | 'MATCHED' | 'OFFER_SENT' | 'ACCEPTED' | 'PICKUP_INITIATED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  qualityAssessment?: {
    method: 'MANUAL' | 'IOT_SENSOR';
    riskStatus: 'WITHIN CONTROL LIMITS' | 'CAUTION' | 'TIME-TEMPERATURE DEVIATION' | 'NOT ELIGIBLE FOR FOOD RECOVERY' | 'MANUAL FOOD-SAFETY REVIEW REQUIRED';
    currentTemperature?: number;
    elapsedHours?: number;
    vocIndex?: number;
    notes?: string;
    isEligibleForHumanConsumption: boolean;
  };
  matchedEntity?: {
    entityType: 'BUYER' | 'RECEIVER';
    isDemo: boolean;
    name: string;
    category: string;
    location: string;
    distanceKm: number;
    authorizedContact: string;
    contactNumber: string;
    pickupLocation: string;
    destination: string;
    matchReason: string;
  };
  createdAt: string;
  updatedAt: string;
}

const RECOVERY_LISTINGS_KEY = 'w2v_recovery_listings_db';

export const INITIAL_DEMO_RECOVERIES: RecoveryListing[] = [
  {
    id: 'rec-food-init-1',
    type: 'FOOD_SURPLUS',
    title: 'Nutritious Steamed Rice & Dal Khichdi',
    category: 'Cooked Surplus Meals (Vegetarian)',
    estimatedQuantity: 28,
    quantityUnit: 'kg',
    confidenceScore: 96,
    detectedMaterialOrFood: 'Cooked Steamed Rice & Dal',
    status: 'ACCEPTED',
    qualityAssessment: {
      method: 'IOT_SENSOR',
      riskStatus: 'WITHIN CONTROL LIMITS',
      currentTemperature: 68.5,
      elapsedHours: 1.2,
      isEligibleForHumanConsumption: true,
      notes: 'Maintained above hot-holding critical control limit (≥65°C). Safe consumption verified.',
    },
    matchedEntity: {
      entityType: 'RECEIVER',
      isDemo: true,
      name: 'Annapurna Seva Samiti (DEMO / SYNTHETIC RECEIVER)',
      category: 'Community Kitchen',
      location: 'Sitabuldi, Nagpur',
      distanceKm: 4.2,
      authorizedContact: 'Mahesh Joshi (Relief Coordinator)',
      contactNumber: '+91 98235 60114',
      pickupLocation: 'Kitchen Loading Bay 1, Central Dining Hall',
      destination: 'Community Food Center, Sitabuldi, Nagpur',
      matchReason: 'Immediate hunger relief requirement; insulated thermal transit available within 20 mins.',
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'rec-food-init-2',
    type: 'FOOD_SURPLUS',
    title: 'Fresh Chapati & Mixed Vegetable Curry',
    category: 'Cooked Surplus Meals (Vegetarian)',
    estimatedQuantity: 16,
    quantityUnit: 'kg',
    confidenceScore: 93,
    detectedMaterialOrFood: 'Whole Wheat Chapati & Sabzi',
    status: 'ACCEPTED',
    qualityAssessment: {
      method: 'IOT_SENSOR',
      riskStatus: 'WITHIN CONTROL LIMITS',
      currentTemperature: 66.0,
      elapsedHours: 1.5,
      isEligibleForHumanConsumption: true,
      notes: 'Inspected and certified within safe distribution window.',
    },
    matchedEntity: {
      entityType: 'RECEIVER',
      isDemo: true,
      name: 'Jeevan Jyoti Janhit NGO (DEMO / SYNTHETIC RECEIVER)',
      category: 'NGO',
      location: 'Sadar Bazar, Nagpur',
      distanceKm: 5.1,
      authorizedContact: 'Kiran Verma (Secretary)',
      contactNumber: '+91 97645 88203',
      pickupLocation: 'Kitchen Loading Bay 1, Central Dining Hall',
      destination: 'Behind District Court, Sadar, Nagpur',
      matchReason: 'Urgent night shelter dinner distribution.',
    },
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'rec-init-1',
    type: 'RESOURCE_BYPRODUCT',
    title: 'Citrus & Lemon Peel Residue',
    category: 'Citrus Peel Byproduct',
    estimatedQuantity: 25,
    quantityUnit: 'kg',
    confidenceScore: 94,
    detectedMaterialOrFood: 'Lemon Peel',
    status: 'ACCEPTED',
    matchedEntity: {
      entityType: 'BUYER',
      isDemo: true,
      name: 'Vidarbha Essential Oils & Citric Extracts (DEMO / SYNTHETIC BUYER)',
      category: 'Fragrance & Essential Oil Extraction',
      location: 'MIDC Butibori, Nagpur',
      distanceKm: 14.2,
      authorizedContact: 'Rameshwar Tawde (Procurement Lead)',
      contactNumber: '+91 98230 44120',
      pickupLocation: 'Kitchen Loading Bay 2, Central Store',
      destination: 'Plant Plot 42, Butibori Industrial Zone, Nagpur',
      matchReason: 'Material compatibility and 10–50 kg batch procurement demand.',
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'rec-init-2',
    type: 'RESOURCE_BYPRODUCT',
    title: 'Organic Carrot & Beetroot Peels',
    category: 'Vegetable Pomace & Peels',
    estimatedQuantity: 38,
    quantityUnit: 'kg',
    confidenceScore: 91,
    detectedMaterialOrFood: 'Root Vegetable Peels',
    status: 'COMPLETED',
    matchedEntity: {
      entityType: 'BUYER',
      isDemo: true,
      name: 'GreenEarth Bio-Pulp & Vermicompost Hub (DEMO / SYNTHETIC BUYER)',
      category: 'Organic Soil Nutrients',
      location: 'Wadi Agro Cluster, Nagpur',
      distanceKm: 8.5,
      authorizedContact: 'Sunil Deshmukh',
      contactNumber: '+91 94221 77319',
      pickupLocation: 'Kitchen Compost Transfer Station',
      destination: 'GreenEarth Unit 3, Wadi, Nagpur',
      matchReason: 'Continuous daily demand for clean organic root peel feedstock.',
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const getRecoveryListings = (): RecoveryListing[] => {
  try {
    const raw = localStorage.getItem(RECOVERY_LISTINGS_KEY);
    if (!raw) {
      localStorage.setItem(RECOVERY_LISTINGS_KEY, JSON.stringify(INITIAL_DEMO_RECOVERIES));
      return INITIAL_DEMO_RECOVERIES;
    }
    const parsed: RecoveryListing[] = JSON.parse(raw);
    // If older storage was initialized before food recoveries were seeded, ensure both flows have initial accepted samples
    const hasFood = parsed.some((l) => l.type === 'FOOD_SURPLUS');
    if (!hasFood) {
      const merged = [...INITIAL_DEMO_RECOVERIES.filter(l => l.type === 'FOOD_SURPLUS'), ...parsed];
      localStorage.setItem(RECOVERY_LISTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_DEMO_RECOVERIES;
  }
};

export const saveRecoveryListings = (listings: RecoveryListing[]): void => {
  try {
    localStorage.setItem(RECOVERY_LISTINGS_KEY, JSON.stringify(listings));
  } catch (err) {
    console.error('Failed to save recovery listings', err);
  }
};

export const addRecoveryListing = (listing: RecoveryListing): void => {
  const current = getRecoveryListings();
  current.unshift(listing);
  saveRecoveryListings(current);
};

export const updateRecoveryListingStatus = (
  id: string,
  status: RecoveryListing['status'],
  matchedEntity?: RecoveryListing['matchedEntity']
): void => {
  const current = getRecoveryListings();
  const index = current.findIndex((item) => item.id === id);
  if (index !== -1) {
    current[index].status = status;
    current[index].updatedAt = new Date().toISOString();
    if (matchedEntity) {
      current[index].matchedEntity = matchedEntity;
    }
    saveRecoveryListings(current);
  }
};

// DEMO / SYNTHETIC BUYERS FOR RESOURCE RECOVERY
export interface DemoBuyer {
  name: string;
  label: string;
  category: string;
  acceptedMaterials: string[];
  minQtyKg: number;
  maxQtyKg: number;
  location: string;
  distanceKm: number;
  contactName: string;
  phone: string;
}

export const DEMO_SYNTHETIC_BUYERS: DemoBuyer[] = [
  {
    name: 'Nagpur Natural Fragrance & Pectin Works',
    label: 'DEMO / SYNTHETIC BUYER',
    category: 'Essential Oils & Citrus Extraction',
    acceptedMaterials: ['lemon peel', 'orange peel', 'citrus peel', 'fruit peel'],
    minQtyKg: 10,
    maxQtyKg: 80,
    location: 'MIDC Butibori, Nagpur',
    distanceKm: 12.4,
    contactName: 'Anil Gokhale (Sourcing Manager)',
    phone: '+91 98220 84931',
  },
  {
    name: 'Maha-Biomass Pellet & Soil Conditioning Co.',
    label: 'DEMO / SYNTHETIC BUYER',
    category: 'Biomass & Industrial Soil Enhancers',
    acceptedMaterials: ['vegetable peel', 'carrot peel', 'beetroot peel', 'onion skin', 'vegetable scraps'],
    minQtyKg: 20,
    maxQtyKg: 200,
    location: 'Hingna Industrial Estate, Nagpur',
    distanceKm: 9.1,
    contactName: 'Pravin Khare (Operations Officer)',
    phone: '+91 97632 11940',
  },
  {
    name: 'Vidarbha Bio-Dye & Pigment Innovators',
    label: 'DEMO / SYNTHETIC BUYER',
    category: 'Natural Fabric Dye & Food-grade Pigment',
    acceptedMaterials: ['beetroot peel', 'onion skin', 'pomegranate peel', 'spinach stalk'],
    minQtyKg: 5,
    maxQtyKg: 60,
    location: 'Kalmeshwar Road, Nagpur',
    distanceKm: 15.6,
    contactName: 'Dr. Smita Bapat (R&D Director)',
    phone: '+91 98901 32884',
  },
];

// DEMO / SYNTHETIC RECEIVERS FOR FOOD RECOVERY (SURPLUS DONATION ONLY)
export interface DemoReceiver {
  name: string;
  label: string;
  type: 'NGO' | 'Food Bank' | 'Shelter' | 'Community Kitchen';
  location: string;
  distanceKm: number;
  capacityMeals: number;
  availability: string;
  contactPerson: string;
  contactPhone: string;
  phone: string;
  pickupAddress: string;
}

export const DEMO_SYNTHETIC_RECEIVERS: DemoReceiver[] = [
  {
    name: 'Annapurna Seva Samiti (DEMO / SYNTHETIC RECEIVER)',
    label: 'DEMO / SYNTHETIC RECEIVER',
    type: 'Community Kitchen',
    location: 'Sitabuldi, Nagpur',
    distanceKm: 4.2,
    capacityMeals: 450,
    availability: 'Immediate Pickup (Van dispatched in 20 mins)',
    contactPerson: 'Mahesh Joshi (Relief Coordinator)',
    contactPhone: '+91 98235 60114',
    phone: '+91 98235 60114',
    pickupAddress: 'Plot 12, West High Court Rd, Dharampeth, Nagpur',
  },
  {
    name: 'Nagpur Shanti Ashray Children’s Shelter (DEMO / SYNTHETIC RECEIVER)',
    label: 'DEMO / SYNTHETIC RECEIVER',
    type: 'Shelter',
    location: 'Manish Nagar, Nagpur',
    distanceKm: 6.8,
    capacityMeals: 180,
    availability: 'Available for evening dinner distribution',
    contactPerson: 'Sister Theresa / Ashok Meshram',
    contactPhone: '+91 94228 19022',
    phone: '+91 94228 19022',
    pickupAddress: 'Near Railway Crossing, Manish Nagar, Nagpur',
  },
  {
    name: 'Vidarbha Food Relief & Hunger Bank (DEMO / SYNTHETIC RECEIVER)',
    label: 'DEMO / SYNTHETIC RECEIVER',
    type: 'Food Bank',
    location: 'MIDC Hingna, Nagpur',
    distanceKm: 8.5,
    capacityMeals: 1200,
    availability: 'Insulated thermal transit vehicle on standby',
    contactPerson: 'Sanjay Deshpande (Logistics Officer)',
    contactPhone: '+91 98810 42398',
    phone: '+91 98810 42398',
    pickupAddress: 'Sector B-4, Hingna Industrial Zone, Nagpur',
  },
  {
    name: 'Jeevan Jyoti Janhit NGO (DEMO / SYNTHETIC RECEIVER)',
    label: 'DEMO / SYNTHETIC RECEIVER',
    type: 'NGO',
    location: 'Sadar Bazar, Nagpur',
    distanceKm: 5.1,
    capacityMeals: 320,
    availability: 'Available immediately for night shelter feeding',
    contactPerson: 'Kiran Verma (Secretary)',
    contactPhone: '+91 97645 88203',
    phone: '+91 97645 88203',
    pickupAddress: 'Behind District Court, Sadar, Nagpur',
  },
];
