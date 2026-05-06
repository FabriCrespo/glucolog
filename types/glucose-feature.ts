export interface GlucoseFeatureRow {
  schemaVersion: 1;
  sourceRecordId: string;
  userId: string;
  recordedAtIso: string;
  glucoseMgDl: number;
  measurementContext: string;
  diabetesType: "type1" | "type2" | "unknown";
  hourOfDay: number;
  dayOfWeek: number;
  ateSomething: boolean;
  minutesSinceMeal: number | null;
  medicationTakenRecently: boolean;
  stressLevel: number | null;
  activityLevelLastHours: string;
  medTakenLast2h: boolean;
  medTakenLast4h: boolean;
  minutesSinceLastMedication: number | null;
  medicationEventsLast24h: number;
  exerciseLast6h: boolean;
  exerciseDurationLast24h: number;
  exerciseIntensityScoreLast24h: number;
  minutesSinceLastExercise: number | null;
  deltaVsPrevReading: number | null;
  rollingMean3: number | null;
  createdAtIso: string;
}
