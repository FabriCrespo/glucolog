import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell, faTimes, faCheck, faClock, faCalendarAlt, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import dayjs from 'dayjs';
import { Event } from '@/types/events';
import { motion, AnimatePresence } from 'framer-motion';

interface EventDetailModalProps {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  actualDuration: number;
  setActualDuration: (duration: number) => void;
  handleCompleteEvent: (event: Event) => void;
  getEventStatusColor: (event: Event) => string;
  getEventStatusText: (event: Event) => string;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  setSelectedEvent,
  actualDuration,
  setActualDuration,
  handleCompleteEvent,
  getEventStatusColor,
  getEventStatusText
}) => {
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (selectedEvent) {
      setNotes(selectedEvent.notes || '');
      setActualDuration(selectedEvent.actualDuration || selectedEvent.plannedDuration || 0);
    }
  }, [selectedEvent, setActualDuration]);
  
  if (!selectedEvent) return null;
  
  const handleClose = () => {
    setSelectedEvent(null);
  };
  
  const handleComplete = () => {
    const updatedEvent = {
      ...selectedEvent,
      notes: notes,
      actualDuration: selectedEvent.type === "exercise" ? actualDuration : undefined
    };
    handleCompleteEvent(updatedEvent);
  };
  
  const getIconColor = () => {
    return selectedEvent.type === "medication" ? "text-green-500" : "text-blue-500";
  };
  
  const getBgColor = () => {
    return selectedEvent.type === "medication" ? "bg-green-50" : "bg-blue-50";
  };
  
  const getBorderColor = () => {
    return selectedEvent.type === "medication" ? "border-green-100" : "border-blue-100";
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${getBgColor()} p-6 relative`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`${getIconColor()} bg-white p-3 rounded-full shadow-md`}>
                  <FontAwesomeIcon
                    icon={selectedEvent.type === "medication" ? faPills : faDumbbell}
                    className="text-xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-black">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-2 shadow-md"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className={`mt-4 p-3 rounded-lg ${selectedEvent.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} flex items-center justify-between`}>
              <span className="font-medium flex items-center gap-2">
                {selectedEvent.completed && <FontAwesomeIcon icon={faCheck} />}
                {getEventStatusText(selectedEvent)}
              </span>
              {selectedEvent.completed && (
                <span className="text-sm font-medium flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  {dayjs(selectedEvent.completedAt!).format("DD/MM/YYYY HH:mm")}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Date and Time */}
            <div className="flex items-center gap-4 bg-gray-500 p-4 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white" />
                <div>
                  <p className="text-xs text-white uppercase tracking-wider">Fecha</p>
                  <p className="font-semibold text-green-100">
                    {dayjs(selectedEvent.date).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <FontAwesomeIcon icon={faClock} className="text-white" />
                <div>
                  <p className="text-xs text-white uppercase tracking-wider">Hora</p>
                  <p className="font-semibold text-green-100">{selectedEvent.time}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className={`p-4 rounded-xl ${getBgColor()} ${getBorderColor()} border space-y-4`}>
              {selectedEvent.type === "medication" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white uppercase tracking-wider">
                        Tipo de Medicamento
                      </p>
                      <p className="font-semibold text-green-200 capitalize">
                        {selectedEvent.medicationType || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white uppercase tracking-wider">Dosis</p>
                      <p className="font-semibold text-green-200">
                        {selectedEvent.dose || "No especificada"}
                      </p>
                    </div>
                  </div>
                  {selectedEvent.frequency && (
                    <div>
                      <p className="text-xs text-white uppercase tracking-wider">Frecuencia</p>
                      <p className="font-semibold text-green-200 capitalize">
                        {selectedEvent.frequency}
                      </p>
                    </div>
                  )}
                  {selectedEvent.instructions && (
                    <div>
                      <p className="text-xs text-white uppercase tracking-wider">Instrucciones</p>
                      <p className="font-semibold text-green-200">
                        {selectedEvent.instructions}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Tipo de Actividad
                      </p>
                      <p className="font-semibold text-gray-800 capitalize">
                        {selectedEvent.activityType || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Intensidad</p>
                      <p className="font-semibold text-gray-800 capitalize">
                        {selectedEvent.intensity || "No especificada"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Duración Planeada
                      </p>
                      <p className="font-semibold text-gray-800">
                        {selectedEvent.plannedDuration} minutos
                      </p>
                    </div>
                    {selectedEvent.completed && selectedEvent.actualDuration && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          Duración Real
                        </p>
                        <p className="font-semibold text-gray-800">
                          {selectedEvent.actualDuration} minutos
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faNoteSticky} className="text-gray-500" />
                Notas
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={3}
                placeholder="Añade notas sobre este evento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={selectedEvent.completed}
              />
            </div>

            {/* Complete Button */}
            {!selectedEvent.completed && (
              <div className="space-y-4">
                {selectedEvent.type === "exercise" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                      Duración Real (minutos)
                    </label>
                    <div className="flex items-center">
                      <button 
                        className="bg-gray-200 p-2 rounded-l-lg hover:bg-gray-300"
                        onClick={() => setActualDuration(Math.max(0, actualDuration - 5))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-full p-3 border-y border-gray-200 text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={actualDuration}
                        onChange={(e) => setActualDuration(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                      />
                      <button 
                        className="bg-gray-200 p-2 rounded-r-lg hover:bg-gray-300"
                        onClick={() => setActualDuration(actualDuration + 5)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Marcar como Completado
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventDetailModal;
