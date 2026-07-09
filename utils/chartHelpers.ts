import type { ChartOptions } from "chart.js";
import type { GlucoseRecord } from "@/types/glucose";

const EMERALD = "#10b981";
const EMERALD_SOFT = "rgba(16, 185, 129, 0.12)";
const SLATE_GRID = "rgba(148, 163, 184, 0.25)";

export function getRecordDate(record: GlucoseRecord): Date {
  return record.recordedAt
    ? record.recordedAt.toDate()
    : new Date(`${record.date}T${record.time}`);
}

function glucosePointColor(level: number): string {
  if (level < 70) return "#f59e0b";
  if (level > 140) return "#ef4444";
  return EMERALD;
}

const BASE_TOOLTIP = {
  backgroundColor: "#0f172a",
  titleColor: "#94a3b8",
  bodyColor: "#f8fafc",
  borderColor: "rgba(148, 163, 184, 0.2)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 0,
  titleFont: { size: 10, weight: "500" as const },
  bodyFont: { size: 13, weight: "300" as const },
  displayColors: false,
};

const BASE_SCALE = {
  grid: { color: SLATE_GRID, lineWidth: 1 },
  border: { display: false },
  ticks: {
    color: "#94a3b8",
    font: { size: 10, weight: "300" as const },
    maxRotation: 0,
  },
};

export function prepareChartData(records: GlucoseRecord[]) {
  const sortedRecords = [...records].sort(
    (a, b) => getRecordDate(a).getTime() - getRecordDate(b).getTime()
  );

  const timelineLabels = sortedRecords.map((r) => {
    const d = getRecordDate(r);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const timelineLevels = sortedRecords.map((r) => r.glucoseLevel);

  const timelineData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Glucosa",
        data: timelineLevels,
        borderColor: EMERALD,
        backgroundColor: EMERALD_SOFT,
        pointBackgroundColor: timelineLevels.map(glucosePointColor),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: timelineLevels.map(() => 4),
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const mealTypes = ["desayuno", "almuerzo", "cena", "otro"];
  const mealCounts = mealTypes.map(
    (meal) =>
      records.filter((r) => (r.foodMeal ?? "").toLowerCase() === meal).length
  );
  const mealData = mealTypes.map((meal) => {
    const mealRecords = records.filter(
      (r) => (r.foodMeal ?? "").toLowerCase() === meal
    );
    return mealRecords.length
      ? mealRecords.reduce((sum, r) => sum + r.glucoseLevel, 0) / mealRecords.length
      : 0;
  });

  const mealImpactData = {
    labels: ["Desayuno", "Almuerzo", "Cena", "Otro"],
    counts: mealCounts,
    datasets: [
      {
        label: "Promedio mg/dL",
        data: mealData,
        backgroundColor: [
          "rgba(16, 185, 129, 0.85)",
          "rgba(20, 184, 166, 0.7)",
          "rgba(45, 212, 191, 0.55)",
          "rgba(148, 163, 184, 0.45)",
        ],
        borderColor: ["#10b981", "#14b8a6", "#2dd4bf", "#94a3b8"],
        borderWidth: 1,
        borderRadius: 0,
        barThickness: "flex" as const,
        maxBarThickness: 48,
      },
    ],
  };

  const timeGroups = {
    "Mañana 6–12": records.filter((r) => {
      const hour = getRecordDate(r).getHours();
      return hour >= 6 && hour < 12;
    }),
    "Tarde 12–18": records.filter((r) => {
      const hour = getRecordDate(r).getHours();
      return hour >= 12 && hour < 18;
    }),
    "Noche 18–24": records.filter((r) => {
      const hour = getRecordDate(r).getHours();
      return hour >= 18 && hour < 24;
    }),
    "Madrugada 0–6": records.filter((r) => {
      const hour = getRecordDate(r).getHours();
      return hour >= 0 && hour < 6;
    }),
  };

  const timeData = Object.values(timeGroups).map((group) =>
    group.length
      ? group.reduce((sum, r) => sum + r.glucoseLevel, 0) / group.length
      : 0
  );
  const timeCounts = Object.values(timeGroups).map((g) => g.length);

  const patternData = {
    labels: Object.keys(timeGroups),
    counts: timeCounts,
    datasets: [
      {
        label: "Promedio mg/dL",
        data: timeData,
        backgroundColor: timeData.map((v) =>
          v > 140
            ? "rgba(239, 68, 68, 0.75)"
            : v < 70
              ? "rgba(245, 158, 11, 0.75)"
              : "rgba(16, 185, 129, 0.75)"
        ),
        borderColor: timeData.map((v) =>
          v > 140 ? "#ef4444" : v < 70 ? "#f59e0b" : "#10b981"
        ),
        borderWidth: 1,
        borderRadius: 0,
        barThickness: "flex" as const,
        maxBarThickness: 56,
      },
    ],
  };

  return { sortedRecords, timelineData, mealImpactData, patternData };
}

const TARGET_ANNOTATIONS = {
  targetZone: {
    type: "box" as const,
    yMin: 70,
    yMax: 140,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    borderWidth: 0,
  },
  lineLow: {
    type: "line" as const,
    yMin: 70,
    yMax: 70,
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderWidth: 1,
    borderDash: [4, 4],
  },
  lineHigh: {
    type: "line" as const,
    yMin: 140,
    yMax: 140,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderWidth: 1,
    borderDash: [4, 4],
  },
};

export function buildTimelineOptions(
  selectedIndex: number | null
): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    onHover: (_, elements) => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = elements.length ? "pointer" : "default";
      }
    },
    scales: {
      y: {
        ...BASE_SCALE,
        suggestedMin: 50,
        suggestedMax: 200,
        ticks: {
          ...BASE_SCALE.ticks,
          callback: (value) => `${value}`,
        },
      },
      x: {
        ...BASE_SCALE,
        ticks: {
          ...BASE_SCALE.ticks,
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...BASE_TOOLTIP,
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (ctx) => `${ctx.parsed.y} mg/dL`,
          afterLabel: (ctx) => {
            if (selectedIndex === ctx.dataIndex) return "Seleccionado";
            return "Toca para fijar";
          },
        },
      },
      annotation: {
        annotations: TARGET_ANNOTATIONS,
      },
    },
  };
}

