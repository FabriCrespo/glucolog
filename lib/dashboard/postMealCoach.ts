import type { GlucoseRecord } from "@/types/glucose";
import type { PredictionResult } from "@/lib/prediction/clientFallback";

export type PostMealImpact = "leve" | "moderado" | "alto" | "bajo";

export type PostMealCoachGuidance = {
  hasMeal: boolean;
  foodName: string;
  mealType: string | null;
  mealAtLabel: string;
  minutesSinceMeal: number | null;
  glucoseAtMeal: number | null;
  predictedGlucose: number | null;
  delta: number | null;
  impact: PostMealImpact | null;
  impactTitle: string;
  impactSummary: string;
  nextCheckMinutes: number | null;
  nextCheckLabel: string;
  nextMealHours: { min: number; max: number } | null;
  nextMealAdvice: string;
  tips: string[];
};

const MEAL_LABEL: Record<string, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  otro: "Snack / otro",
};

function recordDate(record: GlucoseRecord): Date {
  if (record.recordedAt) return record.recordedAt.toDate();
  return new Date(`${record.date}T${record.time}`);
}

/** Último registro que incluye comida. */
export function findLastMealRecord(
  records: GlucoseRecord[]
): GlucoseRecord | null {
  for (const record of records) {
    if (record.ateSomething && (record.foodEaten ?? "").trim()) {
      return record;
    }
  }
  return null;
}

function minutesBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 60_000));
}

/**
 * Estima el impacto de la última comida y sugiere cuándo medir / volver a comer,
 * combinando el registro de comida con la predicción de glucosa.
 */
export function buildPostMealCoachGuidance(
  records: GlucoseRecord[],
  prediction: PredictionResult | null,
  now: Date = new Date()
): PostMealCoachGuidance {
  const meal = findLastMealRecord(records);
  const empty: PostMealCoachGuidance = {
    hasMeal: false,
    foodName: "",
    mealType: null,
    mealAtLabel: "",
    minutesSinceMeal: null,
    glucoseAtMeal: null,
    predictedGlucose: prediction?.predicted_glucose_mg_dl ?? null,
    delta: null,
    impact: null,
    impactTitle: "Sin comida registrada",
    impactSummary:
      "Cuando registres una lectura con comida, aquí verás un estimado del impacto y cuándo volver a comer.",
    nextCheckMinutes: null,
    nextCheckLabel: "Registra una comida para activar esta guía",
    nextMealHours: null,
    nextMealAdvice: "",
    tips: [
      "Anota qué comiste al registrar la glucosa para afinar la predicción.",
    ],
  };

  if (!meal) return empty;

  const mealAt = recordDate(meal);
  const elapsedSinceRecord = minutesBetween(mealAt, now);
  // minutesSinceMeal en el registro = tiempo desde la comida al momento del registro.
  const minutesSinceMeal =
    meal.minutesSinceMeal != null && meal.minutesSinceMeal >= 0
      ? meal.minutesSinceMeal + elapsedSinceRecord
      : elapsedSinceRecord;

  const foodName = (meal.foodEaten ?? "").trim();
  const mealTypeRaw = (meal.foodMeal ?? "").trim().toLowerCase();
  const mealType = MEAL_LABEL[mealTypeRaw] ?? (mealTypeRaw || null);
  const mealAtLabel = `${meal.date} · ${meal.time.slice(0, 5)}`;

  const predicted = prediction?.predicted_glucose_mg_dl ?? null;
  const delta =
    predicted != null ? predicted - meal.glucoseLevel : null;

  let impact: PostMealImpact = "leve";
  if (prediction?.risk_flag_high || (predicted != null && predicted > 180)) {
    impact = "alto";
  } else if (prediction?.risk_flag_low || (predicted != null && predicted < 70)) {
    impact = "bajo";
  } else if (
    (delta != null && Math.abs(delta) >= 25) ||
    (predicted != null && (predicted > 140 || predicted < 80))
  ) {
    impact = "moderado";
  }

  const { impactTitle, impactSummary, nextCheckMinutes, nextMealHours, tips, nextMealAdvice } =
    composeAdvice({
      foodName,
      impact,
      predicted,
      delta,
      minutesSinceMeal,
      glucoseAtMeal: meal.glucoseLevel,
      prediction,
    });

  return {
    hasMeal: true,
    foodName,
    mealType,
    mealAtLabel,
    minutesSinceMeal,
    glucoseAtMeal: meal.glucoseLevel,
    predictedGlucose: predicted,
    delta,
    impact,
    impactTitle,
    impactSummary,
    nextCheckMinutes,
    nextCheckLabel:
      nextCheckMinutes == null
        ? "Sin ventana de control concreta"
        : nextCheckMinutes < 60
          ? `Mide de nuevo en ~${nextCheckMinutes} min`
          : `Mide de nuevo en ~${Math.round(nextCheckMinutes / 60)} h`,
    nextMealHours,
    nextMealAdvice,
    tips,
  };
}

