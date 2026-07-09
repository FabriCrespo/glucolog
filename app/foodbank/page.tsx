"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FlaskConical } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useFoodBankPage } from "@/hooks/useFoodBankPage";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchBar from "@/components/foodbank/SearchBar";
import FoodList from "@/components/foodbank/FoodList";
import FoodDetails from "@/components/foodbank/FoodDetails";
import MicronutrientBalance from "@/components/foodbank/MicronutrientBalance";
import NutrientDensityCalculator from "@/components/foodbank/NutrientDensityCalculator";
import NutrientRecommendations from "@/components/foodbank/NutrientRecommendations";
import GlycemicLoadModal from "@/components/foodbank/GlycemicLoadModal";

export default function FoodBankPage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();
  const [showMobileAnalysis, setShowMobileAnalysis] = useState(false);

  const {
    ui,
    dispatch,
    filteredFoodData,
    nutrientDensity,
    micronutrientStatus,
    recommendations,
    dataLoading,
    dataError,
    emailVerified,
    handleSearch,
    handleCheckboxChange,
    handleFoodClick,
    handleClearFood,
    calculateGlycemicLoadAction,
    closeGlycemicModal,
  } = useFoodBankPage(sessionUser, authLoading);

  const setPortionSize = useCallback(
    (size: number) => dispatch({ type: "SET_PORTION", payload: size }),
    [dispatch]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [authLoading, sessionUser, router]);

  useEffect(() => {
    setShowMobileAnalysis(false);
  }, [ui.selectedFood?.Codigo]);

  useEffect(() => {
    const mobileDetailOpen = Boolean(ui.selectedFood);
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (mobileDetailOpen && isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [ui.selectedFood]);

  if (authLoading || !sessionUser) {
    return <LoadingSpinner />;
  }

  if (dataLoading) {
    return <LoadingSpinner />;
  }

  if (dataError) {
    return (
      <section className="min-h-[calc(100vh-5rem)] w-full bg-white">
        <div className="max-container px-4 py-4 md:padding-container md:py-12">
          <div className="border border-red-200/90 bg-red-50/30 px-6 py-8 text-center">
            <p className="dash-body text-red-700">{dataError}</p>
          </div>
        </div>
      </section>
    );
  }

  const mobileDetailOpen = Boolean(ui.selectedFood);

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-white">
      <div className="max-container px-4 py-4 md:padding-container md:py-12 lg:py-16">
        <header className="mb-6 border-b border-slate-200/90 pb-5 lg:mb-8 lg:pb-6">
          <p className="dash-eyebrow">Nutrición · Glucolog</p>
          <h1 className="dash-title mt-2 text-2xl lg:text-3xl">
            Tabla nutricional
          </h1>
          <p className="dash-body mt-2 max-w-2xl lg:mt-3">
            <span className="lg:hidden">
              Explora por categorías, elige un alimento y revisa su impacto en tu glucosa.
            </span>
            <span className="hidden lg:inline">
              Explora la base de datos, calcula carga glucémica por porción y revisa
              micronutrientes con el mismo estilo que el panel principal.
            </span>
          </p>
        </header>

        {!emailVerified && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/40 px-4 py-3 lg:mb-8 lg:rounded-none"
            role="alert"
          >
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="dash-body text-amber-950">
              Verifica tu correo electrónico para usar la búsqueda y el cálculo de carga
              glucémica.
            </p>
          </div>
        )}

        {/* Búsqueda — siempre visible en móvil salvo detalle a pantalla completa */}
        <section
          aria-label="Búsqueda"
          className={`border-t border-slate-200 pt-6 lg:pt-10 ${
            mobileDetailOpen ? "hidden lg:block" : ""
          }`}
        >
          <SearchBar
            searchTerm={ui.searchTerm}
            handleSearch={handleSearch}
            showWithGlycemicIndex={ui.showWithGlycemicIndex}
            handleCheckboxChange={handleCheckboxChange}
            isEmailVerified={emailVerified}
          />
        </section>

        {/* Explorar — listado / categorías */}
        <section
          aria-label="Explorar alimentos"
          className={`mt-6 grid grid-cols-1 gap-8 border-t border-slate-200 pt-6 lg:mt-10 lg:grid-cols-3 lg:gap-10 lg:pt-10 ${
            mobileDetailOpen ? "hidden lg:grid" : ""
          }`}
        >
          <FoodList
            filteredFoodData={filteredFoodData}
            selectedFood={ui.selectedFood}
            handleFoodClick={handleFoodClick}
            isEmailVerified={emailVerified}
            searchTerm={ui.searchTerm}
          />

          <FoodDetails
            selectedFood={ui.selectedFood}
            portionSize={ui.portionSize}
            setPortionSize={setPortionSize}
            glycemicLoad={ui.glycemicLoadSummary}
            calculateGlycemicLoad={calculateGlycemicLoadAction}
            isEmailVerified={emailVerified}
          />
        </section>

        {/* Móvil: detalle a pantalla completa */}
        <AnimatePresence>
          {mobileDetailOpen && ui.selectedFood ? (
            <motion.div
              key="mobile-food-detail"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 top-[3.75rem] z-40 overflow-y-auto bg-white px-4 pb-8 pt-4 lg:hidden"
            >
              <FoodDetails
                selectedFood={ui.selectedFood}
                portionSize={ui.portionSize}
                setPortionSize={setPortionSize}
                glycemicLoad={ui.glycemicLoadSummary}
                calculateGlycemicLoad={calculateGlycemicLoadAction}
                isEmailVerified={emailVerified}
                mobile
                onBack={handleClearFood}
              />

              {ui.selectedFood ? (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowMobileAnalysis((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 to-sky-50/50 px-4 py-4 text-left transition-colors active:scale-[0.99] dark:border-emerald-700/60 dark:from-emerald-950/55 dark:to-emerald-900/35"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <FlaskConical className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-800">
                          Análisis nutricional
                        </span>
                        <span className="dash-muted mt-0.5 block">
                          Micronutrientes, densidad y recomendaciones
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-violet-500 transition-transform ${
                        showMobileAnalysis ? "rotate-180" : ""
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>

                  <AnimatePresence>
                    {showMobileAnalysis ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-8">
                          <MicronutrientBalance micronutrientStatus={micronutrientStatus} />
                          <NutrientDensityCalculator nutrientDensity={nutrientDensity} />
                          <NutrientRecommendations
                            recommendations={recommendations}
                            selectedFood={ui.selectedFood}
                          />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Escritorio: análisis siempre visible */}
        <section
          aria-label="Análisis nutricional"
          className="mt-10 hidden grid-cols-1 gap-10 border-t border-slate-200 pt-10 md:grid-cols-2 lg:mt-14 lg:grid lg:pt-14"
        >
          <MicronutrientBalance micronutrientStatus={micronutrientStatus} />
          <NutrientDensityCalculator nutrientDensity={nutrientDensity} />
        </section>

        <div className="hidden lg:block">
          <NutrientRecommendations
            recommendations={recommendations}
            selectedFood={ui.selectedFood}
          />
        </div>
      </div>

      <GlycemicLoadModal
        load={ui.glycemicLoadSummary}
        open={ui.glycemicModalOpen}
        onClose={closeGlycemicModal}
      />
    </section>
  );
}
