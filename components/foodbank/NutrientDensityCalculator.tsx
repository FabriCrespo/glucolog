import React from 'react';
import { NutrientDensity } from '@/types/food';

interface NutrientDensityCalculatorProps {
  nutrientDensity: NutrientDensity | null;
}

const NutrientDensityCalculator = ({ nutrientDensity }: NutrientDensityCalculatorProps) => {
  if (!nutrientDensity) return null;

  const densityItems = [
    { 
      label: 'Densidad Proteica', 
      value: nutrientDensity.proteinDensity,
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      )
    },
    { 
      label: 'Densidad de Fibra', 
      value: nutrientDensity.fiberDensity,
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
        </svg>
      )
    },
    { 
      label: 'Densidad Mineral', 
      value: nutrientDensity.mineralDensity,
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    { 
      label: 'Densidad Vitamínica', 
      value: nutrientDensity.vitaminDensity,
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    }
  ];

  // Función para determinar el nivel de densidad nutricional
  const getDensityLevel = (value: number) => {
    if (value >= 80) return { label: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-600' };
    if (value >= 60) return { label: 'Bueno', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (value >= 40) return { label: 'Moderado', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { label: 'Bajo', color: 'text-gray-500', bgColor: 'bg-gray-500' };
  };

  // Calcular el promedio de densidad nutricional
  const averageDensity = densityItems.reduce((sum, item) => sum + item.value, 0) / densityItems.length;
  const densityLevel = getDensityLevel(averageDensity);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Densidad Nutricional</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${densityLevel.bgColor}`}>
            {densityLevel.label}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 bg-green-600 p-4 rounded-lg">
          <div>
            <p className="text-sm text-white mb-1">Calorías por 100g</p>
            <p className="text-2xl font-bold text-white">
              {nutrientDensity.caloriesPer100g.toFixed(1)} <span className="text-sm font-normal">kcal</span>
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>

        <div className="space-y-5">
          {densityItems.map((item) => {
            const level = getDensityLevel(item.value);
            return (
              <div key={item.label} className="bg-white p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-md bg-green-600">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className={`text-sm font-medium ${level.color}`}>{item.value.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">{level.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-700 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Densidad Nutricional Promedio</span>
          <span className="text-sm font-bold text-white">{averageDensity.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-500 bg-opacity-50 rounded-full h-1.5 mt-2">
          <div
            className="bg-white h-1.5 rounded-full"
            style={{ width: `${Math.min(averageDensity, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default NutrientDensityCalculator;

