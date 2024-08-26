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
async function registerGlucose(userID: string, glucoseLevel: number) {
  try {
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // Hora en formato HH:MM:SS

    await addDoc(collection(db, "glucoseRecords", userID, "records"), {
      glucoseLevel: glucoseLevel,
      date: date,
      time: time,
      timeStamp: Timestamp.now(),
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
  const [records, setRecords] = useState<any[]>([]);
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showPieChart, setShowPieChart] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userID && glucoseLevel) {
      await registerGlucose(userID, glucoseLevel);
      setGlucoseLevel("");
      // Refresh records after submitting
      const data = await fetchGlucoseRecords(userID);
      setRecords(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserID(user.uid);
        const data = await fetchGlucoseRecords(user.uid);
        setRecords(data);
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Datos para los gráficos
  const dates = records.map((record) => record.date);
  const glucoseLevels = records.map((record) => record.glucoseLevel);

  // Gráfico de Línea
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: "Nivel de Glucosa",
        data: glucoseLevels,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  // Gráfico de Barras (distribución por horas)
  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: "Nivel de Glucosa",
        data: glucoseLevels,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de Torta (distribución por rango de glucosa)
  const lowLevels = glucoseLevels.filter((level) => level < 70).length;
  const normalLevels = glucoseLevels.filter((level) => level >= 70 && level <= 140).length;
  const highLevels = glucoseLevels.filter((level) => level > 140).length;

  const pieChartData = {
    labels: ["Bajo", "Normal", "Alto"],
    datasets: [
      {
        label: "Distribución de Niveles de Glucosa",
        data: [lowLevels, normalLevels, highLevels],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <section className="flex flex-col h-screen">
      <div className="bg-green-200 w-full h-full border rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="bg-white lg:w-1/3 xl:w-1/3 xs:w-full h-auto border rounded-lg p-4 flex-shrink-0">
            <div className="relative">
              <Image src="/registro.svg" alt="camp" width={50} height={50} className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12" />
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
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className="bg-white even:bg-green-100 hover:bg-green-200">
                      <td className="px-4 py-2 border-b border-green-600">{record.date}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.time}</td>
                      <td className="px-4 py-2 border-b border-green-600">{record.glucoseLevel}</td>
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
        </div>
      </div>
    </section>
  );
  
};

export default Dashboard;
