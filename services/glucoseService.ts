import { db } from "@/app/firebase/config";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { GlucoseRecord } from "@/types/glucose";

export interface RegisterGlucosePayload {
  glucoseLevel: number;
  measurementContext: GlucoseRecord["measurementContext"];
  ateSomething: boolean;
  foodEaten?: string;
  foodMeal?: string;
  minutesSinceMeal?: number | null;
  medicationTakenRecently: boolean;
  medicationType?: string;
  activityLevelLastHours: GlucoseRecord["activityLevelLastHours"];
  stressLevel?: 1 | 2 | 3 | 4 | 5 | null;
  notes?: string;
}

const MEAL_TYPES = new Set(["desayuno", "almuerzo", "cena", "otro"]);
const MEASUREMENT_CONTEXTS = new Set([
  "fasting",
  "pre_meal",
  "post_meal_1h",
  "post_meal_2h",
  "bedtime",
  "random",
]);
const ACTIVITY_LEVELS = new Set(["none", "light", "moderate", "intense"]);

function normalizeText(value: string | undefined, max = 120): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toISODateParts(localDate: Date): { date: string; time: string } {
  const date = localDate.toISOString().split("T")[0];
  const time = localDate.toTimeString().split(" ")[0];
  return { date, time };
}

function normalizeLegacyRecord(raw: Partial<GlucoseRecord>): GlucoseRecord {
  const baseTs = raw.recordedAt ?? raw.timeStamp ?? Timestamp.now();
  const fallbackDate = raw.date ?? baseTs.toDate().toISOString().split("T")[0];
  const fallbackTime = raw.time ?? baseTs.toDate().toTimeString().split(" ")[0];
  const activityLevel = raw.activityLevelLastHours ?? "none";
  const measurementContext = raw.measurementContext ?? "random";

  return {
    schemaVersion: 1,
    source: "manual_app",
    glucoseLevel: Number(raw.glucoseLevel ?? 0),
    recordedAt: baseTs,
    recordedAtIso: raw.recordedAtIso ?? baseTs.toDate().toISOString(),
    timezoneOffsetMinutes:
      typeof raw.timezoneOffsetMinutes === "number" ? raw.timezoneOffsetMinutes : 0,
    measurementContext: MEASUREMENT_CONTEXTS.has(measurementContext)
      ? measurementContext
      : "random",
    minutesSinceMeal:
      typeof raw.minutesSinceMeal === "number" ? clamp(raw.minutesSinceMeal, 0, 720) : null,
    medicationTakenRecently: Boolean(raw.medicationTakenRecently),
    medicationType: normalizeText(raw.medicationType ?? undefined, 80),
    activityLevelLastHours: ACTIVITY_LEVELS.has(activityLevel) ? activityLevel : "none",
    stressLevel:
      typeof raw.stressLevel === "number"
        ? (clamp(raw.stressLevel, 1, 5) as 1 | 2 | 3 | 4 | 5)
        : null,
    notes: normalizeText(raw.notes ?? undefined, 400),
    date: fallbackDate,
    time: fallbackTime,
    timeStamp: baseTs,
    ateSomething: Boolean(raw.ateSomething),
    foodMeal: normalizeText(raw.foodMeal ?? undefined, 30),
    foodEaten: normalizeText(raw.foodEaten ?? undefined, 140),
  };
}

// Función de Registro
export async function registerGlucose(userID: string, payload: RegisterGlucosePayload) {
  try {
    if (!userID) {
      throw new Error("ID de usuario no válido");
    }
    if (isNaN(payload.glucoseLevel) || payload.glucoseLevel < 30 || payload.glucoseLevel > 600) {
      throw new Error("Nivel de glucosa no válido");
    }
    if (!MEASUREMENT_CONTEXTS.has(payload.measurementContext)) {
      throw new Error("Contexto de medición no válido");
    }
    if (!ACTIVITY_LEVELS.has(payload.activityLevelLastHours)) {
      throw new Error("Nivel de actividad no válido");
    }

    const now = new Date();
    const timestamp = Timestamp.now();
    const { date, time } = toISODateParts(now);
    const normalizedFoodMeal = normalizeText(payload.foodMeal, 30)?.toLowerCase() ?? null;
    const safeMeal =
      normalizedFoodMeal && MEAL_TYPES.has(normalizedFoodMeal) ? normalizedFoodMeal : "otro";

    const glucoseData = {
      schemaVersion: 1 as const,
      source: "manual_app" as const,
      glucoseLevel: clamp(Math.round(payload.glucoseLevel), 30, 600),
      recordedAt: timestamp,
      recordedAtIso: now.toISOString(),
      timezoneOffsetMinutes: now.getTimezoneOffset(),
      measurementContext: payload.measurementContext,
      date,
      time,
      timeStamp: timestamp, // Backward compatibility
      ateSomething: payload.ateSomething,
      foodMeal: payload.ateSomething ? safeMeal : null,
      foodEaten: payload.ateSomething
        ? normalizeText(payload.foodEaten, 140) ?? "No especificado"
        : null,
      minutesSinceMeal:
        payload.ateSomething && typeof payload.minutesSinceMeal === "number"
          ? clamp(Math.round(payload.minutesSinceMeal), 0, 720)
          : null,
      medicationTakenRecently: payload.medicationTakenRecently,
      medicationType: payload.medicationTakenRecently
        ? normalizeText(payload.medicationType, 80)
        : null,
      activityLevelLastHours: payload.activityLevelLastHours,
      stressLevel:
        typeof payload.stressLevel === "number"
          ? (clamp(payload.stressLevel, 1, 5) as 1 | 2 | 3 | 4 | 5)
          : null,
      notes: normalizeText(payload.notes, 400),
    };

    const docRef = await addDoc(
      collection(db, "glucoseRecords", userID, "records"), 
      glucoseData
    );
    
    console.log("Registro guardado con ID:", docRef.id);
    return docRef.id; // Devolver el ID del documento creado
  } catch (e) {
    console.error("Error al añadir el registro: ", e);
    throw e;
  }
}

// Función para obtener registros por rango de fecha
export async function fetchGlucoseRecords(userID: string, days: number): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      recordsRef,
      where("timeStamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timeStamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      normalizeLegacyRecord(doc.data() as Partial<GlucoseRecord>)
    );
  } catch (error) {
    console.error("Error fetching glucose records:", error);
    throw error;
  }
}

// Función para obtener todos los registros históricos
export async function fetchAllGlucoseRecords(userID: string): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const q = query(recordsRef, orderBy("timeStamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      normalizeLegacyRecord(doc.data() as Partial<GlucoseRecord>)
    );
  } catch (error) {
    console.error("Error fetching all glucose records:", error);
    throw error;
  }
}

