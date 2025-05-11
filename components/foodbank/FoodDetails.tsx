import React from 'react';
import { FoodItem, GlycemicLoadInfo } from '@/types/food';

interface FoodDetailsProps {
  selectedFood: FoodItem | null;
  portionSize: number;
  setPortionSize: (size: number) => void;
  glycemicLoad: GlycemicLoadInfo | null;
  calculateGlycemicLoad: () => void;
  isEmailVerified: boolean;
}

const FoodDetails = ({
  selectedFood,
  portionSize,
  setPortionSize,
  glycemicLoad,
  calculateGlycemicLoad,
  isEmailVerified
}: FoodDetailsProps) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200">
      {selectedFood ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-green-600 mb-6 border-b pb-2">{selectedFood.Nombre}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Información Básica
              </h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {[
                  { label: 'Calorías', value: selectedFood.Calorias.toFixed(1), unit: 'kcal' },
                  { label: 'Proteína', value: selectedFood.Proteina.toFixed(1), unit: 'g' },
                  { label: 'Grasa', value: selectedFood.Grasa.toFixed(1), unit: 'g' },
                  { label: 'Carbohidratos', value: selectedFood.Carbohidratos.toFixed(1), unit: 'g' },
                  { label: 'Fibra', value: selectedFood.Fibra.toFixed(1), unit: 'g' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-200 hover:bg-green-600 transition-colors">
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="font-semibold text-green-200">{item.value} <span className="text-white text-sm">{item.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Minerales y Vitaminas
              </h3>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {[
                  { label: 'Calcio', value: selectedFood.Calcio.toFixed(1), unit: 'mg' },
                  { label: 'Potasio', value: selectedFood.Potasio.toFixed(1), unit: 'mg' },
                  { label: 'Zinc', value: selectedFood.Zinc.toFixed(2), unit: 'mg' },
                  { label: 'Magnesio', value: selectedFood.Magnesio.toFixed(1), unit: 'mg' },
                  { label: 'Índice Glucémico', value: selectedFood.IndiceGlucemico?.toFixed(1) ?? 'No disponible', unit: '' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-200 hover:bg-green-600 transition-colors">
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="font-semibold text-green-200">{item.value} <span className="text-white text-sm">{item.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedFood.IndiceGlucemico && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Cálculo de Carga Glucémica
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="portionSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño de porción
                  </label>
                  <div className="relative">
                    <input
                      id="portionSize"
                      type="number"
                      value={portionSize}
                      onChange={(e) => setPortionSize(Math.max(0, Number(e.target.value)))}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none shadow-sm"
                      min="0"
                      disabled={!isEmailVerified}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">g</span>
                  </div>
                </div>
                
                <button
                  onClick={calculateGlycemicLoad}
                  className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                  disabled={!isEmailVerified || portionSize <= 0}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Calcular
                </button>
              </div>

              {!isEmailVerified && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p>Verifica tu correo electrónico para acceder a esta función</p>
                    </div>
                  </div>
                </div>
              )}

              {glycemicLoad && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        Carga Glucémica: <span className="text-green-600">{glycemicLoad.value.toFixed(1)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Clasificación: <span className={`font-medium
                          ${glycemicLoad.category === 'Baja' ? 'text-green-600' :
                            glycemicLoad.category === 'Media' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {glycemicLoad.category}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2
                        ${glycemicLoad.category === 'Baja' ? 'bg-green-500' :
                          glycemicLoad.category === 'Media' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                      <span className={`text-sm font-medium
                        ${glycemicLoad.category === 'Baja' ? 'text-green-600' :
                          glycemicLoad.category === 'Media' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {glycemicLoad.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500">
          <svg className="w-16 h-16 mb-4 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">Selecciona un alimento para ver sus detalles</p>
          <p className="text-sm text-gray-400 mt-2">Haz clic en cualquier alimento de la lista</p>
        </div>
      )}
    </div>
  );
};

export default FoodDetails;

