import React, { useState } from 'react';
import { MicronutrientStatus } from '@/types/food';

interface MicronutrientBalanceProps {
  micronutrientStatus: MicronutrientStatus | null;
}

const MicronutrientBalance = ({ micronutrientStatus }: MicronutrientBalanceProps) => {
  if (!micronutrientStatus) return null;
  
  const [activeTab, setActiveTab] = useState<'all' | 'optimal' | 'concern'>('all');

  // Mapeo de nutrientes a nombres más amigables y sus iconos
  const nutrientInfo = {
    magnesium: {
      name: 'Magnesio',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      ),
      unit: 'mg',
      description: 'Esencial para la función muscular y nerviosa'
    },
    zinc: {
      name: 'Zinc',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
        </svg>
      ),
      unit: 'mg',
      description: 'Importante para el sistema inmunológico y la cicatrización'
    },
    calcium: {
      name: 'Calcio',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      unit: 'mg',
      description: 'Fundamental para huesos y dientes fuertes'
    },
    potassium: {
      name: 'Potasio',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      unit: 'mg',
      description: 'Regula la presión arterial y la función muscular'
    }
  };

  // Función para obtener el color y mensaje según el estado
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'good':
        return { 
          color: 'bg-green-600', 
          textColor: 'text-green-600',
          message: 'Óptimo',
          description: 'Nivel adecuado para una buena salud',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          )
        };
      case 'low':
        return { 
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-500',
          message: 'Bajo',
          description: 'Podría ser insuficiente para necesidades diarias',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          )
        };
      case 'high':
        return { 
          color: 'bg-red-500', 
          textColor: 'text-red-500',
          message: 'Elevado',
          description: 'Podría exceder las necesidades diarias',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          )
        };
      default:
        return { 
          color: 'bg-gray-500', 
          textColor: 'text-gray-500',
          message: 'No determinado',
          description: 'No hay suficiente información',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
            </svg>
          )
        };
    }
  };

  // Calcular el porcentaje de nutrientes en estado óptimo
  const totalNutrients = Object.keys(micronutrientStatus).length;
  const optimalNutrients = Object.values(micronutrientStatus).filter(data => data.status === 'good').length;
  const lowNutrients = Object.values(micronutrientStatus).filter(data => data.status === 'low').length;
  const highNutrients = Object.values(micronutrientStatus).filter(data => data.status === 'high').length;
  const optimalPercentage = (optimalNutrients / totalNutrients) * 100;

  // Filtrar nutrientes según la pestaña activa
  const filteredNutrients = Object.entries(micronutrientStatus).filter(([_, data]) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'optimal') return data.status === 'good';
    if (activeTab === 'concern') return data.status === 'low' || data.status === 'high';
    return true;
  });

  // Función para generar recomendaciones basadas en el estado de los micronutrientes
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (lowNutrients > 0) {
      recommendations.push('Considera incluir más alimentos ricos en micronutrientes en tu dieta diaria.');
    }
    
    if (highNutrients > 0) {
      recommendations.push('Algunos micronutrientes están elevados. Consulta con un profesional de la salud.');
    }
    
    if (optimalPercentage < 50) {
      recommendations.push('Tu balance de micronutrientes podría mejorar significativamente.');
    } else if (optimalPercentage >= 80) {
      recommendations.push('¡Excelente balance de micronutrientes! Mantén tu dieta actual.');
    }
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Balance de Micronutrientes</h3>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full text-xs font-medium text-white bg-green-600">
              {optimalPercentage.toFixed(0)}% Óptimo
            </div>
            <button 
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Ver detalles"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Gráfico de resumen */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Distribución de Micronutrientes</span>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div 
              className="bg-green-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(optimalNutrients / totalNutrients) * 100}%` }}
            >
              {optimalNutrients}
            </div>
            <div 
              className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(lowNutrients / totalNutrients) * 100}%` }}
            >
              {lowNutrients}
            </div>
            <div 
              className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(highNutrients / totalNutrients) * 100}%` }}
            >
              {highNutrients}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
              <span className="text-gray-600">Óptimo</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-gray-600">Bajo</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
              <span className="text-gray-600">Elevado</span>
            </div>
          </div>
        </div>

        {/* Pestañas de filtrado */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            Todos ({totalNutrients})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'optimal' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('optimal')}
          >
            Óptimos ({optimalNutrients})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'concern' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('concern')}
          >
            Atención ({lowNutrients + highNutrients})
          </button>
        </div>

        {/* Lista de nutrientes */}
        <div className="space-y-4">
          {filteredNutrients.length > 0 ? (
            filteredNutrients.map(([nutrient, data]) => {
              const info = nutrientInfo[nutrient as keyof typeof nutrientInfo];
              const statusInfo = getStatusInfo(data.status);
              
              return (
                <div key={nutrient} className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${statusInfo.color}`}>
                      {info.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium text-gray-800">{info.name}</span>
                          <span className="text-gray-500 ml-2">{info.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{data.value.toFixed(1)} {info.unit}</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                            {statusInfo.message}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div
                          className={`${statusInfo.color} h-2 rounded-full transition-all duration-500 ease-in-out`}
                          style={{ 
                            width: data.status === 'low' 
                              ? '30%' 
                              : data.status === 'good' 
                                ? '70%' 
                                : '90%' 
                          }}
                        ></div>
                      </div>
                      
                      <p className="text-xs text-gray-500">{statusInfo.description}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500">No hay nutrientes disponibles en esta categoría.</div>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-700 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Equilibrio Nutricional</span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600"></span>
            <span className="text-sm text-white">{optimalNutrients} de {totalNutrients} óptimos</span>
          </div>
        </div>
        <div className="w-full bg-gray-500 bg-opacity-50 rounded-full h-1.5 mt-2">
          <div
            className="bg-white h-1.5 rounded-full"
            style={{ width: `${optimalPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MicronutrientBalance;

