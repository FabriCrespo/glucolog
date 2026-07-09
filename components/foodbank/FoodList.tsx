"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FoodItem } from "@/types/food";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FoodListProps {
  filteredFoodData: FoodItem[];
  selectedFood: FoodItem | null;
  handleFoodClick: (food: FoodItem) => void;
  isEmailVerified: boolean;
  searchTerm: string;
}

const MOBILE_BATCH = 6;

const CATEGORY_PALETTE = [
  {
    gradient: "from-emerald-500 to-teal-600",
    surface: "bg-emerald-50 border-emerald-200/80 text-emerald-900",
    dot: "bg-emerald-500",
  },
  {
    gradient: "from-sky-500 to-blue-600",
    surface: "bg-sky-50 border-sky-200/80 text-sky-900",
    dot: "bg-sky-500",
  },
  {
    gradient: "from-amber-500 to-orange-500",
    surface: "bg-amber-50 border-amber-200/80 text-amber-900",
    dot: "bg-amber-500",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    surface: "bg-violet-50 border-violet-200/80 text-violet-900",
    dot: "bg-violet-500",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    surface: "bg-rose-50 border-rose-200/80 text-rose-900",
    dot: "bg-rose-500",
  },
  {
    gradient: "from-teal-500 to-cyan-600",
    surface: "bg-teal-50 border-teal-200/80 text-teal-900",
    dot: "bg-teal-500",
  },
];

function getIGMeta(ig: number | undefined) {
  if (!ig) return null;
  if (ig < 55) {
    return {
      label: "Bajo",
      pill: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
      dot: "bg-emerald-500",
    };
  }
  if (ig <= 69) {
    return {
      label: "Medio",
      pill: "bg-amber-100 text-amber-800 ring-amber-200/80",
      dot: "bg-amber-500",
    };
  }
  return {
    label: "Alto",
    pill: "bg-red-100 text-red-800 ring-red-200/80",
    dot: "bg-red-500",
  };
}

