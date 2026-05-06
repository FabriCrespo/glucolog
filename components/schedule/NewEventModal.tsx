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
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-600";

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
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isMedication
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isMedication ? faPills : faDumbbell}
                    className="text-xl"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800/90">
                    Nuevo evento
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {isMedication ? "Medicación" : "Actividad física"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
                  className={`rounded-xl border-2 px-4 py-3.5 text-[15px] font-semibold transition-all ${
                    isMedication
                      ? "border-vitality-primary bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200/80"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
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
                  className={`rounded-xl border-2 px-4 py-3.5 text-[15px] font-semibold transition-all ${
                    !isMedication
                      ? "border-vitality-primary bg-sky-50 text-sky-900 shadow-sm ring-1 ring-sky-200/80"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <div className="space-y-4 rounded-2xl border border-emerald-100/90 bg-emerald-50/40 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tipo de medicamento
                      </label>
                      <select
                        className={fieldClass}
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
                      <label className="mb-2 block text-sm font-medium text-slate-700">
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
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Frecuencia
                    </label>
                    <select
                      className={fieldClass}
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
                    <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <div className="space-y-4 rounded-2xl border border-sky-100/90 bg-sky-50/40 p-4 sm:p-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tipo de actividad
                    </label>
                    <select
                      className={fieldClass}
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
                      <label className="mb-2 block text-sm font-medium text-slate-700">
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
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Intensidad
                      </label>
                      <select
                        className={fieldClass}
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="rounded-xl bg-vitality-primary px-8 py-3 text-[15px] font-semibold text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-vitality-primary-dark"
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
