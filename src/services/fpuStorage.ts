import { RecoveryListing, getRecoveryListings, addRecoveryListing } from './recoveryHubStorage';

// FPU PRODUCTION PLANNING
export interface FPUProductionPlan {
  id: string;
  productName: string;
  productCategory: string;
  expectedDemandUnits: number;
  productionQuantityUnits: number;
  unitType: string; // 'Units', 'Packs', 'Cans', 'Bottles', 'kg', 'L'
  productionDate: string;
  availableRawMaterials: string;
  productionSchedule?: string;
  
  // Results
  recommendedProductionUnits: number;
  productionBufferUnits: number;
  rawMaterialRequirementText: string;
  potentialExcessUnits: number;
  createdAt: string;
  status: 'DRAFT' | 'ACCEPTED';
}

// STORAGE MONITORING (SIMULATED IoT DATA)
export interface FPUStorageItem {
  id: string;
  productOrMaterial: string;
  quantity: number;
  unit: string;
  temperatureC: number;
  humidityPercent: number;
  optimalTempRange: [number, number]; // [min, max]
  optimalHumidityRange: [number, number]; // [min, max]
  timestamp: string;
  storageLocation: string;
  status: 'NORMAL' | 'CAUTION' | 'ALERT';
  alertReason?: string;
  dataSourceLabel: 'SIMULATED IoT DATA';
}

// MACHINE MONITORING (SIMULATED PLC/SCADA DATA)
export interface FPUMachineItem {
  id: string;
  name: string;
  type: string;
  status: 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'FAULT';
  runtimeHours: number;
  downtimeHours: number;
  powerKW: number;
  energyConsumptionKWh: number;
  productionRatePerHour: number;
  productionRateUnit: string;
  ratedCapacityPerHour: number;
  faultEventStatus: string;
  lastUpdate: string;
  dataSourceLabel: 'SIMULATED PLC/SCADA DATA';
}

// EXPIRY DETECTION
export interface FPUExpiryItem {
  id: string;
  productName: string;
  productCategory: string;
  packagingType: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate?: string; // YYYY-MM-DD
  quantity: number;
  unit: string;
  confidenceScore: number;
  isDateLegible: boolean;
  manualConfirmationRequired: boolean;
  shelfLifeStatus: 'SAFE / WITHIN RECORDED SHELF LIFE' | 'EXPIRING SOON' | 'EXPIRED' | 'MANUAL REVIEW REQUIRED';
  daysRemaining?: number;
  confirmedAt?: string;
  recoveryInitiated?: boolean;
  imagePreview?: string;
}

// FPU NOTIFICATIONS
export interface FPUNotification {
  id: string;
  type: 'STORAGE_ALERT' | 'MACHINE_ALERT' | 'EXPIRY_ALERT' | 'RECOVERY_MATCH' | 'BUYER_ACCEPTED' | 'PICKUP' | 'DELIVERY' | 'RECOVERY_COMPLETED';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  isRead: boolean;
  timestamp: string;
  actionRoute?: string;
  relatedEntityId?: string;
}

// STORAGE KEYS
const FPU_PLANS_KEY = 'w2v_fpu_production_plans';
const FPU_STORAGE_ITEMS_KEY = 'w2v_fpu_storage_items';
const FPU_MACHINES_KEY = 'w2v_fpu_machines';
const FPU_EXPIRY_ITEMS_KEY = 'w2v_fpu_expiry_items';
const FPU_NOTIFICATIONS_KEY = 'w2v_fpu_notifications';

// INITIAL SEED DATA FOR STORAGE
export const INITIAL_STORAGE_ITEMS: FPUStorageItem[] = [
  {
    id: 'store-1',
    productOrMaterial: 'Raw Pasteurized Milk Tanker Base',
    quantity: 1200,
    unit: 'L',
    temperatureC: 4.2,
    humidityPercent: 65,
    optimalTempRange: [2.0, 5.0],
    optimalHumidityRange: [50, 75],
    timestamp: new Date().toLocaleTimeString(),
    storageLocation: 'Chilled Silo Tank #2 (Dairy Processing Bay)',
    status: 'NORMAL',
    dataSourceLabel: 'SIMULATED IoT DATA',
  },
  {
    id: 'store-2',
    productOrMaterial: 'Fresh Packaged Paneer Blocks (200g)',
    quantity: 350,
    unit: 'kg',
    temperatureC: 6.8,
    humidityPercent: 88,
    optimalTempRange: [1.0, 4.5],
    optimalHumidityRange: [60, 80],
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(),
    storageLocation: 'Cold Room A (Finished Dairy Goods)',
    status: 'CAUTION',
    alertReason: 'Temperature elevated above 4.5°C threshold. Requires cooling compressor inspection.',
    dataSourceLabel: 'SIMULATED IoT DATA',
  },
  {
    id: 'store-3',
    productOrMaterial: 'Concentrated Tomato Paste Bulk Drums',
    quantity: 800,
    unit: 'kg',
    temperatureC: 18.5,
    humidityPercent: 55,
    optimalTempRange: [15.0, 22.0],
    optimalHumidityRange: [40, 65],
    timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
    storageLocation: 'Ambient Storage Rack R-04',
    status: 'NORMAL',
    dataSourceLabel: 'SIMULATED IoT DATA',
  },
  {
    id: 'store-4',
    productOrMaterial: 'Sterilized Alphonso Mango Fruit Pulp Tins',
    quantity: 450,
    unit: 'cans',
    temperatureC: 24.2,
    humidityPercent: 62,
    optimalTempRange: [18.0, 25.0],
    optimalHumidityRange: [45, 70],
    timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(),
    storageLocation: 'Dry Goods Warehouse Bay 3',
    status: 'NORMAL',
    dataSourceLabel: 'SIMULATED IoT DATA',
  },
];

