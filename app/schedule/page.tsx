"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { database } from "@/app/firebase/config";
import { ref, set, onValue } from "firebase/database";

// Interfaz para los eventos
interface Event {
  title: string;
  start: string;
  end: string;
  type: "single" | "medication" | "exercise";
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  exerciseDays?: string[];
}

const Schedule = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventType, setEventType] = useState<
    "single" | "medication" | "exercise"
  >("single");
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start: "",
    end: "",
    type: "single",
    medicationName: "",
    dosage: "",
    frequency: "",
    exerciseDays: [],
  });

  useEffect(() => {
    const eventsRef = ref(database, "events/");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedEvents: Event[] = Object.values(data).map((event: any) => ({
          title: event.title || "Sin título",
          start: event.start || new Date().toISOString(),
          end: event.end || new Date().toISOString(),
          type: event.type || "single",
          medicationName: event.medicationName || "",
          dosage: event.dosage || "",
          frequency: event.frequency || "",
          exerciseDays: event.exerciseDays || [],
        }));
        setEvents(loadedEvents);
      }
    });
  }, []);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    let formattedEvents = [newEvent];
    if (newEvent.type === "medication" && newEvent.frequency) {
      formattedEvents = generateMedicationSchedule(newEvent);
    }

    formattedEvents.forEach((event) => {
      const eventRef = ref(database, `events/${event.start}`);
      set(eventRef, event).catch((error) => {
        console.error("Error al guardar el evento:", error);
      });
    });

    setEvents([...events, ...formattedEvents]);
    setNewEvent({
      title: "",
      start: "",
      end: "",
      type: "single",
      medicationName: "",
      dosage: "",
      frequency: "",
      exerciseDays: [],
    });
  };

  const generateMedicationSchedule = (event: Event) => {
    const medicationEvents = [];
    let currentDate = new Date(event.start);
    const endDate = new Date(
      event.end || currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    ); // 1 semana por defecto

    while (currentDate <= endDate) {
      medicationEvents.push({
        ...event,
        start: currentDate.toISOString(),
        end: new Date(currentDate.getTime() + 30 * 60 * 1000).toISOString(), // Duración de 30 minutos
      });

      currentDate = new Date(
        currentDate.getTime() +
          parseInt(event.frequency || "0") * 60 * 60 * 1000
      );
    }
    return medicationEvents;
  };

  return (
    <section className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 min-h-screen text-gray-900">
      {/* Título */}
      <div className="relative mb-10">
        <Image
          src="/schedule.svg"
          alt="Calendario"
          width={50}
          height={50}
          className="absolute left-[-20px] w-10"
        />
        <h1 className="text-3xl lg:text-5xl font-bold ml-14 capitalize text-green-700">
          Horarios y Calendario
        </h1>
      </div>

      {/* Formulario para añadir eventos */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mb-8">
        <div className="grid grid-cols-1 gap-4">
          <select
            value={eventType}
            onChange={(e) => {
              const value = e.target.value as
                | "single"
                | "medication"
                | "exercise";
              setEventType(value);
            }}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="single">Registrar Evento Único</option>
            <option value="medication">Registrar Medicación</option>
            <option value="exercise">Registrar Horarios de Ejercicio</option>
          </select>

          {eventType === "single" && (
            <>
              <input
                type="text"
                placeholder="Título del evento"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </>
          )}

          {eventType === "medication" && (
            <>
              <input
                type="text"
                placeholder="Nombre del medicamento"
                value={newEvent.medicationName}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, medicationName: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="text"
                placeholder="Dosis"
                value={newEvent.dosage}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, dosage: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="text"
                placeholder="Frecuencia (en horas)"
                value={newEvent.frequency}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, frequency: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="datetime-local"
                placeholder="Fecha de fin (opcional)"
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </>
          )}

          {eventType === "exercise" && (
            <>
              <input
                type="text"
                placeholder="Título del ejercicio"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="time"
                placeholder="Hora de inicio"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <input
                type="time"
                placeholder="Hora de fin"
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  "Lunes",
                  "Martes",
                  "Miércoles",
                  "Jueves",
                  "Viernes",
                  "Sábado",
                  "Domingo",
                ].map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      value={day}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setNewEvent((prevEvent) => ({
                          ...prevEvent,
                          exerciseDays: isChecked
                            ? [...(prevEvent.exerciseDays || []), day]
                            : (prevEvent.exerciseDays || []).filter(
                                (d) => d !== day
                              ),
                        }));
                      }}
                      className="mr-2"
                    />
                    {day}
                  </label>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleAddEvent}
            className="p-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600"
          >
            Añadir Evento
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Eventos Programados</h2>
        {events.map((event, index) => (
          <div key={index} className="p-4 border-b border-gray-200">
            <p className="font-bold">{event.title}</p>
            <p>
              {event.start
                ? new Date(event.start).toLocaleString()
                : "Fecha de inicio no válida"}{" "}
              -
              {event.end
                ? new Date(event.end).toLocaleString()
                : "Fecha de fin no válida"}
            </p>
            <p>
              Tipo de evento:{" "}
              {event.type === "single"
                ? "Único"
                : event.type === "medication"
                ? "Medicamento"
                : "Ejercicio"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Schedule;
