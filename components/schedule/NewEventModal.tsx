"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills,
  faDumbbell,
  faTimes,
  faClock,
  faCalendarAlt,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import type { NewEventFormState } from "@/types/schedule";
import {
  parseNewEventForm,
  type NewEventFormErrors,
} from "@/lib/validation/scheduleForms";
import ScheduleModalShell from "@/components/schedule/ScheduleModalShell";

const fieldClass =
  "dash-input disabled:cursor-not-allowed disabled:opacity-60";

const selectClass =
  "w-full border-0 border-b border-slate-200/90 bg-transparent py-3 text-sm font-light text-slate-800 transition-colors duration-200 focus:border-vitality-primary focus:outline-none focus:ring-0 hover:border-emerald-300/80 disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEventDate: dayjs.Dayjs | null;
  newEventData: NewEventFormState;
  setNewEventData: React.Dispatch<React.SetStateAction<NewEventFormState>>;
  onSave: () => void | Promise<void>;
}

const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  newEventDate,
  newEventData,
  setNewEventData,
  onSave,
}) => {
  const [errors, setErrors] = useState<NewEventFormErrors>({});

  useEffect(() => {
    if (isOpen) setErrors({});
  }, [isOpen]);

  const isMedication = newEventData.type === "medication";

  const handleSubmit = async () => {
    if (!newEventDate) {
      setErrors({ _form: "Falta la fecha del evento. Cierra y elige un día en el calendario." });
      return;
    }
    const parsed = parseNewEventForm(newEventData);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    await Promise.resolve(onSave());
  };

  const shellPadding = "p-6 sm:p-8";

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <ScheduleModalShell
          key="new-event"
          onClose={onClose}
          stackOrder={57}
        >
          <div className={shellPadding}>
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center border ${
                    isMedication
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-sky-200 bg-sky-50 text-sky-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isMedication ? faPills : faDumbbell}
                    className="text-lg"
                  />
                </div>
                <div>
                  <p className="dash-eyebrow">Nuevo evento</p>
                  <h3 className="dash-title mt-1 text-xl">
                    {isMedication ? "Medicación" : "Actividad física"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 transition-colors hover:text-vitality-primary"
                aria-label="Cerrar"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            {errors._form && (
              <div
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {errors._form}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={`dash-pill py-3.5 ${
                    isMedication ? "dash-pill-active" : "dash-pill-idle"
                  }`}
                  onClick={() =>
                    setNewEventData({ ...newEventData, type: "medication" })
                  }
                >
                  <span className="mr-2 inline-block align-middle">
                    <FontAwesomeIcon icon={faPills} />
                  </span>
                  Medicación
                </button>
                <button
                  type="button"
                  className={`dash-pill py-3.5 ${
                    !isMedication ? "dash-pill-active" : "dash-pill-idle"
                  }`}
                  onClick={() =>
                    setNewEventData({ ...newEventData, type: "exercise" })
                  }
                >
                  <span className="mr-2 inline-block align-middle">
                    <FontAwesomeIcon icon={faDumbbell} />
                  </span>
                  Actividad física
                </button>
              </div>

              <div>
                <label className="dash-input-label mb-2 block">
                  Título
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      isMedication ? "Ej. Insulina rápida" : "Ej. Caminata"
                    }
                    className={`${fieldClass} pl-11`}
                    value={newEventData.title}
                    onChange={(e) => {
                      setNewEventData({ ...newEventData, title: e.target.value });
                      if (errors.title) setErrors((x) => ({ ...x, title: undefined }));
                    }}
                  />
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <FontAwesomeIcon icon={isMedication ? faPills : faDumbbell} />
                  </div>
                </div>
                <FieldError message={errors.title} />
              </div>

              {isMedication ? (
                <div className="space-y-4 border border-slate-200 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="dash-input-label mb-2 block">
                        Tipo de medicamento
                      </label>
                      <select
                        className={selectClass}
                        value={newEventData.medicationType}
                        onChange={(e) => {
                          setNewEventData({
                            ...newEventData,
                            medicationType: e.target.value,
                          });
                          if (errors.medicationType)
                            setErrors((x) => ({ ...x, medicationType: undefined }));
                        }}
                      >
                        <option value="">Seleccionar…</option>
                        <option value="insulina">Insulina</option>
                        <option value="pastilla">Pastilla</option>
                        <option value="jarabe">Jarabe</option>
                        <option value="inyeccion">Inyección</option>
                        <option value="otro">Otro</option>
                      </select>
                      <FieldError message={errors.medicationType} />
                    </div>
                    <div>
                      <label className="dash-input-label mb-2 block">
                        Dosis
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 10 UI"
                        className={fieldClass}
                        value={newEventData.dose}
                        onChange={(e) => {
                          setNewEventData({ ...newEventData, dose: e.target.value });
                          if (errors.dose) setErrors((x) => ({ ...x, dose: undefined }));
                        }}
                      />
                      <FieldError message={errors.dose} />
                    </div>
                  </div>

                  <div>
                    <label className="dash-input-label mb-2 block">
                      Frecuencia
                    </label>
                    <select
                      className={selectClass}
                      value={newEventData.frequency}
                      onChange={(e) => {
                        setNewEventData({
                          ...newEventData,
                          frequency: e.target.value,
                        });
                        if (errors.frequency)
                          setErrors((x) => ({ ...x, frequency: undefined }));
                      }}
                    >
                      <option value="">Seleccionar…</option>
                      <option value="unica">Dosis única</option>
                      <option value="diaria">Diaria</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                    <FieldError message={errors.frequency} />
                  </div>

                  <div>
                    <label className="dash-input-label mb-2 block">
                      Instrucciones
                    </label>
                    <textarea
                      placeholder="Ej. Con las comidas"
                      rows={3}
                      className={`${fieldClass} min-h-[88px] resize-y`}
                      value={newEventData.instructions}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          instructions: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border border-slate-200 p-4 sm:p-5">
                  <div>
                    <label className="dash-input-label mb-2 block">
                      Tipo de actividad
                    </label>
                    <select
                      className={selectClass}
                      value={newEventData.activityType}
                      onChange={(e) => {
                        setNewEventData({
                          ...newEventData,
                          activityType: e.target.value,
                        });
                        if (errors.activityType)
                          setErrors((x) => ({ ...x, activityType: undefined }));
                      }}
                    >
                      <option value="">Seleccionar…</option>
                      <option value="caminar">Caminar</option>
                      <option value="correr">Correr</option>
                      <option value="nadar">Nadar</option>
                      <option value="ciclismo">Ciclismo</option>
                      <option value="yoga">Yoga</option>
                      <option value="gimnasio">Gimnasio</option>
                      <option value="otro">Otro</option>
                    </select>
                    <FieldError message={errors.activityType} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="dash-input-label mb-2 block">
                        Duración (min)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={480}
                        step={5}
                        className={fieldClass}
                        value={newEventData.plannedDuration}
                        onChange={(e) =>
                          setNewEventData({
                            ...newEventData,
                            plannedDuration: parseInt(e.target.value, 10) || 30,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="dash-input-label mb-2 block">
                        Intensidad
                      </label>
                      <select
                        className={selectClass}
                        value={newEventData.intensity}
                        onChange={(e) =>
                          setNewEventData({
                            ...newEventData,
                            intensity: e.target.value as NewEventFormState["intensity"],
                          })
                        }
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="dash-input-label mb-2 block">
                    Fecha
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      readOnly
                      disabled
                      className={`${fieldClass} cursor-not-allowed pl-11`}
                      value={
                        newEventDate ? newEventDate.format("YYYY-MM-DD") : ""
                      }
                    />
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="dash-input-label mb-2 block">
                    Hora
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      className={`${fieldClass} pl-11`}
                      value={newEventData.time}
                      onChange={(e) => {
                        setNewEventData({ ...newEventData, time: e.target.value });
                        if (errors.time) setErrors((x) => ({ ...x, time: undefined }));
                      }}
                    />
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <FontAwesomeIcon icon={faClock} />
                    </div>
                  </div>
                  <FieldError message={errors.time} />
                </div>
              </div>

              <div>
                <label className="dash-input-label mb-2 block">
                  Notas adicionales
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Opcional"
                    rows={3}
                    className={`${fieldClass} min-h-[88px] resize-y pl-11`}
                    value={newEventData.notes}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, notes: e.target.value })
                    }
                  />
                  <div className="pointer-events-none absolute left-3.5 top-4 text-slate-400">
                    <FontAwesomeIcon icon={faNoteSticky} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="dash-btn-outline px-6 py-3 text-sm font-light"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="dash-btn-outline-active px-8 py-3 text-sm font-light"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </ScheduleModalShell>
      )}
    </AnimatePresence>
  );
};

export default NewEventModal;
