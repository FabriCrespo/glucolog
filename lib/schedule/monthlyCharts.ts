import type { MonthlyStatsType } from "@/types/events";

const exerciseColors = {
  bg: "rgba(16, 185, 129, 0.45)",
  border: "rgba(5, 150, 105, 1)",
};

const medicationColors = {
  bg: "rgba(14, 165, 233, 0.45)",
  border: "rgba(2, 132, 199, 1)",
};

/** Opciones compartidas para gráficos de barras del panel de agenda. */
export const monthlyBarChartOptions = {
  responsive: true,
  plugins: { legend: { position: "top" as const } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

export function buildExerciseChartData(stats: MonthlyStatsType) {
  const labels = Object.keys(stats.exercisesByType);
  const data = Object.values(stats.exercisesByType);
  return {
    labels,
    datasets: [
      {
        label: "Ejercicios completados por tipo",
        data,
        backgroundColor: exerciseColors.bg,
        borderColor: exerciseColors.border,
        borderWidth: 1,
      },
    ],
    options: monthlyBarChartOptions,
  };
}

export function buildMedicationChartData(stats: MonthlyStatsType) {
  const labels = Object.keys(stats.medicationsByType);
  const data = Object.values(stats.medicationsByType);
  return {
    labels,
    datasets: [
      {
        label: "Medicamentos tomados por tipo",
        data,
        backgroundColor: medicationColors.bg,
        borderColor: medicationColors.border,
        borderWidth: 1,
      },
    ],
    options: monthlyBarChartOptions,
  };
}
