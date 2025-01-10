"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import Image from "next/image";
import "../schedule/page.css";
import { db, auth } from "../firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  dateTime: string;
  details?: string;
  dose?: string;
  frequency?: string;
  medicationType?: string;
  instructions?: string;
  activityType?: string;
  plannedDuration?: number;
  actualDuration?: number;
  intensity?: 'baja' | 'media' | 'alta';
  time: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
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
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [actualDuration, setActualDuration] = useState<number>(0);

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

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCompleteEvent = async (event: Event) => {
    if (auth.currentUser) {
      try {
        const eventRef = doc(db, "users", auth.currentUser.uid, "events", event.id);
        const completionData = {
          completed: true,
          completedAt: new Date().toISOString(),
          ...(event.type === "exercise" && {
            actualDuration: event.actualDuration || event.plannedDuration
          })
        };
        
        await updateDoc(eventRef, completionData);
        await fetchEvents();
      } catch (error) {
        console.error("Error al marcar el evento como completado:", error);
      }
    }
  };

  const handleUpdateDuration = async (event: Event, duration: number) => {
    if (auth.currentUser) {
      try {
        const eventRef = doc(db, "users", auth.currentUser.uid, "events", event.id);
        await updateDoc(eventRef, {
          actualDuration: duration
        });
        await fetchEvents();
      } catch (error) {
        console.error("Error al actualizar la duración:", error);
      }
    }
  };

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
          frequency: newEventData.frequency,
          medicationType: newEventData.medicationType,
          instructions: newEventData.instructions,
          activityType: newEventData.activityType,
          plannedDuration: newEventData.plannedDuration,
          intensity: newEventData.intensity,
          time: newEventData.time,
          completed: newEventData.completed,
          notes: newEventData.notes,
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
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-out animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out animate-zoomIn">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  {newEventData.type === "medication" ? (
                    <>
                      <FontAwesomeIcon icon={faPills} className="text-green-500 text-2xl" />
                      Nueva Medicación
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faDumbbell} className="text-blue-500 text-2xl" />
                      Nueva Actividad Física
                    </>
                  )}
                </h3>
                <button
                  onClick={handleCloseEventModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Selector de tipo de evento */}
                <div className="flex gap-4">
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                      newEventData.type === "medication"
                        ? "bg-green-500 text-white shadow-lg shadow-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setNewEventData({ ...newEventData, type: "medication" })}
                  >
                    <FontAwesomeIcon icon={faPills} className="text-xl" />
                    Medicación
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                      newEventData.type === "exercise"
                        ? "bg-green-500 text-white shadow-lg shadow-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setNewEventData({ ...newEventData, type: "exercise" })}
                  >
                    <FontAwesomeIcon icon={faDumbbell} className="text-xl" />
                    Actividad Física
                  </button>
                </div>

                {/* Título común */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título del {newEventData.type === "medication" ? "Medicamento" : "Ejercicio"}
                  </label>
                  <input
                    type="text"
                    placeholder={newEventData.type === "medication" ? "ej. Insulina" : "ej. Caminata"}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    value={newEventData.title}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, title: e.target.value })
                    }
                  />
                </div>

                {/* Campos específicos para medicación */}
                {newEventData.type === "medication" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de Medicamento
                        </label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200"
                          value={newEventData.medicationType}
                          onChange={(e) =>
                            setNewEventData({ ...newEventData, medicationType: e.target.value })
                          }
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="pastilla">Pastilla</option>
                          <option value="inyectable">Inyectable</option>
                          <option value="jarabe">Jarabe</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dosis
                        </label>
                        <input
                          type="text"
                          placeholder="ej. 1 pastilla, 5ml"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          value={newEventData.dose}
                          onChange={(e) =>
                            setNewEventData({ ...newEventData, dose: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Frecuencia
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200"
                        value={newEventData.frequency}
                        onChange={(e) =>
                          setNewEventData({ ...newEventData, frequency: e.target.value })
                        }
                      >
                        <option value="">Seleccionar frecuencia</option>
                        <option value="unica">Única vez</option>
                        <option value="diaria">Diaria</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Instrucciones
                      </label>
                      <textarea
                        placeholder="ej. Tomar con comida"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                        value={newEventData.instructions}
                        onChange={(e) =>
                          setNewEventData({ ...newEventData, instructions: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de Actividad
                        </label>
                        <select
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200"
                          value={newEventData.activityType}
                          onChange={(e) =>
                            setNewEventData({ ...newEventData, activityType: e.target.value })
                          }
                        >
                          <option value="">Seleccionar actividad</option>
                          <option value="caminar">Caminar</option>
                          <option value="correr">Correr</option>
                          <option value="ciclismo">Ciclismo</option>
                          <option value="natacion">Natación</option>
                          <option value="yoga">Yoga</option>
                          <option value="pesas">Pesas</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duración (minutos)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          value={newEventData.plannedDuration}
                          onChange={(e) =>
                            setNewEventData({
                              ...newEventData,
                              plannedDuration: parseInt(e.target.value) || 30,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Intensidad
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["baja", "media", "alta"].map((intensity) => (
                          <button
                            key={intensity}
                            type="button"
                            className={`py-3 px-4 rounded-xl transition-all duration-200 ${
                              newEventData.intensity === intensity
                                ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            onClick={() =>
                              setNewEventData({ ...newEventData, intensity: intensity as any })
                            }
                          >
                            {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos comunes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      value={newEventData.time}
                      onChange={(e) =>
                        setNewEventData({ ...newEventData, time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
                      value={newEventDate?.format("DD/MM/YYYY") || ""}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    placeholder="Notas o recordatorios importantes"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
                    value={newEventData.notes}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 py-3 px-6 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 font-semibold shadow-lg shadow-green-200"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCloseEventModal}
                    className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} 

        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {selectedEvent.type === "medication" ? (
                    <FontAwesomeIcon icon={faPills} className="text-green-500" />
                  ) : (
                    <FontAwesomeIcon icon={faDumbbell} className="text-blue-500" />
                  )}
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-medium">{selectedEvent.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hora</p>
                      <p className="font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                </div>

                {selectedEvent.type === "medication" ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Detalles de la Medicación</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium">{selectedEvent.medicationType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Dosis</p>
                          <p className="font-medium">{selectedEvent.dose}</p>
                        </div>
                      </div>
                      {selectedEvent.instructions && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Instrucciones</p>
                          <p className="font-medium">{selectedEvent.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Detalles de la Actividad</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Tipo</p>
                          <p className="font-medium">{selectedEvent.activityType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Intensidad</p>
                          <p className="font-medium capitalize">{selectedEvent.intensity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duración Planeada</p>
                          <p className="font-medium">{selectedEvent.plannedDuration} minutos</p>
                        </div>
                        {selectedEvent.actualDuration && (
                          <div>
                            <p className="text-sm text-gray-600">Duración Real</p>
                            <p className="font-medium">{selectedEvent.actualDuration} minutos</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Notas</p>
                    <p className="font-medium">{selectedEvent.notes}</p>
                  </div>
                )}

                {!selectedEvent.completed ? (
                  <div className="space-y-4">
                    {selectedEvent.type === "exercise" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duración Real (minutos)
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-lg"
                          value={actualDuration}
                          onChange={(e) => setActualDuration(Math.max(0, parseInt(e.target.value) || 0))}
                          min="0"
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        if (selectedEvent.type === "exercise") {
                          handleUpdateDuration(selectedEvent, actualDuration);
                        }
                        handleCompleteEvent(selectedEvent);
                        setSelectedEvent(null);
                      }}
                      className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Marcar como Completado
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="font-medium">Completado el {new Date(selectedEvent.completedAt!).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Schedule;
