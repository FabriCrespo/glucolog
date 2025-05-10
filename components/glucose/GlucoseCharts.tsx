import Image from 'next/image';
import { Line, Bar } from 'react-chartjs-2';
import { GlucoseRecord } from '@/types/glucose';
import GlucoseInsights from './GlucoseInsights';
// Importar la configuración de Chart.js
import '@/utils/chartConfig';

interface GlucoseChartsProps {
  chartData: {
    timelineData: any;
    mealImpactData: any;
    patternData: any;
  };
  chartOptions: any;
  fetchingRecords: boolean;
  records: GlucoseRecord[];
}

const GlucoseCharts = ({ chartData, chartOptions, fetchingRecords, records }: GlucoseChartsProps) => {
  // Verificar si los datos del gráfico están listos para renderizar
  const hasTimelineData = chartData.timelineData?.datasets?.length > 0;
  const hasMealImpactData = chartData.mealImpactData?.datasets?.length > 0;
  const hasPatternData = chartData.patternData?.datasets?.length > 0;

  return (
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
              {hasTimelineData && (
                <Line data={chartData.timelineData} options={chartOptions.timeline} />
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Impacto por Comida */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Impacto por Tipo de Comida
              </h2>
              <div className="h-[300px]">
                {hasMealImpactData && (
                  <Bar data={chartData.mealImpactData} options={chartOptions.mealImpact} />
                )}
              </div>
            </div>

            {/* Patrones Diarios */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Patrones Durante el Día
              </h2>
              <div className="h-[300px]">
                {hasPatternData && (
                  <Bar data={chartData.patternData} options={chartOptions.pattern} />
                )}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <GlucoseInsights records={records} />
        </div>
      )}
    </div>
  );
};

export default GlucoseCharts;


