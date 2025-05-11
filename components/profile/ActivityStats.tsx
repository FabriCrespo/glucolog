import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Pill, CheckCircle, Clock, Calendar } from 'lucide-react';

interface ActivityStatsProps {
  userId: string;
}

const ActivityStats = ({ userId }: ActivityStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState({
    medicationCompliance: 85,
    recentExercises: [
      { name: 'Caminata', duration: 30, date: '2023-06-15', completed: true },
      { name: 'Yoga', duration: 45, date: '2023-06-13', completed: true },
      { name: 'Natación', duration: 60, date: '2023-06-10', completed: false }
    ],
    totalExerciseDuration: 240,
    exerciseDays: 8
  });

  useEffect(() => {
    // Aquí iría la lógica para obtener los datos reales del usuario
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBackground = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-600" />
        Estadísticas de Actividad
      </h3>

      <div className="space-y-6">
        {/* Cumplimiento de medicación */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 uppercase tracking-wider mb-2 flex items-center">
            <Pill className="w-4 h-4 mr-1" />
            Cumplimiento de Medicación
          </h4>
          
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className={`text-sm font-medium ${getComplianceColor(activityData.medicationCompliance)}`}>
                {activityData.medicationCompliance}% Completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${activityData.medicationCompliance}%` }}
                transition={{ duration: 0.8 }}
                className={`h-2.5 rounded-full ${
                  activityData.medicationCompliance >= 90 ? 'bg-green-600' : 
                  activityData.medicationCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              ></motion.div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center">
            <div className={`p-1 rounded-full ${getComplianceBackground(activityData.medicationCompliance)}`}>
              <CheckCircle className={`w-4 h-4 ${getComplianceColor(activityData.medicationCompliance)}`} />
            </div>
            <p className="ml-2 text-sm text-gray-600">
              {activityData.medicationCompliance >= 90 
                ? '¡Excelente cumplimiento!' 
                : activityData.medicationCompliance >= 70 
                ? 'Buen cumplimiento, pero hay margen de mejora.' 
                : 'Necesitas mejorar tu cumplimiento de medicación.'}
            </p>
          </div>
        </div>

        {/* Ejercicios recientes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-purple-600" />
            Ejercicios Recientes
          </h4>
          
          <div className="space-y-2">
            {activityData.recentExercises.map((exercise, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                exercise.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <span className="font-medium text-gray-800">{exercise.name}</span>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500 ml-1">{exercise.duration} min</span>
                    <span className="text-xs text-gray-500 ml-2">{new Date(exercise.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {exercise.completed ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Completado
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    Pendiente
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Duración total de ejercicio */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h4 className="text-xs font-medium text-purple-800 uppercase tracking-wider mb-1">
              Duración Total
            </h4>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-purple-700">{activityData.totalExerciseDuration}</span>
              <span className="text-sm text-purple-600 ml-1 mb-0.5">minutos</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Este mes</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="text-xs font-medium text-indigo-800 uppercase tracking-wider mb-1">
              Días Activos
            </h4>
            <div className="flex items-end">
              <span className="text-2xl font-bold text-indigo-700">{activityData.exerciseDays}</span>
              <span className="text-sm text-indigo-600 ml-1 mb-0.5">días</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Este mes</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityStats;