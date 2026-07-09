"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GlucoseRecord } from "@/types/glucose";
import { getGlucoseStatus } from "@/lib/dashboard/metrics";

interface GlucoseTableProps {
  records: GlucoseRecord[];
  fetchingRecords: boolean;
  className?: string;
}

const CONTEXT_LABELS: Record<string, string> = {
  fasting: "Ayunas",
  pre_meal: "Pre comida",
  post_meal_1h: "Post 1h",
  post_meal_2h: "Post 2h",
  bedtime: "Noche",
  random: "Aleatoria",
};

const STATUS_DOT = {
  low: "bg-amber-500",
  normal: "bg-emerald-500",
  high: "bg-red-500",
} as const;

const STATUS_TEXT = {
  low: "text-amber-600",
  normal: "text-emerald-600",
  high: "text-red-600",
} as const;

export default function GlucoseTable({
  records,
  fetchingRecords,
  className = "",
}: GlucoseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(records.length / recordsPerPage));
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = records.slice(indexOfFirst, indexOfLast);

  if (fetchingRecords) {
    return (
      <div className={`border-y border-slate-200 py-16 text-center ${className}`}>
        <p className="text-sm font-light text-slate-400">Cargando registros…</p>
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className={`border-y border-dashed border-slate-200 py-16 text-center ${className}`}>
        <p className="dash-eyebrow">Sin datos</p>
        <p className="dash-body mt-3">
          Pulsa <span className="font-normal text-vitality-primary">Nuevo registro</span> para añadir tu primera lectura.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-slate-200 border-y border-slate-200">
        {currentRecords.map((record, index) => {
          const { status, label } = getGlucoseStatus(record.glucoseLevel);
          const context = CONTEXT_LABELS[record.measurementContext] ?? "—";

          return (
            <motion.li
              key={`${record.recordedAtIso}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="group dash-row grid grid-cols-[1fr_auto] items-center gap-4 py-4 sm:grid-cols-12 sm:gap-6 sm:py-5"
            >
              <div className="min-w-0 sm:col-span-5">
                <p className="text-sm font-light text-slate-800">{record.date}</p>
                <p className="dash-muted mt-0.5">
                  {record.time}
                  <span className="mx-2 text-emerald-200">·</span>
                  <span className="text-emerald-800/60">{context}</span>
                  {record.ateSomething && record.foodMeal ? (
                    <>
                      <span className="mx-2 text-slate-200">·</span>
                      {record.foodMeal}
                    </>
                  ) : null}
                </p>
              </div>

              <div className="hidden items-center gap-6 sm:col-span-4 sm:flex">
                <span className="dash-stat-label hidden sm:inline">
                  {record.ateSomething ? "Comió" : "Sin comida"}
                </span>
                {record.foodEaten ? (
                  <span className="truncate text-xs font-light text-slate-500 transition-colors group-hover:text-slate-600">
                    {record.foodEaten}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 sm:col-span-3">
                <span
                  className={`hidden items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] sm:inline-flex ${STATUS_TEXT[status]}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
                  {label}
                </span>
                <p className={`text-2xl font-extralight tabular-nums sm:text-3xl ${STATUS_TEXT[status]}`}>
                  {record.glucoseLevel}
                </p>
                <span className="hidden text-[10px] font-light text-slate-400 sm:inline">
                  mg/dL
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between pt-5">
          <p className="text-xs font-light text-slate-400">
            {indexOfFirst + 1}–{Math.min(indexOfLast, records.length)} de {records.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 transition-all duration-200 hover:bg-emerald-50 hover:text-vitality-primary disabled:opacity-30 dark:hover:text-emerald-400"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-light tabular-nums text-emerald-800/70">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 transition-all duration-200 hover:bg-emerald-50 hover:text-vitality-primary disabled:opacity-30 dark:hover:text-emerald-400"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
