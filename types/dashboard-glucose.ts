import type { ChartData, ChartOptions } from "chart.js";

/** Opciones del selector de rango (deben coincidir con las etiquetas en UI). */
export type DateRangeLabel = "7 días" | "1 mes" | "3 meses" | "1 año";

export interface GlucoseChartDatasets {
  timelineData: ChartData<"line">;
  mealImpactData: ChartData<"bar">;
  patternData: ChartData<"bar">;
}

export interface GlucoseChartOptionsBundle {
  timeline: ChartOptions<"line">;
  mealImpact: ChartOptions<"bar">;
  pattern: ChartOptions<"bar">;
}

/** Mensaje unificado para el formulario del dashboard. */
export type DashboardFormFeedback =
  | { variant: "success"; message: string }
  | { variant: "error"; message: string };

export interface GlucoseFormSnapshot {
  glucoseLevel: number | "";
  measurementContext:
    | "fasting"
    | "pre_meal"
    | "post_meal_1h"
    | "post_meal_2h"
    | "bedtime"
    | "random";
  ateSomething: boolean;
  foodEaten: string;
  foodMeal: string;
  minutesSinceMeal: number | "";
  medicationTakenRecently: boolean;
  medicationType: string;
  activityLevelLastHours: "none" | "light" | "moderate" | "intense";
  stressLevel: 1 | 2 | 3 | 4 | 5 | "";
  notes: string;
  dateRange: DateRangeLabel;
}