export function buildMealImpactOptions(
  selectedIndex: number | null
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: true },
    scales: {
      y: {
        ...BASE_SCALE,
        beginAtZero: true,
        suggestedMax: 200,
      },
      x: { ...BASE_SCALE },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...BASE_TOOLTIP,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            if (!val) return "Sin datos";
            return `${Math.round(val)} mg/dL promedio`;
          },
        },
      },
      annotation: {
        annotations: TARGET_ANNOTATIONS,
      },
    },
    onHover: (_, elements) => {
      if (typeof document !== "undefined") {
        document.body.style.cursor = elements.length ? "pointer" : "default";
      }
    },
  };
}

export function buildPatternOptions(
  selectedIndex: number | null
): ChartOptions<"bar"> {
  return buildMealImpactOptions(selectedIndex);
}

/** @deprecated use build*Options — kept for hook compatibility */
export function prepareChartOptions() {
  return {
    timeline: buildTimelineOptions(null),
    mealImpact: buildMealImpactOptions(null),
    pattern: buildPatternOptions(null),
  };
}

export function applyTimelineSelection(
  timelineData: ReturnType<typeof prepareChartData>["timelineData"],
  selectedIndex: number | null
) {
  const dataset = timelineData.datasets?.[0];
  if (!dataset?.data?.length) {
    return timelineData;
  }

  const levels = dataset.data as number[];
  return {
    ...timelineData,
    datasets: [
      {
        ...dataset,
        pointRadius: levels.map((_, i) => (selectedIndex === i ? 7 : 4)),
        pointBorderWidth: levels.map((_, i) => (selectedIndex === i ? 3 : 2)),
      },
    ],
  };
}

export function applyBarSelection(
  data: { labels: string[]; datasets: object[] },
  selectedIndex: number | null
) {
  if (selectedIndex == null) return data;

  const dataset = data.datasets?.[0] as {
    backgroundColor: string | string[];
    borderWidth?: number | number[];
    [key: string]: unknown;
  } | undefined;

  if (!dataset) return data;
  const bg = Array.isArray(dataset.backgroundColor)
    ? [...dataset.backgroundColor]
    : [dataset.backgroundColor];

  return {
    ...data,
    datasets: [
      {
        ...dataset,
        backgroundColor: bg.map((c, i) => {
          if (i === selectedIndex) return c;
          if (typeof c === "string" && c.startsWith("rgba")) {
            return c.replace(/,\s*[\d.]+\)$/, ", 0.2)");
          }
          return c;
        }),
        borderWidth: bg.map((_, i) => (i === selectedIndex ? 2 : 1)),
      },
    ],
  };
}
