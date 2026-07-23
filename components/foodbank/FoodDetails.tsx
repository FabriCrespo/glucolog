"use client";

import React, { useMemo, useState } from "react";
import type { FoodItem, GlycemicLoadInfo } from "@/types/food";
import { ChevronDown, ArrowLeft } from "lucide-react";

interface FoodDetailsProps {
  selectedFood: FoodItem | null;
  portionSize: number;
  setPortionSize: (size: number) => void;
  glycemicLoad: GlycemicLoadInfo | null;
  calculateGlycemicLoad: () => void;
  isEmailVerified: boolean;
  mobile?: boolean;
  onBack?: () => void;
}

function igVerdict(ig: number | undefined) {
  if (!ig) return null;
  if (ig < 55) {
    return {
      label: "Bueno para glucosa",
      tone: "text-emerald-700",
      bg: "border-emerald-200 bg-emerald-50/40",
      tip: "Sube la glucosa lentamente. Buena opción en porciones normales.",
    };
  }
  if (ig <= 69) {
    return {
      label: "Moderado",
      tone: "text-amber-700",
      bg: "border-amber-200 bg-amber-50/40",
      tip: "Puede subir la glucosa de forma media. Controla la porción.",
    };
  }
  return {
    label: "Ten cuidado",
    tone: "text-red-700",
    bg: "border-red-200 bg-red-50/40",
    tip: "Puede subir la glucosa rápido. Porciones pequeñas y combina con proteína o fibra.",
  };
}

function NutrientRow({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit: string;
  hint?: string;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <div className="flex justify-between gap-4">
        <span className="dash-body text-slate-600">{label}</span>
        <span className="font-extralight tabular-nums text-slate-800">
          {value}{" "}
          {unit ? (
            <span className="font-light text-slate-400">{unit}</span>
          ) : null}
        </span>
      </div>
      {hint ? <p className="dash-muted mt-1">{hint}</p> : null}
    </div>
  );
}

