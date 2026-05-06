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
    if (!ig) return "";
    return ig < 55 ? "bg-emerald-500" : ig <= 69 ? "bg-amber-500" : "bg-red-500";
  };

  const getIGLabel = (ig: number | undefined) => {
    if (!ig) return '';
    return ig < 55 ? 'Bajo' : ig <= 69 ? 'Medio' : 'Alto';
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Alimentos</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Total: {filteredFoodData.length}
          </span>
        </div>
      </div>
      <div className="h-[600px] overflow-y-auto p-4">
        {filteredFoodData.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No se encontraron alimentos</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([category, foods]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {category}{" "}
                  <span className="font-normal text-slate-400">({foods.length})</span>
                </h3>
                <ul className="space-y-2">
                  {sortItems(foods).map((food) => (
                    <li
                      key={food.Codigo}
                      onClick={() => handleFoodClick(food)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all
                        ${
                          selectedFood?.Codigo === food.Codigo
                            ? "border-emerald-300/90 bg-emerald-50 shadow-sm ring-1 ring-emerald-200/80"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }
                        ${!isEmailVerified ? "cursor-not-allowed opacity-50" : ""}`}
                      style={{ pointerEvents: isEmailVerified ? "auto" : "none" }}
                    >
                      <div className="flex items-center gap-3">
                        {food.IndiceGlucemico && (
                          <div className="flex flex-col items-center">
                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${getIGColor(food.IndiceGlucemico)}`} />
                            <span
                              className={`mt-1 text-xs ${
                                selectedFood?.Codigo === food.Codigo
                                  ? "text-emerald-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {getIGLabel(food.IndiceGlucemico)}
                            </span>
                          </div>
                        )}
                        <span
                          className={`flex-1 font-medium ${
                            selectedFood?.Codigo === food.Codigo
                              ? "text-slate-900"
                              : "text-slate-800"
                          }`}
                        >
                          {food.Nombre}
                        </span>
                        <div className="flex flex-col items-end">
                          {food.IndiceGlucemico && (
                            <span
                              className={`text-sm ${
                                selectedFood?.Codigo === food.Codigo
                                  ? "text-slate-700"
                                  : "text-slate-500"
                              }`}
                            >
                              IG: {food.IndiceGlucemico}
                            </span>
                          )}
                          {food.Calorias && (
                            <span
                              className={`text-xs ${
                                selectedFood?.Codigo === food.Codigo
                                  ? "text-slate-500"
                                  : "text-slate-400"
                              }`}
                            >
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

