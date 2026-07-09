import type { GlucoseRecord } from "@/types/glucose";

export type GlucoseStatus = "low" | "normal" | "high";

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const base =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${base}, ${first}` : base;
}

export function getGlucoseStatus(level: number): {
  status: GlucoseStatus;
  label: string;
} {
  if (level < 70) return { status: "low", label: "Baja" };
  if (level > 140) return { status: "high", label: "Alta" };
  return { status: "normal", label: "En rango" };
}

export function getTrend(records: GlucoseRecord[]) {
  if (records.length < 2) {
    return { direction: "stable" as const, delta: 0 };
  }
  const delta = records[0].glucoseLevel - records[1].glucoseLevel;
  if (Math.abs(delta) < 5) return { direction: "stable" as const, delta: 0 };
  return {
    direction: delta > 0 ? ("up" as const) : ("down" as const),
    delta: Math.abs(delta),
  };
}

export function getInRangePercent(records: GlucoseRecord[]): number {
  if (!records.length) return 0;
  const inRange = records.filter(
    (r) => r.glucoseLevel >= 70 && r.glucoseLevel <= 140
  ).length;
  return Math.round((inRange / records.length) * 100);
}

export function getLoggingStreak(records: GlucoseRecord[]): number {
  if (!records.length) return 0;

  const daySet = new Set(records.map((r) => r.date));
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (daySet.has(key)) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function getCoachTip(
  records: GlucoseRecord[],
  latest: GlucoseRecord | null
): string {
  if (!latest) {
    return "Registra tu primera lectura hoy y desbloquea predicciones personalizadas.";
  }

  const { status } = getGlucoseStatus(latest.glucoseLevel);
  const trend = getTrend(records);
  const inRange = getInRangePercent(records);

  if (status === "high" && trend.direction === "up") {
    return "Tu glucosa subió respecto a la lectura anterior. Revisa carbohidratos recientes y considera una caminata corta.";
  }
  if (status === "low") {
    return "Nivel bajo detectado. Ten a mano una fuente rápida de glucosa y monitorea en 15 minutos.";
  }
  if (inRange >= 70 && trend.direction === "down") {
    return "Vas en buena dirección: la tendencia baja y la mayoría de lecturas están en rango.";
  }
  if (inRange < 50) {
    return "Menos de la mitad de tus lecturas están en rango. Revisar horarios de comida puede ayudar.";
  }
  return "Buen ritmo. Mantén registros regulares para que la predicción sea más precisa.";
}

export function getRiskScore(result: {
  risk_flag_high: boolean;
  risk_flag_low: boolean;
}): number {
  if (result.risk_flag_high) return 82;
  if (result.risk_flag_low) return 28;
  return 18;
}

export function getPredictionCoachMessage(result: {
  predicted_glucose_mg_dl: number;
  risk_flag_high: boolean;
  risk_flag_low: boolean;
}): string {
  if (result.risk_flag_high) {
    return "La IA anticipa un posible pico. Hidrátate, evita snacks extra y revisa tu plan de comida.";
  }
  if (result.risk_flag_low) {
    return "Riesgo de descenso. Lleva contigo algo para corregir hipoglucemia si lo necesitas.";
  }
  if (result.predicted_glucose_mg_dl >= 70 && result.predicted_glucose_mg_dl <= 140) {
    return "Todo indica un escenario estable. Sigue con tus hábitos actuales.";
  }
  return "Situación moderada. Un registro más tarde ayudará a afinar la predicción.";
}

export function getPredictionRiskMeta(result: {
  risk_flag_high: boolean;
  risk_flag_low: boolean;
}) {
  if (result.risk_flag_high) {
    return {
      label: "Riesgo alto",
      accent: "border-red-400",
      text: "text-red-600",
      bar: "bg-red-500",
      glow: "from-red-500/8 to-transparent",
      dot: "bg-red-500",
    };
  }
  if (result.risk_flag_low) {
    return {
      label: "Riesgo bajo",
      accent: "border-amber-400",
      text: "text-amber-600",
      bar: "bg-amber-500",
      glow: "from-amber-500/8 to-transparent",
      dot: "bg-amber-500",
    };
  }
  return {
    label: "En equilibrio",
    accent: "border-emerald-400",
    text: "text-emerald-600",
    bar: "bg-emerald-500",
    glow: "from-emerald-500/10 to-transparent",
    dot: "bg-emerald-500",
  };
}
