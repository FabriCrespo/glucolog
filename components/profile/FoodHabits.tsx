import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Coffee, Clock, TrendingUp, Utensils } from "lucide-react";
import { fetchGlucoseRecords } from "@/services/glucoseService";
import type { GlucoseRecord } from "@/types/glucose";

interface FoodHabitsProps {
  userId: string;
}

type RangeDays = 7 | 14 | 30;

const FoodHabits = ({ userId }: FoodHabitsProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<RangeDays>(14);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchGlucoseRecords(userId, selectedRange);
        setRecords(data);
      } catch (error) {
        console.error("Error fetching food habit data:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) void load();
  }, [selectedRange, userId]);

  const eatenRecords = useMemo(
    () => records.filter((r) => r.ateSomething && (r.foodEaten ?? "").trim()),
    [records]
  );

  const lastMeal = useMemo(() => {
    if (!eatenRecords.length) return null;
    return [...eatenRecords].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    })[0];
  }, [eatenRecords]);

  const frequentFoods = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of eatenRecords) {
      const key = (item.foodEaten ?? "").trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [eatenRecords]);

  const highImpactFoods = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const item of eatenRecords) {
      const key = (item.foodEaten ?? "").trim();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(item.glucoseLevel);
    }
    return [...grouped.entries()]
      .map(([name, levels]) => {
        const avg = Math.round(levels.reduce((sum, v) => sum + v, 0) / levels.length);
        let impact: "alto" | "medio-alto" | "medio" | "bajo" = "bajo";
        if (avg > 160) impact = "alto";
        else if (avg > 140) impact = "medio-alto";
        else if (avg > 115) impact = "medio";
        return { name, impact, avg };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);
  }, [eatenRecords]);

  const mealConsistency = useMemo(() => {
    if (!eatenRecords.length) return 0;
    const days = new Set(eatenRecords.map((r) => r.date)).size;
    const score = Math.min(100, Math.round((days / selectedRange) * 100));
    return score;
  }, [eatenRecords, selectedRange]);

  const getMealIcon = (mealType?: string | null) => {
    const value = (mealType ?? "").toLowerCase();
    if (value.includes("desayuno")) return <Coffee className="h-5 w-5 text-yellow-500" />;
    if (value.includes("almuerzo")) return <Utensils className="h-5 w-5 text-emerald-500" />;
    if (value.includes("cena")) return <Utensils className="h-5 w-5 text-blue-500" />;
    return <Clock className="h-5 w-5 text-purple-500" />;
  };

  const getImpactClasses = (impact: string) => {
    if (impact === "alto") return "bg-red-100 text-red-700 border-red-200";
    if (impact === "medio-alto") return "bg-orange-100 text-orange-700 border-orange-200";
    if (impact === "medio") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-1/3 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!eatenRecords.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Utensils className="h-5 w-5 text-emerald-600" />
          Habitos alimenticios
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Aun no hay comidas registradas para analizar en los ultimos {selectedRange} dias.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Utensils className="h-5 w-5 text-emerald-600" />
          Habitos alimenticios reales
        </h3>
        <div className="flex gap-2">
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Comidas registradas
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{eatenRecords.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dias con registros
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {new Set(eatenRecords.map((r) => r.date)).size}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Consistencia
          </p>
          <p className="mt-1 text-2xl font-bold text-vitality-primary">{mealConsistency}%</p>
        </div>
      </div>

      {lastMeal && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Ultima comida registrada
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">{lastMeal.foodEaten}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                {getMealIcon(lastMeal.foodMeal)}
                <span className="capitalize">
                  {lastMeal.foodMeal ?? "Sin tipo"} · {lastMeal.date} · {lastMeal.time.slice(0, 5)}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {lastMeal.glucoseLevel} mg/dL
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Alimentos mas frecuentes
          </p>
          <div className="space-y-2">
            {frequentFoods.map((food) => (
              <div
                key={food.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-800">{food.name}</span>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                  {food.count} veces
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <TrendingUp className="h-4 w-4 text-red-500" />
            Mayor impacto glucemico
          </p>
          <div className="space-y-2">
            {highImpactFoods.map((food) => (
              <div
                key={food.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-800">{food.name}</span>
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${getImpactClasses(
                    food.impact
                  )}`}
                >
                  {food.impact} · {food.avg} mg/dL
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p>
              Esto es orientativo: compara estos patrones con tu contexto clinico y tus horarios.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodHabits;
