import { RecoveryListing, getRecoveryListings } from './recoveryHubStorage';
import { SavedEnergyAnalysis, getSavedEnergyAnalyses } from './smartEnergyStorage';
import { SavedProductionPlan, getSavedProductionPlans, getSavedOptimizedMenus, OptimizedMenuResult } from './smartPlanningStorage';
import { StoredRegistration, getStoredRegistrations } from './registrationStorage';

export type ImpactDateFilter = 'TODAY' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export interface DateFilterRange {
  filter: ImpactDateFilter;
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string;   // YYYY-MM-DD
}

export interface ImpactSummaryMetrics {
  foodRescuedKg: number;
  foodDonatedKg: number;
  deliveriesCompletedCount: number;
  wastePreventedKg: number;
  resourcesRecoveredKg: number;
  energySavedKWh: number;
  estimatedCO2eAvoidedKg: number;
  moneySavedInr: number;
  impactPoints: number;

  hasFoodRescuedData: boolean;
  hasFoodDonatedData: boolean;
  hasDeliveriesData: boolean;
  hasWastePreventedData: boolean;
  hasResourcesRecoveredData: boolean;
  hasEnergySavedData: boolean;
  hasCO2eData: boolean;
  hasMoneySavedData: boolean;
}

export interface FoodRecoveryMetrics {
  totalFoodRescuedKg: number;
  totalFoodDonatedKg: number;
  wastePreventedKg: number;
  completedFoodDeliveriesCount: number;
  completedRecoveriesCount: number;
  hasCompletedData: boolean;
  timelineChartData: Array<{
    dateLabel: string;
    rawDate: string;
    foodRescuedKg: number;
  }>;
}

export interface ResourceCategoryBreakdown {
  category: string;
  quantityKg: number;
  percentage: number;
  deliveriesCount: number;
}

export interface ResourceRecoveryMetrics {
  totalResourcesRecoveredKg: number;
  completedResourceRecoveriesCount: number;
  hasCompletedData: boolean;
  categories: ResourceCategoryBreakdown[];
}

export interface EnergyImpactMetrics {
  estimatedEnergySavedKWh: number;
  estimatedCO2eAvoidedKg: number;
  moneySavedInr: number;
  recordedAnalysesCount: number;
  hasRecordedData: boolean;
  bySource: Array<{
    source: string;
    savedKWh: number;
    savedCO2eKg: number;
  }>;
}

export interface RecentImpactActivityItem {
  id: string;
  type: 'FOOD_RECOVERY_COMPLETED' | 'RESOURCE_RECOVERY_COMPLETED' | 'ENERGY_SAVING_RECORDED';
  title: string;
  subtitle: string;
  partnerOrTarget?: string;
  quantityOrMetric: string;
  timestamp: string;
}

export interface ImpactDashboardData {
  summary: ImpactSummaryMetrics;
  foodRecovery: FoodRecoveryMetrics;
  resourceRecovery: ResourceRecoveryMetrics;
  energyImpact: EnergyImpactMetrics;
  leaderboardRank: {
    rankText: string;
    hasEnoughData: boolean;
    totalPoints: number;
  };
  sustainabilitySummary: {
    foodWastePreventedKg: number;
    resourcesRecoveredKg: number;
    estimatedEnergySavedKWh: number;
    estimatedCO2eAvoidedKg: number;
    completedRecoveryActivitiesCount: number;
    hasAnyData: boolean;
  };
  recentActivities: RecentImpactActivityItem[];
  hasAnyCompletedActivity: boolean;
  isUsingDemoData: boolean;
  demoNoticeText: string;
}

/**
 * Filter an ISO date string against the selected period
 */
export const isDateWithinFilter = (
  isoDateStr: string,
  range: DateFilterRange
): boolean => {
  if (!isoDateStr) return false;
  const targetDate = new Date(isoDateStr);
  if (isNaN(targetDate.getTime())) return false;

  const now = new Date();

  switch (range.filter) {
    case 'TODAY': {
      return (
        targetDate.getFullYear() === now.getFullYear() &&
        targetDate.getMonth() === now.getMonth() &&
        targetDate.getDate() === now.getDate()
      );
    }
    case 'THIS_MONTH': {
      return (
        targetDate.getFullYear() === now.getFullYear() &&
        targetDate.getMonth() === now.getMonth()
      );
    }
    case 'THIS_YEAR': {
      return targetDate.getFullYear() === now.getFullYear();
    }
    case 'CUSTOM': {
      if (!range.customStartDate && !range.customEndDate) return true;
      const start = range.customStartDate
        ? new Date(`${range.customStartDate}T00:00:00`)
        : new Date(0);
      const end = range.customEndDate
        ? new Date(`${range.customEndDate}T23:59:59`)
        : new Date(8640000000000000);
      return targetDate >= start && targetDate <= end;
    }
    default:
      return true;
  }
};

