import { LineChart } from 'lucide-react';
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
    <div className="w-full flex-1 overflow-auto">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 ring-1 ring-emerald-100/80">
            <LineChart className="h-5 w-5 text-vitality-primary" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Análisis y tendencias
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Visualiza patrones según el periodo seleccionado en el formulario.
            </p>
          </div>
        </div>
      </div>

      {fetchingRecords ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-200 border-t-vitality-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-600">
          <p className="text-base font-medium text-slate-800">Aún no hay datos para graficar</p>
          <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">
            Cuando registres lecturas, aquí verás líneas de tiempo y distribución por comidas.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Línea de Tiempo */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Niveles por tipo de comida
            </h3>
            <div className="h-[min(400px,55vh)] min-h-[260px]">
              {hasTimelineData && (
                <Line data={chartData.timelineData} options={chartOptions.timeline} />
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Impacto por Comida */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Impacto por tipo de comida
              </h3>
              <div className="h-[min(300px,45vh)] min-h-[220px]">
                {hasMealImpactData && (
                  <Bar data={chartData.mealImpactData} options={chartOptions.mealImpact} />
                )}
              </div>
            </div>

            {/* Patrones Diarios */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Patrones durante el día
              </h3>
              <div className="h-[min(300px,45vh)] min-h-[220px]">
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


