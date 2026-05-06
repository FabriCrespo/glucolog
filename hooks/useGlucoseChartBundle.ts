"use client";

import { useMemo } from "react";
import type { GlucoseChartDatasets, GlucoseChartOptionsBundle } from "@/types/dashboard-glucose";
import type { GlucoseRecord } from "@/types/glucose";
import { prepareChartData, prepareChartOptions } from "@/utils/chartHelpers";

const EMPTY_DATASETS: GlucoseChartDatasets = {
  timelineData: { labels: [], datasets: [] },
  mealImpactData: { labels: [], datasets: [] },
  patternData: { labels: [], datasets: [] },
};

/**
 * Deriva datos y opciones de Chart.js a partir de los registros (sin duplicar estado en la página).
 */
export function useGlucoseChartBundle(records: GlucoseRecord[]): {
  chartData: GlucoseChartDatasets;
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
    const { timelineData, mealImpactData, patternData } = prepareChartData(records);
    return {
      timelineData: timelineData as GlucoseChartDatasets["timelineData"],
      mealImpactData: mealImpactData as GlucoseChartDatasets["mealImpactData"],
      patternData: patternData as GlucoseChartDatasets["patternData"],
    };
  }, [records]);

  return { chartData, chartOptions };
}