/**
 * Demo / Synthetic completed activities strictly specified for Institutional Kitchen Impact Dashboard
 */
export const getDemoCompletedRecoveries = (): RecoveryListing[] => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return [
    // 1. FOOD RECOVERY — COMPLETED
    {
      id: 'demo-completed-rec-1',
      type: 'FOOD_SURPLUS',
      title: 'Cooked Rice (DEMO DATA)',
      category: 'Cooked Surplus Meals (Vegetarian)',
      estimatedQuantity: 25,
      confirmedQuantity: 25,
      quantityUnit: 'kg',
      confidenceScore: 98,
      detectedMaterialOrFood: 'Cooked Rice',
      status: 'COMPLETED',
      qualityAssessment: {
        method: 'IOT_SENSOR',
        riskStatus: 'WITHIN CONTROL LIMITS',
        currentTemperature: 67.5,
        elapsedHours: 1.1,
        isEligibleForHumanConsumption: true,
        notes: 'Maintained above hot-holding critical control limit (≥65°C). Safe consumption verified.',
      },
      matchedEntity: {
        entityType: 'RECEIVER',
        isDemo: true,
        name: 'DEMO NGO A',
        category: 'NGO',
        location: 'Sitabuldi Relief Camp, Nagpur',
        distanceKm: 3.5,
        authorizedContact: 'Coordinator (DEMO NGO A)',
        contactNumber: '+91 98000 00001',
        pickupLocation: 'Kitchen Loading Bay 1, Central Dining Hall',
        destination: 'DEMO NGO A Community Center',
        matchReason: 'Immediate hunger relief requirement; insulated thermal transit completed.',
      },
      createdAt: `${todayStr}T09:30:00.000Z`,
      updatedAt: `${todayStr}T11:15:00.000Z`,
    },
    // 2. FOOD RECOVERY — COMPLETED
    {
      id: 'demo-completed-rec-2',
      type: 'FOOD_SURPLUS',
      title: 'Dal (DEMO DATA)',
      category: 'Cooked Surplus Meals (Vegetarian)',
      estimatedQuantity: 15,
      confirmedQuantity: 15,
      quantityUnit: 'kg',
      confidenceScore: 97,
      detectedMaterialOrFood: 'Dal',
      status: 'COMPLETED',
      qualityAssessment: {
        method: 'IOT_SENSOR',
        riskStatus: 'WITHIN CONTROL LIMITS',
        currentTemperature: 66.0,
        elapsedHours: 1.4,
        isEligibleForHumanConsumption: true,
        notes: 'Inspected and certified within safe distribution window.',
      },
      matchedEntity: {
        entityType: 'RECEIVER',
        isDemo: true,
        name: 'DEMO FOOD BANK A',
        category: 'Food Bank',
        location: 'Sadar Shelter Point, Nagpur',
        distanceKm: 4.8,
        authorizedContact: 'Volunteer Lead (DEMO FOOD BANK A)',
        contactNumber: '+91 98000 00002',
        pickupLocation: 'Kitchen Loading Bay 1, Central Dining Hall',
        destination: 'DEMO FOOD BANK A Distribution Center',
        matchReason: 'Community hot-meal nourishment drive completed.',
      },
      createdAt: `${todayStr}T10:00:00.000Z`,
      updatedAt: `${todayStr}T12:00:00.000Z`,
    },
    // 3. RESOURCE RECOVERY — COMPLETED
    {
      id: 'demo-completed-rec-3',
      type: 'RESOURCE_BYPRODUCT',
      title: 'Lemon Peel (DEMO DATA)',
      category: 'Fruit/vegetable by-products',
      estimatedQuantity: 20,
      confirmedQuantity: 20,
      quantityUnit: 'kg',
      confidenceScore: 96,
      detectedMaterialOrFood: 'Lemon Peel',
      status: 'COMPLETED',
      matchedEntity: {
        entityType: 'BUYER',
        isDemo: true,
        name: 'DEMO RESOURCE INDUSTRY A',
        category: 'Industrial Extraction / Bio-Processing',
        location: 'MIDC Bio-Industrial Zone, Nagpur',
        distanceKm: 12.0,
        authorizedContact: 'Procurement Rep (DEMO RESOURCE INDUSTRY A)',
        contactNumber: '+91 98000 00003',
        pickupLocation: 'Kitchen Loading Bay 2, Byproduct Collection',
        destination: 'DEMO RESOURCE INDUSTRY A Bio-Processing Plant',
        matchReason: 'Clean citrus peel recovery for essential oils and organic citric acids.',
      },
      createdAt: `${todayStr}T08:15:00.000Z`,
      updatedAt: `${todayStr}T10:45:00.000Z`,
    },
  ];
};

