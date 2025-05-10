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
    if (avg >= 70 && avg <= 140) return 'text-green-500';
    if (avg < 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getStatusIcon = (avg: number) => {
    if (avg >= 70 && avg <= 140) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (avg < 70) return <TrendingDown className="w-6 h-6 text-yellow-500" />;
    return <TrendingUp className="w-6 h-6 text-red-500" />;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      <div className="bg-green-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Resumen de Glucosa
          </h2>
          <Activity className="w-6 h-6 text-white" />
        </div>
        <p className="text-green-100 text-sm mt-1">
          Basado en {stats.total} mediciones
        </p>
      </div>
      
      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Promedio</h3>
              {getStatusIcon(stats.average)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(stats.average)}`}>
              {stats.average} <span className="text-sm font-normal text-gray-500">mg/dL</span>
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Mínimo</h3>
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {stats.min} <span className="text-sm font-normal text-gray-500">mg/dL</span>
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider">Máximo</h3>
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {stats.max} <span className="text-sm font-normal text-gray-500">mg/dL</span>
            </p>
          </motion.div>
        </div>
        
        {/* Distribución de lecturas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-gray-600" />
            Distribución de Lecturas
          </h3>
          
          <div className="relative pt-1">
            <div className="flex h-10 rounded-xl overflow-hidden shadow-inner bg-gray-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.normal / stats.total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-green-500 h-full flex items-center justify-center text-xs font-medium text-white"
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
          className="bg-gray-50 p-5 rounded-xl border  border-gray-200"
        >
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-500" />
            Recomendaciones
          </h3>
          
          <ul className="space-y-3 ">
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
                <p className="text-white">Considera reducir el consumo de carbohidratos y aumentar la actividad física.</p>
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
                <p className="text-white">Mantén siempre a mano alimentos con azúcares de rápida absorción para casos de hipoglucemia.</p>
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
                <p className="text-white">Tu promedio está por encima del rango recomendado. Consulta con tu médico sobre ajustes en tu tratamiento.</p>
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
                <p className="text-white">Tu promedio está por debajo del rango recomendado. Consulta con tu médico sobre ajustes en tu tratamiento.</p>
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
                <p className="text-white">¡Buen trabajo! Tu promedio está dentro del rango recomendado.</p>
              </motion.li>
            )}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlucoseInsights;


