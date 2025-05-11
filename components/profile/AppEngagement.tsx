import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BarChart2 } from 'lucide-react';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface AppEngagementProps {
  userId: string;
}

const AppEngagement = ({ userId }: AppEngagementProps) => {
  const [lastLogin, setLastLogin] = useState<string>('');
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        // Obtener datos del usuario
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Calcular último inicio de sesión
          const lastLoginTime = auth.currentUser?.metadata.lastSignInTime;
          if (lastLoginTime) {
            const lastDate = new Date(lastLoginTime);
            setLastLogin(lastDate.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            }));
          }
          
          // Calcular días consecutivos (simulado por ahora)
          // En una implementación real, necesitarías almacenar un registro de inicios de sesión
          setConsecutiveDays(Math.floor(Math.random() * 7) + 1); // Simulado entre 1-7 días
          
          // Calcular completitud del perfil
          const requiredFields = ['firstName', 'lastName', 'email', 'diabetesType', 'gender'];
          const optionalFields = ['age', 'weight', 'height', 'phone', 'address', 'photoURL'];
          
          let completedRequired = 0;
          let completedOptional = 0;
          
          requiredFields.forEach(field => {
            if (userData[field]) completedRequired++;
          });
          
          optionalFields.forEach(field => {
            if (userData[field]) completedOptional++;
          });
          
          const completionPercentage = Math.round(
            ((completedRequired / requiredFields.length) * 0.7 + 
             (completedOptional / optionalFields.length) * 0.3) * 100
          );
          
          setProfileCompletion(completionPercentage);
        }
      } catch (error) {
        console.error("Error fetching engagement data:", error);
      }
    };
    
    if (userId) {
      fetchEngagementData();
    }
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center mb-3">
        <BarChart2 className="w-5 h-5 text-purple-500 mr-2" />
        <h3 className="text-lg font-semibold">Tu Actividad</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="text-sm text-gray-600">Último inicio de sesión</p>
            <p className="font-medium">{lastLogin || 'Hoy'}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <div>
            <p className="text-sm text-gray-600">Días consecutivos</p>
            <p className="font-medium">{consecutiveDays} días</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-600">Completitud del perfil</p>
            <p className="text-sm font-medium">{profileCompletion}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          {profileCompletion < 100 && (
            <p className="text-xs text-gray-500 mt-1">
              Completa tu perfil para obtener recomendaciones más precisas
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AppEngagement;