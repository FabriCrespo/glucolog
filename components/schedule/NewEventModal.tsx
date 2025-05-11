import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell, faTimes, faClock, faCalendarAlt, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { Event } from '@/types/events';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEventDate: dayjs.Dayjs | null;
  newEventData: {
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
  };
  setNewEventData: React.Dispatch<React.SetStateAction<{
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
  }>>;
  onSave: () => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  newEventDate,
  newEventData,
  setNewEventData,
  onSave
}) => {
  if (!isOpen) return null;

  const isMedication = newEventData.type === "medication";

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ease-out animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-[650px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-zoomIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {isMedication ? (
              <>
                <div className="bg-green-200 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faPills}
                    className="text-green-50 text-xl"
                  />
                </div>
                <span className="bg-green-200 text-green-50 px-2 py-1 rounded">
                  Nueva Medicación
                </span>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faDumbbell}
                    className="text-blue-500 text-xl"
                  />
                </div>
                <span className="bg-blue-50 text-blue-500 px-2 py-1 rounded">
                  Nueva Actividad Física
                </span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>
        {/* Contenido */}
        <div className="space-y-6">
          {/* Selector de tipo de evento */}
          <div className="flex gap-4 mb-8">
            <button
              className={`flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                isMedication
                  ? "bg-green-500 text-white shadow-lg shadow-green-200 scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() =>
                setNewEventData({ ...newEventData, type: "medication" })
              }
            >
              <FontAwesomeIcon icon={faPills} className="text-xl" />
              <span className="font-medium">Medicación</span>
            </button>
            <button
              className={`flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                !isMedication
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() =>
                setNewEventData({ ...newEventData, type: "exercise" })
              }
            >
              <FontAwesomeIcon icon={faDumbbell} className="text-xl" />
              <span className="font-medium">Actividad Física</span>
            </button>
          </div>

          {/* Título común */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
              Título del {isMedication ? "Medicamento" : "Ejercicio"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={isMedication ? "ej. Insulina" : "ej. Caminata"}
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={newEventData.title}
                onChange={(e) =>
                  setNewEventData({
                    ...newEventData,
                    title: e.target.value,
                  })
                }
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={isMedication ? faPills : faDumbbell} />
              </div>
            </div>
          </div>

          {/* Campos específicos para medicación */}
          {isMedication ? (
            <div className="space-y-6 bg-green-50/30 p-6 rounded-xl border border-green-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                    Tipo de Medicamento
                  </label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 appearance-none"
                    value={newEventData.medicationType}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        medicationType: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="insulina">Insulina</option>
                    <option value="pastilla">Pastilla</option>
                    <option value="jarabe">Jarabe</option>
                    <option value="inyeccion">Inyección</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                    Dosis
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 10mg"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    value={newEventData.dose}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        dose: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                  Frecuencia
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 appearance-none"
                  value={newEventData.frequency}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      frequency: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar frecuencia</option>
                  <option value="unica">Dosis única</option>
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                  Instrucciones
                </label>
                <textarea
                  placeholder="ej. Tomar después de comer"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-h-[100px]"
                  value={newEventData.instructions}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      instructions: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="space-y-6 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-500 transition-colors">
                  Tipo de Actividad
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 appearance-none"
                  value={newEventData.activityType}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      activityType: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="caminar">Caminar</option>
                  <option value="correr">Correr</option>
                  <option value="nadar">Nadar</option>
                  <option value="ciclismo">Ciclismo</option>
                  <option value="yoga">Yoga</option>
                  <option value="gimnasio">Gimnasio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-500 transition-colors">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    step="5"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={newEventData.plannedDuration}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        plannedDuration: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-500 transition-colors">
                    Intensidad
                  </label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 appearance-none"
                    value={newEventData.intensity}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        intensity: e.target.value as any,
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

          {/* Campos comunes */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                Fecha
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 text-white"
                  value={
                    newEventDate ? newEventDate.format("YYYY-MM-DD") : ""
                  }
                  onChange={(e) =>
                    console.log("Fecha seleccionada:", e.target.value)
                  }
                  disabled
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
                Hora
              </label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  value={newEventData.time}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      time: e.target.value,
                    })
                  }
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FontAwesomeIcon icon={faClock} />
                </div>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-500 transition-colors">
              Notas adicionales
            </label>
            <div className="relative">
              <textarea
                placeholder="Cualquier información adicional..."
                className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-h-[100px]"
                value={newEventData.notes}
                onChange={(e) =>
                  setNewEventData({
                    ...newEventData,
                    notes: e.target.value,
                  })
                }
              ></textarea>
              <div className="absolute left-4 top-6 text-gray-400">
                <FontAwesomeIcon icon={faNoteSticky} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 mr-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className={`px-8 py-3 ${
                isMedication 
                  ? "bg-green-500" 
                  : "bg-blue-500"
              } text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium`}
            >
              Guardar Evento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEventModal;

