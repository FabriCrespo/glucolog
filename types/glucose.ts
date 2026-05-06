import { Timestamp } from "firebase/firestore";

export type GlucoseMeasurementContext =
  | "fasting"
  | "pre_meal"
  | "post_meal_1h"
  | "post_meal_2h"
  | "bedtime"
  | "random";

export type GlucoseActivityLevel = "none" | "light" | "moderate" | "intense";

export type GlucoseSource = "manual_app";

export interface GlucoseRecord {
  schemaVersion: 1;
  source: GlucoseSource;
  glucoseLevel: number;
  recordedAt: Timestamp;
  recordedAtIso: string;
  timezoneOffsetMinutes: number;
  measurementContext: GlucoseMeasurementContext;
  minutesSinceMeal: number | null;
  medicationTakenRecently: boolean;
  medicationType: string | null;
  activityLevelLastHours: GlucoseActivityLevel;
  stressLevel: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  date: string;
  time: string;
  timeStamp: Timestamp; // Backward compatibility
  ateSomething: boolean;
  foodMeal?: string | null;
  foodEaten?: string | null;
}