export const getDemoSavedEnergyAnalyses = (): SavedEnergyAnalysis[] => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return [
    // 4. ENERGY SAVING — COMPLETED/RECORDED
    {
      id: 'demo-energy-rec-1',
      recipeOrMenuName: 'Smart Energy Demo',
      quantity: 1,
      quantityUnit: 'batch',
      servings: 250,
      energySource: 'Electricity',
      selectedEquipment: ['Direct-Fired Open Boiling Cauldron (Aluminium)'],
      recommendedEquipment: 'Commercial Pressure Boiling Steam Kettle',
      recommendedCookingMethod: 'Pressurized closed-jacket steam boiling',
      estimatedEnergyKWh: 8.8,
      estimatedEnergyUnitLabel: 'kWh',
      estimatedCO2eKg: 3.8,
      currentMethodName: 'Direct open flame boiling',
      currentEquipmentName: 'Direct-Fired Cauldron',
      currentEnergyKWh: 12.0,
      currentCO2eKg: 5.2,
      energySavingKWh: 3.2,
      energySavingPercentage: 26.7,
      co2eSavingKg: 1.4,
      co2eSavingPercentage: 26.9,
      explanation: 'Smart Energy Demo: Pressurized batch boiling reduces thermal dissipation. ESTIMATED / DEMO DATA.',
      hasReliableComparison: true,
      savedAt: `${todayStr}T09:00:00.000Z`,
    },
    // 5. ANOTHER ENERGY RECORD
    {
      id: 'demo-energy-rec-2',
      recipeOrMenuName: 'Smart Energy Demo (Simmering & Heat Retention)',
      quantity: 1,
      quantityUnit: 'batch',
      servings: 180,
      energySource: 'Electricity',
      selectedEquipment: ['Open Flame Cast-Iron Kadai / Degchi'],
      recommendedEquipment: 'Tilting Bratt Pan (Heavy-Duty Multi-Cooker)',
      recommendedCookingMethod: 'Multi-deck insulated simmering with lid lock',
      estimatedEnergyKWh: 6.2,
      estimatedEnergyUnitLabel: 'kWh',
      estimatedCO2eKg: 2.6,
      currentMethodName: 'Uninsulated open simmering',
      currentEquipmentName: 'Open Cast-Iron Kadai',
      currentEnergyKWh: 9.0,
      currentCO2eKg: 3.8,
      energySavingKWh: 2.8,
      energySavingPercentage: 31.1,
      co2eSavingKg: 1.2,
      co2eSavingPercentage: 31.6,
      explanation: 'Smart Energy Demo: Insulated multi-deck simmering optimization. ESTIMATED / DEMO DATA.',
      hasReliableComparison: true,
      savedAt: `${todayStr}T13:30:00.000Z`,
    },
  ];
};

/**
 * Calculate the complete, strictly data-driven Impact Dashboard analytics
 */
