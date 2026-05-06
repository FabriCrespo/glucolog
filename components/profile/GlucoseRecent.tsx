import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { GlucoseRecord } from "@/types/glucose";
import { fetchGlucoseRecords } from "@/services/glucoseService";

interface GlucoseRecentProps {
  userId: string;
}

type RangeDays = 7 | 14 | 30;

type ComputedStats = {
  lastReading: GlucoseRecord | null;
  average: number;
  trend: "up" | "down" | "stable";
  readingsCount: number;
  inRangePercent: number;
  lowCount: number;
  highCount: number;
};

const GlucoseRecent = ({ userId }: GlucoseRecentProps) => {
  const [selectedRange, setSelectedRange] = useState<RangeDays>(7);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ComputedStats>({
    lastReading: null,
    average: 0,
    trend: "stable",
    readingsCount: 0,
    inRangePercent: 0,
    lowCount: 0,
    highCount: 0,
  });

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        const recentRecords = await fetchGlucoseRecords(userId, selectedRange);
        setRecords(recentRecords);

        if (recentRecords.length > 0) {
          const sortedRecords = [...recentRecords].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          });

          const lastReading = sortedRecords[0];
          const glucoseLevels = recentRecords.map((r) => r.glucoseLevel);
          const average =
            glucoseLevels.reduce((sum, level) => sum + level, 0) /
            glucoseLevels.length;

          let trend: "up" | "down" | "stable" = "stable";
          if (sortedRecords.length >= 3) {
            const recent = sortedRecords
              .slice(0, 3)
              .map((r) => r.glucoseLevel);
            const avgRecent =
              recent.reduce((sum, val) => sum + val, 0) / recent.length;
            const older = sortedRecords
              .slice(Math.max(0, sortedRecords.length - 3))
              .map((r) => r.glucoseLevel);
            const avgOlder =
              older.reduce((sum, val) => sum + val, 0) / older.length;

            if (avgRecent > avgOlder + 10) trend = "up";
            else if (avgRecent < avgOlder - 10) trend = "down";
          }

          const lowCount = recentRecords.filter((r) => r.glucoseLevel < 70).length;
          const highCount = recentRecords.filter((r) => r.glucoseLevel > 140).length;
          const inRangeCount = recentRecords.length - lowCount - highCount;
          const inRangePercent = Math.round((inRangeCount / recentRecords.length) * 100);

          setStats({
            lastReading,
            average: Math.round(average),
            trend,
            readingsCount: recentRecords.length,
            inRangePercent,
            lowCount,
            highCount,
          });
        } else {
          setStats({
            lastReading: null,
            average: 0,
            trend: "stable",
            readingsCount: 0,
            inRangePercent: 0,
            lowCount: 0,
            highCount: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching glucose data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecentData();
  }, [selectedRange, userId]);

  const dailyAverage = useMemo(() => {
    const buckets: Record<string, number[]> = {};
    for (const record of records) {
      if (!buckets[record.date]) buckets[record.date] = [];
      buckets[record.date].push(record.glucoseLevel);
    }
    return Object.entries(buckets)
      .map(([date, values]) => ({
        date,
        avg: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8);
  }, [records]);

  const foodMentions = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const food = (r.foodEaten ?? "").trim();
      if (!food) continue;
      map.set(food, (map.get(food) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [records]);

  const getStatusColor = (level: number) => {
    if (level < 70) return "text-yellow-500";
    if (level > 140) return "text-red-500";
    return "text-green-500";
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendMessage = () => {
    switch (stats.trend) {
      case "up":
        return "Tendencia al alza";
      case "down":
        return "Tendencia a la baja";
      default:
        return "Niveles estables";
    }
  };

  const getEnergyMessage = () => {
    if (!stats.readingsCount) return "Aun sin datos suficientes.";
    if (stats.inRangePercent >= 75) {
      return "Excelente consistencia: la mayor parte del tiempo estuviste en rango.";
    }
    if (stats.inRangePercent >= 55) {
      return "Buen avance: hay base estable, con margen para pulir picos.";
    }
    return "Semana desafiante: prioriza constancia en comidas y horarios.";
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-3 h-4 w-1/3 rounded bg-slate-200" />
        <div className="mb-6 h-10 w-1/2 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-slate-900">Sin datos recientes</h3>
        </div>
        <p className="text-sm text-slate-600">
          No hay registros de glucosa en los ultimos {selectedRange} dias.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setSelectedRange(days as RangeDays)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedRange === days
                  ? "bg-vitality-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Salud en tus ultimos dias
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Panorama dinamico de tu glucosa reciente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setSelectedRange(days as RangeDays)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedRange === days
                  ? "bg-vitality-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      {stats.lastReading && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Ultima lectura
              </p>
              <div className="mt-2 flex items-baseline">
                <span
                  className={`text-3xl font-bold ${getStatusColor(stats.lastReading.glucoseLevel)}`}
                >
                  {stats.lastReading.glucoseLevel}
                </span>
                <span className="ml-1 text-sm text-slate-500">mg/dL</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {stats.lastReading.date} · {stats.lastReading.time.substring(0, 5)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Promedio
              </p>
              <p className={`mt-2 text-2xl font-bold ${getStatusColor(stats.average)}`}>
                {stats.average}{" "}
                <span className="text-sm font-medium text-slate-500">mg/dL</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.readingsCount} registros
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tiempo en rango
              </p>
              <p className="mt-2 text-2xl font-bold text-vitality-primary">
                {stats.inRangePercent}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Bajos: {stats.lowCount} · Altos: {stats.highCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tendencia
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                {getTrendIcon()}
                {getTrendMessage()}
              </div>
              <p className="mt-1 text-xs text-slate-500">{getEnergyMessage()}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <CalendarDays className="h-4 w-4" />
                Evolucion diaria (promedio)
              </p>
              <div className="space-y-2">
                {dailyAverage.map((day) => {
                  const widthPct = Math.max(
                    8,
                    Math.min(100, Math.round((day.avg / 220) * 100))
                  );
                  const tone =
                    day.avg < 70
                      ? "bg-yellow-400"
                      : day.avg > 140
                        ? "bg-red-400"
                        : "bg-emerald-500";

                  return (
                    <div
                      key={day.date}
                      className="grid grid-cols-[5rem,1fr,4rem] items-center gap-2 text-xs"
                    >
                      <span className="font-medium text-slate-600">
                        {day.date.slice(5)}
                      </span>
                      <div className="h-2.5 rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${tone}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="text-right font-semibold text-slate-700">
                        {day.avg} mg
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Hallazgos rapidos
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-vitality-primary" />
                  <span>
                    Registros capturados: <strong>{stats.readingsCount}</strong>{" "}
                    en los ultimos {selectedRange} dias.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-vitality-primary" />
                  <span>
                    Mejor ventana de control:{" "}
                    <strong>
                      {stats.inRangePercent >= 70 ? "muy buena" : "en progreso"}
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-vitality-primary" />
                  <span>
                    Alimentos mas anotados:{" "}
                    {foodMentions.length
                      ? foodMentions.map((f) => `${f.name} (${f.count})`).join(", ")
                      : "aun no hay comidas registradas"}
                    .
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GlucoseRecent;
