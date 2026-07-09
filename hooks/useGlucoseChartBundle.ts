"use client";

import { useMemo } from "react";
import type { GlucoseChartDatasets, GlucoseChartOptionsBundle } from "@/types/dashboard-glucose";
import type { GlucoseRecord } from "@/types/glucose";
import { prepareChartData, prepareChartOptions } from "@/utils/chartHelpers";

const EMPTY_DATASETS = {
  sortedRecords: [] as GlucoseRecord[],
  timelineData: { labels: [], datasets: [] },
  mealImpactData: { labels: [], counts: [], datasets: [] },
  patternData: { labels: [], counts: [], datasets: [] },
};

export type GlucoseChartBundle = ReturnType<typeof prepareChartData>;

/**
 * Deriva datos y opciones de Chart.js a partir de los registros (sin duplicar estado en la página).
 */
export function useGlucoseChartBundle(records: GlucoseRecord[]): {
  chartData: GlucoseChartBundle;
  chartOptions: GlucoseChartOptionsBundle;
} {
  const chartOptions = useMemo(() => {
    const { timeline, mealImpact, pattern } = prepareChartOptions();
    return {
      timeline: timeline as GlucoseChartOptionsBundle["timeline"],
      mealImpact: mealImpact as GlucoseChartOptionsBundle["mealImpact"],
      pattern: pattern as GlucoseChartOptionsBundle["pattern"],
    };
  }, []);

  const chartData = useMemo(() => {
    if (!records.length) {
      return EMPTY_DATASETS;
    }
    return prepareChartData(records);
  }, [records]);

  return { chartData, chartOptions };
}
