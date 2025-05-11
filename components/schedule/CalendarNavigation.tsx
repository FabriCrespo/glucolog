import React from 'react';
import { Dayjs } from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface CalendarNavigationProps {
  currentDate: Dayjs;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleToday: () => void;
}

const CalendarNavigation = ({ 
  currentDate, 
  handlePrevMonth, 
  handleNextMonth,
  handleToday
}: CalendarNavigationProps) => {
  const isCurrentMonth = currentDate.format("MM YYYY") === new Date().toLocaleDateString('es', { month: '2-digit', year: 'numeric' }).replace('/', ' ');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="bg-green-50 p-3 rounded-full">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.format("MMMM").charAt(0).toUpperCase() + currentDate.format("MMMM").slice(1)} <span className="text-green-50">{currentDate.format("YYYY")}</span>
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToday}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${isCurrentMonth ? 'bg-gray-200 text-gray-600' : 'bg-green-50 text-white hover:bg-green-600'}`}
          disabled={isCurrentMonth}
        >
          Hoy
        </motion.button>
        
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <motion.button
            whileHover={{ backgroundColor: '#e5e7eb' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-2 bg-white text-gray-700 hover:bg-gray-100 border-r border-gray-200 flex items-center justify-center w-10 h-10"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </motion.button>
          
          <motion.button
            whileHover={{ backgroundColor: '#e5e7eb' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-2 bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center w-10 h-10"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarNavigation;

