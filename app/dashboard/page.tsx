"use client";
import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import {
  Line,
  Bar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GlucoseRecord {
  glucoseLevel: number;
  date: string;
  time: string;
  timeStamp: Timestamp;
  ateSomething: boolean;
  foodMeal?: string;
  foodEaten?: string;
}

// Función de Registro
async function registerGlucose(
  userID: string,
  glucoseLevel: number,
  ateSomething: boolean,
  foodEaten?: string,
  foodMeal?: string
) {
  try {
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // Hora en formato HH:MM:SS

    await addDoc(collection(db, "glucoseRecords", userID, "records"), {
      glucoseLevel: glucoseLevel,
      date: date,
      time: time,
      timeStamp: Timestamp.now(),
      ateSomething: ateSomething,
      foodMeal: foodMeal,
      foodEaten: foodEaten || "", // Solo se almacena si hay valor
    });
  } catch (e) {
    console.error("Error al añadir el registro: ", e);
  }
}

// Obtener los datos de glucosa de los últimos 7 días
async function fetchGlucoseRecords(
  userID: string,
  range: string = "7 días"
): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const today = new Date();
    let dateRange: Date;

    switch (range) {
      case "7 días":
        dateRange = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1 mes":
        dateRange = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3 meses":
        dateRange = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1 año":
        dateRange = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startTimestamp = Timestamp.fromDate(dateRange);
    const endTimestamp = Timestamp.fromDate(today);

    // Optimizar la consulta para filtrar por fecha en Firestore
    const q = query(
      recordsRef,
      where("timeStamp", ">=", startTimestamp),
      where("timeStamp", "<=", endTimestamp),
      orderBy("timeStamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as GlucoseRecord);
  } catch (error) {
    console.error("Error fetching glucose records:", error);
    throw error;
  }
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700"></div>
  </div>
);

const Dashboard = () => {
  const [glucoseLevel, setGlucoseLevel] = useState<number | "">("");
  const [ateSomething, setAteSomething] = useState<boolean>(false);
  const [foodEaten, setFoodEaten] = useState<string>("");
  const [foodMeal, setFoodMeal] = useState<string>("");
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7 días");
  const [showLineChart, setShowLineChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showPieChart, setShowPieChart] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number>(0);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  const getPrediction = async (glucoseRecord: any) => {
    try {
      const date = new Date(glucoseRecord.date.split('/').reverse().join('-'));
      const hour = parseInt(glucoseRecord.time.split(':')[0]);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hour: hour,
          day_of_week: date.getDay(),
          meal_type: glucoseRecord.foodMeal || 'none',
          last_glucose: glucoseRecord.glucoseLevel
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener predicción');
      }

      const data = await response.json();
      setPrediction(Math.round(data.predicted_glucose));
      setPredictionConfidence(data.confidence);
    } catch (error) {
      console.error('Error al predecir:', error);
      setPrediction(null);
      setPredictionConfidence(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!userID) throw new Error("Usuario no autenticado");
      if (glucoseLevel === "") throw new Error("Nivel de glucosa requerido");
      if (ateSomething && !foodEaten) throw new Error("Ingrese lo que comió");

      const newRecord = {
        glucoseLevel: Number(glucoseLevel),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
        timeStamp: Timestamp.now(),
        ateSomething: ateSomething,
        foodMeal: foodMeal,
        foodEaten: ateSomething ? foodEaten : undefined,
      };

      await addDoc(collection(db, "glucoseRecords", userID, "records"), newRecord);

      await getPrediction(newRecord);

      setGlucoseLevel("");
      setAteSomething(false);
      setFoodEaten("");
      setFoodMeal("");

      const data = await fetchGlucoseRecords(userID, dateRange);
      setRecords(data);

      // Calcular predicción basada en los últimos registros
      if (data.length > 0) {
        const recentLevels = data.slice(0, 7).map((r) => r.glucoseLevel);
        const avgLevel = recentLevels.reduce((a, b) => a + b, 0) / recentLevels.length;
        setPrediction(Math.round(avgLevel));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar glucosa");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null);
      try {
        if (user) {
          setUserID(user.uid);
          const data = await fetchGlucoseRecords(user.uid, dateRange);
          setRecords(data);
        } else {
          window.location.href = "/login";
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar registros");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dateRange]);

  const chartData = useMemo(() => {
    // Ordenar registros por fecha
    const sortedRecords = [...records].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    // 1. Timeline chart - Shows glucose levels by meal type over dates
    const timelineData = {
      labels: sortedRecords.map(record => record.date),
      datasets: [
        {
          label: 'Desayuno',
          data: sortedRecords.map(record => 
            record.foodMeal === 'desayuno' ? record.glucoseLevel : null
          ),
          borderColor: 'rgba(147, 51, 234, 1)', // purple
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: true
        },
        {
          label: 'Almuerzo',
          data: sortedRecords.map(record => 
            record.foodMeal === 'almuerzo' ? record.glucoseLevel : null
          ),
          borderColor: 'rgba(59, 130, 246, 1)', // blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: true
        },
        {
          label: 'Cena',
          data: sortedRecords.map(record => 
            record.foodMeal === 'cena' ? record.glucoseLevel : null
          ),
          borderColor: 'rgba(236, 72, 153, 1)', // pink
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: true
        },
        {
          label: 'Otro',
          data: sortedRecords.map(record => 
            record.foodMeal === 'Otro' ? record.glucoseLevel : null
          ),
          borderColor: 'rgba(245, 158, 11, 1)', // amber
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: true
        },
        {
          label: 'Sin Comida',
          data: sortedRecords.map(record => 
            !record.ateSomething ? record.glucoseLevel : null
          ),
          borderColor: 'rgba(75, 85, 99, 1)', // gray
          backgroundColor: 'rgba(75, 85, 99, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: true,
          borderDash: [5, 5]
        }
      ]
    };

    // 2. Meal Impact Chart - Shows average glucose change after different meals
    const mealTypes = ['desayuno', 'almuerzo', 'cena', 'Otro'];
    const mealImpact = mealTypes.map(meal => {
      const mealRecords = records.filter(r => r.foodMeal === meal);
      if (mealRecords.length === 0) return { avg: 0, min: 0, max: 0 };
      
      const levels = mealRecords.map(r => r.glucoseLevel);
      return {
        avg: levels.reduce((a, b) => a + b, 0) / levels.length,
        min: Math.min(...levels),
        max: Math.max(...levels)
      };
    });

    const mealImpactData = {
      labels: ['Desayuno', 'Almuerzo', 'Cena', 'Otros'],
      datasets: [
        {
          label: 'Rango de Glucosa',
          data: mealImpact.map(m => m.avg),
          backgroundColor: [
            'rgba(147, 51, 234, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(245, 158, 11, 0.7)'
          ],
          borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };

    // 3. Daily Pattern - Shows glucose patterns by time of day
    const timeGroups = {
      mañana: records.filter(r => {
        const hour = parseInt(r.time.split(':')[0]);
        return hour >= 6 && hour < 12;
      }),
      tarde: records.filter(r => {
        const hour = parseInt(r.time.split(':')[0]);
        return hour >= 12 && hour < 18;
      }),
      noche: records.filter(r => {
        const hour = parseInt(r.time.split(':')[0]);
        return hour >= 18 || hour < 6;
      })
    };

    const patternData = {
      labels: ['Mañana (6-12h)', 'Tarde (12-18h)', 'Noche (18-6h)'],
      datasets: [
        {
          label: 'Con Comida',
          data: Object.values(timeGroups).map(group => {
            const withFood = group.filter(r => r.ateSomething);
            return withFood.length > 0 
              ? withFood.reduce((sum, r) => sum + r.glucoseLevel, 0) / withFood.length 
              : 0;
          }),
          backgroundColor: 'rgba(52, 211, 153, 0.7)',
          borderColor: 'rgba(52, 211, 153, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Sin Comida',
          data: Object.values(timeGroups).map(group => {
            const withoutFood = group.filter(r => !r.ateSomething);
            return withoutFood.length > 0 
              ? withoutFood.reduce((sum, r) => sum + r.glucoseLevel, 0) / withoutFood.length 
              : 0;
          }),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };

    return { timelineData, mealImpactData, patternData };
  }, [records]);

  const chartOptions = {
    timeline: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const dataIndex = context.dataIndex;
              const record = records[dataIndex];
              return [
                `${context.dataset.label}: ${context.parsed.y} mg/dl`,
                `Hora: ${record.time}`,
                record.ateSomething ? `Comida: ${record.foodMeal || 'No especificada'}` : 'En ayunas'
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          title: {
            display: true,
            text: 'Nivel de Glucosa (mg/dl)'
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Fecha'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    },
    mealImpact: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `Promedio: ${context.parsed.y.toFixed(1)} mg/dl`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          title: {
            display: true,
            text: 'Nivel de Glucosa (mg/dl)'
          }
        }
      }
    },
    pattern: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => `Promedio: ${context.parsed.y.toFixed(1)} mg/dl`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          title: {
            display: true,
            text: 'Nivel de Glucosa (mg/dl)'
          }
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="max-container padding-container flex flex-col md:gap-28 lg:py-5 xl:flex-row">
      <div className="bg-green-200 w-full h-full border rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="bg-white lg:w-1/3 xl:w-1/3 xs:w-full h-auto border rounded-lg p-4 flex-shrink-0">
            <div className="relative">
              <Image
                src="/registro.svg"
                alt="camp"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-20px] w-5 lg:w-[50px] xs:w-12"
              />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
                Registrar glucosa
              </h1>
            </div>

            <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
              <p className="italic">
                Por favor, ingrese su nivel de glucosa en miligramos (mg).
              </p>
              <div>
                <input
                  type="number"
                  className="w-full h-10 border border-green-50 rounded-md text-center"
                  value={glucoseLevel}
                  onChange={(e) =>
                    setGlucoseLevel(Math.max(0, Number(e.target.value)))
                  }
                  min="0"
                  required
                />
                <label className="ml-2 font-bold">mg/dl</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={ateSomething}
                  onChange={() => setAteSomething(!ateSomething)}
                />
                <label>¿Comió algo antes de la medición?</label>
              </div>

              {ateSomething && (
                <div>
                  <select
                    className="w-full h-10 border border-green-50 rounded-md text-center"
                    value={foodMeal}
                    onChange={(e) => setFoodMeal(e.target.value)}
                  >
                    <option value="" disabled>
                      Seleccione una opción
                    </option>
                    <option value="desayuno">Desayuno</option>
                    <option value="almuerzo">Almuerzo</option>
                    <option value="cena">Cena</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              )}
              {ateSomething && (
                <div>
                  <input
                    type="text"
                    className="w-full h-10 border border-green-50 rounded-md text-center"
                    value={foodEaten}
                    onChange={(e) => setFoodEaten(e.target.value)}
                    placeholder="Ingrese lo que comió"
                  />
                </div>
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
              <div>
                <div>
                  <select
                    value={dateRange}
                    onChange={async (e) => {
                      setDateRange(e.target.value);
                      if (userID) {
                        setFetchingRecords(true);
                        try {
                          const data = await fetchGlucoseRecords(
                            userID,
                            e.target.value
                          );
                          setRecords(data);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Error al cargar registros");
                        } finally {
                          setFetchingRecords(false);
                        }
                      }
                    }}
                  >
                    <option value="7 días">Últimos 7 días</option>
                    <option value="1 mes">Último mes</option>
                    <option value="3 meses">Últimos 3 meses</option>
                    <option value="1 año">Último año</option>
                  </select>
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-center mt-2">{error}</p>
              )}
            </form>
          </div>

          <div className="bg-white w-full md:w-[63%] flex-1 border rounded-2xl shadow-lg p-4 overflow-y-auto">
            <h1 className="bold-20 lg:bold-32 mt-5 ml-5 capitalize">
              Historial de Registros
            </h1>
            <div className="bg-green-200 w-full h-80 mt-2 rounded-lg shadow-lg overflow-y-auto relative">
              {fetchingRecords ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700"></div>
                </div>
              ) : (
                <table className="w-full table-fixed border border-green-600">
                  <thead className="bg-green-600 text-white uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 border-b border-green-600">
                        Fecha
                      </th>
                      <th className="px-4 py-2 border-b border-green-600">
                        Comió Algo
                      </th>
                      <th className="px-4 py-2 border-b border-green-600">
                        Comida
                      </th>
                      <th className="px-4 py-2 border-b border-green-600">
                        Qué Comió
                      </th>
                      <th className="px-4 py-2 border-b border-green-600">
                        Nivel de Glucosa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr
                        key={index}
                        className="bg-white even:bg-green-100 hover:bg-green-200"
                      >
                        <td className="px-4 py-2 border-b border-green-600">
                          {record.date}
                        </td>
                        <td className="px-4 py-2 border-b border-green-600">
                          {record.ateSomething ? "Sí" : "No"}
                        </td>
                        <td className="px-4 py-2 border-b border-green-600">
                          {record.foodMeal || "N/A"}
                        </td>
                        <td className="px-4 py-2 border-b border-green-600">
                          {record.foodEaten || "N/A"}
                        </td>
                        <td className="px-4 py-2 border-b border-green-600">
                          {record.glucoseLevel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white w-full flex-1 mt-8 border rounded-2xl shadow-lg p-6 overflow-auto">
          <div className="relative mb-8">
            <Image
              src="/predictions.svg"
              alt="search"
              width={50}
              height={50}
              className="absolute left-[-5px] top-[-20px] w-5 lg:w-[50px] xs:w-12"
            />
            <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
              Análisis de Glucosa
            </h1>
          </div>

          {fetchingRecords ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No hay registros suficientes para mostrar análisis.</p>
              <p className="mt-2">Comienza a registrar tus niveles de glucosa para ver estadísticas detalladas.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Línea de Tiempo */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Niveles de Glucosa por Tipo de Comida
                </h2>
                <div className="h-[400px]">
                  <Line data={chartData.timelineData} options={chartOptions.timeline} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Impacto por Comida */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Impacto por Tipo de Comida
                  </h2>
                  <div className="h-[300px]">
                    <Bar data={chartData.mealImpactData} options={chartOptions.mealImpact} />
                  </div>
                </div>

                {/* Patrones Diarios */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Patrones Durante el Día
                  </h2>
                  <div className="h-[300px]">
                    <Bar data={chartData.patternData} options={chartOptions.pattern} />
                  </div>
                </div>
              </div>

              {/* Insights Section */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Insights Importantes
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Mejor Momento</h3>
                    <p className="text-purple-600 mt-2">
                      Tus niveles de glucosa son más estables durante la 
                      {records.length > 0 ? 
                        (() => {
                          const timeGroups = {
                            mañana: records.filter(r => {
                              const hour = parseInt(r.time.split(':')[0]);
                              return hour >= 6 && hour < 12;
                            }),
                            tarde: records.filter(r => {
                              const hour = parseInt(r.time.split(':')[0]);
                              return hour >= 12 && hour < 18;
                            }),
                            noche: records.filter(r => {
                              const hour = parseInt(r.time.split(':')[0]);
                              return hour >= 18 || hour < 6;
                            })
                          };
                          
                          const variations = Object.entries(timeGroups).map(([time, group]) => ({
                            time,
                            variation: group.length > 1 ? 
                              Math.max(...group.map(r => r.glucoseLevel)) - Math.min(...group.map(r => r.glucoseLevel)) : 
                              Infinity
                          }));
                          
                          return ` ${variations.reduce((a, b) => a.variation < b.variation ? a : b).time}`;
                        })() 
                        : ' mañana'}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Comida con Menor Impacto</h3>
                    <p className="text-blue-600 mt-2">
                      {records.length > 0 ? 
                        (() => {
                          const mealImpact = ['desayuno', 'almuerzo', 'cena'].map(meal => {
                            const mealRecords = records.filter(r => r.foodMeal === meal);
                            if (mealRecords.length === 0) return { meal, avg: Infinity };
                            return {
                              meal,
                              avg: mealRecords.reduce((sum, r) => sum + r.glucoseLevel, 0) / mealRecords.length
                            };
                          });
                          const bestMeal = mealImpact.reduce((a, b) => a.avg < b.avg ? a : b);
                          return `El ${bestMeal.meal} suele tener el menor impacto en tu glucosa`;
                        })() 
                        : 'Registra más comidas para ver este insight'}
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <h3 className="font-semibold text-pink-800">Tendencia General</h3>
                    <p className="text-pink-600 mt-2">
                      {records.length > 0 ? 
                        (() => {
                          const recentAvg = records.slice(0, Math.min(5, records.length))
                            .reduce((sum, r) => sum + r.glucoseLevel, 0) / Math.min(5, records.length);
                          const olderAvg = records.slice(-Math.min(5, records.length))
                            .reduce((sum, r) => sum + r.glucoseLevel, 0) / Math.min(5, records.length);
                          
                          if (recentAvg < olderAvg) return "Tus niveles de glucosa muestran una tendencia a la baja";
                          if (recentAvg > olderAvg) return "Tus niveles de glucosa muestran una tendencia al alza";
                          return "Tus niveles de glucosa se mantienen estables";
                        })() 
                        : 'Registra más mediciones para ver la tendencia'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white mt-8 p-6 border rounded-2xl shadow-lg">
          <div className="relative">
            <Image
              src="/prediction.svg"
              alt="predictions"
              width={50}
              height={50}
              className="absolute left-[-15px] top-[-20px] w-5 lg:w-[50px] xs:w-12"
            />
            <h1 className="bold-20 lg:bold-32 mt-3 ml-10 capitalize">
              Predicción
            </h1>
          </div>
          <div className="mt-4 text-center">
            {prediction !== null ? (
              <div className="space-y-2">
                <p className="font-semibold text-lg">
                  Tu siguiente nivel de glucosa será aproximadamente{" "}
                  <strong className="text-green-600">{prediction} mg/dl</strong>
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">
                    Confianza de la predicción:
                  </span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${predictionConfidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(predictionConfidence * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                No hay suficientes datos para generar una predicción precisa.
                Continúa registrando tus niveles de glucosa para obtener mejores predicciones.
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Esta predicción se basa en tus datos históricos y patrones de glucosa.
            Los resultados pueden variar dependiendo de diversos factores como dieta,
            actividad física y otros aspectos de tu estilo de vida.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
