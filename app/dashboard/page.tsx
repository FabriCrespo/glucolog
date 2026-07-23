"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDashboardGlucose } from "@/hooks/useDashboardGlucose";
import { useGlucosePrediction } from "@/hooks/useGlucosePrediction";
import GlucoseCharts from "@/components/glucose/GlucoseCharts";
import GlucoseRecordsSection from "@/components/glucose/GlucoseRecordsSection";
import DashboardDesktopHero from "@/components/glucose/DashboardDesktopHero";
import DashboardServicesAccordion from "@/components/glucose/DashboardServicesAccordion";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getGreeting } from "@/lib/dashboard/metrics";
import "@/utils/chartConfig";

export default function DashboardPage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();

  const userId = sessionUser?.uid;
  const userName =
    sessionUser?.displayName || sessionUser?.email?.split("@")[0] || null;

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

  const prediction = useGlucosePrediction(records, form);

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
    <section className="min-h-[calc(100vh-5rem)] w-full bg-white">
      <div className="max-container px-4 py-4 md:padding-container md:py-12 lg:py-16">
        {/* Resumen compacto */}
        <DashboardDesktopHero records={records} userName={userName} />

        <header className="mb-8 border-b border-slate-200/90 pb-6 md:hidden">
          <p className="dash-eyebrow">Glucolog</p>
          <h1 className="dash-title mt-2 text-xl">{getGreeting(userName)}</h1>
          <p className="dash-muted mt-2">
            {records[0]
              ? `Última lectura: ${records[0].glucoseLevel} mg/dL`
              : "Registra tu glucosa para activar predicción y servicios."}
          </p>
        </header>

        {/* 1. Formulario + registros */}
        <GlucoseRecordsSection
          records={records}
          fetchingRecords={fetchingRecords}
          fetchError={fetchError}
          form={form}
          dispatch={dispatch}
          submitting={submitting}
          feedback={feedback}
          handleSubmit={handleSubmit}
          handleDateRangeChange={handleDateRangeChange}
        />

        {/* 2. Gráficos */}
        <section aria-label="Gráficos" className="mt-10 lg:mt-14">
          <GlucoseCharts
            chartData={chartData}
            chartOptions={chartOptions}
            fetchingRecords={fetchingRecords}
            records={records}
          />
        </section>

        {/* 3. Servicios IA / coaching (desplegables) */}
        <DashboardServicesAccordion
          records={records}
          userId={sessionUser.uid}
          prediction={prediction}
        />
      </div>
    </section>
  );
}
