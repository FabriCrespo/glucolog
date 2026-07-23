"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Printer } from "lucide-react";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import { buildWeeklyDoctorReport } from "@/lib/profile/weeklyDoctorReport";

interface WeeklyDoctorReportPanelProps {
  userId: string;
  patientName: string;
  diabetesType?: string;
}

export default function WeeklyDoctorReportPanel({
  userId,
  patientName,
  diabetesType,
}: WeeklyDoctorReportPanelProps) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<
    Awaited<ReturnType<typeof fetchGlucoseRecords>>
  >([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchGlucoseRecords(userId, 30);
        if (!cancelled) setRecords(data);
      } catch {
        if (!cancelled) setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const report = useMemo(
    () =>
      buildWeeklyDoctorReport(records, {
        patientName,
        diabetesType,
        days: 7,
      }),
    [records, patientName, diabetesType]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>${report.title}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:2rem;color:#0f172a;line-height:1.5;max-width:40rem;margin:0 auto}
        h1{font-size:1.25rem;font-weight:500;margin:0 0 .25rem}
        .muted{color:#64748b;font-size:.875rem}
        pre{white-space:pre-wrap;font-size:.9rem;margin-top:1.5rem}
        @media print{body{padding:0}}
      </style></head><body>
      <h1>${report.title}</h1>
      <p class="muted">${report.periodLabel} · ${report.patientLine}</p>
      <pre>${report.shareText.replace(/</g, "&lt;")}</pre>
      <script>window.onload=()=>{window.print()}<\/script>
      </body></html>`);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="profile-skeleton mt-8">
        <div className="h-4 w-1/3 bg-slate-200" />
        <div className="mt-4 h-24 bg-slate-100" />
      </div>
    );
  }

  return (
    <section
      aria-label="Informe semanal médico"
      className="mt-10 border-t border-slate-200 pt-8 dark:border-emerald-800/45"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Para tu médico</p>
          <h3 className="dash-title mt-2 text-lg sm:text-xl">{report.title}</h3>
          <p className="dash-muted mt-1">
            {report.periodLabel} · {report.patientLine}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="dash-btn-ghost inline-flex items-center gap-1.5"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {copied ? "Copiado" : "Copiar texto"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="dash-btn-ghost inline-flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
            PDF / imprimir
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-slate-200/90">
        <div className="sm:px-4 sm:first:pl-0">
          <p className="dash-stat-label">Lecturas</p>
          <p className="dash-stat-value mt-1 text-2xl">{report.metrics.readings}</p>
        </div>
        <div className="sm:px-4">
          <p className="dash-stat-label">Promedio</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {report.metrics.average || "—"}
          </p>
        </div>
        <div className="sm:px-4">
          <p className="dash-stat-label">En rango</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-emerald-600">
            {report.metrics.readings ? `${report.metrics.inRangePercent}%` : "—"}
          </p>
        </div>
        <div className="sm:px-4 sm:last:pr-0">
          <p className="dash-stat-label">Tendencia</p>
          <p className="dash-stat-value mt-1 text-2xl">{report.metrics.trendLabel}</p>
        </div>
      </div>

      <p className="dash-body mt-6">{report.narrative}</p>

      {report.patterns.length ? (
        <ul className="mt-4 space-y-2">
          {report.patterns.map((p) => (
            <li
              key={p}
              className="flex gap-2 text-sm font-light text-slate-600 dark:text-emerald-200/85"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <pre className="mt-6 max-h-48 overflow-auto border border-slate-100 bg-slate-50/50 p-4 text-xs font-light leading-relaxed text-slate-600 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200/80">
        {report.shareText}
      </pre>
    </section>
  );
}
