import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faDumbbell, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Event } from '@/types/events';
import dayjs from 'dayjs';

interface EventsListProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: import('dayjs').Dayjs | null;
  selectedDayEvents: Event[];
  handleAddNewEvent: () => void;
  getEventStatusColor: (event: Event) => string;
  getEventStatusText: (event: Event) => string;
  setSelectedEvent: (event: Event) => void;
}

const EventsList: React.FC<EventsListProps> = ({
  isVisible,
  onClose,
  selectedDate,
  selectedDayEvents,
  handleAddNewEvent,
  getEventStatusColor,
  getEventStatusText,
  setSelectedEvent
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b border-green-50 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-90">
              Eventos del {selectedDate?.format("DD/MM/YYYY")}
            </h3>
            <p className="text-sm text-gray-30 mt-1">
              {selectedDayEvents.length} eventos encontrados
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-10 hover:bg-gray-20 p-2 rounded-full transition-colors duration-200"
            aria-label="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-50 w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddNewEvent}
          className="w-full mb-6 py-3.5 px-4 bg-green-50 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 font-semibold flex items-center justify-center gap-2 shadow-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Agregar Nuevo Evento
        </button>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-4">
            {selectedDayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  setSelectedEvent(event);
                  onClose();
                }}
                className={`p-5 rounded-xl border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md bg-white ${
                  event.type === "medication"
                    ? "border-l-green-50"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    event.type === "medication" ? "bg-green-50" : "bg-blue-500"
                  }`}>
                    <FontAwesomeIcon
                      icon={event.type === "medication" ? faPills : faDumbbell}
                      className="text-white text-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-90">{event.title}</h4>
                    <p className="text-sm text-gray-30">{event.time}</p>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${
                      getEventStatusColor(event).includes("green") 
                        ? "bg-green-50" 
                        : getEventStatusColor(event).includes("yellow") 
                          ? "bg-yellow-50" 
                          : "bg-gray-50"
                    }`}
                  >
                    {getEventStatusText(event)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-10 rounded-xl">
            <p className="text-gray-50 font-medium">No hay eventos para este día</p>
            <p className="text-sm text-gray-30 mt-1">Haz clic en "Agregar Nuevo Evento" para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;


