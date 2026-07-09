"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import type { Chart as ChartJS } from "chart.js";
import type { GlucoseRecord } from "@/types/glucose";
import { getGlucoseStatus, getInRangePercent } from "@/lib/dashboard/metrics";
import type { GlucoseChartBundle } from "@/hooks/useGlucoseChartBundle";
import {
  applyBarSelection,
  applyTimelineSelection,
  buildMealImpactOptions,
  buildPatternOptions,
  buildTimelineOptions,
} from "@/utils/chartHelpers";
import GlucoseInsights from "@/components/glucose/GlucoseInsights";
import "@/utils/chartConfig";

type ChartTab = "timeline" | "meals" | "patterns" | "summary";

const TABS: { id: ChartTab; label: string }[] = [
  { id: "timeline", label: "Tendencia" },
  { id: "meals", label: "Comidas" },
  { id: "patterns", label: "Horarios" },
  { id: "summary", label: "Resumen" },
];

const CONTEXT_LABELS: Record<string, string> = {
  fasting: "Ayunas",
  pre_meal: "Pre comida",
  post_meal_1h: "Post 1h",
  post_meal_2h: "Post 2h",
  bedtime: "Noche",
  random: "Aleatoria",
};

interface GlucoseChartsProps {
  chartData: GlucoseChartBundle;
  chartOptions: unknown;
  fetchingRecords: boolean;
  records: GlucoseRecord[];
}

