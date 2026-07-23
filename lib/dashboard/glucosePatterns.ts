import type { GlucoseRecord } from "@/types/glucose";

export type GlucosePatternInsight = {
  id: string;
  title: string;
  detail: string;
  strength: "solid" | "hint";
};

const WEEKDAY = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function recordDay(record: GlucoseRecord): number {
  const d = record.recordedAt
    ? record.recordedAt.toDate()
    : new Date(`${record.date}T${record.time}`);
  return d.getDay();
}

function mealKey(record: GlucoseRecord): string {
  const m = (record.foodMeal ?? "").trim().toLowerCase();
  if (m === "desayuno" || m === "almuerzo" || m === "cena" || m === "otro") {
    return m;
  }
  return "sin_comida";
}

/**
 * Detecta patrones simples a partir del historial (regla, no ML).
 */
export function detectGlucosePatterns(
  records: GlucoseRecord[]
): GlucosePatternInsight[] {
  if (records.length < 5) {
    return [
      {
        id: "need-data",
        title: "Aún pocos datos para patrones",
        detail:
          "Con 1–2 semanas de registros (glucosa, comida y estrés) aparecerán hallazgos como “los viernes cenas más altas”.",
        strength: "hint",
      },
    ];
  }

  const insights: GlucosePatternInsight[] = [];

  // Promedio por día de la semana
  const byWeekday = new Map<number, number[]>();
  for (const r of records) {
    const day = recordDay(r);
    const list = byWeekday.get(day) ?? [];
    list.push(r.glucoseLevel);
    byWeekday.set(day, list);
  }

  let worstDay: { day: number; avg: number; n: number } | null = null;
  let bestDay: { day: number; avg: number; n: number } | null = null;
  for (const [day, levels] of byWeekday) {
    if (levels.length < 2) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (!worstDay || avg > worstDay.avg) worstDay = { day, avg, n: levels.length };
    if (!bestDay || avg < bestDay.avg) bestDay = { day, avg, n: levels.length };
  }

  if (worstDay && bestDay && worstDay.day !== bestDay.day && worstDay.avg - bestDay.avg >= 15) {
    insights.push({
      id: `weekday-${worstDay.day}`,
      title: `Los ${WEEKDAY[worstDay.day]} sueles tener glucosas más altas`,
      detail: `Promedio ~${Math.round(worstDay.avg)} mg/dL (${worstDay.n} lecturas) vs ~${Math.round(bestDay.avg)} los ${WEEKDAY[bestDay.day]}.`,
      strength: worstDay.n >= 3 ? "solid" : "hint",
    });
  }

  // Por tipo de comida
  const byMeal = new Map<string, number[]>();
  for (const r of records) {
    if (!r.ateSomething) continue;
    const key = mealKey(r);
    if (key === "sin_comida") continue;
    const list = byMeal.get(key) ?? [];
    list.push(r.glucoseLevel);
    byMeal.set(key, list);
  }

  let worstMeal: { key: string; avg: number; n: number } | null = null;
  for (const [key, levels] of byMeal) {
    if (levels.length < 2) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (!worstMeal || avg > worstMeal.avg) worstMeal = { key, avg, n: levels.length };
  }

  if (worstMeal && worstMeal.avg > 140) {
    const labels: Record<string, string> = {
      desayuno: "desayunos",
      almuerzo: "almuerzos",
      cena: "cenas",
      otro: "snacks",
    };
    insights.push({
      id: `meal-${worstMeal.key}`,
      title: `Tus ${labels[worstMeal.key] ?? worstMeal.key} se asocian a lecturas más altas`,
      detail: `Promedio ~${Math.round(worstMeal.avg)} mg/dL en ${worstMeal.n} registros con esa comida.`,
      strength: worstMeal.n >= 3 ? "solid" : "hint",
    });
  }

  // Día + cena (ej. viernes cenas)
  const dinnerByDay = new Map<number, number[]>();
  for (const r of records) {
    if (mealKey(r) !== "cena") continue;
    const day = recordDay(r);
    const list = dinnerByDay.get(day) ?? [];
    list.push(r.glucoseLevel);
    dinnerByDay.set(day, list);
  }
  let worstDinner: { day: number; avg: number; n: number } | null = null;
  for (const [day, levels] of dinnerByDay) {
    if (levels.length < 2) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (!worstDinner || avg > worstDinner.avg) {
      worstDinner = { day, avg, n: levels.length };
    }
  }
  if (worstDinner && worstDinner.avg >= 145) {
    insights.push({
      id: `dinner-${worstDinner.day}`,
      title: `Los ${WEEKDAY[worstDinner.day]} las cenas suelen ir más altas`,
      detail: `Promedio ~${Math.round(worstDinner.avg)} mg/dL en ${worstDinner.n} cenas registradas ese día.`,
      strength: worstDinner.n >= 3 ? "solid" : "hint",
    });
  }

  // Estrés vs picos
  const withStress = records.filter((r) => r.stressLevel != null);
  if (withStress.length >= 6) {
    const highStress = withStress.filter((r) => (r.stressLevel ?? 0) >= 4);
    const lowStress = withStress.filter((r) => (r.stressLevel ?? 0) <= 2);
    if (highStress.length >= 2 && lowStress.length >= 2) {
      const avgHigh =
        highStress.reduce((s, r) => s + r.glucoseLevel, 0) / highStress.length;
      const avgLow =
        lowStress.reduce((s, r) => s + r.glucoseLevel, 0) / lowStress.length;
      if (avgHigh - avgLow >= 12) {
        insights.push({
          id: "stress-peaks",
          title: "El estrés correlaciona con picos",
          detail: `Con estrés alto (4–5) promedio ~${Math.round(avgHigh)} mg/dL vs ~${Math.round(avgLow)} con estrés bajo.`,
          strength: highStress.length >= 3 ? "solid" : "hint",
        });
      }
    }
  }

  // Post-comida contexts
  const postMeal = records.filter(
    (r) =>
      r.measurementContext === "post_meal_1h" ||
      r.measurementContext === "post_meal_2h"
  );
  if (postMeal.length >= 3) {
    const avg =
      postMeal.reduce((s, r) => s + r.glucoseLevel, 0) / postMeal.length;
    const highRate =
      postMeal.filter((r) => r.glucoseLevel > 140).length / postMeal.length;
    if (highRate >= 0.4) {
      insights.push({
        id: "post-meal",
        title: "El post-comida es tu ventana más sensible",
        detail: `${Math.round(highRate * 100)}% de mediciones post-comida están >140 (promedio ~${Math.round(avg)}).`,
        strength: postMeal.length >= 5 ? "solid" : "hint",
      });
    }
  }

  if (!insights.length) {
    insights.push({
      id: "stable",
      title: "Sin patrones fuertes por ahora",
      detail:
        "Tu historial se ve relativamente uniforme. Sigue anotando comida y estrés para detectar matices.",
      strength: "hint",
    });
  }

  return insights.slice(0, 4);
}
