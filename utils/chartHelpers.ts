import { GlucoseRecord } from "@/types/glucose";
import { ChartData, ChartOptions } from "chart.js";

export function prepareChartData(records: GlucoseRecord[]) {
  // Ordenar registros por fecha y hora
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Datos para el gráfico de línea de tiempo
  const timelineData = {
    labels: sortedRecords.map(r => `${r.date} ${r.time.substring(0, 5)}`),
    datasets: [
      {
        label: 'Nivel de Glucosa',
        data: sortedRecords.map(r => r.glucoseLevel),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      }
    ]
  };

  // Datos para el gráfico de impacto por comida
  const mealTypes = ['desayuno', 'almuerzo', 'cena', 'Otro'];
  const mealData = mealTypes.map(meal => {
    const mealRecords = records.filter(r => r.foodMeal === meal);
    return mealRecords.length > 0 
      ? mealRecords.reduce((sum, r) => sum + r.glucoseLevel, 0) / mealRecords.length 
      : 0;
  });

  const mealImpactData = {
    labels: ['Desayuno', 'Almuerzo', 'Cena', 'Otro'],
    datasets: [
      {
        label: 'Promedio de Glucosa',
        data: mealData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Datos para el gráfico de patrones diarios
  const timeGroups = {
    'Mañana (6-12)': records.filter(r => {
      const hour = parseInt(r.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    }),
    'Tarde (12-18)': records.filter(r => {
      const hour = parseInt(r.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    }),
    'Noche (18-24)': records.filter(r => {
      const hour = parseInt(r.time.split(':')[0]);
      return hour >= 18 && hour < 24;
    }),
    'Madrugada (0-6)': records.filter(r => {
      const hour = parseInt(r.time.split(':')[0]);
      return hour >= 0 && hour < 6;
    })
  };

  const timeData = Object.entries(timeGroups).map(([time, group]) => 
    group.length > 0 
      ? group.reduce((sum, r) => sum + r.glucoseLevel, 0) / group.length 
      : 0
  );

  const patternData = {
    labels: Object.keys(timeGroups),
    datasets: [
      {
        label: 'Promedio de Glucosa',
        data: timeData,
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
      }
    ]
  };

  return { timelineData, mealImpactData, patternData };
}

export function prepareChartOptions() {
  const timeline: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Nivel de Glucosa (mg/dL)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Glucosa: ${context.parsed.y} mg/dL`;
          }
        }
      }
    }
  };

  const mealImpact: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Promedio de Glucosa (mg/dL)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const pattern: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Promedio de Glucosa (mg/dL)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return { timeline, mealImpact, pattern };
}