"use client";

import type { GlucoseRecord } from "@/types/glucose";
import {
  getCoachTip,
  getGlucoseStatus,
  getGreeting,
  getInRangePercent,
  getLoggingStreak,
  getTrend,
} from "@/lib/dashboard/metrics";

interface DashboardDesktopHeroProps {
  records: GlucoseRecord[];
  userName?: string | null;
}

function formatLastReading(record: GlucoseRecord): string {
  const date = record.recordedAt
    ? record.recordedAt.toDate()
    : new Date(`${record.date}T${record.time}`);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_TEXT = {
  low: "text-amber-600",
  normal: "text-emerald-600",
  high: "text-red-600",
} as const;

export default function DashboardDesktopHero({
  records,
  userName,
}: DashboardDesktopHeroProps) {
  const latest = records[0] ?? null;
  const coachTip = getCoachTip(records, latest);
  const status = latest ? getGlucoseStatus(latest.glucoseLevel) : null;
  const trend = getTrend(records);
  const inRange = getInRangePercent(records);
  const streak = getLoggingStreak(records);

  const trendLabel =
    trend.direction === "stable"
      ? "Estable"
      : trend.direction === "up"
        ? `+${trend.delta}`
        : `−${trend.delta}`;

  const trendColor =
    trend.direction === "up"
      ? "text-red-600 group-hover:text-red-700"
      : trend.direction === "down"
        ? "text-emerald-600 group-hover:text-vitality-primary"
        : "text-slate-800 group-hover:text-vitality-primary";

  return (
    <header className="mb-10 hidden md:block lg:mb-14">
      <p className="dash-eyebrow">Glucolog</p>

      <div className="mt-3 flex items-end justify-between gap-10 border-b border-slate-200/90 pb-10">
        <div className="max-w-lg">
          <h1 className="dash-title text-2xl lg:text-3xl">{getGreeting(userName)}</h1>
          <p className="dash-accent-quote mt-5 text-sm">{coachTip}</p>
        </div>

        <dl className="group shrink-0 text-right">
          <dt className="dash-stat-label">Última lectura</dt>
          <dd className="mt-2 text-6xl font-extralight tabular-nums leading-none text-slate-800 transition-colors duration-300 group-hover:text-vitality-primary lg:text-7xl">
            {latest?.glucoseLevel ?? "—"}
          </dd>
          <dd className="dash-muted mt-2">
            mg/dL
            {status ? (
              <>
                {" · "}
                <span className={STATUS_TEXT[status.status]}>{status.label}</span>
              </>
            ) : null}
          </dd>
          {latest ? (
            <dd className="mt-1 text-xs font-light text-slate-500">{formatLastReading(latest)}</dd>
          ) : null}
        </dl>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-slate-200/90">
        <div className="dash-stat-cell sm:px-6 sm:first:pl-0">
          <dt className="dash-stat-label">Racha</dt>
          <dd className="dash-stat-value mt-2 text-2xl">{streak ? `${streak}d` : "—"}</dd>
        </div>
        <div className="dash-stat-cell sm:px-6">
          <dt className="dash-stat-label">En rango</dt>
          <dd className="mt-2 text-2xl font-extralight tabular-nums text-emerald-600 transition-colors duration-300 group-hover:text-vitality-primary">
            {records.length ? `${inRange}%` : "—"}
          </dd>
        </div>
        <div className="dash-stat-cell sm:px-6">
          <dt className="dash-stat-label">Tendencia</dt>
          <dd className={`mt-2 text-2xl font-extralight tabular-nums transition-colors duration-300 ${trendColor}`}>
            {records.length >= 2 ? trendLabel : "—"}
          </dd>
        </div>
        <div className="dash-stat-cell sm:px-6 sm:last:pr-0">
          <dt className="dash-stat-label">Lecturas</dt>
          <dd className="dash-stat-value mt-2 text-2xl">{records.length || "—"}</dd>
        </div>
      </dl>
    </header>
  );
}
