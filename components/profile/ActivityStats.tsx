import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
} from "lucide-react";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import type { GlucoseRecord } from "@/types/glucose";

interface ActivityStatsProps {
  userId: string;
}

type RangeDays = 7 | 14 | 30;
type WorkoutType = "Caminata" | "Fuerza" | "Yoga" | "Movilidad";

const WORKOUT_PRESETS: Record<WorkoutType, number> = {
  Caminata: 30,
  Fuerza: 40,
  Yoga: 25,
  Movilidad: 20,
};

const ActivityStats = ({ userId }: ActivityStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<RangeDays>(14);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutType>("Caminata");
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchGlucoseRecords(userId, selectedRange);
        setRecords(data);
      } catch (error) {
        console.error("Error fetching activity data:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) void load();
  }, [selectedRange, userId]);

  const activeDays = useMemo(() => new Set(records.map((r) => r.date)).size, [records]);

  const readingsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.date, (map.get(r.date) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-8);
  }, [records]);

  const consistency = useMemo(
    () => (selectedRange ? Math.min(100, Math.round((activeDays / selectedRange) * 100)) : 0),
    [activeDays, selectedRange]
  );

  const estimatedMinutes = useMemo(() => {
    const base = activeDays * 22;
    return todayDone ? base + WORKOUT_PRESETS[todayWorkout] : base;
  }, [activeDays, todayDone, todayWorkout]);

  const weeklyGoalProgress = Math.min(100, Math.round((estimatedMinutes / 150) * 100));

  if (loading) {
    return (
      <div className="profile-skeleton">
        <div className="mb-4 h-5 w-1/3 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="profile-panel"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="dash-title flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-blue-600 dark:text-emerald-400" />
          Actividad fisica y consistencia
        </h3>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setSelectedRange(days as RangeDays)}
              className={`dash-pill ${selectedRange === days ? "dash-pill-active" : "dash-pill-idle"}`}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="profile-card-muted">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-300/80">
            Dias activos
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{activeDays}</p>
          <p className="mt-1 text-xs text-slate-500">Con registros en la app</p>
        </div>
        <div className="profile-card-muted">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-300/80">
            Consistencia
          </p>
          <p className="mt-1 text-2xl font-bold text-vitality-primary">{consistency}%</p>
          <p className="mt-1 text-xs text-slate-500">Ventana de {selectedRange} dias</p>
        </div>
        <div className="profile-card-muted">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-300/80">
            Minutos estimados
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{estimatedMinutes}</p>
          <p className="mt-1 text-xs text-slate-500">Basado en tu ritmo de registro</p>
        </div>
      </div>

      <div className="profile-card mt-5">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emerald-300/80">
          <Flame className="h-4 w-4 text-amber-500" />
          Progreso objetivo semanal (150 min)
        </p>
        <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-emerald-950/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyGoalProgress}%` }}
            transition={{ duration: 0.6 }}
            className="h-2.5 rounded-full bg-vitality-primary"
          />
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {weeklyGoalProgress}% del objetivo.{" "}
          {weeklyGoalProgress >= 100
            ? "Meta cumplida, excelente trabajo."
            : "Suma sesiones cortas para acercarte a la meta."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="profile-card-muted">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-emerald-300/80">
            <Calendar className="h-4 w-4 text-purple-600" />
            Ritmo diario reciente
          </p>
          <div className="space-y-2">
            {readingsPerDay.length ? (
              readingsPerDay.map(([date, count]) => {
                const width = Math.max(10, Math.min(100, count * 18));
                return (
                  <div
                    key={date}
                    className="grid grid-cols-[5rem,1fr,3rem] items-center gap-2 text-xs"
                  >
                    <span className="font-medium text-slate-600 dark:text-slate-300">{date.slice(5)}</span>
                    <div className="h-2.5 rounded-full bg-slate-200 dark:bg-emerald-950/50">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-right font-semibold text-slate-700 dark:text-slate-200">{count}x</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">Aun no hay suficientes registros.</p>
            )}
          </div>
        </div>

        <div className="profile-card">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-emerald-300/80">
            <Dumbbell className="h-4 w-4 text-blue-600" />
            Plan rapido de hoy
          </p>

          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(WORKOUT_PRESETS) as WorkoutType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTodayWorkout(option)}
                className={`dash-pill ${todayWorkout === option ? "dash-pill-active" : "dash-pill-idle"}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-emerald-800/30 dark:bg-emerald-950/22 dark:text-slate-200">
            <p className="font-medium">
              Sesion sugerida: {todayWorkout} ({WORKOUT_PRESETS[todayWorkout]} min)
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Bloque corto y sostenible.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTodayDone((v) => !v)}
            className={`mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-light transition-colors ${
              todayDone
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/55 dark:bg-emerald-950/45 dark:text-emerald-200"
                : "dash-btn-outline-active"
            }`}
          >
            {todayDone ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sesion marcada como hecha
              </>
            ) : (
              <>
                <Footprints className="h-4 w-4" />
                Marcar sesion de hoy
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityStats;
