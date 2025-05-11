import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showWithGlycemicIndex: boolean;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmailVerified: boolean;
}

const SearchBar = ({
  searchTerm,
  handleSearch,
  showWithGlycemicIndex,
  handleCheckboxChange,
  isEmailVerified
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-100"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
            <motion.input
              type="text"
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full h-12 pl-12 pr-4 rounded-lg border-2 
                ${isFocused ? 'border-green-600 shadow-lg' : 'border-gray-200'} 
                focus:outline-none transition-all duration-300`}
              disabled={!isEmailVerified}
            />
            <motion.svg 
              className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-green-600' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: isFocused ? [0, -10, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </motion.svg>
            {searchTerm && (
              <button 
                onClick={() => handleSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {!isEmailVerified && (
            <p className="text-xs text-amber-600 mt-1 ml-1">
              Verifica tu email para buscar alimentos
            </p>
          )}
        </div>
        
        <motion.div 
          className="flex items-center space-x-3 bg-green-50 bg-opacity-10 p-3 rounded-lg"
          whileHover={{ scale: 1.03 }}
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showWithGlycemicIndex}
              onChange={handleCheckboxChange}
              className="sr-only peer"
              disabled={!isEmailVerified}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
              ${isEmailVerified ? 'peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-green-600' : 'opacity-60'} 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
              after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Solo con Índice Glucémico</span>
          </label>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
