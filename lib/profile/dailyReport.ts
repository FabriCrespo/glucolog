import type { GlucoseRecord } from "@/types/glucose";
import {
  getGlucoseStatus,
  getInRangePercent,
  getLoggingStreak,
  getTrend,
} from "@/lib/dashboard/metrics";

export type ControlLevel = "excellent" | "good" | "attention" | "critical" | "empty";

export interface DailyReportSummary {
  level: ControlLevel;
  title: string;
  summary: string;
  lastReading: GlucoseRecord | null;
  average: number;
  inRangePercent: number;
  trendLabel: string;
  streak: number;
  lowCount: number;
  highCount: number;
  readingsCount: number;
  doctorNote: string;
}

function formatDiabetesType(type?: string): string {
  if (!type) return "Diabetes";
  const map: Record<string, string> = {
    type1: "Diabetes tipo 1",
    type2: "Diabetes tipo 2",
    gestational: "Diabetes gestacional",
    other: "Diabetes",
  };
  return map[type] ?? "Diabetes";
}

export function getReportDateLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildDailyReport(
  records: GlucoseRecord[],
  diabetesType?: string
): DailyReportSummary {
  const sorted = [...records].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    return db - da;
  });

  const lastReading = sorted[0] ?? null;
  const readingsCount = records.length;
  const inRangePercent = getInRangePercent(records);
  const streak = getLoggingStreak(records);
  const trend = getTrend(sorted);
  const lowCount = records.filter((r) => r.glucoseLevel < 70).length;
  const highCount = records.filter((r) => r.glucoseLevel > 140).length;
  const average = readingsCount
    ? Math.round(
        records.reduce((s, r) => s + r.glucoseLevel, 0) / readingsCount
      )
    : 0;

  const trendLabel =
    trend.direction === "up"
      ? "Subiendo"
      : trend.direction === "down"
        ? "Bajando"
        : "Estable";

  if (!readingsCount) {
    return {
      level: "empty",
      title: "Sin datos suficientes",
      summary:
        "Aún no hay lecturas recientes para evaluar tu control. Registra glucosa, comidas y actividad para generar tu informe.",
      lastReading: null,
      average: 0,
      inRangePercent: 0,
      trendLabel: "—",
      streak: 0,
      lowCount: 0,
      highCount: 0,
      readingsCount: 0,
      doctorNote:
        "Recomendación: toma al menos una lectura hoy y anota qué comiste. Con 3–5 días de registros el informe será mucho más útil.",
    };
  }

  const lastStatus = lastReading
    ? getGlucoseStatus(lastReading.glucoseLevel)
    : null;

  let level: ControlLevel = "good";
  let title = "Control aceptable";
  let summary =
    "Tus lecturas muestran un control razonable. Sigue registrando para afinar el seguimiento.";
  let doctorNote =
    "Mantén horarios regulares de comida y medicación. Si algo cambia, comparte este informe con tu médico.";

  if (inRangePercent >= 75 && highCount <= 1 && lowCount === 0) {
    level = "excellent";
    title = "Control muy bueno";
    summary = `La mayoría de tus lecturas están en rango (${inRangePercent}%). Buen trabajo sosteniendo hábitos.`;
    doctorNote =
      "Patrón favorable. Continúa con la misma rutina de registros y revisa este informe en tu próxima consulta.";
  } else if (highCount >= 3 || (lastStatus?.status === "high" && trend.direction === "up")) {
    level = "critical";
    title = "Requiere atención";
    summary = `Detectamos ${highCount} lectura${highCount === 1 ? "" : "s"} alta${highCount === 1 ? "" : "s"} y tendencia al alza. Conviene revisar comidas y medicación.`;
    doctorNote =
      "Prioriza porciones de carbohidratos, hidratación y movimiento ligero post-comida. Si persiste, contacta a tu equipo de salud.";
  } else if (lowCount >= 2 || lastStatus?.status === "low") {
    level = "attention";
    title = "Cuidado con lecturas bajas";
    summary = `Hubo ${lowCount} lectura${lowCount === 1 ? "" : "s"} por debajo de 70 mg/dL. Lleva contigo algo para corregir hipoglucemia.`;
    doctorNote =
      "No te saltes comidas ni dosis sin indicación médica. Monitorea de nuevo si sientes síntomas.";
  } else if (inRangePercent < 50 || highCount >= 2) {
    level = "attention";
    title = "Control mejorable";
    summary = `Solo ${inRangePercent}% de lecturas en rango. Hay margen para mejorar con constancia en registros y horarios.`;
    doctorNote = `Con ${formatDiabetesType(diabetesType).toLowerCase()}, pequeños ajustes en comidas y actividad suelen marcar diferencia en 1–2 semanas.`;
  }

  return {
    level,
    title,
    summary,
    lastReading,
    average,
    inRangePercent,
    trendLabel,
    streak,
    lowCount,
    highCount,
    readingsCount,
    doctorNote,
  };
}

export function controlLevelStyles(level: ControlLevel) {
  switch (level) {
    case "excellent":
      return {
        border: "border-emerald-200 dark:border-emerald-700/60",
        bg: "bg-emerald-50/40 dark:bg-emerald-950/45",
        tone: "text-emerald-800 dark:text-emerald-200",
        dot: "bg-emerald-500",
      };
    case "good":
      return {
        border: "border-sky-200 dark:border-emerald-700/50",
        bg: "bg-sky-50/30 dark:bg-emerald-950/38",
        tone: "text-sky-900 dark:text-emerald-200",
        dot: "bg-sky-500",
      };
    case "attention":
      return {
        border: "border-amber-200 dark:border-amber-700/55",
        bg: "bg-amber-50/40 dark:bg-amber-950/40",
        tone: "text-amber-900 dark:text-amber-200",
        dot: "bg-amber-500",
      };
    case "critical":
      return {
        border: "border-red-200 dark:border-red-700/55",
        bg: "bg-red-50/40 dark:bg-red-950/40",
        tone: "text-red-800 dark:text-red-300",
        dot: "bg-red-500",
      };
    default:
      return {
        border: "border-slate-200 dark:border-emerald-800/40",
        bg: "bg-slate-50/40 dark:bg-emerald-950/30",
        tone: "text-slate-700 dark:text-slate-200",
        dot: "bg-slate-400",
      };
  }
}

export { formatDiabetesType };
