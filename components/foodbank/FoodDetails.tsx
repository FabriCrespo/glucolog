import React from "react";
import type { FoodItem, GlycemicLoadInfo } from "@/types/food";

interface FoodDetailsProps {
  selectedFood: FoodItem | null;
  portionSize: number;
  setPortionSize: (size: number) => void;
  glycemicLoad: GlycemicLoadInfo | null;
  calculateGlycemicLoad: () => void;
  isEmailVerified: boolean;
}

const FoodDetails = ({
  selectedFood,
  portionSize,
  setPortionSize,
  glycemicLoad,
  calculateGlycemicLoad,
  isEmailVerified,
}: FoodDetailsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm lg:col-span-2">
      {selectedFood ? (
        <div className="p-5 sm:p-6">
          <h2 className="border-b border-slate-100 pb-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {selectedFood.Nombre}
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="mb-3 flex items-center text-base font-semibold text-slate-800">
                <svg
                  className="mr-2 h-5 w-5 text-vitality-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Información básica
              </h3>
              <div className="space-y-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                {[
                  {
                    label: "Calorías",
                    value: selectedFood.Calorias.toFixed(1),
                    unit: "kcal",
                  },
                  {
                    label: "Proteína",
                    value: selectedFood.Proteina.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Grasa",
                    value: selectedFood.Grasa.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Carbohidratos",
                    value: selectedFood.Carbohidratos.toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Fibra",
                    value: selectedFood.Fibra.toFixed(1),
                    unit: "g",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0 last:pb-0 first:pt-0"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {item.value}{" "}
                      <span className="font-normal text-slate-500">{item.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="mb-3 flex items-center text-base font-semibold text-slate-800">
                <svg
                  className="mr-2 h-5 w-5 text-vitality-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Minerales y vitaminas
              </h3>
              <div className="space-y-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                {[
                  {
                    label: "Calcio",
                    value: selectedFood.Calcio.toFixed(1),
                    unit: "mg",
                  },
                  {
                    label: "Potasio",
                    value: selectedFood.Potasio.toFixed(1),
                    unit: "mg",
                  },
                  {
                    label: "Zinc",
                    value: selectedFood.Zinc.toFixed(2),
                    unit: "mg",
                  },
                  {
                    label: "Magnesio",
                    value: selectedFood.Magnesio.toFixed(1),
                    unit: "mg",
                  },
                  {
                    label: "Índice glucémico",
                    value:
                      selectedFood.IndiceGlucemico?.toFixed(1) ?? "No disponible",
                    unit: "",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0 last:pb-0 first:pt-0"
                  >
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {item.value}{" "}
                      {item.unit ? (
                        <span className="font-normal text-slate-500">{item.unit}</span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedFood.IndiceGlucemico ? (
            <div className="mt-8 rounded-2xl border border-emerald-100/90 bg-gradient-to-r from-emerald-50/90 to-sky-50/60 p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 flex items-center text-base font-semibold text-slate-900">
                <svg
                  className="mr-2 h-5 w-5 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Cálculo de carga glucémica
              </h3>

              <div className="flex flex-col items-end gap-4 md:flex-row">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="portionSize"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Tamaño de porción
                  </label>
                  <div className="relative">
                    <input
                      id="portionSize"
                      type="number"
                      value={portionSize}
                      onChange={(e) =>
                        setPortionSize(Math.max(0, Number(e.target.value)))
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-10 text-slate-900 shadow-sm transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25 disabled:opacity-60"
                      min={0}
                      disabled={!isEmailVerified}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      g
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={calculateGlycemicLoad}
                  className="flex h-12 w-full shrink-0 items-center justify-center rounded-xl bg-vitality-primary px-6 text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-vitality-primary-dark disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                  disabled={!isEmailVerified || portionSize <= 0}
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Calcular
                </button>
              </div>

              {!isEmailVerified && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                  Verifica tu correo electrónico para usar esta función.
                </div>
              )}

              {glycemicLoad && (
                <div className="mt-4 rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">
                        Carga glucémica:{" "}
                        <span className="text-emerald-700">
                          {glycemicLoad.value.toFixed(1)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Clasificación:{" "}
                        <span
                          className={`font-semibold ${
                            glycemicLoad.category === "Baja"
                              ? "text-emerald-700"
                              : glycemicLoad.category === "Media"
                                ? "text-amber-700"
                                : "text-red-700"
                          }`}
                        >
                          {glycemicLoad.category}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3.5 w-3.5 rounded-full ${
                          glycemicLoad.category === "Baja"
                            ? "bg-emerald-500"
                            : glycemicLoad.category === "Media"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`text-sm font-semibold ${
                          glycemicLoad.category === "Baja"
                            ? "text-emerald-700"
                            : glycemicLoad.category === "Media"
                              ? "text-amber-700"
                              : "text-red-700"
                        }`}
                      >
                        {glycemicLoad.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center p-8 text-center text-slate-500">
          <svg
            className="mb-4 h-16 w-16 text-emerald-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium text-slate-700">
            Selecciona un alimento para ver sus detalles
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Haz clic en cualquier alimento de la lista
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodDetails;
