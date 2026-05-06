"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  if (authLoading || !sessionUser) {
    return <LoadingSpinner />;
  }

  if (dataLoading) {
    return <LoadingSpinner />;
  }

  if (dataError) {
    return (
      <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-8 sm:py-10 lg:py-12">
        <div className="max-container padding-container">
          <div className="rounded-2xl border border-red-200/90 bg-white p-8 text-center shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]">
            <p className="text-[15px] font-medium text-red-700">{dataError}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-8 sm:py-10 lg:py-12">
      <div className="max-container padding-container">
        <header className="mb-8 lg:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/90 sm:text-xs">
            Nutrición · Glucolog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Tabla nutricional de alimentos
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Explora la base de datos, calcula carga glucémica por porción y revisa
            micronutrientes con el mismo estilo que el panel principal.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] sm:p-6 lg:p-8">
          {!emailVerified && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
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
              <p>
                Verifica tu correo electrónico para usar la búsqueda y el cálculo
                de carga glucémica en esta sección.
              </p>
            </div>
          )}

          <SearchBar
            searchTerm={ui.searchTerm}
            handleSearch={handleSearch}
            showWithGlycemicIndex={ui.showWithGlycemicIndex}
            handleCheckboxChange={handleCheckboxChange}
            isEmailVerified={emailVerified}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <FoodList
              filteredFoodData={filteredFoodData}
              selectedFood={ui.selectedFood}
              handleFoodClick={handleFoodClick}
              isEmailVerified={emailVerified}
            />

            <FoodDetails
              selectedFood={ui.selectedFood}
              portionSize={ui.portionSize}
              setPortionSize={setPortionSize}
              glycemicLoad={ui.glycemicLoadSummary}
              calculateGlycemicLoad={calculateGlycemicLoadAction}
              isEmailVerified={emailVerified}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-100 pt-8 md:grid-cols-2 lg:mt-10 lg:pt-10">
            <MicronutrientBalance micronutrientStatus={micronutrientStatus} />
            <NutrientDensityCalculator nutrientDensity={nutrientDensity} />
          </div>

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
