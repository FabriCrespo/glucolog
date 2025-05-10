"use client";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { registerGlucose, fetchGlucoseRecords } from "@/services/glucoseService";
import { GlucoseRecord } from "@/types/glucose";
import GlucoseForm from "@/components/glucose/GlucoseForm";
import GlucoseTable from "@/components/glucose/GlucoseTable";
import GlucoseCharts from "@/components/glucose/GlucoseCharts";
import LoadingSpinner from "@/components/LoadingSpinner";
import { prepareChartData, prepareChartOptions } from "@/utils/chartHelpers";
import { ChartData, ChartOptions } from "chart.js";
// Importar la configuración de Chart.js
import '@/utils/chartConfig';

// Definir interfaces para los datos del gráfico
interface ChartDatasets {
  timelineData: ChartData<'line'>;
  mealImpactData: ChartData<'bar'>;
  patternData: ChartData<'bar'>;
}

interface ChartOptionsType {
  timeline: ChartOptions<'line'>;
  mealImpact: ChartOptions<'bar'>;
  pattern: ChartOptions<'bar'>;
}

const Dashboard = () => {
  const [glucoseLevel, setGlucoseLevel] = useState<number | "">("");
  const [ateSomething, setAteSomething] = useState(false);
  const [foodEaten, setFoodEaten] = useState("");
  const [foodMeal, setFoodMeal] = useState("");
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("7 días");
  
  // Inicializar con tipos correctos
  const [chartData, setChartData] = useState<ChartDatasets>({
    timelineData: {
      labels: [],
      datasets: []
    },
    mealImpactData: {
      labels: [],
      datasets: []
    },
    patternData: {
      labels: [],
      datasets: []
    }
  });
  
  const [chartOptions, setChartOptions] = useState<ChartOptionsType>({
    timeline: {},
    mealImpact: {},
    pattern: {}
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRecords(7);
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      const { timelineData, mealImpactData, patternData } = prepareChartData(records);
      const { timeline, mealImpact, pattern } = prepareChartOptions();
      
      setChartData({ 
        timelineData: timelineData as ChartData<'line'>, 
        mealImpactData: mealImpactData as ChartData<'bar'>, 
        patternData: patternData as ChartData<'bar'> 
      });
      
      setChartOptions({ 
        timeline: timeline as ChartOptions<'line'>, 
        mealImpact: mealImpact as ChartOptions<'bar'>, 
        pattern: pattern as ChartOptions<'bar'> 
      });
    }
  }, [records]);

  const fetchRecords = async (days: number) => {
    if (auth.currentUser) {
      try {
        setFetchingRecords(true);
        const fetchedRecords = await fetchGlucoseRecords(auth.currentUser.uid, days);
        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching records:", error);
        setError("Error al cargar los registros");
      } finally {
        setFetchingRecords(false);
      }
    }
  };

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range);
    let days = 7;
    
    switch (range) {
      case "7 días":
        days = 7;
        break;
      case "1 mes":
        days = 30;
        break;
      case "3 meses":
        days = 90;
        break;
      case "1 año":
        days = 365;
        break;
      default:
        days = 7;
    }
    
    await fetchRecords(days);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (glucoseLevel === "") {
      setError("Por favor ingrese un nivel de glucosa");
      return;
    }
    
    // Validación adicional para los campos de comida
    if (ateSomething) {
      if (!foodMeal) {
        setError("Por favor seleccione el tipo de comida");
        return;
      }
      if (!foodEaten) {
        setError("Por favor indique qué comió");
        return;
      }
    }
    
    if (auth.currentUser) {
      try {
        setSubmitting(true);
        setError(null);
        
        // Convertir glucoseLevel a número antes de enviarlo
        const glucoseLevelNumber = typeof glucoseLevel === 'string' ? 
          parseInt(glucoseLevel) : glucoseLevel;
        
        await registerGlucose(
          auth.currentUser.uid,
          glucoseLevelNumber,
          ateSomething,
          foodEaten || undefined,
          foodMeal || undefined
        );
        
        // Reset form
        setGlucoseLevel("");
        setAteSomething(false);
        setFoodEaten("");
        setFoodMeal("");
        
        // Refresh records
        const daysMap: { [key: string]: number } = {
          "7 días": 7,
          "1 mes": 30,
          "3 meses": 90,
          "1 año": 365
        };
        await fetchRecords(daysMap[dateRange] || 7);
        
        // Mostrar mensaje de éxito
        setError("Registro guardado correctamente");
        setTimeout(() => setError(null), 3000); // Limpiar mensaje después de 3 segundos
        
      } catch (error) {
        console.error("Error submitting:", error);
        setError("Error al registrar. Intente nuevamente.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setError("Debe iniciar sesión para registrar");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="max-container padding-container flex flex-col md:gap-28 lg:py-5 xl:flex-row">
      <div className="bg-green-200 w-full h-full border rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <GlucoseForm
            glucoseLevel={glucoseLevel}
            setGlucoseLevel={setGlucoseLevel}
            ateSomething={ateSomething}
            setAteSomething={setAteSomething}
            foodEaten={foodEaten}
            setFoodEaten={setFoodEaten}
            foodMeal={foodMeal}
            setFoodMeal={setFoodMeal}
            dateRange={dateRange}
            setDateRange={setDateRange}
            submitting={submitting}
            error={error}
            handleSubmit={handleSubmit}
            handleDateRangeChange={handleDateRangeChange}
          />
          
          <GlucoseTable 
            records={records}
            fetchingRecords={fetchingRecords}
          />
        </div>

        <GlucoseCharts
          chartData={chartData}
          chartOptions={chartOptions}
          fetchingRecords={fetchingRecords}
          records={records}
        />
      </div>
    </section>
  );
};

export default Dashboard;
