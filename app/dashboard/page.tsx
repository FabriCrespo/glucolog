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
  foodMeal?: string | null;
  foodEaten?: string | null;
}

interface GlucosePrediction {
  predicted_glucose: number;
  confidence: number;
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
      foodEaten: foodEaten,
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

// Función para obtener todos los registros históricos
async function fetchAllGlucoseRecords(userID: string): Promise<GlucoseRecord[]> {
  try {
    const recordsRef = collection(db, "glucoseRecords", userID, "records");
    const q = query(recordsRef, orderBy("timeStamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as GlucoseRecord);
  } catch (error) {
    console.error("Error fetching all glucose records:", error);
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
  const [allRecords, setAllRecords] = useState<GlucoseRecord[]>([]);
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7 días");
  const [prediction, setPrediction] = useState<GlucosePrediction | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number>(0);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  // Implementación local del modelo de predicción
  const localPredict = (records: GlucoseRecord[]): number => {
    if (records.length < 2) return 0;
    
    // Calcular la media móvil de los últimos registros
    const lastValues = records.slice(0, 5).map(r => r.glucoseLevel);
    const average = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
    
    // Calcular la tendencia
    const trend = records[0].glucoseLevel - records[1].glucoseLevel;
    
    // Predecir el próximo valor basado en la media y la tendencia
    return average + trend;
  };

  const localGetConfidence = (records: GlucoseRecord[]): number => {
    if (records.length < 5) return 0;
    if (records.length < 10) return 50;
    if (records.length < 20) return 70;
    return 85;
  };

  const updatePrediction = (records: GlucoseRecord[]) => {
    if (records.length < 5) {
      setPrediction(null);
      return;
    }

    const predictedValue = localPredict(records);
    const confidence = localGetConfidence(records);

    setPrediction({
      predicted_glucose: predictedValue,
      confidence: confidence
    });
  };

  // Efecto para actualizar predicciones cuando cambian los registros
  useEffect(() => {
    if (allRecords.length >= 5) {
      updatePrediction(allRecords);
    }
  }, [allRecords]);

  const checkMLServer = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('ML Server not available:', error);
    }
    return false;
  };

  const trainModel = async (records: GlucoseRecord[]) => {
    if (!(await checkMLServer())) {
      console.log('ML Server not available, skipping training');
      return;
    }

    try {
      const trainingData = records.map(record => ({
        hour: parseInt(record.time.split(':')[0]),
        day_of_week: new Date(record.date).getDay(),
        meal_type: record.foodMeal || 'none',
        last_glucose: record.glucoseLevel
      }));

      const response = await fetch('http://localhost:8000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        throw new Error('Error en el entrenamiento del modelo');
      }
    } catch (error) {
      console.error('Error al entrenar modelo:', error);
    }
  };

  const getPrediction = async (glucoseRecord: any) => {
    if (!(await checkMLServer())) {
      console.log('ML Server not available, skipping prediction');
      return;
    }

    try {
      const date = new Date(glucoseRecord.date);
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
      setPrediction(data);
    } catch (error) {
      console.error('Error al predecir:', error);
      setPrediction(null);
    }
  };

  // Efecto para cargar datos históricos y entrenar el modelo
  useEffect(() => {
    const loadHistoricalData = async (userId: string) => {
      try {
        const historicalData = await fetchAllGlucoseRecords(userId);
        setAllRecords(historicalData);
        
        if (historicalData.length >= 5) {
          await trainModel(historicalData);
          await getPrediction(historicalData[0]);
        }
      } catch (error) {
        console.error("Error loading historical data:", error);
      }
    };

    if (userID) {
      loadHistoricalData(userID);
    }
  }, [userID]);

  // Efecto separado para la visualización de datos según el rango seleccionado
  useEffect(() => {
    const loadDisplayData = async () => {
      if (!userID) return;
      
      try {
        const displayData = await fetchGlucoseRecords(userID, dateRange);
        setRecords(displayData);
      } catch (error) {
        console.error("Error loading display data:", error);
        setError(error instanceof Error ? error.message : "Error al cargar registros");
      }
    };

    loadDisplayData();
  }, [dateRange, userID]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setError(null);
      try {
        if (user) {
          setUserID(user.uid);
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

  useEffect(() => {
    const checkServer = async () => {
      await checkMLServer();
    };
    checkServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!userID) throw new Error("Usuario no autenticado");
      if (glucoseLevel === "") throw new Error("Nivel de glucosa requerido");

      const newRecord = {
        glucoseLevel: Number(glucoseLevel),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
        timeStamp: Timestamp.now(),
        ateSomething,
        ...(ateSomething ? { 
          foodMeal: foodMeal || null,
          foodEaten: foodEaten || null 
        } : {
          foodMeal: null,
          foodEaten: null
        })
      };

      await addDoc(collection(db, "glucoseRecords", userID, "records"), newRecord);

      // Actualizar todos los registros históricos
      const updatedHistoricalData = await fetchAllGlucoseRecords(userID);
      setAllRecords(updatedHistoricalData);

      // Actualizar los registros visualizados según el rango seleccionado
      const displayData = await fetchGlucoseRecords(userID, dateRange);
      setRecords(displayData);

      setGlucoseLevel("");
      setAteSomething(false);
      setFoodEaten("");
      setFoodMeal("");

    } catch (err) {
      console.error("Error al registrar:", err);
      setError(err instanceof Error ? err.message : "Error al registrar glucosa");
    } finally {
      setSubmitting(false);
    }
  };

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
                  onChange={(e) => {
                    const value = e.target.value;
                    setGlucoseLevel(value === "" ? "" : Math.max(0, Number(value)));
                  }}
                  min="0"
                  required
                  placeholder="Ingrese nivel de glucosa"
                />
                <label className="ml-2 font-bold">mg/dl</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 w-4 h-4"
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
                <label>¿Comió algo antes de la medición?</label>
              </div>

              {ateSomething && (
                <>
                  <div>
                    <select
                      className="w-full h-10 border border-green-50 rounded-md text-center"
                      value={foodMeal}
                      onChange={(e) => setFoodMeal(e.target.value)}
                    >
                      <option value="">Seleccione tipo de comida</option>
                      <option value="desayuno">Desayuno</option>
                      <option value="almuerzo">Almuerzo</option>
                      <option value="cena">Cena</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full h-10 border border-green-50 rounded-md text-center"
                      value={foodEaten}
                      onChange={(e) => setFoodEaten(e.target.value)}
                      placeholder="¿Qué comió?"
                    />
                  </div>
                </>
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
                  onChange={async (e) => {
                    setDateRange(e.target.value);
                    if (userID) {
                      setFetchingRecords(true);
                      try {
                        const data = await fetchGlucoseRecords(userID, e.target.value);
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
                      {records.length > 0 ? (
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
                      ) : ' mañana'}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Comida con Menor Impacto</h3>
                    <p className="text-blue-600 mt-2">
                      {records.length > 0 ? (
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
                      ) : 'Registra más comidas para ver este insight'}
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <h3 className="font-semibold text-pink-800">Tendencia General</h3>
                    <p className="text-pink-600 mt-2">
                      {records.length > 0 ? (
                        (() => {
                          const recentAvg = records.slice(0, Math.min(5, records.length))
                            .reduce((sum, r) => sum + r.glucoseLevel, 0) / Math.min(5, records.length);
                          const olderAvg = records.slice(-Math.min(5, records.length))
                            .reduce((sum, r) => sum + r.glucoseLevel, 0) / Math.min(5, records.length);

                          if (recentAvg < olderAvg) return "Tus niveles de glucosa muestran una tendencia a la baja";
                          if (recentAvg > olderAvg) return "Tus niveles de glucosa muestran una tendencia al alza";
                          return "Tus niveles de glucosa se mantienen estables";
                        })()
                      ) : 'Registra más mediciones para ver la tendencia'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Add Prediction Section after Insights */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Predicción de Glucosa
                </h2>
                
                {prediction ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        prediction.predicted_glucose < 70 ? 'bg-red-100 border-l-4 border-red-500' :
                        prediction.predicted_glucose > 180 ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                        'bg-emerald-100 border-l-4 border-emerald-500'
                      }`}>
                        <h3 className="font-semibold text-gray-800">Próximo Nivel Estimado</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-3xl font-bold">
                            {Math.round(prediction.predicted_glucose)}
                          </span>
                          <span className="text-gray-600">mg/dl</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800">Confianza de la Predicción</h3>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                              style={{ width: `${prediction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 mt-1 block">
                            {prediction.confidence}% de confianza
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Recomendaciones</h3>
                      {prediction.predicted_glucose < 70 ? (
                        <div className="space-y-2 text-red-700">
                          <p>⚠️ Nivel de glucosa bajo predicho</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Consume carbohidratos de rápida absorción</li>
                            <li>Ten a mano caramelos o jugo de frutas</li>
                            <li>Considera tomar un snack si planeas actividad física</li>
                          </ul>
                        </div>
                      ) : prediction.predicted_glucose > 180 ? (
                        <div className="space-y-2 text-yellow-700">
                          <p>⚠️ Nivel de glucosa alto predicho</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Bebe agua para mantenerte hidratado</li>
                            <li>Considera una caminata suave</li>
                            <li>Revisa tu próxima comida planificada</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-2 text-emerald-700">
                          <p>✅ Nivel de glucosa normal predicho</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>Mantén tu rutina actual</li>
                            <li>Continúa con tus hábitos saludables</li>
                            <li>Registra tu próxima medición según lo programado</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg">No hay suficientes datos para generar una predicción</p>
                    <p className="mt-2">Registra al menos 5 mediciones para ver predicciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
