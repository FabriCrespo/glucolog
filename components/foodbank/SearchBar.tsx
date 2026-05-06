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
      className="mb-6 rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 shadow-sm"
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
              className={`h-12 w-full rounded-xl border-2 pl-12 pr-4 text-slate-900 transition-all duration-300 placeholder:text-slate-400
                ${isFocused ? "border-vitality-primary shadow-md shadow-emerald-900/5" : "border-slate-200"}
                focus:outline-none focus:ring-2 focus:ring-vitality-primary/25`}
              disabled={!isEmailVerified}
            />
            <motion.svg 
              className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-300 ${isFocused ? "text-vitality-primary" : "text-slate-400"}`} 
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
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
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
          className="flex items-center space-x-3 rounded-lg bg-emerald-50/40 p-3"
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
            <div className={`relative h-6 w-11 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vitality-primary/30 
              ${isEmailVerified ? "peer-checked:bg-vitality-primary peer-checked:after:translate-x-full peer-checked:after:border-white" : "opacity-60"} 
              after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-['']`}></div>
            <span className="ml-3 text-sm font-medium text-slate-700">Solo con índice glucémico</span>
          </label>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
