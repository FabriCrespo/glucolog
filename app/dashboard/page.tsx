"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDashboardGlucose } from "@/hooks/useDashboardGlucose";
import GlucoseCharts from "@/components/glucose/GlucoseCharts";
import GlucoseForm from "@/components/glucose/GlucoseForm";
import GlucoseTable from "@/components/glucose/GlucoseTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@/utils/chartConfig";

export default function DashboardPage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();

  const userId = sessionUser?.uid;

  const {
    form,
    dispatch,
    records,
    fetchingRecords,
    fetchError,
    chartData,
    chartOptions,
    submitting,
    feedback,
    handleSubmit,
    handleDateRangeChange,
  } = useDashboardGlucose({ userId });

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [authLoading, sessionUser, router]);

  if (authLoading || !sessionUser) {
    return <LoadingSpinner />;
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-8 sm:py-10 lg:py-12">
      <div className="max-container padding-container">
        <header className="mb-8 lg:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/90 sm:text-xs">
            Panel · Glucolog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Tu control de glucosa
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Registra lecturas, consulta el historial y revisa tendencias con el mismo estilo claro que el resto de la app.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch xl:gap-8">
            <GlucoseForm
              form={form}
              dispatch={dispatch}
              submitting={submitting}
              feedback={feedback}
              fetchError={fetchError}
              handleSubmit={handleSubmit}
              handleDateRangeChange={handleDateRangeChange}
            />

            <GlucoseTable records={records} fetchingRecords={fetchingRecords} />
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8 lg:mt-10 lg:pt-10">
            <GlucoseCharts
              chartData={chartData}
              chartOptions={chartOptions}
              fetchingRecords={fetchingRecords}
              records={records}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
