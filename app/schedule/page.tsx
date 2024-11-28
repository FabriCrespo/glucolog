"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import Image from "next/image";
import "../schedule/page.css";
import { db, auth } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  dateTime: string; // Añadido
  details?: string;
  dose?: string;
  time?: string;
  state: boolean;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventDate, setNewEventDate] = useState<dayjs.Dayjs | null>(null);
  const [newEventData, setNewEventData] = useState({
    title: "",
    type: "medication",
    details: "",
    dose: "",
    time: "",
    state: false,
  });
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");

  const days = [];
  let day = startDay;

  while (day.isBefore(endDay, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  const handlePrevMonth = () =>
    setCurrentDate(currentDate.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const getEventsForDay = (date: dayjs.Dayjs) =>
    events.filter((event) => dayjs(event.date).isSame(date, "day"));

  const handleEventClick = (event: Event) => setSelectedEvent(event);

  const handleDateClick = (date: dayjs.Dayjs) => {
    if (date.isBefore(dayjs(), "day")) {
      setIsAlertVisible(true);
      return;
    }

    setNewEventDate(date);
    setIsAddingEvent(true);
  };

  const handleCloseAlertModal = () => setIsAlertVisible(false);

  const handleCloseEventModal = () => {
    setIsAddingEvent(false);
    setNewEventData({
      title: "",
      type: "medication",
      details: "",
      dose: "",
      time: "",
      state: false,
    });
  };
  const handleSaveEvent = async () => {
    if (newEventDate && auth.currentUser) {
      try {
        const eventDateTime = dayjs(
          `${newEventDate.format("YYYY-MM-DD")} ${newEventData.time}`
        ).toISOString();
  
        const newEvent: Event = {
          id: Math.random().toString(),
          title: newEventData.title,
          date: newEventDate.format("YYYY-MM-DD"),
          dateTime: eventDateTime,
          type: newEventData.type,
          details: newEventData.details,
          dose: newEventData.dose,
          time: newEventData.time,
          state: false,
        };
  
        await addDoc(
          collection(db, "users", auth.currentUser.uid, "events"),
          newEvent
        );
  
        await fetchEvents();
        handleCloseEventModal();
      } catch (error) {
        console.error("Error guardando el evento en Firestore:", error);
      }
    }
  };
  

  // Función para cargar eventos desde Firestore
  // Función para cargar eventos desde Firestore
  const fetchEvents = async () => {
    if (auth.currentUser) {
      try {
        const eventsSnapshot = await getDocs(
          collection(db, "users", auth.currentUser.uid, "events")
        );
        const eventsList = eventsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Event)
        );
        setEvents(eventsList);
      } catch (error) {
        console.error("Error cargando los eventos desde Firestore:", error);
      }
    }
  };

  // Llama a fetchEvents cuando el componente se monta para cargar los eventos existentes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Cargar los eventos desde Firestore si el usuario está autenticado
        fetchEvents();
      } else {
        // Limpiar la lista de eventos si no hay usuario autenticado
        setEvents([]);
      }
    });

    // Limpia el observador cuando el componente se desmonte
    return () => unsubscribe();
  }, []);
  return (
    <section>
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
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Anterior
          </button>
          <h2 className="text-2xl font-semibold">
            {currentDate.format("MMMM YYYY")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Siguiente
          </button>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
            (day, index) => (
              <div key={index} className="text-lg font-semibold text-gray-700">
                {day}
              </div>
            )
          )}
          {days.map((dayItem, index) => {
            const isToday = dayItem.isSame(dayjs(), "day");

            return (
              <div
                key={index}
                onClick={() => handleDateClick(dayItem)}
                className={`border p-4 h-32 flex flex-col items-center justify-start relative cursor-pointer transition-all duration-300 ${
                  dayItem.isSame(currentDate, "month")
                    ? "bg-white"
                    : "bg-gray-100 text-gray-400"
                } ${
                  newEventDate && dayItem.isSame(newEventDate, "day")
                    ? "border-green-500"
                    : ""
                } ${
                  isToday
                    ? "border-green-500 shadow-md shadow-green-300 text-green-500"
                    : ""
                }`}
              >
                <span className="font-semibold text-lg">{dayItem.date()}</span>
                <div className="mt-2 space-y-1 flex flex-col items-center">
                  {getEventsForDay(dayItem).map((event, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleEventClick(event)}
                      className="cursor-pointer flex items-center space-x-1"
                    >
                      {event.type === "medication" ? (
                        <FontAwesomeIcon
                          icon={faPills}
                          className="text-green-500 text-lg"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faDumbbell}
                          className="text-blue-500 text-lg"
                        />
                      )}
                      <span className="bg-gray-200 text-gray-800 text-sm rounded px-2">
                        {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isAlertVisible && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
              <h3 className="text-xl font-semibold mb-4">Fecha no válida</h3>
              <p className="mb-4">
                No puedes agregar eventos en fechas anteriores a hoy.
              </p>
              <button
                onClick={handleCloseAlertModal}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {isAddingEvent && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-out opacity-0 animate-fadeIn">
            <div className="bg-white p-6 rounded shadow-lg w-80 transform transition-transform duration-300 ease-out scale-95 animate-zoomIn">
              <h3 className="text-xl font-semibold mb-4">Nuevo Evento</h3>

              {/* Campo común para el título del evento */}
              <input
                type="text"
                placeholder="Título"
                className="w-full mb-2 p-2 border rounded"
                value={newEventData.title}
                onChange={(e) =>
                  setNewEventData({ ...newEventData, title: e.target.value })
                }
              />

              {/* Selector de tipo de evento */}
              <select
                className="w-full mb-2 p-2 border rounded"
                value={newEventData.type}
                onChange={(e) =>
                  setNewEventData({ ...newEventData, type: e.target.value })
                }
              >
                <option value="medication">Medicación</option>
                <option value="exercise">Actividad Física</option>
              </select>

              {/* Campos específicos para el tipo de evento */}
              {newEventData.type === "medication" ? (
                <>
                  <input
                    type="text"
                    placeholder="Nombre del medicamento"
                    className="w-full mb-2 p-2 border rounded"
                    value={newEventData.details}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        details: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Dosis"
                    className="w-full mb-2 p-2 border rounded"
                    value={newEventData.dose}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, dose: e.target.value })
                    }
                  />
                  <input
                    type="time"
                    className="w-full mb-2 p-2 border rounded"
                    value={newEventData.time}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, time: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Descripción de la actividad (ej. Cardio, Pesas)"
                    className="w-full mb-2 p-2 border rounded"
                    value={newEventData.details}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        details: e.target.value,
                      })
                    }
                  />
                  <input
                    type="time"
                    className="w-full mb-2 p-2 border rounded"
                    value={newEventData.time}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, time: e.target.value })
                    }
                  />
                </>
              )}

              {/* Botones de Guardar y Cancelar */}
              <button
                onClick={handleSaveEvent}
                className="w-full mb-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                Guardar
              </button>
              <button
                onClick={handleCloseEventModal}
                className="w-full px-4 py-2 bg-red-500 text-white rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Schedule;