export const calculateImpactDashboardData = (
  range: DateFilterRange,
  orgEmail?: string
): ImpactDashboardData => {
  // 1. Fetch raw records from existing databases
  const rawRecoveries = getRecoveryListings();
  const rawEnergyAnalyses = getSavedEnergyAnalyses();
  const allOptimizedMenus = getSavedOptimizedMenus();

  // Check if real completed food activities exist in user database
  const realCompletedFood = rawRecoveries.filter(
    (l) => l.status === 'COMPLETED' && l.type === 'FOOD_SURPLUS' && !l.id.startsWith('demo-completed-')
  );

  // If there are no real completed food recoveries yet, supply the clearly-labelled DEMO / SYNTHETIC records
  const isUsingDemoData = realCompletedFood.length === 0;

  const allRecoveries: RecoveryListing[] = isUsingDemoData
    ? getDemoCompletedRecoveries()
    : rawRecoveries;

  const allEnergyAnalyses: SavedEnergyAnalysis[] = isUsingDemoData
    ? getDemoSavedEnergyAnalyses()
    : rawEnergyAnalyses;

  // 2. Filter for COMPLETED recoveries only (per strict rules 4, 5, 12)
  // Food that was only detected, listed, matched, or accepted must NOT be counted as rescued/donated until COMPLETED.
  const completedRecoveries = allRecoveries.filter(
    (l) => l.status === 'COMPLETED'
  );

  // Apply date range filter
  const filteredCompletedRecoveries = completedRecoveries.filter((l) =>
    isDateWithinFilter(l.updatedAt || l.createdAt, range)
  );

  const filteredEnergyAnalyses = allEnergyAnalyses.filter((e) =>
    isDateWithinFilter(e.savedAt, range)
  );

  const filteredOptimizedMenus = allOptimizedMenus.filter((m) =>
    isDateWithinFilter(m.analyzedAt, range)
  );

  // 3. Separate Food Recovery vs Resource Recovery
  const completedFoodRecoveries = filteredCompletedRecoveries.filter(
    (l) => l.type === 'FOOD_SURPLUS'
  );
  const completedResourceRecoveries = filteredCompletedRecoveries.filter(
    (l) => l.type === 'RESOURCE_BYPRODUCT'
  );

  // 4. Food Recovery Calculations
  const foodRescuedKg = completedFoodRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );
  const foodDonatedKg = foodRescuedKg; // In W2V food recovery flow, all rescued surplus is donated to verified receivers
  const completedFoodDeliveriesCount = completedFoodRecoveries.length;

  // 5. Resource Recovery Calculations
  const resourcesRecoveredKg = completedResourceRecoveries.reduce(
    (acc, curr) => acc + (curr.confirmedQuantity || curr.estimatedQuantity || 0),
    0
  );
  const completedResourceRecoveriesCount = completedResourceRecoveries.length;

  // Categories for resource recovery
  const categoryMap: Record<string, { qty: number; count: number }> = {};
  completedResourceRecoveries.forEach((rec) => {
    let cat = rec.category || 'Organic resources';
    const lower = (rec.category + ' ' + rec.title + ' ' + rec.detectedMaterialOrFood).toLowerCase();
    if (lower.includes('peel') || lower.includes('citrus') || lower.includes('pomace') || lower.includes('carrot') || lower.includes('beet')) {
      cat = 'Fruit/vegetable by-products';
    } else if (lower.includes('compost') || lower.includes('soil') || lower.includes('biomass')) {
      cat = 'Organic resources';
    } else {
      cat = 'Other recoverable resources';
    }

    if (!categoryMap[cat]) {
      categoryMap[cat] = { qty: 0, count: 0 };
    }
    const qty = rec.confirmedQuantity || rec.estimatedQuantity || 0;
    categoryMap[cat].qty += qty;
    categoryMap[cat].count += 1;
  });

  const resourceCategories: ResourceCategoryBreakdown[] = Object.entries(categoryMap).map(
    ([category, data]) => ({
      category,
      quantityKg: data.qty,
      percentage: resourcesRecoveredKg > 0 ? Math.round((data.qty / resourcesRecoveredKg) * 100) : 0,
      deliveriesCount: data.count,
    })
  );

  // 6. Waste Prevented
  // Total organic waste prevented from landfill = Food Rescued (kg) + Resources Recovered (kg)
  const wastePreventedKg = foodRescuedKg + resourcesRecoveredKg;

  // 7. Energy Impact Calculations
  const energySavedKWh = filteredEnergyAnalyses.reduce(
    (acc, curr) => acc + (curr.energySavingKWh || 0),
    0
  );
  const energyCO2eAvoidedKg = filteredEnergyAnalyses.reduce(
    (acc, curr) => acc + (curr.co2eSavingKg || 0),
    0
  );

  // Energy source breakdown
  const energySourceMap: Record<string, { savedKWh: number; savedCO2eKg: number }> = {};
  filteredEnergyAnalyses.forEach((item) => {
    const src = item.energySource || 'Electricity';
    if (!energySourceMap[src]) {
      energySourceMap[src] = { savedKWh: 0, savedCO2eKg: 0 };
    }
    energySourceMap[src].savedKWh += item.energySavingKWh || 0;
    energySourceMap[src].savedCO2eKg += item.co2eSavingKg || 0;
  });
  const energyBySource = Object.entries(energySourceMap).map(([source, data]) => ({
    source,
    savedKWh: Math.round(data.savedKWh * 10) / 10,
    savedCO2eKg: Math.round(data.savedCO2eKg * 10) / 10,
  }));

  // 8. Estimated CO2e Avoided Calculations (Strictly labeled ESTIMATED per rule 6 & 15)
  // Calculated from recorded Smart Energy analyses (e.g. 1.4 + 1.2 = 2.6 kg CO2e)
  const totalEstimatedCO2eAvoidedKg = Math.round(energyCO2eAvoidedKg * 10) / 10;

  // 9. Money Saved (₹)
  // - Energy tariff savings: commercial institutional tariff ~₹9.20 per kWh
  // - Menu optimization savings: cost difference from accepted menus
  const energyMoneySaved = Math.round(energySavedKWh * 9.20);
  const menuMoneySaved = filteredOptimizedMenus.reduce((acc, curr) => {
    return acc + (curr.totalCostDifference < 0 ? Math.abs(curr.totalCostDifference) : 0);
  }, 0);
  const totalMoneySavedInr = energyMoneySaved + menuMoneySaved;

  // 10. Impact Points: STRICT RULE (Section 7)
  // 10 kg FOOD SAVED = 1 IMPACT POINT (per completed recovery; e.g. 25 kg = 2 pts, 15 kg = 1 pt -> total 3 pts)
  // Points are updated ONLY after successful completion of food recovery.
  // NO points for creating a plan, detecting surplus, listing, matching, or accepting.
  const allTimeCompletedFood = completedRecoveries.filter(
    (l) => l.type === 'FOOD_SURPLUS'
  );
  const allTimeImpactPoints = allTimeCompletedFood.reduce((sum, r) => {
    const qty = r.confirmedQuantity || r.estimatedQuantity || 0;
    return sum + Math.floor(qty / 10);
  }, 0);

  // Period impact points (calculated from completed food recovery records):
  const periodImpactPoints = completedFoodRecoveries.reduce((sum, r) => {
    const qty = r.confirmedQuantity || r.estimatedQuantity || 0;
    return sum + Math.floor(qty / 10);
  }, 0);

  // 11. Timeline Chart Data for Food Recovery Over Time
  // Use actual completed recovery records
  const timelineChartData = completedFoodRecoveries.map((rec) => {
    const d = new Date(rec.updatedAt || rec.createdAt);
    const dateLabel = `${rec.detectedMaterialOrFood || rec.title.replace(' (DEMO DATA)', '')} (${d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })})`;
    const qty = rec.confirmedQuantity || rec.estimatedQuantity || 0;
    return {
      dateLabel,
      rawDate: rec.updatedAt || rec.createdAt,
      foodRescuedKg: qty,
    };
  });

  // 12. Leaderboard: STRICT RULE (Section 8)
  // "Use actual stored organization/user impact points. Do not create fake rankings.
  // If there is not enough data: 'Leaderboard will appear after completed impact activities.'"
  const hasLeaderboardData = allTimeImpactPoints > 0;
  let leaderboardRankText = 'Leaderboard will appear after completed impact activities.';

  if (hasLeaderboardData) {
    leaderboardRankText = `Tier Verified · ${allTimeImpactPoints} Impact Points`;
  }

  // 13. Recent Impact Activity (Section 10)
  // Only completed activities from actual records
  const recentActivities: RecentImpactActivityItem[] = [];

  completedFoodRecoveries.forEach((rec) => {
    const qty = rec.confirmedQuantity || rec.estimatedQuantity || 0;
    const partner = rec.matchedEntity?.name || 'Local Verified Receiver';
    const points = Math.floor(qty / 10);
    recentActivities.push({
      id: rec.id,
      type: 'FOOD_RECOVERY_COMPLETED',
      title: isUsingDemoData ? 'FOOD RECOVERY — COMPLETED (DEMO DATA)' : 'FOOD RECOVERY — COMPLETED',
      subtitle: `${qty} kg ${rec.detectedMaterialOrFood || rec.title}`,
      partnerOrTarget: `Provider: Demo Institutional Kitchen · Receiver: ${partner}`,
      quantityOrMetric: `${qty} kg (${points} ${points === 1 ? 'pt' : 'pts'})`,
      timestamp: rec.updatedAt || rec.createdAt,
    });
  });

  completedResourceRecoveries.forEach((rec) => {
    const qty = rec.confirmedQuantity || rec.estimatedQuantity || 0;
    const partner = rec.matchedEntity?.name || 'Local Circular Industry';
    recentActivities.push({
      id: rec.id,
      type: 'RESOURCE_RECOVERY_COMPLETED',
      title: isUsingDemoData ? 'RESOURCE RECOVERY — COMPLETED (DEMO DATA)' : 'RESOURCE RECOVERY — COMPLETED',
      subtitle: `${qty} kg ${rec.detectedMaterialOrFood || rec.title}`,
      partnerOrTarget: `Provider: Demo Institutional Kitchen · Buyer: ${partner}`,
      quantityOrMetric: `${qty} kg`,
      timestamp: rec.updatedAt || rec.createdAt,
    });
  });

  filteredEnergyAnalyses.forEach((ene) => {
    recentActivities.push({
      id: ene.id,
      type: 'ENERGY_SAVING_RECORDED',
      title: isUsingDemoData ? 'ENERGY SAVING — RECORDED (ESTIMATED / DEMO DATA)' : 'ENERGY SAVING — RECORDED (ESTIMATED)',
      subtitle: `${ene.recipeOrMenuName}: Saved ${ene.energySavingKWh} kWh (${ene.co2eSavingKg} kg CO2e avoided)`,
      partnerOrTarget: `Source: ${ene.energySource} · Equipment: ${ene.recommendedEquipment || 'High-Efficiency Cooking'}`,
      quantityOrMetric: `${ene.energySavingKWh} kWh`,
      timestamp: ene.savedAt,
    });
  });

  // Sort recent activities descending by timestamp
  recentActivities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Deliveries completed count matches completed food recovery deliveries (2 deliveries)
  const deliveriesCompletedCount = completedFoodDeliveriesCount;

  const hasAnyCompletedActivity =
    filteredCompletedRecoveries.length > 0 || filteredEnergyAnalyses.length > 0;

  return {
    summary: {
      foodRescuedKg,
      foodDonatedKg,
      deliveriesCompletedCount,
      wastePreventedKg,
      resourcesRecoveredKg,
      energySavedKWh: Math.round(energySavedKWh * 10) / 10,
      estimatedCO2eAvoidedKg: totalEstimatedCO2eAvoidedKg,
      moneySavedInr: totalMoneySavedInr,
      impactPoints: periodImpactPoints,

      hasFoodRescuedData: foodRescuedKg > 0,
      hasFoodDonatedData: foodDonatedKg > 0,
      hasDeliveriesData: deliveriesCompletedCount > 0,
      hasWastePreventedData: wastePreventedKg > 0,
      hasResourcesRecoveredData: resourcesRecoveredKg > 0,
      hasEnergySavedData: energySavedKWh > 0,
      hasCO2eData: totalEstimatedCO2eAvoidedKg > 0,
      hasMoneySavedData: totalMoneySavedInr > 0,
    },
    foodRecovery: {
      totalFoodRescuedKg: foodRescuedKg,
      totalFoodDonatedKg: foodDonatedKg,
      wastePreventedKg: foodRescuedKg,
      completedFoodDeliveriesCount,
      completedRecoveriesCount: completedFoodDeliveriesCount,
      hasCompletedData: completedFoodDeliveriesCount > 0,
      timelineChartData,
    },
    resourceRecovery: {
      totalResourcesRecoveredKg: resourcesRecoveredKg,
      completedResourceRecoveriesCount,
      hasCompletedData: completedResourceRecoveriesCount > 0,
      categories: resourceCategories,
    },
    energyImpact: {
      estimatedEnergySavedKWh: Math.round(energySavedKWh * 10) / 10,
      estimatedCO2eAvoidedKg: Math.round(energyCO2eAvoidedKg * 10) / 10,
      moneySavedInr: energyMoneySaved,
      recordedAnalysesCount: filteredEnergyAnalyses.length,
      hasRecordedData: filteredEnergyAnalyses.length > 0,
      bySource: energyBySource,
    },
    leaderboardRank: {
      rankText: leaderboardRankText,
      hasEnoughData: hasLeaderboardData,
      totalPoints: allTimeImpactPoints,
    },
    sustainabilitySummary: {
      foodWastePreventedKg: foodRescuedKg,
      resourcesRecoveredKg,
      estimatedEnergySavedKWh: Math.round(energySavedKWh * 10) / 10,
      estimatedCO2eAvoidedKg: totalEstimatedCO2eAvoidedKg,
      completedRecoveryActivitiesCount: deliveriesCompletedCount,
      hasAnyData: hasAnyCompletedActivity,
    },
    recentActivities,
    hasAnyCompletedActivity,
    isUsingDemoData,
    demoNoticeText: 'DEMO DATA — Replace with verified organizational activity records',
  };
};
