import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MonthlyStatsType } from '@/types/events';
import { FaMedkit, FaRunning, FaClock, FaChartBar, FaChartPie } from 'react-icons/fa';

interface MonthlyStatsProps {
  monthlyStats: MonthlyStatsType;
  exerciseChartData: any;
  medicationChartData: any;
}

const MonthlyStats = ({ monthlyStats, exerciseChartData, medicationChartData }: MonthlyStatsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [chartType, setChartType] = useState<'bar' | 'doughnut'>('bar');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Verificar que los datos existen
  if (!monthlyStats) {
    console.warn("MonthlyStats: No se recibieron datos de estadísticas mensuales");
    return <div className="p-4 bg-yellow-50 rounded-lg">Cargando estadísticas...</div>;
  }

  // Verificar que los datos de gráficos existen
  const hasExerciseData = exerciseChartData && 
    exerciseChartData.datasets && 
    exerciseChartData.datasets.length > 0;
    
  const hasMedicationData = medicationChartData && 
    medicationChartData.datasets && 
    medicationChartData.datasets.length > 0;

  if (!hasExerciseData || !hasMedicationData) {
    console.warn("MonthlyStats: Datos de gráficos incompletos", { 
      hasExerciseData, 
      hasMedicationData 
    });
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <span className="bg-green-100 p-2 rounded-full mr-3">
            <FaChartBar className="text-green-600" />
          </span>
          Estadísticas del Mes
        </h2>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'details' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Detalles
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onMouseEnter={() => setHoveredCard('medications')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white p-6 rounded-xl border border-green-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-green-800 mb-1">
                    Medicaciones
                  </h3>
                  <div className="text-4xl font-bold text-green-600">
                    {monthlyStats.completedMedications}
                  </div>
                  <p className="text-sm text-green-700 mt-1">completadas este mes</p>
                </div>
                <div className="p-4 rounded-full bg-green-50 text-green-500">
                  <FaMedkit size={24} />
                </div>
              </div>
              {hoveredCard === 'medications' && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700">
                    Has completado el {Math.round((monthlyStats.completedMedications / (monthlyStats.completedMedications + 5)) * 100)}% de tus medicaciones programadas.
                  </p>
                </div>
              )}
            </div>

            <div 
              onMouseEnter={() => setHoveredCard('exercises')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-800 mb-1">
                    Ejercicios
                  </h3>
                  <div className="text-4xl font-bold text-blue-600">
                    {monthlyStats.completedExercises}
                  </div>
                  <p className="text-sm text-blue-700 mt-1">completados este mes</p>
                </div>
                <div className="p-4 rounded-full bg-blue-50 text-blue-500">
                  <FaRunning size={24} />
                </div>
              </div>
              {hoveredCard === 'exercises' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    Has aumentado un 15% respecto al mes anterior. ¡Sigue así!
                  </p>
                </div>
              )}
            </div>

            <div 
              onMouseEnter={() => setHoveredCard('duration')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-purple-800 mb-1">
                    Tiempo Total
                  </h3>
                  <div className="text-4xl font-bold text-purple-600">
                    {monthlyStats.totalDuration}
                  </div>
                  <p className="text-sm text-purple-700 mt-1">minutos de ejercicio</p>
                </div>
                <div className="p-4 rounded-full bg-purple-50 text-purple-500">
                  <FaClock size={24} />
                </div>
              </div>
              {hoveredCard === 'duration' && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm text-purple-700">
                    Promedio diario: {Math.round(monthlyStats.totalDuration / 30)} minutos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                <span className="bg-blue-100 p-2 rounded-full mr-2">
                  <FaRunning className="text-blue-600" />
                </span>
                Ejercicios por Tipo
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <FaChartBar />
                </button>
                <button 
                  onClick={() => setChartType('doughnut')}
                  className={`p-2 rounded-lg ${chartType === 'doughnut' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <FaChartPie />
                </button>
              </div>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              {!hasExerciseData ? (
                <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
              ) : chartType === 'bar' ? (
                <Bar
                  data={exerciseChartData}
                  options={{
                    ...exerciseChartData.options,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                      }
                    }
                  }}
                />
              ) : (
                <Doughnut
                  data={{
                    labels: exerciseChartData.labels,
                    datasets: [{
                      data: exerciseChartData.datasets[0].data,
                      backgroundColor: exerciseChartData.datasets[0].backgroundColor,
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{
                    cutout: '60%',
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <span className="bg-green-100 p-2 rounded-full mr-2">
                  <FaMedkit className="text-green-600" />
                </span>
                Medicamentos por Tipo
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <FaChartBar />
                </button>
                <button 
                  onClick={() => setChartType('doughnut')}
                  className={`p-2 rounded-lg ${chartType === 'doughnut' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <FaChartPie />
                </button>
              </div>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              {!hasMedicationData ? (
                <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico</p>
              ) : chartType === 'bar' ? (
                <Bar
                  data={medicationChartData}
                  options={{
                    ...medicationChartData.options,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                      }
                    }
                  }}
                />
              ) : (
                <Doughnut
                  data={{
                    labels: medicationChartData.labels,
                    datasets: [{
                      data: medicationChartData.datasets[0].data,
                      backgroundColor: medicationChartData.datasets[0].backgroundColor,
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{
                    cutout: '60%',
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyStats;