// INITIAL SEED DATA FOR MACHINES
export const INITIAL_MACHINES: FPUMachineItem[] = [
  {
    id: 'mach-1',
    name: 'Continuous Plate Pasteurizer Unit (PLT-01)',
    type: 'Thermal Pasteurization',
    status: 'RUNNING',
    runtimeHours: 6.4,
    downtimeHours: 0.2,
    powerKW: 18.5,
    energyConsumptionKWh: 118.4,
    productionRatePerHour: 800,
    productionRateUnit: 'L/hr',
    ratedCapacityPerHour: 1000,
    faultEventStatus: 'Optimal Flow · HTST Holding Tube 72.5°C',
    lastUpdate: 'Just now',
    dataSourceLabel: 'SIMULATED PLC/SCADA DATA',
  },
  {
    id: 'mach-2',
    name: 'Form-Fill-Seal Vacuum Packaging Line (FFS-02)',
    type: 'Pouch Packaging',
    status: 'FAULT',
    runtimeHours: 4.1,
    downtimeHours: 1.3,
    powerKW: 0.8,
    energyConsumptionKWh: 32.8,
    productionRatePerHour: 0,
    productionRateUnit: 'packs/hr',
    ratedCapacityPerHour: 1200,
    faultEventStatus: 'Thermal Sealing Jaw Jam (Sensor E-402 tripped)',
    lastUpdate: '2 mins ago',
    dataSourceLabel: 'SIMULATED PLC/SCADA DATA',
  },
  {
    id: 'mach-3',
    name: 'Rotary Vacuum Evaporator & Concentrator (EVA-03)',
    type: 'Pulp Concentration',
    status: 'RUNNING',
    runtimeHours: 7.8,
    downtimeHours: 0.0,
    powerKW: 24.0,
    energyConsumptionKWh: 187.2,
    productionRatePerHour: 450,
    productionRateUnit: 'kg/hr',
    ratedCapacityPerHour: 500,
    faultEventStatus: 'Vacuum Level -0.85 bar stable',
    lastUpdate: '1 min ago',
    dataSourceLabel: 'SIMULATED PLC/SCADA DATA',
  },
  {
    id: 'mach-4',
    name: 'High-Speed Can Seaming & Capping Line (CSM-01)',
    type: 'Canning Automation',
    status: 'IDLE',
    runtimeHours: 2.5,
    downtimeHours: 0.8,
    powerKW: 2.1,
    energyConsumptionKWh: 16.5,
    productionRatePerHour: 0,
    productionRateUnit: 'cans/hr',
    ratedCapacityPerHour: 1500,
    faultEventStatus: 'Standby for Next Production Batch',
    lastUpdate: '8 mins ago',
    dataSourceLabel: 'SIMULATED PLC/SCADA DATA',
  },
];

// INITIAL SEED DATA FOR EXPIRY ITEMS
export const INITIAL_EXPIRY_ITEMS: FPUExpiryItem[] = [
  {
    id: 'exp-1',
    productName: 'Commercial Vacuum Paneer Blocks (200g)',
    productCategory: 'Dairy Products',
    packagingType: 'Multi-layer Barrier Pouch',
    batchNumber: 'LOT-DAIRY-26B',
    manufacturingDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], // 4 days remaining
    quantity: 65,
    unit: 'kg',
    confidenceScore: 94,
    isDateLegible: true,
    manualConfirmationRequired: false,
    shelfLifeStatus: 'EXPIRING SOON',
    daysRemaining: 4,
    confirmedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    imagePreview: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'exp-2',
    productName: 'Aseptic Alphonso Mango Pulp (Tin Cans 850g)',
    productCategory: 'Fruit Pulp & Puree',
    packagingType: 'Sanitary Food-Grade Tin Can',
    batchNumber: 'LOT-MGO-104A',
    manufacturingDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    quantity: 240,
    unit: 'cans',
    confidenceScore: 97,
    isDateLegible: true,
    manualConfirmationRequired: false,
    shelfLifeStatus: 'SAFE / WITHIN RECORDED SHELF LIFE',
    daysRemaining: 180,
    confirmedAt: new Date(Date.now() - 86400000).toISOString(),
    imagePreview: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80',
  },
];

