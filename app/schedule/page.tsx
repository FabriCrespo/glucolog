"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BarChart3, ChevronDown } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSchedulePage } from "@/hooks/useSchedulePage";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertModal from "@/components/schedule/AlertModal";
import CalendarGrid from "@/components/schedule/CalendarGrid";
import CalendarNavigation from "@/components/schedule/CalendarNavigation";
import EventDetailModal from "@/components/schedule/EventDetailModal";
import EventsList from "@/components/schedule/EventsList";
import MonthlyStats from "@/components/schedule/MonthlyStats";
import NewEventModal from "@/components/schedule/NewEventModal";
import ScheduleMobileHub from "@/components/schedule/ScheduleMobileHub";
import ScheduleSuccessToast from "@/components/schedule/ScheduleSuccessToast";
import "./page.css";

export default function SchedulePage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();
  const [mobileView, setMobileView] = useState<"hub" | "calendar">("hub");
  const [showMobileStats, setShowMobileStats] = useState(false);

  const schedule = useSchedulePage(sessionUser, authLoading);

  useEffect(() => {
    if (authLoading) return;
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [authLoading, sessionUser, router]);

  useEffect(() => {
    if (schedule.showEventsList || schedule.selectedEvent || schedule.isAddingEvent) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [schedule.showEventsList, schedule.selectedEvent, schedule.isAddingEvent]);

  if (authLoading || !sessionUser) {
    return <LoadingSpinner />;
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] w-full bg-white">
      <div className="max-container px-4 py-4 md:padding-container md:py-12 lg:py-16">
        <header className="mb-6 border-b border-slate-200/90 pb-5 lg:mb-8 lg:pb-6">
          <p className="dash-eyebrow">Agenda · Glucolog</p>
          <h1 className="dash-title mt-2 text-2xl lg:text-3xl">
            Calendario de actividades
          </h1>
          <p className="dash-body mt-2 max-w-2xl lg:mt-3">
            <span className="lg:hidden">
              Empieza con tu día de hoy. Abre el calendario completo solo cuando lo
              necesites.
            </span>
            <span className="hidden lg:inline">
              Medicación y ejercicio en un solo lugar. Toca un día para ver o crear
              eventos y revisa tu resumen mensual abajo.
            </span>
          </p>
        </header>

        {schedule.loadingEventsError ? (
          <div
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 lg:mb-8 lg:rounded-none"
            role="alert"
          >
            <p className="dash-body text-amber-950">{schedule.loadingEventsError}</p>
          </div>
        ) : null}

        {/* ——— Móvil: hub de inicio ——— */}
        <section
          aria-label="Resumen del día"
          className={`border-t border-slate-200 pt-6 lg:hidden ${
            mobileView === "calendar" ? "hidden" : ""
          }`}
        >
          <ScheduleMobileHub
            getEventsForDay={schedule.getEventsForDay}
            handleDateClick={schedule.handleDateClick}
            openNewEventForDate={schedule.openNewEventForDate}
            onOpenCalendar={() => setMobileView("calendar")}
            getEventStatusText={schedule.getEventStatusText}
            setSelectedEvent={schedule.setSelectedEvent}
            monthlyStats={schedule.monthlyStats}
          />

          <div className="mt-8 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => setShowMobileStats((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 to-emerald-50/40 px-4 py-4 text-left transition-all active:scale-[0.99] dark:border-emerald-700/60 dark:from-emerald-950/55 dark:to-emerald-900/35"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    Estadísticas del mes
                  </span>
                  <span className="dash-muted mt-0.5 block">
                    Resumen y gráficos de medicación y ejercicio
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 text-violet-500 transition-transform ${
                  showMobileStats ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            <AnimatePresence>
              {showMobileStats ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5">
                    <MonthlyStats
                      monthlyStats={schedule.monthlyStats}
                      exerciseChartData={schedule.exerciseChartData}
                      medicationChartData={schedule.medicationChartData}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

        {/* ——— Móvil: calendario compacto ——— */}
        <section
          aria-label="Calendario"
          className={`border-t border-slate-200 pt-6 lg:hidden ${
            mobileView === "hub" ? "hidden" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileView("hub")}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-light text-vitality-primary ring-1 ring-emerald-200/80 transition-colors active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Volver al inicio
          </button>

          <CalendarNavigation
            currentDate={schedule.currentDate}
            handlePrevMonth={schedule.goPrevMonth}
            handleNextMonth={schedule.goNextMonth}
            handleToday={schedule.goToday}
          />

          <CalendarGrid
            days={schedule.calendarDays}
            currentDate={schedule.currentDate}
            newEventDate={schedule.newEventDate}
            handleDateClick={schedule.handleDateClick}
            getEventsForDay={schedule.getEventsForDay}
            handleEventClick={schedule.handleEventClick}
            compact
          />

          <p className="dash-muted mt-4 text-center">
            Toca un día para ver o crear eventos
          </p>
        </section>

        {/* ——— Escritorio: calendario completo ——— */}
        <section
          aria-label="Calendario"
          className="hidden border-t border-slate-200 pt-10 lg:block"
        >
          <CalendarNavigation
            currentDate={schedule.currentDate}
            handlePrevMonth={schedule.goPrevMonth}
            handleNextMonth={schedule.goNextMonth}
            handleToday={schedule.goToday}
          />

          <CalendarGrid
            days={schedule.calendarDays}
            currentDate={schedule.currentDate}
            newEventDate={schedule.newEventDate}
            handleDateClick={schedule.handleDateClick}
            getEventsForDay={schedule.getEventsForDay}
            handleEventClick={schedule.handleEventClick}
          />
        </section>

        <section
          aria-label="Resumen mensual"
          className="mt-10 hidden border-t border-slate-200 pt-10 lg:mt-14 lg:block lg:pt-14"
        >
          <MonthlyStats
            monthlyStats={schedule.monthlyStats}
            exerciseChartData={schedule.exerciseChartData}
            medicationChartData={schedule.medicationChartData}
          />
        </section>

        <AlertModal
          isVisible={schedule.isAlertVisible}
          onClose={schedule.handleCloseAlertModal}
          title="Fecha no válida"
          message="No puedes agregar eventos en fechas anteriores a hoy."
        />

        <NewEventModal
          isOpen={schedule.isAddingEvent}
          onClose={schedule.handleCloseEventModal}
          newEventDate={schedule.newEventDate}
          newEventData={schedule.newEventData}
          setNewEventData={schedule.setNewEventData}
          onSave={schedule.handleSaveEvent}
        />

        <ScheduleSuccessToast open={schedule.showSuccessModal} />

        <EventsList
          isVisible={schedule.showEventsList}
          onClose={schedule.closeEventsList}
          selectedDate={schedule.selectedDate}
          selectedDayEvents={schedule.selectedDayEvents}
          handleAddNewEvent={schedule.handleAddNewEvent}
          getEventStatusText={schedule.getEventStatusText}
          setSelectedEvent={schedule.setSelectedEvent}
        />

        <EventDetailModal
          selectedEvent={schedule.selectedEvent}
          setSelectedEvent={schedule.setSelectedEvent}
          actualDuration={schedule.actualDuration}
          setActualDuration={schedule.setActualDuration}
          handleCompleteEvent={schedule.handleCompleteEvent}
          getEventStatusText={schedule.getEventStatusText}
        />
      </div>
    </section>
  );
}
