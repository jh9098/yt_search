import type { SearchCorePreset, SearchFilterState } from "../types";

const CORE_PRESET_OVERRIDES: Record<SearchCorePreset, Partial<SearchFilterState>> = {
  none: {},
  newRapidGrowth: {
    period: "30d",
    minViews: 100000,
    maxSubscribers: 300000,
    minPerformance: 50,
  },
  efficiencyMonster: {
    period: "30d",
    minViews: 50000,
    maxSubscribers: 100000,
    minPerformance: 70,
    subscriberPublicOnly: true,
  },
  fastRising: {
    period: "7d",
    minViews: 50000,
    minPerformance: 60,
  },
  krTrend: {
    period: "7d",
    country: "KR",
    minViews: 30000,
    minPerformance: 30,
  },
  globalTrend: {
    period: "7d",
    country: "",
    minViews: 50000,
    minPerformance: 30,
  },
};

export function applyCorePreset(filters: SearchFilterState, preset: SearchCorePreset): SearchFilterState {
  const overrides = CORE_PRESET_OVERRIDES[preset];

  return {
    ...filters,
    ...overrides,
    corePreset: preset,
  };
}