const FoodDetails = ({
  selectedFood,
  portionSize,
  setPortionSize,
  glycemicLoad,
  calculateGlycemicLoad,
  isEmailVerified,
  mobile = false,
  onBack,
}: FoodDetailsProps) => {
  const [showBasics, setShowBasics] = useState(false);
  const [showMinerals, setShowMinerals] = useState(false);

  const igMeta = useMemo(
    () => (selectedFood ? igVerdict(selectedFood.IndiceGlucemico) : null),
    [selectedFood]
  );

  if (!selectedFood) {
    return (
      <div className="hidden min-h-[280px] flex-col items-center justify-center border border-dashed border-slate-200 px-8 py-12 text-center lg:flex lg:col-span-2">
        <p className="dash-title text-lg text-slate-700">Selecciona un alimento</p>
        <p className="dash-body mt-2">
          Toca uno de la lista para ver si conviene en tu dieta
        </p>
      </div>
    );
  }

  const fiberHint =
    selectedFood.Fibra >= 5
      ? "Buena fibra: ayuda al control de glucosa."
      : selectedFood.Fibra >= 2
        ? "Fibra moderada."
        : "Poca fibra. Combina con verduras o legumbres.";

  const carbHint =
    selectedFood.Carbohidratos > 30
      ? "Alto en carbohidratos: cuida la porción."
      : selectedFood.Carbohidratos > 15
        ? "Carbohidratos moderados."
        : "Bajo en carbohidratos.";

  return (
    <div className={`min-w-0 lg:col-span-2 ${mobile ? "pb-8" : ""}`}>
      {mobile && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-light text-vitality-primary ring-1 ring-emerald-200/80 transition-colors active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Volver al listado
        </button>
      ) : null}

      <div className="border-b border-slate-200 pb-4">
        <p className="dash-eyebrow">Detalle</p>
        <h2 className="dash-title mt-2 text-xl sm:text-2xl">{selectedFood.Nombre}</h2>
      </div>

      {igMeta ? (
        <div className={`mt-5 rounded-2xl border px-4 py-4 lg:mt-6 lg:rounded-none ${igMeta.bg}`}>
          <p className={`dash-stat-label ${igMeta.tone}`}>{igMeta.label}</p>
          <p className="dash-body mt-1">
            Índice glucémico:{" "}
            <strong className="font-medium tabular-nums">
              {selectedFood.IndiceGlucemico}
            </strong>
          </p>
          <p className="dash-accent-quote mt-3 text-sm">{igMeta.tip}</p>
        </div>
      ) : null}

      <div
        className={`mt-5 gap-3 ${
          mobile
            ? "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none"
            : "grid sm:grid-cols-3"
        }`}
      >
        <div
          className={`dash-stat-cell shrink-0 border border-slate-100 px-4 py-3 ${
            mobile ? "min-w-[140px] snap-start rounded-2xl bg-gradient-to-br from-white to-emerald-50/30 dark:from-emerald-950/55 dark:to-emerald-900/30" : ""
          }`}
        >
          <p className="dash-stat-label">Calorías</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {selectedFood.Calorias.toFixed(0)}
            <span className="ml-1 text-sm text-slate-400">kcal</span>
          </p>
          <p className="dash-muted mt-1">por 100 g</p>
        </div>
        <div
          className={`dash-stat-cell shrink-0 border border-slate-100 px-4 py-3 ${
            mobile ? "min-w-[140px] snap-start rounded-2xl bg-gradient-to-br from-white to-amber-50/30 dark:from-emerald-950/55 dark:to-emerald-900/30" : ""
          }`}
        >
          <p className="dash-stat-label">Carbohidratos</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {selectedFood.Carbohidratos.toFixed(0)}
            <span className="ml-1 text-sm text-slate-400">g</span>
          </p>
          <p className="dash-muted mt-1">{carbHint}</p>
        </div>
        <div
          className={`dash-stat-cell shrink-0 border border-slate-100 px-4 py-3 ${
            mobile ? "min-w-[140px] snap-start rounded-2xl bg-gradient-to-br from-white to-sky-50/30 dark:from-emerald-950/55 dark:to-emerald-900/30" : ""
          }`}
        >
          <p className="dash-stat-label">Fibra</p>
          <p className="dash-stat-value mt-1 text-2xl">
            {selectedFood.Fibra.toFixed(1)}
            <span className="ml-1 text-sm text-slate-400">g</span>
          </p>
          <p className="dash-muted mt-1">{fiberHint}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2 lg:mt-8">
        <button
          type="button"
          onClick={() => setShowBasics((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-emerald-300 lg:rounded-none"
        >
          <span className="dash-stat-label">Información básica</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${showBasics ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
        {showBasics ? (
          <div className="border border-t-0 border-slate-200 px-4 pb-2">
            <NutrientRow
              label="Proteína"
              value={selectedFood.Proteina.toFixed(1)}
              unit="g"
              hint={
                selectedFood.Proteina >= 10
                  ? "Buen aporte proteico."
                  : "Proteína baja. Combina con otros alimentos."
              }
            />
            <NutrientRow
              label="Grasa"
              value={selectedFood.Grasa.toFixed(1)}
              unit="g"
            />
            <NutrientRow
              label="Carbohidratos"
              value={selectedFood.Carbohidratos.toFixed(1)}
              unit="g"
              hint={carbHint}
            />
            <NutrientRow
              label="Fibra"
              value={selectedFood.Fibra.toFixed(1)}
              unit="g"
              hint={fiberHint}
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowMinerals((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-emerald-300 lg:rounded-none"
        >
          <span className="dash-stat-label">Minerales</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${showMinerals ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
        {showMinerals ? (
          <div className="border border-t-0 border-slate-200 px-4 pb-2">
            <NutrientRow
              label="Calcio"
              value={selectedFood.Calcio.toFixed(1)}
              unit="mg"
            />
            <NutrientRow
              label="Potasio"
              value={selectedFood.Potasio.toFixed(1)}
              unit="mg"
            />
            <NutrientRow
              label="Zinc"
              value={selectedFood.Zinc.toFixed(2)}
              unit="mg"
            />
            <NutrientRow
              label="Magnesio"
              value={selectedFood.Magnesio.toFixed(1)}
              unit="mg"
            />
          </div>
        ) : null}
      </div>

      {selectedFood.IndiceGlucemico ? (
        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="dash-stat-label">Calculadora de carga glucémica</p>
          <p className="dash-body mt-2">
            Indica cuántos gramos vas a comer y te decimos el impacto real en tu
            glucosa.
          </p>

          <div className="mt-6 flex flex-col items-end gap-4 md:flex-row">
            <div className="min-w-0 flex-1">
              <label htmlFor="portionSize" className="dash-input-label">
                ¿Cuántos gramos comerás?
              </label>
              <div className="relative mt-2">
                <input
                  id="portionSize"
                  type="number"
                  value={portionSize}
                  onChange={(e) =>
                    setPortionSize(Math.max(0, Number(e.target.value)))
                  }
                  className="dash-input pr-8"
                  min={0}
                  disabled={!isEmailVerified}
                />
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm font-light text-slate-400">
                  g
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={calculateGlycemicLoad}
              className="dash-btn-outline-active w-full px-6 py-3.5 text-sm font-light md:w-auto"
              disabled={!isEmailVerified || portionSize <= 0}
            >
              Calcular impacto
            </button>
          </div>

          {!isEmailVerified ? (
            <p className="dash-muted mt-4 text-amber-700">
              Verifica tu correo para usar la calculadora.
            </p>
          ) : null}

          {glycemicLoad ? (
            <div
              className={`mt-6 border px-4 py-4 ${
                glycemicLoad.category === "Baja"
                  ? "border-emerald-200 bg-emerald-50/40"
                  : glycemicLoad.category === "Media"
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-red-200 bg-red-50/40"
              }`}
            >
              <p className="dash-stat-label">Resultado para tu porción</p>
              <p className="dash-stat-value mt-1 text-3xl text-vitality-primary">
                {glycemicLoad.value.toFixed(1)}
              </p>
              <p className="dash-body mt-2">
                {glycemicLoad.category === "Baja"
                  ? "Bueno: impacto bajo en glucosa con esta porción."
                  : glycemicLoad.category === "Media"
                    ? "Moderado: puedes comerlo, pero controla la cantidad."
                    : "Alto impacto: porción pequeña o combínalo con proteína/fibra."}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FoodDetails;
