"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import Image from "next/image";
import "../schedule/page.css";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import { Event } from "@/types/events";
import { CalendarService } from "@/services/calendarService";
import NewEventModal from '@/components/schedule/NewEventModal';
import AlertModal from '@/components/schedule/AlertModal';
import EventsList from '@/components/schedule/EventsList';
const BarChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


import CalendarNavigation from '@/components/schedule/CalendarNavigation';
import CalendarGrid from "@/components/schedule/CalendarGrid";
import MonthlyStats from "@/components/schedule/MonthlyStats";
import EventDetailModal from '@/components/schedule/EventDetailModal';
/**
 * Schedule Component - Manages calendar events for medications and exercises
 */
const Schedule: React.FC = () => {
  // State management
  const [events, setEvents] = useState<Event[]>([]); // All user events
  const [currentDate, setCurrentDate] = useState(dayjs()); // Current displayed month
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // Event being viewed
  const [isAddingEvent, setIsAddingEvent] = useState(false); // Modal visibility state
  const [newEventDate, setNewEventDate] = useState<dayjs.Dayjs | null>(null); // Date for new event
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success notification state
  const [isAlertVisible, setIsAlertVisible] = useState(false); // Alert modal visibility
  const [actualDuration, setActualDuration] = useState<number>(0); // Exercise completion duration
  const [showEventsList, setShowEventsList] = useState(false); // Events list modal visibility
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]); // Events for selected day
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null); // Selected calendar day
  
  // Default values for new events
  const [newEventData, setNewEventData] = useState({
    title: "",
    type: "medication",
    details: "",
    dose: "",
    frequency: "",
    medicationType: "",
    instructions: "",
    activityType: "",
    plannedDuration: 30,
    intensity: "media" as const,
    time: "",
    completed: false,
    notes: "",
    state: false,
  });
  
  // Monthly statistics for dashboard
  const [monthlyStats, setMonthlyStats] = useState({
    completedMedications: 0,
    completedExercises: 0,
    totalDuration: 0,
    exercisesByType: {} as Record<string, number>,
    medicationsByType: {} as Record<string, number>,
  });

  // Calendar date calculations
  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");

  const days = [];
  let day = startDay;
  while (day.isBefore(endDay, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  /**
   * Calendar navigation handlers
   */
  const handlePrevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const handleToday = () => setCurrentDate(dayjs());

  /**
   * Gets events for a specific day
   */
  const getEventsForDay = (date: dayjs.Dayjs) => 
    CalendarService.getEventsForDay(events, date);

  /**
   * Handles click on an event in the calendar
   */
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  /**
   * Marks an event as completed in Firestore and local state
   */
  const handleCompleteEvent = async (event: Event) => {
    if (auth.currentUser && !event.completed && event.id) {
      try {
        const eventRef = doc(db, "users", auth.currentUser.uid, "events", event.id);
        const completionData = {
          completed: true,
          completedAt: new Date().toISOString(),
          ...(event.type === "exercise" && {
            actualDuration: actualDuration || event.plannedDuration,
          }),
        };

        await updateDoc(eventRef, completionData);

        // Update local state
        setEvents((prevEvents) =>
          prevEvents.map((e) => e.id === event.id ? { ...e, ...completionData } : e)
        );

        setSelectedEvent(null);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      } catch (error) {
        console.error("Error al marcar el evento como completado:", error);
      }
    }
  };

  /**
   * Handles click on a calendar day
   */
  const handleDateClick = (date: dayjs.Dayjs) => {
    const events = getEventsForDay(date);
    setSelectedDate(date);
    
    if (date.isBefore(dayjs(), 'day')) {
      setIsAlertVisible(true);
    } else {
      setSelectedDayEvents(events);
      setShowEventsList(true);
    }
  };

  /**
   * Initiates new event creation process
   */
  const handleAddNewEvent = () => {
    setNewEventDate(selectedDate);
    setIsAddingEvent(true);
    setShowEventsList(false);
  };

  /**
   * Modal close handlers
   */
  const handleCloseAlertModal = () => setIsAlertVisible(false);
  const handleCloseEventModal = () => {
    setIsAddingEvent(false);
    setNewEventData({
      title: "",
      type: "medication",
      details: "",
      dose: "",
      frequency: "",
      medicationType: "",
      instructions: "",
      activityType: "",
      plannedDuration: 30,
      intensity: "media" as const,
      time: "",
      completed: false,
      notes: "",
      state: false,
    });
    setNewEventDate(null);
  };

  /**
   * Saves a new event to Firestore and updates local state
   */
  const handleSaveEvent = async () => {
    if (!newEventDate || !auth.currentUser) return;

    if (!newEventData.title || !newEventData.time) {
      alert("Por favor completa el título y la hora del evento");
      return;
    }

    try {
      const eventDateTime = dayjs(`${newEventDate.format("YYYY-MM-DD")} ${newEventData.time}`).toISOString();
      const eventData = {
        title: newEventData.title,
        date: newEventDate.format("YYYY-MM-DD"),
        dateTime: eventDateTime,
        type: newEventData.type,
        details: newEventData.details,
        dose: newEventData.dose,
        frequency: newEventData.frequency,
        medicationType: newEventData.medicationType,
        instructions: newEventData.instructions,
        activityType: newEventData.activityType,
        plannedDuration: newEventData.plannedDuration,
        intensity: newEventData.intensity,
        time: newEventData.time,
        completed: false,
        notes: newEventData.notes,
        state: false,
      };

      const docRef = await addDoc(
        collection(db, "users", auth.currentUser.uid, "events"),
        eventData
      );

      setEvents((prevEvents) => [...prevEvents, { id: docRef.id, ...eventData }]);
      handleCloseEventModal();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error("Error guardando el evento en Firestore:", error);
      alert("Error al guardar el evento. Por favor intenta de nuevo.");
    }
  };

  /**
   * Fetches all events from Firestore
   */
  const fetchEvents = async () => {
    try {
      const eventsList = await CalendarService.fetchEvents();
      setEvents(eventsList);
    } catch (error) {
      console.error("Error cargando los eventos:", error);
    }
  };

  /**
   * Updates monthly statistics when events or current date changes
   */
  useEffect(() => {
    const stats = CalendarService.calculateMonthlyStats(events, currentDate);
    setMonthlyStats(stats);
  }, [events, currentDate]);

  /**
   * Chart data for exercises by type
   */
  const exerciseChartData = {
    labels: Object.keys(monthlyStats.exercisesByType),
    datasets: [{
      label: "Ejercicios Completados por Tipo",
      data: Object.values(monthlyStats.exercisesByType),
      backgroundColor: "rgba(54, 162, 235, 0.5)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    }],
    options: {
      responsive: true,
      plugins: { legend: { position: "top" as const } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  };

  /**
   * Chart data for medications by type
   */
  const medicationChartData = {
    labels: Object.keys(monthlyStats.medicationsByType),
    datasets: [{
      label: "Medicamentos Tomados por Tipo",
      data: Object.values(monthlyStats.medicationsByType),
      backgroundColor: "rgba(75, 192, 192, 0.5)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    }],
    options: {
      responsive: true,
      plugins: { legend: { position: "top" as const } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  };

  /**
   * Returns CSS classes for event status styling
   */
  const getEventStatusColor = (event: Event) => {
    if (event.completed) return "bg-green-100 border-green-200 text-green-800";
    
    const eventDate = dayjs(event.date);
    const today = dayjs();
    if (eventDate.isBefore(today, "day")) return "bg-red-100 border-red-200 text-red-800";
    
    return "bg-blue-100 border-blue-200 text-blue-800";
  };

  /**
   * Returns text description of event status
   */
  const getEventStatusText = (event: Event) => {
    if (event.completed) return "Completado";
    
    const eventDate = dayjs(event.date);
    const today = dayjs();
    if (eventDate.isBefore(today, "day")) return "Vencido";
    
    return "Pendiente";
  };

  /**
   * Loads events when component mounts and user is authenticated
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchEvents();
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <section>
      {/* Encabezado del calendario */}
      <div className="relative my-9 flex items-center justify-center flex-col">
        <div className="relative flex items-center">
          <Image
            src="/calendar.svg"
            alt="camp"
            width={50}
            height={50}
            className="w-5 lg:w-[50px] xs:w-12 mr-2"
          />
          <h1 className="font-bold text-2xl lg:text-4xl mt-5 capitalize text-center text-green-50">
            Calendario de actividades
          </h1>
        </div>
      </div>

      {/* Contenido del calendario */}
      <div className="max-w-6xl mx-auto text-center">
        <CalendarNavigation 
          currentDate={currentDate}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          handleToday={handleToday}
        />
        
        <CalendarGrid 
          days={days}
          currentDate={currentDate}
          newEventDate={newEventDate}
          handleDateClick={handleDateClick}
          getEventsForDay={getEventsForDay}
          handleEventClick={handleEventClick}
        />

        {/* Agregar la sección de estadísticas después del calendario */}
        <MonthlyStats 
          monthlyStats={monthlyStats}
          exerciseChartData={exerciseChartData}
          medicationChartData={medicationChartData}
        />

        {/* Modal de alerta */}
        <AlertModal 
          isVisible={isAlertVisible}
          onClose={handleCloseAlertModal}
          title="Fecha no válida"
          message="No puedes agregar eventos en fechas anteriores a hoy."
        />

        {/* Componente de Modal de Nuevo Evento */}
        <NewEventModal 
          isOpen={isAddingEvent}
          onClose={handleCloseEventModal}
          newEventDate={newEventDate}
          newEventData={newEventData}
          setNewEventData={setNewEventData as React.Dispatch<React.SetStateAction<{
            title: string;
            type: string;
            details: string;
            dose: string;
            frequency: string;
            medicationType: string;
            instructions: string;
            activityType: string;
            plannedDuration: number;
            intensity: string;
            time: string;
            completed: boolean;
            notes: string;
            state: boolean;
          }>>}
          onSave={handleSaveEvent}
        />
        {/* Modal de éxito al registrar evento */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg transform animate-fadeIn">
              <div className="flex items-center gap-3 text-green-600">
                <svg
                  className="w-8 h-8 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xl font-semibold">
                  ¡Evento Registrado Exitosamente!
                </span>
              </div>
            </div>
          </div>
        )}

        <EventsList 
          isVisible={showEventsList}
          onClose={() => setShowEventsList(false)}
          selectedDate={selectedDate}
          selectedDayEvents={selectedDayEvents}
          handleAddNewEvent={handleAddNewEvent}
          getEventStatusColor={getEventStatusColor}
          getEventStatusText={getEventStatusText}
          setSelectedEvent={setSelectedEvent}
        />

        {/* Modal de detalle del evento */}
        <EventDetailModal 
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          actualDuration={actualDuration}
          setActualDuration={setActualDuration}
          handleCompleteEvent={handleCompleteEvent}
          getEventStatusColor={getEventStatusColor}
          getEventStatusText={getEventStatusText}
        />
      </div>
    </section>
  );
};

export default Schedule;
