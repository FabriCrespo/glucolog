"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import ScheduleSuccessToast from "@/components/schedule/ScheduleSuccessToast";
import "./page.css";

export default function SchedulePage() {
  const router = useRouter();
  const { user: sessionUser, loading: authLoading } = useAuthSession();

  const schedule = useSchedulePage(sessionUser, authLoading);

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
            Agenda · Glucolog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Calendario de actividades
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Medicación y ejercicio en un solo lugar: navega por el mes, registra
            eventos y revisa el resumen al estilo del panel principal.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] sm:p-6 lg:p-8">
          {schedule.loadingEventsError && (
            <div
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="alert"
            >
              {schedule.loadingEventsError}
            </div>
          )}

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

          <div className="mt-8 border-t border-slate-100 pt-8 lg:mt-10 lg:pt-10">
            <MonthlyStats
              monthlyStats={schedule.monthlyStats}
              exerciseChartData={schedule.exerciseChartData}
              medicationChartData={schedule.medicationChartData}
            />
          </div>

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
      </div>
    </section>
  );
}
