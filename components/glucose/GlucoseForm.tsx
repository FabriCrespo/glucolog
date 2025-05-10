import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlusCircle, Clock, Utensils, Coffee } from 'lucide-react';

interface GlucoseFormProps {
  glucoseLevel: number | "";
  setGlucoseLevel: (value: number | "") => void;
  ateSomething: boolean;
  setAteSomething: (value: boolean) => void;
  foodEaten: string;
  setFoodEaten: (value: string) => void;
  foodMeal: string;
  setFoodMeal: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  submitting: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDateRangeChange: (value: string) => Promise<void>;
}

const GlucoseForm = ({
  glucoseLevel,
  setGlucoseLevel,
  ateSomething,
  setAteSomething,
  foodEaten,
  setFoodEaten,
  foodMeal,
  setFoodMeal,
  dateRange,
  setDateRange,
  submitting,
  error,
  handleSubmit,
  handleDateRangeChange
}: GlucoseFormProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white lg:w-1/3 xl:w-1/3 xs:w-full h-auto border border-gray-200 rounded-xl p-6 flex-shrink-0 shadow-lg"
    >
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-3 rounded-full mr-3">
          <PlusCircle className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Registrar glucosa
        </h1>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <p className="text-gray-600 text-sm">
          Por favor, ingrese su nivel de glucosa en miligramos (mg).
        </p>
        
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de glucosa
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              value={glucoseLevel}
              onChange={(e) => {
                const value = e.target.value;
                // Permitir solo números positivos o campo vacío
                if (value === "" || /^\d+$/.test(value)) {
                  setGlucoseLevel(value === "" ? "" : Math.max(0, Number(value)));
                }
              }}
              min="0"
              required
              placeholder="Ingrese nivel de glucosa"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">mg/dl</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center bg-gray-50 p-3 rounded-lg border  border-gray-200">
          <input
            type="checkbox"
            id="ateSomething"
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            checked={ateSomething}
            onChange={(e) => {
              const checked = e.target.checked;
              setAteSomething(checked);
              if (!checked) {
                setFoodMeal("");
                setFoodEaten("");
              }
            }}
          />
          <label htmlFor="ateSomething" className="ml-2 text-white block text-sm font-medium text-gray-700">
            ¿Comió algo antes de la medición?
          </label>
        </div>

        {ateSomething && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de comida
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Utensils className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  value={foodMeal}
                  onChange={(e) => setFoodMeal(e.target.value)}
                  required={ateSomething}
                >
                  <option value="">Seleccione tipo de comida</option>
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alimento comido
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Coffee className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  value={foodEaten}
                  onChange={(e) => setFoodEaten(e.target.value)}
                  placeholder="¿Qué comió?"
                  required={ateSomething}
                />
              </div>
            </div>
          </motion.div>
        )}

        <button
          className="w-full h-10 font-semibold bg-green-700 rounded-lg text-white hover:bg-green-800 flex items-center justify-center"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            "Registrar"
          )}
        </button>

        <div className="mt-4">
          <select
            className="w-full h-10 border border-green-50 rounded-md text-center"
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
          >
            <option value="7 días">Últimos 7 días</option>
            <option value="1 mes">Último mes</option>
            <option value="3 meses">Últimos 3 meses</option>
            <option value="1 año">Último año</option>
          </select>
        </div>

        {error && (
          <p className={`text-center mt-2 ${
            error === "Registro guardado correctamente" ? "text-green-500" : "text-red-500"
          }`}>
            {error}
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default GlucoseForm;