// INITIAL NOTIFICATIONS
export const INITIAL_FPU_NOTIFICATIONS: FPUNotification[] = [
  {
    id: 'notif-1',
    type: 'MACHINE_ALERT',
    title: 'Machine Alert: FFS-02 Packaging Line Fault',
    message: 'Machine FFS-02 has entered FAULT status. Thermal sealing jaw jam detected by PLC sensor.',
    severity: 'CRITICAL',
    isRead: false,
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'STORAGE_ALERT',
    title: 'Storage Alert: Cold Room A Temperature Deviation',
    message: 'Temperature condition requires attention for stored product. Cold Room A registered 6.8°C (optimal ≤ 4.5°C).',
    severity: 'WARNING',
    isRead: false,
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'EXPIRY_ALERT',
    title: 'Expiry Alert: Paneer Batch LOT-DAIRY-26B Approaching Recorded Expiry',
    message: 'Product LOT-DAIRY-26B is approaching its recorded expiry date (4 days remaining). Eligible for rapid secondary buyer recovery.',
    severity: 'WARNING',
    isRead: false,
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'BUYER_ACCEPTED',
    title: 'Recovery Offer Accepted by Vidarbha Essential Oils',
    message: 'Buyer accepted Citrus & Lemon Peel Residue (25 kg). Route optimization is now ROUTE READY.',
    severity: 'INFO',
    isRead: true,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

// FPU STORAGE ACCESSORS
export const getFPUProductionPlans = (): FPUProductionPlan[] => {
  try {
    const raw = localStorage.getItem(FPU_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveFPUProductionPlan = (plan: FPUProductionPlan): void => {
  const current = getFPUProductionPlans();
  current.unshift(plan);
  localStorage.setItem(FPU_PLANS_KEY, JSON.stringify(current));
};

export const getFPUStorageItems = (): FPUStorageItem[] => {
  try {
    const raw = localStorage.getItem(FPU_STORAGE_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(FPU_STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_STORAGE_ITEMS));
      return INITIAL_STORAGE_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORAGE_ITEMS;
  }
};

export const saveFPUStorageItems = (items: FPUStorageItem[]): void => {
  localStorage.setItem(FPU_STORAGE_ITEMS_KEY, JSON.stringify(items));
};

export const getFPUMachines = (): FPUMachineItem[] => {
  try {
    const raw = localStorage.getItem(FPU_MACHINES_KEY);
    if (!raw) {
      localStorage.setItem(FPU_MACHINES_KEY, JSON.stringify(INITIAL_MACHINES));
      return INITIAL_MACHINES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MACHINES;
  }
};

export const saveFPUMachines = (machines: FPUMachineItem[]): void => {
  localStorage.setItem(FPU_MACHINES_KEY, JSON.stringify(machines));
};

export const getFPUExpiryItems = (): FPUExpiryItem[] => {
  try {
    const raw = localStorage.getItem(FPU_EXPIRY_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(FPU_EXPIRY_ITEMS_KEY, JSON.stringify(INITIAL_EXPIRY_ITEMS));
      return INITIAL_EXPIRY_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPIRY_ITEMS;
  }
};

export const saveFPUExpiryItems = (items: FPUExpiryItem[]): void => {
  localStorage.setItem(FPU_EXPIRY_ITEMS_KEY, JSON.stringify(items));
};

export const addFPUExpiryItem = (item: FPUExpiryItem): void => {
  const current = getFPUExpiryItems();
  current.unshift(item);
  saveFPUExpiryItems(current);
};

export const getFPUNotifications = (): FPUNotification[] => {
  try {
    const raw = localStorage.getItem(FPU_NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(FPU_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_FPU_NOTIFICATIONS));
      return INITIAL_FPU_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FPU_NOTIFICATIONS;
  }
};

export const saveFPUNotifications = (notifs: FPUNotification[]): void => {
  localStorage.setItem(FPU_NOTIFICATIONS_KEY, JSON.stringify(notifs));
};

export const addFPUNotification = (notif: Omit<FPUNotification, 'id' | 'timestamp' | 'isRead'>): void => {
  const all = getFPUNotifications();
  const newNotif: FPUNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    isRead: false,
    timestamp: new Date().toISOString(),
  };
  all.unshift(newNotif);
  saveFPUNotifications(all);
};

export const markFPUNotificationAsRead = (id: string): void => {
  const all = getFPUNotifications();
  const item = all.find((n) => n.id === id);
  if (item) {
    item.isRead = true;
    saveFPUNotifications(all);
  }
};

export const markAllFPUNotificationsAsRead = (): void => {
  const all = getFPUNotifications();
  all.forEach((n) => (n.isRead = true));
  saveFPUNotifications(all);
};
