"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDashboardGlucose } from "@/hooks/useDashboardGlucose";
import GlucoseCharts from "@/components/glucose/GlucoseCharts";
import LivePredictionPanel from "@/components/glucose/LivePredictionPanel";
import GlucoseRecordsSection from "@/components/glucose/GlucoseRecordsSection";
import DashboardDesktopHero from "@/components/glucose/DashboardDesktopHero";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getCoachTip, getGreeting } from "@/lib/dashboard/metrics";
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

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [authLoading, sessionUser, router]);

  if (authLoading || !sessionUser) {
    return <LoadingSpinner />;
  }

  const coachTip = getCoachTip(records, records[0] ?? null);

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-white">
      <div className="max-container px-4 py-4 md:padding-container md:py-12 lg:py-16">
        <DashboardDesktopHero records={records} userName={userName} />

        <header className="mb-8 border-b border-slate-200/90 pb-6 md:hidden">
          <p className="dash-eyebrow">Glucolog</p>
          <h1 className="dash-title mt-2 text-xl">{getGreeting(userName)}</h1>
          <p className="dash-accent-quote mt-3 text-sm">{coachTip}</p>
        </header>

        <LivePredictionPanel records={records} form={form} />

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

        <section aria-label="Gráficos" className="mt-10 lg:mt-14">
          <GlucoseCharts
            chartData={chartData}
            chartOptions={chartOptions}
            fetchingRecords={fetchingRecords}
            records={records}
          />
        </section>
      </div>
    </section>
  );
}
