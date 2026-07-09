import "@/components/schedule/registerChartJs";
import React, { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { MonthlyStatsType } from "@/types/events";

interface MonthlyStatsProps {
  monthlyStats: MonthlyStatsType;
  exerciseChartData: Record<string, unknown>;
  medicationChartData: Record<string, unknown>;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 12,
    },
  },
};

const MonthlyStats = ({
  monthlyStats,
  exerciseChartData,
  medicationChartData,
}: MonthlyStatsProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );
  const [chartType, setChartType] = useState<"bar" | "doughnut">("bar");

  if (!monthlyStats) {
    return (
      <p className="dash-body py-6 text-center text-slate-500">
        Cargando estadísticas…
      </p>
    );
  }

  const exerciseData = exerciseChartData as {
    labels?: string[];
    datasets?: { data: number[]; backgroundColor: string | string[] }[];
    options?: Record<string, unknown>;
  };
  const medicationData = medicationChartData as {
    labels?: string[];
    datasets?: { data: number[]; backgroundColor: string | string[] }[];
    options?: Record<string, unknown>;
  };

  const hasExerciseData = Boolean(exerciseData?.datasets?.length);
  const hasMedicationData = Boolean(medicationData?.datasets?.length);

  const stats = [
    {
      id: "medications",
      label: "Medicaciones",
      value: monthlyStats.completedMedications,
      hint: "completadas este mes",
      tone: "text-emerald-700",
    },
    {
      id: "exercises",
      label: "Ejercicios",
      value: monthlyStats.completedExercises,
      hint: "completados este mes",
      tone: "text-sky-700",
    },
    {
      id: "duration",
      label: "Tiempo activo",
      value: monthlyStats.totalDuration,
      hint: "minutos de ejercicio",
      tone: "text-slate-700",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Resumen</p>
          <h2 className="dash-title mt-2 text-xl lg:text-2xl">
            Estadísticas del mes
          </h2>
        </div>
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`dash-tab ${activeTab === "overview" ? "dash-tab-active" : "dash-tab-idle"}`}
          >
            Resumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`dash-tab ${activeTab === "details" ? "dash-tab-active" : "dash-tab-idle"}`}
          >
            Gráficos
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="dash-stat-cell border border-slate-200 px-5 py-5"
            >
              <p className="dash-stat-label">{stat.label}</p>
              <p className={`dash-stat-value mt-2 text-4xl ${stat.tone}`}>
                {stat.value}
              </p>
              <p className="dash-muted mt-1">{stat.hint}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="dash-muted">Tipo de gráfico</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`dash-pill ${chartType === "bar" ? "dash-pill-active" : "dash-pill-idle"}`}
              >
                Barras
              </button>
              <button
                type="button"
                onClick={() => setChartType("doughnut")}
                className={`dash-pill ${chartType === "doughnut" ? "dash-pill-active" : "dash-pill-idle"}`}
              >
                Dona
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="border border-slate-200 p-4 sm:p-5">
              <p className="dash-stat-label text-sky-800">Ejercicios por tipo</p>
              <div className="mt-4 h-[280px]">
                {!hasExerciseData ? (
                  <p className="dash-body flex h-full items-center justify-center text-slate-500">
                    Sin datos suficientes
                  </p>
                ) : chartType === "bar" ? (
                  <Bar
                    data={exerciseData as never}
                    options={{ ...chartOptions, ...(exerciseData.options ?? {}) }}
                  />
                ) : (
                  <Doughnut
                    data={{
                      labels: exerciseData.labels,
                      datasets: [
                        {
                          data: exerciseData.datasets![0].data,
                          backgroundColor:
                            exerciseData.datasets![0].backgroundColor,
                          borderWidth: 1,
                          borderColor: "#fff",
                        },
                      ],
                    }}
                    options={{ ...chartOptions, cutout: "60%" }}
                  />
                )}
              </div>
            </div>

            <div className="border border-slate-200 p-4 sm:p-5">
              <p className="dash-stat-label text-emerald-800">
                Medicamentos por tipo
              </p>
              <div className="mt-4 h-[280px]">
                {!hasMedicationData ? (
                  <p className="dash-body flex h-full items-center justify-center text-slate-500">
                    Sin datos suficientes
                  </p>
                ) : chartType === "bar" ? (
                  <Bar
                    data={medicationData as never}
                    options={{
                      ...chartOptions,
                      ...(medicationData.options ?? {}),
                    }}
                  />
                ) : (
                  <Doughnut
                    data={{
                      labels: medicationData.labels,
                      datasets: [
                        {
                          data: medicationData.datasets![0].data,
                          backgroundColor:
                            medicationData.datasets![0].backgroundColor,
                          borderWidth: 1,
                          borderColor: "#fff",
                        },
                      ],
                    }}
                    options={{ ...chartOptions, cutout: "60%" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyStats;
