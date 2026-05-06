import { GlucoseRecord } from '@/types/glucose';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface GlucoseInsightsProps {
  records: GlucoseRecord[];
}

const GlucoseInsights = ({ records }: GlucoseInsightsProps) => {
  // Calcular estadísticas básicas
  const calculateStats = () => {
    if (records.length === 0) return null;
    
    const glucoseLevels = records.map(r => r.glucoseLevel);
    const average = glucoseLevels.reduce((sum, level) => sum + level, 0) / glucoseLevels.length;
    const max = Math.max(...glucoseLevels);
    const min = Math.min(...glucoseLevels);
    
    // Contar lecturas por rango
    const normal = glucoseLevels.filter(level => level >= 70 && level <= 140).length;
    const high = glucoseLevels.filter(level => level > 140).length;
    const low = glucoseLevels.filter(level => level < 70).length;
    
    return {
      average: Math.round(average),
      max,
      min,
      normal,
      high,
      low,
      total: glucoseLevels.length
    };
  };
  
  const stats = calculateStats();
  
  if (!stats) return null;
  
  // Determinar el estado general basado en el promedio
  const getStatusColor = (avg: number) => {
    if (avg >= 70 && avg <= 140) return "text-emerald-600";
    if (avg < 70) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusIcon = (avg: number) => {
    if (avg >= 70 && avg <= 140)
      return <CheckCircle className="h-6 w-6 text-emerald-600" strokeWidth={1.75} aria-hidden />;
    if (avg < 70)
      return <TrendingDown className="h-6 w-6 text-amber-600" strokeWidth={1.75} aria-hidden />;
    return <TrendingUp className="h-6 w-6 text-red-600" strokeWidth={1.75} aria-hidden />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md"
    >
      <div className="bg-gradient-to-r from-vitality-primary to-emerald-700 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Resumen rápido
          </h2>
          <Activity className="h-6 w-6 shrink-0 text-white/95" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-1 text-sm text-emerald-50/95">
          Basado en {stats.total} {stats.total === 1 ? "medición" : "mediciones"}
        </p>
      </div>
      
      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-900">Promedio</h3>
              {getStatusIcon(stats.average)}
            </div>
            <p className={`text-3xl font-bold tabular-nums ${getStatusColor(stats.average)}`}>
              {stats.average}{" "}
              <span className="text-sm font-normal text-slate-500">mg/dL</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">Mínimo</h3>
              <TrendingDown className="h-6 w-6 text-emerald-700" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-3xl font-bold tabular-nums text-emerald-700">
              {stats.min} <span className="text-sm font-normal text-slate-500">mg/dL</span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-red-200 bg-red-50/90 p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-red-900">Máximo</h3>
              <TrendingUp className="h-6 w-6 text-red-700" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-3xl font-bold tabular-nums text-red-700">
              {stats.max} <span className="text-sm font-normal text-slate-500">mg/dL</span>
            </p>
          </motion.div>
        </div>

        {/* Distribución de lecturas */}
        <div className="mb-8">
          <h3 className="mb-3 flex items-center text-lg font-semibold text-slate-900">
            <Activity className="mr-2 h-5 w-5 text-vitality-primary" strokeWidth={1.75} aria-hidden />
            Distribución de lecturas
          </h3>
          
          <div className="relative pt-1">
            <div className="flex h-10 rounded-xl overflow-hidden shadow-inner bg-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.normal / stats.total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex h-full items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                style={{ width: `${(stats.normal / stats.total) * 100}%` }}
                title={`Normal: ${stats.normal} lecturas`}
              >
                {stats.normal > 0 && (stats.normal / stats.total) * 100 > 15 && `${stats.normal}`}
              </motion.div>
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.high / stats.total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-red-500 h-full flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(stats.high / stats.total) * 100}%` }}
                title={`Alta: ${stats.high} lecturas`}
              >
                {stats.high > 0 && (stats.high / stats.total) * 100 > 15 && `${stats.high}`}
              </motion.div>
              
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.low / stats.total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-yellow-500 h-full flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(stats.low / stats.total) * 100}%` }}
                title={`Baja: ${stats.low} lecturas`}
              >
                {stats.low > 0 && (stats.low / stats.total) * 100 > 15 && `${stats.low}`}
              </motion.div>
            </div>
            
            <div className="flex justify-between text-xs mt-2 px-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-green-700 font-medium">{stats.normal} normales</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-red-700 font-medium">{stats.high} altas</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-yellow-700 font-medium">{stats.low} bajas</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recomendaciones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-slate-200 bg-slate-50/90 p-5"
        >
          <h3 className="mb-3 flex items-center text-lg font-semibold text-slate-900">
            <Info className="mr-2 h-5 w-5 text-sky-600" strokeWidth={1.75} aria-hidden />
            Recomendaciones
          </h3>

          <ul className="space-y-3">
            {stats.high > stats.normal && (
              <motion.li 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Considera reducir el consumo de carbohidratos y aumentar la actividad física.
                </p>
              </motion.li>
            )}
            
            {stats.low > 0 && (
              <motion.li 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                  <TrendingUp className="w-3 h-3 text-yellow-600" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Mantén siempre a mano alimentos con azúcares de rápida absorción para casos de hipoglucemia.
                </p>
              </motion.li>
            )}
            
            {stats.average > 140 && (
              <motion.li 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Tu promedio está por encima del rango recomendado. Consulta con tu médico sobre ajustes en tu
                  tratamiento.
                </p>
              </motion.li>
            )}
            
            {stats.average < 70 && (
              <motion.li 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Tu promedio está por debajo del rango recomendado. Consulta con tu médico sobre ajustes en tu
                  tratamiento.
                </p>
              </motion.li>
            )}
            
            {stats.average >= 70 && stats.average <= 140 && (
              <motion.li 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-start"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  ¡Buen trabajo! Tu promedio está dentro del rango recomendado.
                </p>
              </motion.li>
            )}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlucoseInsights;


