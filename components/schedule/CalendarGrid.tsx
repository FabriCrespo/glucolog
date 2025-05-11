import React from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faDumbbell, faCircle } from '@fortawesome/free-solid-svg-icons';
import { Event } from '@/types/events';

interface CalendarGridProps {
  days: Dayjs[];
  currentDate: Dayjs;
  newEventDate: Dayjs | null;
  handleDateClick: (date: Dayjs) => void;
  getEventsForDay: (date: Dayjs) => Event[];
  handleEventClick: (event: Event, e: React.MouseEvent) => void;
}

const CalendarGrid = ({
  days,
  currentDate,
  newEventDate,
  handleDateClick,
  getEventsForDay,
  handleEventClick
}: CalendarGridProps) => {
  
  // Función para obtener el estado de los eventos del día
  const getDayStatus = (events: Event[]) => {
    if (events.length === 0) return null;
    
    const hasIncomplete = events.some(event => !event.completed);
    const allCompleted = events.length > 0 && events.every(event => event.completed);
    
    if (hasIncomplete) return "pending";
    if (allCompleted) return "completed";
    return null;
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-7 bg-green-50">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
          (day, index) => (
            <div key={index} className="text-lg font-semibold text-white py-3 text-center border-b border-green-100">
              {day}
            </div>
          )
        )}
      </div>
      
      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7">
        {days.map((dayItem, index) => {
          const isToday = dayItem.isSame(dayjs(), "day");
          const isPast = dayItem.isBefore(dayjs(), "day");
          const eventsForDay = getEventsForDay(dayItem);
          const dayStatus = getDayStatus(eventsForDay);
          const isCurrentMonth = dayItem.isSame(currentDate, "month");
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(dayItem)}
              className={`border-b border-r p-2 min-h-[120px] flex flex-col relative cursor-pointer transition-all duration-300 
                ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-white"}
                ${newEventDate && dayItem.isSame(newEventDate, "day") ? "ring-2 ring-green-500 ring-inset" : ""}
                ${isToday ? "bg-green-50" : ""}
                ${isPast && !isCurrentMonth ? "bg-gray-100" : ""}
                hover:bg-green-50 hover:shadow-inner`}
            >
              {/* Indicador de día actual */}
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold text-lg ${isToday ? "text-green-600 bg-green-100 w-7 h-7 rounded-full flex items-center justify-center" : ""}`}>
                  {dayItem.date()}
                </span>
                
                {/* Indicador de estado del día */}
                {dayStatus && (
                  <span className={`w-2 h-2 rounded-full ${dayStatus === "completed" ? "bg-green-500" : "bg-yellow-500"}`}></span>
                )}
              </div>
              
              {/* Lista de eventos */}
              <div className="mt-1 space-y-1 flex flex-col overflow-hidden">
                {eventsForDay.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleEventClick(event, e)}
                    className={`cursor-pointer flex items-center text-xs p-1 rounded-md transition-all
                      ${event.completed 
                        ? "bg-green-600 text-white" 
                        : isPast 
                          ? "bg-red-600 text-white" 
                          : "bg-blue-600 text-white"}`}
                  >
                    {event.type === "medication" ? (
                      <FontAwesomeIcon
                        icon={faPills}
                        className="text-white mr-1"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faDumbbell}
                        className="text-white mr-1"
                      />
                    )}
                    <span className="truncate">
                      {event.time} {event.title}
                    </span>
                  </div>
                ))}
                
                {/* Indicador de más eventos */}
                {eventsForDay.length > 3 && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <FontAwesomeIcon icon={faCircle} className="text-gray-400 text-[8px] mr-1" />
                    <span>{eventsForDay.length - 3} más</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;


