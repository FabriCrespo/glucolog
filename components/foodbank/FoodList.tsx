import React, { useState } from 'react';
import { FoodItem } from '@/types/food';

interface FoodListProps {
  filteredFoodData: FoodItem[];
  selectedFood: FoodItem | null;
  handleFoodClick: (food: FoodItem) => void;
  isEmailVerified: boolean;
}

const FoodList = ({
  filteredFoodData,
  selectedFood,
  handleFoodClick,
  isEmailVerified
}: FoodListProps) => {
  const [sortBy, setSortBy] = useState<'nombre' | 'ig'>('nombre');
  
  // Agrupar alimentos por categoría
  const groupedByCategory = filteredFoodData.reduce((acc, food) => {
    const category = food.Categoria || 'Sin categoría';
    if (!acc[category]) acc[category] = [];
    acc[category].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  // Ordenar alimentos según criterio seleccionado
  const sortItems = (items: FoodItem[]) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'nombre') return a.Nombre.localeCompare(b.Nombre);
      if (sortBy === 'ig') {
        if (!a.IndiceGlucemico) return 1;
        if (!b.IndiceGlucemico) return -1;
        return a.IndiceGlucemico - b.IndiceGlucemico;
      }
      return 0;
    });
  };

  const getIGColor = (ig: number | undefined) => {
    if (!ig) return '';
    return ig < 55 ? 'bg-green-500' : ig <= 69 ? 'bg-yellow-500' : 'bg-red-500';
  };

  const getIGLabel = (ig: number | undefined) => {
    if (!ig) return '';
    return ig < 55 ? 'Bajo' : ig <= 69 ? 'Medio' : 'Alto';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Alimentos</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Total: {filteredFoodData.length}</span>
        </div>
      </div>
      <div className="h-[600px] overflow-y-auto p-4">
        {filteredFoodData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No se encontraron alimentos</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([category, foods]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {category} <span className="text-xs text-gray-400">({foods.length})</span>
                </h3>
                <ul className="space-y-2">
                  {sortItems(foods).map((food) => (
                    <li
                      key={food.Codigo}
                      onClick={() => handleFoodClick(food)}
                      className={`p-3 rounded-lg cursor-pointer transition-all
                        ${selectedFood?.Codigo === food.Codigo ? 'bg-green-600 text-white shadow-md' : 'hover:bg-green-50 hover:shadow'}
                        ${!isEmailVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ pointerEvents: isEmailVerified ? "auto" : "none" }}
                    >
                      <div className="flex items-center gap-3">
                        {food.IndiceGlucemico && (
                          <div className="flex flex-col items-center">
                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${getIGColor(food.IndiceGlucemico)}`} />
                            <span className={`text-xs mt-1 ${selectedFood?.Codigo === food.Codigo ? 'text-white' : 'text-gray-400'}`}>
                              {getIGLabel(food.IndiceGlucemico)}
                            </span>
                          </div>
                        )}
                        <span className="flex-1 font-medium">{food.Nombre}</span>
                        <div className="flex flex-col items-end">
                          {food.IndiceGlucemico && (
                            <span className={`text-sm ${selectedFood?.Codigo === food.Codigo ? 'text-white' : 'text-gray-500'}`}>
                              IG: {food.IndiceGlucemico}
                            </span>
                          )}
                          {food.Calorias && (
                            <span className={`text-xs ${selectedFood?.Codigo === food.Codigo ? 'text-white' : 'text-gray-400'}`}>
                              {food.Calorias} kcal
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodList;