function composeAdvice(args: {
  foodName: string;
  impact: PostMealImpact;
  predicted: number | null;
  delta: number | null;
  minutesSinceMeal: number;
  glucoseAtMeal: number;
  prediction: PredictionResult | null;
}): {
  impactTitle: string;
  impactSummary: string;
  nextCheckMinutes: number;
  nextMealHours: { min: number; max: number };
  nextMealAdvice: string;
  tips: string[];
} {
  const { foodName, impact, predicted, delta, minutesSinceMeal, glucoseAtMeal } =
    args;

  const hoursAgo = (minutesSinceMeal / 60).toFixed(1);
  const predText =
    predicted != null ? ` Predicción ~${predicted} mg/dL.` : "";

  if (impact === "alto") {
    return {
      impactTitle: "Impacto alto estimado",
      impactSummary: `Tras «${foodName}» (hace ~${hoursAgo} h, lectura ${glucoseAtMeal} mg/dL) la predicción anticipa un posible pico.${predText} Conviene controlar porción y acompañar con caminata suave si tu plan lo permite.`,
      nextCheckMinutes: 60,
      nextMealHours: { min: 3.5, max: 5 },
      nextMealAdvice:
        "Espera unas 3.5–5 h para la próxima comida principal, prioriza proteína + verdura y evita snacks azucarados hasta estabilizar.",
      tips: [
        "Bebe agua y evita picoteo entre horas.",
        "Si puedes, 10–15 min de caminata suave ayudan al control post-comida.",
        "Revisa tu plan de medicación/insulina con tu equipo de salud si los picos se repiten.",
      ],
    };
  }

  if (impact === "bajo") {
    return {
      impactTitle: "Posible descenso",
      impactSummary: `Con «${foodName}» la predicción apunta a glucosa baja o en descenso.${predText} Ten a mano una corrección rápida según tu protocolo.`,
      nextCheckMinutes: 20,
      nextMealHours: { min: 1.5, max: 3 },
      nextMealAdvice:
        "Puedes adelantar un snack equilibrado (carbohidrato + proteína) en 1.5–3 h, o antes si sientes síntomas de hipoglucemia.",
      tips: [
        "No ignores temblores, sudor o confusión: mide y actúa.",
        "Un snack pequeño ahora puede ser mejor que esperar a la comida grande.",
        "Anota cómo te sentiste para afinar próximas predicciones.",
      ],
    };
  }

  if (impact === "moderado") {
    const direction =
      delta != null && delta > 0 ? "al alza" : "con variación notable";
    return {
      impactTitle: "Impacto moderado",
      impactSummary: `«${foodName}» se asocia a un cambio ${direction} (lectura ${glucoseAtMeal} mg/dL).${predText} Vigila la curva sin alarmarte.`,
      nextCheckMinutes: 90,
      nextMealHours: { min: 3, max: 4.5 },
      nextMealAdvice:
        "Programa la próxima comida en 3–4.5 h. Mantén porciones estables y combina el plato con fibra o proteína.",
      tips: [
        "Evita snacks densos en carbohidratos hasta la próxima comida.",
        "Una caminata corta post-comida suele suavizar la curva.",
      ],
    };
  }

  // leve
  return {
    impactTitle: "Impacto leve / estable",
    impactSummary: `Tu última comida «${foodName}» (hace ~${hoursAgo} h) encaja con un escenario estable.${predText} Buen momento para mantener el ritmo habitual.`,
    nextCheckMinutes: 120,
    nextMealHours: { min: 3, max: 5 },
    nextMealAdvice:
      "Puedes volver a comer en unas 3–5 h, según tu rutina (desayuno / almuerzo / cena).",
    tips: [
      "Sigue registrando comida + glucosa para mejorar la estimación.",
      "Si cambias mucho la porción, la próxima predicción puede variar.",
    ],
  };
}

/** Texto corto para UI (horas restantes hacia la próxima comida). */
export function formatNextMealWindow(
  hours: { min: number; max: number } | null,
  minutesSinceMeal: number | null
): string | null {
  if (!hours || minutesSinceMeal == null) return null;
  const hoursSince = minutesSinceMeal / 60;
  const remainMin = Math.max(0, hours.min - hoursSince);
  const remainMax = Math.max(0, hours.max - hoursSince);
  if (remainMax <= 0) {
    return "Ya estás en ventana razonable para la próxima comida (ajusta a cómo te sientes y tu plan).";
  }
  const fmt = (h: number) =>
    h < 1 ? `${Math.round(h * 60)} min` : `${h.toFixed(1)} h`;
  return `Ventana sugerida para volver a comer: en ${fmt(remainMin)} – ${fmt(remainMax)}.`;
}