function FoodListItem({
  food,
  isSelected,
  onClick,
  isEmailVerified,
  variant = "desktop",
}: {
  food: FoodItem;
  isSelected: boolean;
  onClick: () => void;
  isEmailVerified: boolean;
  variant?: "desktop" | "mobile";
}) {
  const ig = getIGMeta(food.IndiceGlucemico);

  if (variant === "mobile") {
    return (
      <motion.li
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`list-none ${!isEmailVerified ? "pointer-events-none opacity-50" : ""}`}
      >
        <button
          type="button"
          onClick={onClick}
          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98] ${
            isSelected
              ? "border-vitality-primary bg-emerald-50/70 shadow-sm shadow-emerald-900/5"
              : "border-slate-200/90 bg-white hover:border-emerald-300/60 hover:bg-emerald-50/30"
          }`}
        >
          {ig ? (
            <span
              className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ${ig.pill}`}
            >
              <span className="text-sm font-semibold tabular-nums">{food.IndiceGlucemico}</span>
              <span className="text-[9px] font-medium uppercase tracking-wide">{ig.label}</span>
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium leading-snug text-slate-800">
              {food.Nombre}
            </span>
            {food.Calorias ? (
              <span className="mt-0.5 block text-xs font-light text-slate-500">
                {food.Calorias} kcal · 100 g
              </span>
            ) : null}
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 ${isSelected ? "text-vitality-primary" : "text-slate-300"}`}
            strokeWidth={1.5}
          />
        </button>
      </motion.li>
    );
  }

  return (
    <li
      onClick={onClick}
      className={`cursor-pointer border-l-2 py-3 pl-3 pr-1 transition-all ${
        isSelected
          ? "border-vitality-primary bg-emerald-50/40"
          : "border-transparent hover:bg-emerald-50/20"
      } ${!isEmailVerified ? "cursor-not-allowed opacity-50" : ""}`}
      style={{ pointerEvents: isEmailVerified ? "auto" : "none" }}
    >
      <div className="flex items-center gap-3">
        {ig ? (
          <div className="flex flex-col items-center">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ig.dot}`} />
            <span className="mt-1 text-[10px] font-light text-slate-500">{ig.label}</span>
          </div>
        ) : null}
        <span
          className={`flex-1 text-sm font-light ${
            isSelected ? "text-slate-900" : "text-slate-700"
          }`}
        >
          {food.Nombre}
        </span>
        <div className="flex flex-col items-end gap-0.5">
          {food.IndiceGlucemico ? (
            <span className="text-xs font-light tabular-nums text-slate-500">
              IG {food.IndiceGlucemico}
            </span>
          ) : null}
          {food.Calorias ? (
            <span className="text-xs font-light tabular-nums text-slate-500">
              {food.Calorias} kcal
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

const FoodList = ({
  filteredFoodData,
  selectedFood,
  handleFoodClick,
  isEmailVerified,
  searchTerm,
}: FoodListProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileVisible, setMobileVisible] = useState(MOBILE_BATCH);

  const groupedByCategory = useMemo(() => {
    return filteredFoodData.reduce(
      (acc, food) => {
        const category = food.Categoria || "Sin categoría";
        if (!acc[category]) acc[category] = [];
        acc[category].push(food);
        return acc;
      },
      {} as Record<string, FoodItem[]>
    );
  }, [filteredFoodData]);

  const categories = useMemo(
    () =>
      Object.entries(groupedByCategory)
        .map(([name, foods]) => ({
          name,
          count: foods.length,
          foods: [...foods].sort((a, b) => a.Nombre.localeCompare(b.Nombre)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [groupedByCategory]
  );

  const isSearching = searchTerm.trim().length > 0;
  const showMobileDiscover = !isSearching && !activeCategory;

  const mobileFoods = useMemo(() => {
    if (isSearching) {
      return [...filteredFoodData].sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }
    if (activeCategory) {
      return categories.find((c) => c.name === activeCategory)?.foods ?? [];
    }
    return [];
  }, [isSearching, activeCategory, filteredFoodData, categories]);

  useEffect(() => {
    setMobileVisible(MOBILE_BATCH);
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    if (isSearching) setActiveCategory(null);
  }, [isSearching]);

  const visibleMobileFoods = mobileFoods.slice(0, mobileVisible);
  const hasMoreMobile = mobileVisible < mobileFoods.length;

  return (
    <div className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="dash-eyebrow">Catálogo</p>
          <h2 className="dash-title mt-2 text-lg">Alimentos</h2>
        </div>
        <p className="dash-muted tabular-nums">{filteredFoodData.length} resultados</p>
      </div>

      {/* ——— Mobile: descubrir → lista progresiva ——— */}
      <div className="mt-5 lg:hidden">
        {!isEmailVerified ? (
          <p className="dash-muted rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-amber-900">
            Verifica tu correo para explorar alimentos.
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          {showMobileDiscover ? (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 px-5 py-5 ring-1 ring-emerald-200/50">
                <p className="text-sm font-medium text-slate-800">
                  ¿Qué quieres comer hoy?
                </p>
                <p className="mt-1 text-sm font-light text-slate-600">
                  Elige una categoría o busca arriba. No mostramos todo de golpe para
                  que sea más fácil de explorar.
                </p>
              </div>

              {categories.length === 0 ? (
                <p className="dash-body mt-6 text-center text-slate-500">
                  No hay alimentos que coincidan con el filtro.
                </p>
              ) : (
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {categories.map((cat, index) => {
                    const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
                    return (
                      <li key={cat.name}>
                        <button
                          type="button"
                          disabled={!isEmailVerified}
                          onClick={() => setActiveCategory(cat.name)}
                          className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border text-left transition-all active:scale-[0.97] disabled:opacity-50 ${
                            palette.surface
                          }`}
                        >
                          <div
                            className={`bg-gradient-to-br ${palette.gradient} px-4 py-3 text-white`}
                          >
                            <span className="text-2xl font-extralight tabular-nums">
                              {cat.count}
                            </span>
                            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider opacity-90">
                              alimentos
                            </span>
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-2 px-3 py-3">
                            <span className="text-sm font-medium leading-snug">
                              {cat.name}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              {!isSearching ? (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-light text-vitality-primary transition-colors hover:text-vitality-primary-dark"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  Volver a categorías
                </button>
              ) : null}

              <p className="dash-stat-label mb-3">
                {isSearching
                  ? `Resultados para “${searchTerm.trim()}”`
                  : activeCategory}
              </p>

              {mobileFoods.length === 0 ? (
                <p className="dash-body py-8 text-center text-slate-500">
                  No se encontraron alimentos
                </p>
              ) : (
                <>
                  <ul className="space-y-2.5">
                    {visibleMobileFoods.map((food) => (
                      <FoodListItem
                        key={food.Codigo}
                        food={food}
                        isSelected={selectedFood?.Codigo === food.Codigo}
                        onClick={() => handleFoodClick(food)}
                        isEmailVerified={isEmailVerified}
                        variant="mobile"
                      />
                    ))}
                  </ul>

                  {hasMoreMobile ? (
                    <button
                      type="button"
                      onClick={() => setMobileVisible((n) => n + MOBILE_BATCH)}
                      className="mt-4 w-full rounded-2xl border border-dashed border-emerald-300/80 bg-emerald-50/40 py-3.5 text-sm font-light text-emerald-800 transition-colors hover:bg-emerald-50 active:scale-[0.99] dark:border-emerald-700/60 dark:text-emerald-300"
                    >
                      Ver {Math.min(MOBILE_BATCH, mobileFoods.length - mobileVisible)} más
                      <span className="text-emerald-600/70">
                        {" "}
                        · quedan {mobileFoods.length - mobileVisible}
                      </span>
                    </button>
                  ) : mobileFoods.length > MOBILE_BATCH ? (
                    <p className="mt-4 text-center text-xs font-light text-slate-400">
                      Has visto todos los alimentos de esta sección
                    </p>
                  ) : null}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ——— Desktop: lista completa con scroll ——— */}
      <div className="mt-4 hidden h-[620px] overflow-y-auto border-t border-slate-200 scrollbar-none lg:block">
        {filteredFoodData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="dash-body text-slate-500">No se encontraron alimentos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.name} className="py-4">
                <p className="dash-stat-label px-1">
                  {cat.name}{" "}
                  <span className="font-light text-slate-400">({cat.count})</span>
                </p>
                <ul className="mt-2">
                  {cat.foods.map((food) => (
                    <FoodListItem
                      key={food.Codigo}
                      food={food}
                      isSelected={selectedFood?.Codigo === food.Codigo}
                      onClick={() => handleFoodClick(food)}
                      isEmailVerified={isEmailVerified}
                      variant="desktop"
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodList;
