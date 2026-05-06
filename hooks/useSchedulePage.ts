"use client";

import type { User } from "firebase/auth";
import dayjs from "dayjs";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from "react";
import { auth } from "@/app/firebase/config";
import {
  INITIAL_NEW_EVENT_FORM,
  SUCCESS_TOAST_MS,
} from "@/constants/schedule";
import {
  getEventStatusColor,
  getEventStatusText,
} from "@/lib/schedule/eventPresentation";
import {
  buildExerciseChartData,
  buildMedicationChartData,
} from "@/lib/schedule/monthlyCharts";
import { parseNewEventForm } from "@/lib/validation/scheduleForms";
import { CalendarService } from "@/services/calendarService";
import type { Event, MonthlyStatsType } from "@/types/events";
import type { NewEventFormState } from "@/types/schedule";

export interface UseSchedulePageResult {
  currentDate: dayjs.Dayjs;
  setCurrentDate: Dispatch<SetStateAction<dayjs.Dayjs>>;
  calendarDays: dayjs.Dayjs[];
  selectedEvent: Event | null;
  setSelectedEvent: Dispatch<SetStateAction<Event | null>>;
  isAddingEvent: boolean;
  newEventDate: dayjs.Dayjs | null;
  newEventData: NewEventFormState;
  setNewEventData: Dispatch<SetStateAction<NewEventFormState>>;
  showSuccessModal: boolean;
  isAlertVisible: boolean;
  actualDuration: number;
  setActualDuration: Dispatch<SetStateAction<number>>;
  showEventsList: boolean;
  selectedDayEvents: Event[];
  selectedDate: dayjs.Dayjs | null;
  monthlyStats: MonthlyStatsType;
  exerciseChartData: ReturnType<typeof buildExerciseChartData>;
  medicationChartData: ReturnType<typeof buildMedicationChartData>;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  goToday: () => void;
  getEventsForDay: (date: dayjs.Dayjs) => Event[];
  handleEventClick: (event: Event, e: MouseEvent) => void;
  handleCompleteEvent: (event: Event) => Promise<void>;
  handleDateClick: (date: dayjs.Dayjs) => void;
  handleAddNewEvent: () => void;
  handleCloseAlertModal: () => void;
  handleCloseEventModal: () => void;
  handleSaveEvent: () => Promise<void>;
  closeEventsList: () => void;
  getEventStatusColor: (event: Event) => string;
  getEventStatusText: (event: Event) => string;
  loadingEventsError: string | null;
}

