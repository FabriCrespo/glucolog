import type { GlucoseRecord } from "@/types/glucose";
import {
  getInRangePercent,
  getLoggingStreak,
  getTrend,
} from "@/lib/dashboard/metrics";
import { detectGlucosePatterns } from "@/lib/dashboard/glucosePatterns";
import { formatDiabetesType } from "@/lib/profile/dailyReport";

export type WeeklyDoctorReport = {
  title: string;
  periodLabel: string;
  patientLine: string;
  metrics: {
    readings: number;
    average: number;
    inRangePercent: number;
    lowCount: number;
    highCount: number;
    streak: number;
    trendLabel: string;
  };
  patterns: string[];
  narrative: string;
  shareText: string;
};

function avg(records: GlucoseRecord[]): number {
  if (!records.length) return 0;
  return Math.round(
    records.reduce((s, r) => s + r.glucoseLevel, 0) / records.length
  );
}

/**
 * Informe semanal listo para compartir con el médico (texto).
 */
export function buildWeeklyDoctorReport(
  records: GlucoseRecord[],
  options?: {
    patientName?: string;
    diabetesType?: string;
    days?: number;
  }
): WeeklyDoctorReport {
  const days = options?.days ?? 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const week = records.filter((r) => {
    const d = r.recordedAt
      ? r.recordedAt.toDate()
      : new Date(`${r.date}T${r.time}`);
    return d >= cutoff;
  });

  const sorted = [...week].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    return db - da;
  });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const periodLabel = `${fmt(start)} – ${fmt(end)}`;
  const patientName = options?.patientName?.trim() || "Paciente";
  const diabetes = formatDiabetesType(options?.diabetesType);
  const patientLine = `${patientName} · ${diabetes}`;

  const inRangePercent = getInRangePercent(week);
  const trend = getTrend(sorted);
  const trendLabel =
    trend.direction === "up"
      ? "Subiendo"
      : trend.direction === "down"
        ? "Bajando"
        : "Estable";

  const metrics = {
    readings: week.length,
    average: avg(week),
    inRangePercent,
    lowCount: week.filter((r) => r.glucoseLevel < 70).length,
    highCount: week.filter((r) => r.glucoseLevel > 140).length,
    streak: getLoggingStreak(records),
    trendLabel,
  };

  const patterns = detectGlucosePatterns(week.length >= 5 ? week : records)
    .filter((p) => p.id !== "need-data")
    .map((p) => `${p.title}. ${p.detail}`);

  let narrative: string;
  if (!week.length) {
    narrative =
      "No hay lecturas en los últimos 7 días. Se recomienda reanudar el registro de glucosa capilar con contexto de comida y síntomas.";
  } else if (inRangePercent >= 70 && metrics.highCount <= 2) {
    narrative = `Control aceptable en la semana: ${inRangePercent}% en rango (70–140 mg/dL), promedio ${metrics.average} mg/dL. Tendencia ${trendLabel.toLowerCase()}.`;
  } else if (metrics.lowCount >= 2) {
    narrative = `Atención a hipoglucemias: ${metrics.lowCount} lecturas <70 mg/dL esta semana. Promedio ${metrics.average} mg/dL, ${inRangePercent}% en rango. Revisar dosis, timing de comida y actividad.`;
  } else {
    narrative = `Control mejorable: ${inRangePercent}% en rango, ${metrics.highCount} lecturas >140 mg/dL, promedio ${metrics.average} mg/dL. Tendencia ${trendLabel.toLowerCase()}. Útil revisar porciones post-comida y horarios.`;
  }

  const shareLines = [
    "INFORME SEMANAL DE GLUCOSA — Glucolog",
    periodLabel,
    patientLine,
    "",
    `Lecturas: ${metrics.readings}`,
    `Promedio: ${metrics.average} mg/dL`,
    `% en rango (70–140): ${metrics.inRangePercent}%`,
    `Bajas (<70): ${metrics.lowCount}`,
    `Altas (>140): ${metrics.highCount}`,
    `Tendencia: ${metrics.trendLabel}`,
    `Racha de registro: ${metrics.streak} día(s)`,
    "",
    "Resumen clínico orientativo:",
    narrative,
    "",
  ];

  if (patterns.length) {
    shareLines.push("Patrones observados:");
    for (const p of patterns) shareLines.push(`• ${p}`);
    shareLines.push("");
  }

  shareLines.push(
    "Nota: documento educativo generado por la app. No sustituye evaluación médica."
  );

  return {
    title: "Informe semanal para el médico",
    periodLabel,
    patientLine,
    metrics,
    patterns,
    narrative,
    shareText: shareLines.join("\n"),
  };
}
