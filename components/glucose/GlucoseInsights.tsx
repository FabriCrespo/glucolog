"use client";

import { motion } from "framer-motion";
import type { GlucoseRecord } from "@/types/glucose";
import { getGlucoseStatus } from "@/lib/dashboard/metrics";

interface GlucoseInsightsProps {
  records: GlucoseRecord[];
}

export default function GlucoseInsights({ records }: GlucoseInsightsProps) {
  if (!records.length) return null;

  const levels = records.map((r) => r.glucoseLevel);
  const average = Math.round(
    levels.reduce((sum, level) => sum + level, 0) / levels.length
  );
  const max = Math.max(...levels);
  const min = Math.min(...levels);
  const normal = levels.filter((l) => l >= 70 && l <= 140).length;
  const high = levels.filter((l) => l > 140).length;
  const low = levels.filter((l) => l < 70).length;
  const total = levels.length;
  const { label: avgLabel, status } = getGlucoseStatus(average);

  const STATUS_TEXT = {
    low: "text-amber-600",
    normal: "text-emerald-600",
    high: "text-red-600",
  } as const;

  const recommendation =
    high > normal
      ? "Hay más lecturas altas que en rango. Revisa carbohidratos y actividad reciente."
      : low > 0
        ? "Detectamos hipoglucemias. Mantén fuente rápida de glucosa cerca."
        : average > 140
          ? "El promedio supera el rango objetivo. Consulta ajustes con tu médico."
          : average < 70
            ? "Promedio bajo. Valora revisión de medicación o ingesta."
            : "Promedio en rango. Mantén el ritmo de registros.";

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-6 border-b border-slate-200/90 pb-8 sm:grid-cols-4 sm:divide-x sm:divide-slate-200/90">
        <div className="dash-stat-cell sm:px-6 sm:first:pl-0">
          <dt className="dash-stat-label">Promedio</dt>
          <dd className={`mt-2 text-3xl font-extralight tabular-nums lg:text-4xl ${STATUS_TEXT[status]}`}>
            {average}
          </dd>
          <dd className="dash-muted mt-1">{avgLabel}</dd>
        </div>
        <div className="dash-stat-cell sm:px-6">
          <dt className="dash-stat-label">Mínimo</dt>
          <dd className="dash-stat-value mt-2 text-3xl lg:text-4xl">{min}</dd>
        </div>
        <div className="dash-stat-cell sm:px-6">
          <dt className="dash-stat-label">Máximo</dt>
          <dd className="dash-stat-value mt-2 text-3xl lg:text-4xl">{max}</dd>
        </div>
        <div className="dash-stat-cell sm:px-6 sm:last:pr-0">
          <dt className="dash-stat-label">Lecturas</dt>
          <dd className="dash-stat-value mt-2 text-3xl lg:text-4xl">{total}</dd>
        </div>
      </dl>

      <div>
        <p className="dash-stat-label">Distribución</p>
        <div className="mt-4 h-px w-full bg-slate-200">
          <div className="flex h-px">
            <motion.div
              className="h-px bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(normal / total) * 100}%` }}
              transition={{ duration: 0.7 }}
            />
            <motion.div
              className="h-px bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(high / total) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.1 }}
            />
            <motion.div
              className="h-px bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${(low / total) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.2 }}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-light text-slate-500">
          <span className="transition-colors hover:text-emerald-700">
            <span className="font-normal text-emerald-600">{normal}</span> en rango
          </span>
          <span className="transition-colors hover:text-red-700">
            <span className="font-normal text-red-600">{high}</span> altas
          </span>
          <span className="transition-colors hover:text-amber-700">
            <span className="font-normal text-amber-600">{low}</span> bajas
          </span>
        </div>
      </div>

      <p className="dash-accent-quote text-sm">{recommendation}</p>
    </div>
  );
}
