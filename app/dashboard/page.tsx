"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase/config";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

// Función de Registro
async function registerGlucose(userID: string, glucoseLevel: number, ateSomething: boolean, foodEaten?: string) {
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
      foodEaten: foodEaten || "", // Solo se almacena si hay valor
    });
  } catch (e) {
    console.error("Error al añadir el registro: ", e);
  }
}

// Obtener los datos de glucosa de los últimos 7 días
async function fetchGlucoseRecords(userID: string) {
  const recordsRef = collection(db, "glucoseRecords", userID, "records");
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const q = query(recordsRef);

  const querySnapshot = await getDocs(q);
  const records = querySnapshot.docs.map((doc) => doc.data());

  // Filtrar los registros de los últimos 7 días
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= sevenDaysAgo && recordDate <= today;
  });

  return filteredRecords;
}

const Dashboard = () => {
  const [glucoseLevel, setGlucoseLevel] = useState<number | "">("");
  const [ateSomething, setAteSomething] = useState<boolean>(false);
  const [foodEaten, setFoodEaten] = useState<string>("");
  const [records, setRecords] = useState<any[]>([]);
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showPieChart, setShowPieChart] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userID && glucoseLevel !== "" && (ateSomething ? foodEaten : true)) {
      await registerGlucose(userID, glucoseLevel, ateSomething, ateSomething ? foodEaten : undefined);
      setGlucoseLevel("");
      setAteSomething(false);
      setFoodEaten("");
      const data = await fetchGlucoseRecords(userID);
      setRecords(data);
      calculatePrediction(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserID(user.uid);
        const data = await fetchGlucoseRecords(user.uid);
        setRecords(data);
        setLoading(false);
        calculatePrediction(data);
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const calculatePrediction = (records: any[]) => {
    if (records.length === 0) return;
    const averageLevel = records.reduce((sum, record) => sum + record.glucoseLevel, 0) / records.length;
    setPrediction(Math.round(averageLevel));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

// Datos para los gráficos
const dates = records.map((record) => record.date);
const glucoseLevels = records.map((record) => record.glucoseLevel);
const ateOrNot = records.map((record) => record.ateSomething ? "Comió" : "No Comió");

// Gráfico de Línea 
const lineChartData = {
  labels: dates,
  datasets: [
    {
      label: "Nivel de Glucosa (Comió)",
      data: records
        .filter((record) => record.ateSomething)
        .map((record) => record.glucoseLevel),
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      fill: true,
    },
    {
      label: "Nivel de Glucosa (No Comió)",
      data: records
        .filter((record) => !record.ateSomething)
        .map((record) => record.glucoseLevel),
      borderColor: "rgba(54, 162, 235, 1)",
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      fill: true,
    },
  ],
};

// Gráfico de Barras 
const timePeriods = records.map((record) => {
  const dateTimeString = `${record.date} ${record.time}`;  
  const hour = new Date(dateTimeString).getHours();        
  if (hour >= 0 && hour < 12) return "Mañana";
  else if (hour >= 12 && hour < 18) return "Tarde";
  else return "Noche";
});


const barChartData = {
  labels: timePeriods,
  datasets: [
    {
      label: "Glucosa (Comió)",
      data: records
        .filter((record) => record.ateSomething)
        .map((record) => record.glucoseLevel),
      backgroundColor: "rgba(153, 102, 255, 0.6)",
      borderColor: "rgba(153, 102, 255, 1)",
      borderWidth: 1,
    },
    {
      label: "Glucosa (No Comió)",
      data: records
        .filter((record) => !record.ateSomething)
        .map((record) => record.glucoseLevel),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

// Gráfico de Torta 
const lowLevelsAte = glucoseLevels.filter(
  (level, index) => level < 70 && records[index].ateSomething
).length;
const normalLevelsAte = glucoseLevels.filter(
  (level, index) => level >= 70 && level <= 140 && records[index].ateSomething
).length;
const highLevelsAte = glucoseLevels.filter(
  (level, index) => level > 140 && records[index].ateSomething
).length;

const lowLevelsNotAte = glucoseLevels.filter(
  (level, index) => level < 70 && !records[index].ateSomething
).length;
const normalLevelsNotAte = glucoseLevels.filter(
  (level, index) => level >= 70 && level <= 140 && !records[index].ateSomething
).length;
const highLevelsNotAte = glucoseLevels.filter(
  (level, index) => level > 140 && !records[index].ateSomething
).length;

const pieChartData = {
  labels: [
    "Bajo (Comió)",
    "Normal (Comió)",
    "Alto (Comió)",
    "Bajo (No Comió)",
    "Normal (No Comió)",
    "Alto (No Comió)",
  ],
  datasets: [
    {
      label: "Distribución de Niveles de Glucosa",
      data: [
        lowLevelsAte,
        normalLevelsAte,
        highLevelsAte,
        lowLevelsNotAte,
        normalLevelsNotAte,
        highLevelsNotAte,
      ],
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#FF9AA2",
        "#85C1E9",
        "#F7DC6F",
      ],
      hoverOffset: 4,
    },
  ],
};

  return (
    <section className="max-container padding-container flex flex-col  md:gap-28 lg:py-5 xl:flex-row">
      <div className="bg-green-200 w-full h-full border rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="bg-white lg:w-1/3 xl:w-1/3 xs:w-full h-auto border rounded-lg p-4 flex-shrink-0">
            <div className="relative">
              <Image src="/registro.svg" alt="camp" width={50} height={50} className="absolute left-[-5px] top-[-20px] w-5 lg:w-[50px] xs:w-12" />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">Registrar glucosa</h1>
            </div>

            <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
              <p className="italic">Por favor, ingrese su nivel de glucosa en miligramos (mg).</p>
              <div>
                <input
                  type="number"
                  className="w-full h-10 border border-green-50 rounded-md text-center"
                  value={glucoseLevel}
                  onChange={(e) => setGlucoseLevel(Number(e.target.value))}
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
                  <input
                    type="text"
                    className="w-full h-10 border border-green-50 rounded-md text-center"
                    value={foodEaten}
                    onChange={(e) => setFoodEaten(e.target.value)}
                    placeholder="Ingrese lo que comió"
                  />
                </div>
              )}
              <button className="w-full h-10 font-semibold bg-green-700 rounded-lg text-white hover:bg-green-800" type="submit">
                Registrar
              </button>
            </form>
          </div>

          <div className="bg-white w-full md:w-[63%] flex-1 border rounded-2xl shadow-sm p-4 overflow-y-auto">
            <h1 className="bold-20 lg:bold-32 mt-5 ml-5 capitalize">Historial de Registros</h1>
            <div className="bg-green-200 w-full h-80 mt-2 rounded-lg shadow-lg overflow-y-auto">
              <table className="w-full table-fixed border border-green-600">
                <thead className="bg-green-600 text-white uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 border-b border-green-600">Fecha</th>
                    <th className="px-4 py-2 border-b border-green-600">Hora</th>
                    <th className="px-4 py-2 border-b border-green-600">Nivel de Glucosa</th>
                    <th className="px-4 py-2 border-b border-green-600">Comió Algo</th>
                    <th className="px-4 py-2 border-b border-green-600">Qué Comió</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className="bg-white even:bg-green-100 hover:bg-green-200">
                      <td className="px-4 py-2 border-b border-green-600">{record.date}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.time}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.glucoseLevel}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.ateSomething ? "Sí" : "No"}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.foodEaten || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white w-full flex-1 mt-8 border rounded-2xl shadow-lg p-6 overflow-auto">
          <div className="relative">
            <Image src="/predictions.svg" alt="search" width={50} height={50} className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12" />
            <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">Predicciones y Estadísticas</h1>
          </div>

          <div className="flex gap-4 mt-4 flex-wrap">
            <label className="flex items-center">
              <input type="checkbox" checked={showLineChart} onChange={() => setShowLineChart(!showLineChart)} />
              <span className="ml-2">Mostrar gráfico de línea</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={showBarChart} onChange={() => setShowBarChart(!showBarChart)} />
              <span className="ml-2">Mostrar gráfico de barras</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={showPieChart} onChange={() => setShowPieChart(!showPieChart)} />
              <span className="ml-2">Mostrar gráfico de torta</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mt-8 h-full">
            {showLineChart && (
              <div className="bg-white p-4 shadow-lg rounded-lg flex-1 min-w-0">
                <h2 className="text-center font-bold mb-4">Tendencia de Niveles de Glucosa</h2>
                <Line data={lineChartData} />
              </div>
            )}

            {showBarChart && (
              <div className="bg-white p-4 shadow-lg rounded-lg flex-1 min-w-0">
                <h2 className="text-center font-bold mb-4">Distribución por Horas</h2>
                <Bar data={barChartData} />
              </div>
            )}

            {showPieChart && (
              <div className="bg-white p-4 shadow-lg rounded-lg flex-1 min-w-0">
                <h2 className="text-center font-bold mb-4">Distribución de Niveles</h2>
                <Pie data={pieChartData} />
              </div>
            )}
          </div>
          <div className="bg-white mt-8 p-6 border rounded-2xl shadow-lg">
            <div className="relative">
              <Image src="/prediction.svg" alt="predictions" width={50} height={50} className="absolute left-[-15px] top-[-20px] w-5 lg:w-[50px] xs:w-12" />
              <h1 className="bold-20 lg:bold-32 mt-3 ml-10 capitalize">Predicción</h1>
            </div>
            <p className="mt-4 text-center font-semibold">
              {prediction !== null ? (
                <>
                  Tu siguiente nivel de glucosa será aproximadamente <strong>{prediction} mg/dl</strong>.
                </>
              ) : (
                <strong>No hay suficientes datos para predecir.</strong>
              )}
            </p>
            <p className="mt-2 text-sm">
              La predicción se basa en el promedio de tus niveles de glucosa en los últimos 7 días. Ten en cuenta que esta estimación puede variar dependiendo de tu consistencia en registrar los niveles de glucosa y otros factores individuales. Para obtener una evaluación más precisa, es importante mantener un registro constante y seguir las recomendaciones de tu médico.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
  
};

export default Dashboard;