export function useSchedulePage(
  sessionUser: User | null | undefined,
  authLoading: boolean
): UseSchedulePageResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(() => dayjs());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventDate, setNewEventDate] = useState<dayjs.Dayjs | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);
  const [showEventsList, setShowEventsList] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [newEventData, setNewEventData] = useState<NewEventFormState>(
    () => ({ ...INITIAL_NEW_EVENT_FORM })
  );
  const [loadingEventsError, setLoadingEventsError] = useState<string | null>(
    null
  );

  const successToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissSuccessSoon = useCallback(() => {
    if (successToastTimer.current) {
      clearTimeout(successToastTimer.current);
    }
    successToastTimer.current = setTimeout(() => {
      setShowSuccessModal(false);
      successToastTimer.current = null;
    }, SUCCESS_TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (successToastTimer.current) {
        clearTimeout(successToastTimer.current);
      }
    };
  }, []);

  const calendarDays = useMemo(
    () => CalendarService.getCalendarDays(currentDate),
    [currentDate]
  );

  const monthlyStats = useMemo(
    () => CalendarService.calculateMonthlyStats(events, currentDate),
    [events, currentDate]
  );

  const exerciseChartData = useMemo(
    () => buildExerciseChartData(monthlyStats),
    [monthlyStats]
  );

  const medicationChartData = useMemo(
    () => buildMedicationChartData(monthlyStats),
    [monthlyStats]
  );

  const fetchEvents = useCallback(async () => {
    if (!sessionUser) return;
    setLoadingEventsError(null);
    try {
      const list = await CalendarService.fetchEvents();
      setEvents(list);
    } catch (err) {
      console.error("[useSchedulePage] fetchEvents", err);
      setLoadingEventsError(
        err instanceof Error ? err.message : "No se pudieron cargar los eventos"
      );
    }
  }, [sessionUser]);

  useEffect(() => {
    if (authLoading || !sessionUser) return;
    fetchEvents();
  }, [authLoading, sessionUser, fetchEvents]);

  const goPrevMonth = useCallback(() => {
    setCurrentDate((d) => d.subtract(1, "month"));
  }, []);

  const goNextMonth = useCallback(() => {
    setCurrentDate((d) => d.add(1, "month"));
  }, []);

  const goToday = useCallback(() => {
    setCurrentDate(dayjs());
  }, []);

  const getEventsForDay = useCallback(
    (date: dayjs.Dayjs) => CalendarService.getEventsForDay(events, date),
    [events]
  );

  const handleEventClick = useCallback((event: Event, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  }, []);

  const handleCompleteEvent = useCallback(
    async (event: Event) => {
      if (!auth.currentUser || event.completed || !event.id) return;

      try {
        const completionData: Partial<Event> = {
          completed: true,
          completedAt: new Date().toISOString(),
          ...(event.type === "exercise" && {
            actualDuration: actualDuration || event.plannedDuration,
          }),
        };

        await CalendarService.updateEvent(event.id, completionData);

        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id ? { ...e, ...completionData } : e
          )
        );

        setSelectedEvent(null);
        setShowSuccessModal(true);
        dismissSuccessSoon();
      } catch (error) {
        console.error("Error al marcar el evento como completado:", error);
      }
    },
    [actualDuration, dismissSuccessSoon]
  );

  const handleDateClick = useCallback(
    (date: dayjs.Dayjs) => {
      const dayEvents = getEventsForDay(date);
      setSelectedDate(date);

      if (date.isBefore(dayjs(), "day")) {
        setIsAlertVisible(true);
      } else {
        setSelectedDayEvents(dayEvents);
        setShowEventsList(true);
      }
    },
    [getEventsForDay]
  );

  const handleAddNewEvent = useCallback(() => {
    setShowEventsList(false);
    requestAnimationFrame(() => {
      setNewEventDate(selectedDate);
      setIsAddingEvent(true);
    });
  }, [selectedDate]);

  const handleCloseAlertModal = useCallback(() => {
    setIsAlertVisible(false);
  }, []);

  const resetNewEventForm = useCallback(() => {
    setNewEventData({ ...INITIAL_NEW_EVENT_FORM });
    setNewEventDate(null);
  }, []);

  const handleCloseEventModal = useCallback(() => {
    setIsAddingEvent(false);
    resetNewEventForm();
  }, [resetNewEventForm]);

  const handleSaveEvent = useCallback(async () => {
    if (!newEventDate || !auth.currentUser) return;

    const parsed = parseNewEventForm(newEventData);
    if (!parsed.success) return;

    const form = parsed.data;

    try {
      const eventDateTime = dayjs(
        `${newEventDate.format("YYYY-MM-DD")} ${form.time}`
      ).toISOString();

      const payload: Omit<Event, "id"> = {
        title: form.title,
        date: newEventDate.format("YYYY-MM-DD"),
        dateTime: eventDateTime,
        type: form.type,
        details: form.details,
        dose: form.dose,
        frequency: form.frequency,
        medicationType: form.medicationType,
        instructions: form.instructions,
        activityType: form.activityType,
        plannedDuration: form.plannedDuration,
        intensity: form.intensity,
        time: form.time,
        completed: false,
        notes: form.notes,
        state: false,
      };

      const id = await CalendarService.addEvent(payload);

      setEvents((prev) => [...prev, { id, ...payload }]);
      handleCloseEventModal();
      setShowSuccessModal(true);
      dismissSuccessSoon();
    } catch (error) {
      console.error("Error guardando el evento:", error);
      window.alert("Error al guardar el evento. Por favor intenta de nuevo.");
    }
  }, [newEventDate, newEventData, handleCloseEventModal, dismissSuccessSoon]);

  const closeEventsList = useCallback(() => {
    setShowEventsList(false);
  }, []);

  return {
    currentDate,
    setCurrentDate,
    calendarDays,
    selectedEvent,
    setSelectedEvent,
    isAddingEvent,
    newEventDate,
    newEventData,
    setNewEventData,
    showSuccessModal,
    isAlertVisible,
    actualDuration,
    setActualDuration,
    showEventsList,
    selectedDayEvents,
    selectedDate,
    monthlyStats,
    exerciseChartData,
    medicationChartData,
    goPrevMonth,
    goNextMonth,
    goToday,
    getEventsForDay,
    handleEventClick,
    handleCompleteEvent,
    handleDateClick,
    handleAddNewEvent,
    handleCloseAlertModal,
    handleCloseEventModal,
    handleSaveEvent,
    closeEventsList,
    getEventStatusColor,
    getEventStatusText,
    loadingEventsError,
  };
}