export default function GlucoseCharts({
  chartData,
  fetchingRecords,
  records,
}: GlucoseChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("timeline");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<"line" | "bar">>(null);

  const data = chartData;

  const inRange = getInRangePercent(records);
  const stats = useMemo(() => {
    if (!records.length) return null;
    const levels = records.map((r) => r.glucoseLevel);
    return {
      avg: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
      min: Math.min(...levels),
      max: Math.max(...levels),
    };
  }, [records]);

  const timelineChartData = useMemo(
    () => applyTimelineSelection(data.timelineData, selectedIndex),
    [data.timelineData, selectedIndex]
  );

  const mealChartData = useMemo(
    () =>
      applyBarSelection(
        {
          labels: data.mealImpactData.labels,
          datasets: data.mealImpactData.datasets,
        },
        selectedIndex
      ),
    [data.mealImpactData, selectedIndex]
  );

  const patternChartData = useMemo(
    () =>
      applyBarSelection(
        {
          labels: data.patternData.labels,
          datasets: data.patternData.datasets,
        },
        selectedIndex
      ),
    [data.patternData, selectedIndex]
  );

  const timelineOptions = useMemo(
    () => buildTimelineOptions(selectedIndex),
    [selectedIndex]
  );
  const mealOptions = useMemo(
    () => buildMealImpactOptions(selectedIndex),
    [selectedIndex]
  );
  const patternOptions = useMemo(
    () => buildPatternOptions(selectedIndex),
    [selectedIndex]
  );

  const handleChartClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const chart = chartRef.current;
      if (!chart) return;
      const elements = chart.getElementsAtEventForMode(
        event.nativeEvent,
        "nearest",
        { intersect: activeTab !== "timeline" },
        false
      );
      if (elements.length) {
        setSelectedIndex((prev) =>
          prev === elements[0].index ? null : elements[0].index
        );
      }
    },
    [activeTab]
  );

  const handleTabChange = (tab: ChartTab) => {
    setActiveTab(tab);
    setSelectedIndex(null);
  };

  const labelAt = (labels: unknown[] | undefined, index: number) => {
    const label = labels?.[index];
    if (label == null) return "";
    if (Array.isArray(label)) return label.join(", ");
    return String(label);
  };

  const selectionDetail = useMemo(() => {
    if (selectedIndex == null) return null;

    if (activeTab === "timeline") {
      const record = data.sortedRecords[selectedIndex];
      if (!record) return null;
      const { label } = getGlucoseStatus(record.glucoseLevel);
      return {
        title: labelAt(timelineChartData.labels, selectedIndex),
        value: record.glucoseLevel,
        meta: `${label} · ${CONTEXT_LABELS[record.measurementContext] ?? "—"}`,
        sub:
          record.foodMeal || record.foodEaten
            ? [record.foodMeal, record.foodEaten].filter(Boolean).join(" · ")
            : undefined,
      };
    }

    if (activeTab === "meals") {
      const val = data.mealImpactData.datasets[0].data[selectedIndex] as number;
      const count = data.mealImpactData.counts[selectedIndex];
      return {
        title: labelAt(data.mealImpactData.labels, selectedIndex),
        value: val ? Math.round(val) : null,
        meta: count ? `${count} lectura${count === 1 ? "" : "s"}` : "Sin datos",
        sub: "Promedio por tipo de comida",
      };
    }

    if (activeTab === "patterns") {
      const val = data.patternData.datasets[0].data[selectedIndex] as number;
      const count = data.patternData.counts[selectedIndex];
      return {
        title: labelAt(data.patternData.labels, selectedIndex),
        value: val ? Math.round(val) : null,
        meta: count ? `${count} lectura${count === 1 ? "" : "s"}` : "Sin datos",
        sub: "Promedio por franja horaria",
      };
    }

    return null;
  }, [
    activeTab,
    data,
    selectedIndex,
    timelineChartData.labels,
  ]);

  const hasPositiveBarValue = (v: number | [number, number] | null) =>
    typeof v === "number" && v > 0;

  const hasTimeline = (data.timelineData.datasets[0]?.data?.length ?? 0) > 0;
  const hasMeals =
    data.mealImpactData.datasets[0]?.data?.some(hasPositiveBarValue) ?? false;
  const hasPatterns =
    data.patternData.datasets[0]?.data?.some(hasPositiveBarValue) ?? false;

  return (
    <section aria-label="Análisis gráfico" className="w-full border-t border-slate-200 pt-10 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Análisis</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">Tendencias visuales</h2>
        </div>
        {stats ? (
          <dl className="flex gap-6 text-right sm:gap-8">
            <div className="group">
              <dt className="dash-stat-label">Prom</dt>
              <dd className="dash-stat-value mt-0.5 text-lg">{stats.avg}</dd>
            </div>
            <div className="group">
              <dt className="dash-stat-label">Rango</dt>
              <dd className="dash-stat-value mt-0.5 text-lg">
                {stats.min}–{stats.max}
              </dd>
            </div>
            <div className="group">
              <dt className="dash-stat-label">En rango</dt>
              <dd className="mt-0.5 text-lg font-extralight tabular-nums text-emerald-600 transition-colors duration-300 group-hover:text-vitality-primary">
                {inRange}%
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px scrollbar-none">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={activeTab === id ? "dash-tab dash-tab-active" : "dash-tab dash-tab-idle"}
          >
            {label}
          </button>
        ))}
      </div>

      {fetchingRecords ? (
        <p className="py-20 text-center text-sm font-light text-slate-400">
          Preparando gráficos…
        </p>
      ) : !records.length ? (
        <p className="border-y border-dashed border-slate-200 py-16 text-center text-sm font-light text-slate-400">
          Registra lecturas para ver tendencias e interacciones aquí.
        </p>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {selectionDetail ? (
              <motion.div
                key={`detail-${activeTab}-${selectedIndex}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-transparent"
              >
                <div className="flex flex-wrap items-end justify-between gap-4 py-4 pl-4 lg:pl-5">
                  <div className="min-w-0">
                    <p className="dash-stat-label">Selección</p>
                    <p className="dash-body mt-1">{selectionDetail.title}</p>
                    {selectionDetail.sub ? (
                      <p className="mt-0.5 text-xs font-light text-slate-400">
                        {selectionDetail.sub}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-end gap-4">
                    {selectionDetail.value != null ? (
                      <p className="text-4xl font-extralight tabular-nums text-vitality-primary">
                        {selectionDetail.value}
                        <span className="ml-2 text-sm font-light text-slate-400">
                          mg/dL
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-light text-slate-400">—</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(null)}
                      className="pb-1 text-xs font-light text-slate-500 transition-colors hover:text-vitality-primary"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                <p className="border-t border-slate-100 px-4 py-2 text-xs font-light text-slate-500 lg:pl-5">
                  {selectionDetail.meta}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-3 text-center text-[10px] font-light uppercase tracking-[0.18em] text-emerald-800/40"
              >
                Toca un punto o barra para explorar
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="relative border-b border-slate-200 py-6 lg:py-8"
            >
              {activeTab === "timeline" && hasTimeline ? (
                <div className="h-[min(52vh,380px)] min-h-[240px] w-full sm:min-h-[280px] lg:min-h-[320px]">
                  <Line
                    key="timeline-chart"
                    ref={chartRef as React.RefObject<ChartJS<"line">>}
                    data={timelineChartData}
                    options={timelineOptions}
                    onClick={handleChartClick}
                  />
                </div>
              ) : null}

              {activeTab === "meals" ? (
                hasMeals ? (
                  <div className="h-[min(45vh,320px)] min-h-[220px] w-full">
                    <Bar
                      key="meals-chart"
                      ref={chartRef as React.RefObject<ChartJS<"bar">>}
                      data={mealChartData}
                      options={mealOptions}
                      onClick={handleChartClick}
                    />
                  </div>
                ) : (
                  <EmptyChart message="Sin lecturas con tipo de comida registrado." />
                )
              ) : null}

              {activeTab === "patterns" ? (
                hasPatterns ? (
                  <div className="h-[min(45vh,320px)] min-h-[220px] w-full">
                    <Bar
                      key="patterns-chart"
                      ref={chartRef as React.RefObject<ChartJS<"bar">>}
                      data={patternChartData}
                      options={patternOptions}
                      onClick={handleChartClick}
                    />
                  </div>
                ) : (
                  <EmptyChart message="Sin datos suficientes por franja horaria." />
                )
              ) : null}

              {activeTab === "summary" ? (
                <GlucoseInsights records={records} />
              ) : null}

              {activeTab !== "summary" ? (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] font-light uppercase tracking-[0.16em] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-px w-4 border-t border-dashed border-emerald-400" />
                    70 mg/dL
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-px w-4 border-t border-dashed border-red-400" />
                    140 mg/dL
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    En rango
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Alta
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Baja
                  </span>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <p className="py-16 text-center text-sm font-light text-slate-400">{message}</p>
  );
}
