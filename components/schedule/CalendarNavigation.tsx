import React from "react";
import { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarNavigationProps {
  currentDate: Dayjs;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleToday: () => void;
}

const CalendarNavigation = ({
  currentDate,
  handlePrevMonth,
  handleNextMonth,
  handleToday,
}: CalendarNavigationProps) => {
  const now = new Date();
  const isCurrentMonth =
    currentDate.month() === now.getMonth() &&
    currentDate.year() === now.getFullYear();

  const monthLabel =
    currentDate.format("MMMM").charAt(0).toUpperCase() +
    currentDate.format("MMMM").slice(1);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="dash-eyebrow">Mes actual</p>
        <h2 className="dash-title mt-2 text-xl lg:text-2xl">
          {monthLabel}{" "}
          <span className="font-extralight text-slate-500">
            {currentDate.format("YYYY")}
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleToday}
          disabled={isCurrentMonth}
          className={`rounded-full px-5 py-2.5 text-sm font-light transition-all lg:rounded-none ${
            isCurrentMonth
              ? "border border-slate-200 bg-slate-50 text-slate-400 opacity-70"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-vitality-primary/40 active:scale-[0.98]"
          }`}
        >
          Hoy
        </button>

        <div className="flex overflow-hidden rounded-full border border-slate-200 lg:rounded-none">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex h-10 w-10 items-center justify-center bg-white text-slate-600 transition-colors hover:bg-emerald-50 hover:text-vitality-primary dark:hover:text-emerald-400 lg:dash-btn-outline lg:border-0 lg:border-r lg:border-slate-200"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex h-10 w-10 items-center justify-center border-l border-slate-200 bg-white text-slate-600 transition-colors hover:bg-emerald-50 hover:text-vitality-primary dark:hover:text-emerald-400 lg:dash-btn-outline lg:border-0"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarNavigation;
