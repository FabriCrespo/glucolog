"use client";

import { useEffect, useState } from "react";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import { getGlucoseStatus } from "@/lib/dashboard/metrics";
import {
  buildDailyReport,
  controlLevelStyles,
  formatDiabetesType,
  getReportDateLabel,
  type DailyReportSummary,
} from "@/lib/profile/dailyReport";

interface DailyHealthReportProps {
  userId: string;
  patientName: string;
  diabetesType?: string;
}

export default function DailyHealthReport({
  userId,
  patientName,
  diabetesType,
}: DailyHealthReportProps) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DailyReportSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const records = await fetchGlucoseRecords(userId, 14);
        if (cancelled) return;
        setReport(buildDailyReport(records, diabetesType));
      } catch {
        if (!cancelled) {
          setReport(buildDailyReport([], diabetesType));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, diabetesType]);

  if (loading || !report) {
    return (
      <div className="animate-pulse border border-slate-200 p-6">
        <div className="h-4 w-1/3 bg-slate-200" />
        <div className="mt-4 h-8 w-2/3 bg-slate-200" />
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="h-16 bg-slate-100" />
          <div className="h-16 bg-slate-100" />
          <div className="h-16 bg-slate-100" />
          <div className="h-16 bg-slate-100" />
        </div>
      </div>
    );
  }

  const styles = controlLevelStyles(report.level);
  const lastStatus = report.lastReading
    ? getGlucoseStatus(report.lastReading.glucoseLevel)
    : null;

  return (
    <article className={`border px-5 py-6 sm:px-6 ${styles.border} ${styles.bg}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Informe diario</p>
          <h2 className="dash-title mt-2 text-xl capitalize sm:text-2xl">
            {getReportDateLabel()}
          </h2>
          <p className="dash-body mt-2">
            Paciente: <strong className="font-medium">{patientName}</strong>
            <span className="mx-2 text-emerald-200">·</span>
            {formatDiabetesType(diabetesType)}
          </p>
        </div>
        <div className="text-right">
          <p className="dash-stat-label">Evaluación general</p>
          <p className={`mt-1 text-lg font-light ${styles.tone}`}>
            {report.title}
          </p>
        </div>
      </div>

      <p className={`dash-accent-quote mt-5 text-sm ${styles.tone}`}>
        {report.summary}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dash-stat-cell border border-slate-200/80 bg-white/60 px-4 py-3">
          <p className="dash-stat-label">Última glucosa</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {report.lastReading ? report.lastReading.glucoseLevel : "—"}
            {report.lastReading ? (
              <span className="ml-1 text-sm text-slate-400">mg/dL</span>
            ) : null}
          </p>
          {lastStatus ? (
            <p className={`dash-muted mt-1 ${styles.tone}`}>{lastStatus.label}</p>
          ) : null}
        </div>
        <div className="dash-stat-cell border border-slate-200/80 bg-white/60 px-4 py-3">
          <p className="dash-stat-label">En rango</p>
          <p className="dash-stat-value mt-1 text-2xl text-vitality-primary">
            {report.inRangePercent}%
          </p>
          <p className="dash-muted mt-1">últimos 14 días</p>
        </div>
        <div className="dash-stat-cell border border-slate-200/80 bg-white/60 px-4 py-3">
          <p className="dash-stat-label">Promedio</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {report.average || "—"}
            {report.average ? (
              <span className="ml-1 text-sm text-slate-400">mg/dL</span>
            ) : null}
          </p>
          <p className="dash-muted mt-1">{report.readingsCount} lecturas</p>
        </div>
        <div className="dash-stat-cell border border-slate-200/80 bg-white/60 px-4 py-3">
          <p className="dash-stat-label">Tendencia</p>
          <p className="dash-stat-value mt-1 text-2xl">{report.trendLabel}</p>
          <p className="dash-muted mt-1">
            Racha: {report.streak} día{report.streak === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="border border-emerald-200/80 bg-white/50 px-3 py-2.5 text-center">
          <p className="dash-stat-label text-emerald-800">En rango</p>
          <p className="dash-stat-value text-lg">
            {report.readingsCount - report.lowCount - report.highCount}
          </p>
        </div>
        <div className="border border-amber-200/80 bg-white/50 px-3 py-2.5 text-center">
          <p className="dash-stat-label text-amber-800">Bajas (&lt;70)</p>
          <p className="dash-stat-value text-lg">{report.lowCount}</p>
        </div>
        <div className="border border-red-200/80 bg-white/50 px-3 py-2.5 text-center">
          <p className="dash-stat-label text-red-800">Altas (&gt;140)</p>
          <p className="dash-stat-value text-lg">{report.highCount}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200/80 pt-5">
        <p className="dash-stat-label">Nota clínica orientativa</p>
        <p className="dash-body mt-2">{report.doctorNote}</p>
        <p className="dash-muted mt-3">
          Este informe resume lo que registraste en Glucolog. No reemplaza una
          consulta médica.
        </p>
      </div>
    </article>
  );
}
