import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { GlucoseRecord } from '@/types/glucose';
import { fetchGlucoseRecords } from '@/services/glucoseService';

interface GlucoseRecentProps {
  userId: string;
}

const GlucoseRecent = ({ userId }: GlucoseRecentProps) => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    lastReading: GlucoseRecord | null;
    average: number;
    trend: 'up' | 'down' | 'stable';
  }>({
    lastReading: null,
    average: 0,
    trend: 'stable'
  });

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        setLoading(true);
        // Obtener los últimos 7 días de registros
        const recentRecords = await fetchGlucoseRecords(userId, 7);
        setRecords(recentRecords);
        
        if (recentRecords.length > 0) {
          // Ordenar por fecha y hora más reciente
          const sortedRecords = [...recentRecords].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          });
          
          // Último registro
          const lastReading = sortedRecords[0];
          
          // Calcular promedio
          const glucoseLevels = recentRecords.map(r => r.glucoseLevel);
          const average = glucoseLevels.reduce((sum, level) => sum + level, 0) / glucoseLevels.length;
          
          // Determinar tendencia
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (sortedRecords.length >= 3) {
            const recent = sortedRecords.slice(0, 3).map(r => r.glucoseLevel);
            const avgRecent = recent.reduce((sum, val) => sum + val, 0) / recent.length;
            const older = sortedRecords.slice(Math.max(0, sortedRecords.length - 3)).map(r => r.glucoseLevel);
            const avgOlder = older.reduce((sum, val) => sum + val, 0) / older.length;
            
            if (avgRecent > avgOlder + 10) trend = 'up';
            else if (avgRecent < avgOlder - 10) trend = 'down';
          }
          
          setStats({
            lastReading,
            average: Math.round(average),
            trend
          });
        }
      } catch (error) {
        console.error("Error fetching glucose data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchRecentData();
    }
  }, [userId]);

  const getStatusColor = (level: number) => {
    if (level < 70) return "text-yellow-500";
    if (level > 140) return "text-red-500";
    return "text-green-500";
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTrendMessage = () => {
    switch (stats.trend) {
      case 'up':
        return "Tendencia al alza";
      case 'down':
        return "Tendencia a la baja";
      default:
        return "Niveles estables";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold">Sin datos recientes</h3>
        </div>
        <p className="text-gray-600">
          No hay registros de glucosa en los últimos 7 días.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Resumen de Glucosa</h3>
        {getTrendIcon()}
      </div>
      
      {stats.lastReading && (
        <>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${getStatusColor(stats.lastReading.glucoseLevel)}`}>
              {stats.lastReading.glucoseLevel}
            </span>
            <span className="text-sm text-gray-500 ml-1">mg/dL</span>
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            Última lectura: {stats.lastReading.date} {stats.lastReading.time.substring(0, 5)}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Promedio 7 días</span>
                <div className={`font-semibold ${getStatusColor(stats.average)}`}>
                  {stats.average} mg/dL
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tendencia</span>
                <div className="font-semibold flex items-center">
                  {getTrendMessage()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GlucoseRecent;