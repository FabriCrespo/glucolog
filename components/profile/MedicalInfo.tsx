import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Info } from 'lucide-react';
import { UserData } from '@/services/userService';

interface MedicalInfoProps {
  userData: UserData;
}

const MedicalInfo = ({ userData }: MedicalInfoProps) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Generar recomendaciones basadas en el tipo de diabetes
    const generateRecommendations = () => {
      const diabetesType = userData.diabetesType || 'No especificado';
      const recs: string[] = [];

      if (diabetesType.toLowerCase().includes('tipo 1')) {
        recs.push('Monitorea tus niveles de glucosa al menos 4 veces al día');
        recs.push('Administra insulina según las indicaciones de tu médico');
        recs.push('Mantén un registro de carbohidratos consumidos');
      } else if (diabetesType.toLowerCase().includes('tipo 2')) {
        recs.push('Mantén un peso saludable y realiza actividad física regularmente');
        recs.push('Limita el consumo de carbohidratos refinados y azúcares');
        recs.push('Toma tus medicamentos orales según lo prescrito');
      } else if (diabetesType.toLowerCase().includes('gestacional')) {
        recs.push('Monitorea tus niveles de glucosa con mayor frecuencia');
        recs.push('Sigue una dieta equilibrada recomendada por tu nutricionista');
        recs.push('Realiza actividad física moderada según lo aprobado por tu médico');
      } else {
        recs.push('Consulta con un especialista para determinar tu tipo específico de diabetes');
        recs.push('Mantén un estilo de vida saludable con alimentación balanceada');
        recs.push('Realiza chequeos médicos regulares');
      }

      setRecommendations(recs);
    };

    generateRecommendations();
  }, [userData.diabetesType]);

  const getDiabetesDescription = () => {
    const type = userData.diabetesType?.toLowerCase() || '';
    
    if (type.includes('tipo 1')) {
      return 'La diabetes tipo 1 es una condición autoinmune donde el páncreas produce poca o ninguna insulina. Requiere inyecciones de insulina diarias.';
    } else if (type.includes('tipo 2')) {
      return 'La diabetes tipo 2 ocurre cuando el cuerpo se vuelve resistente a la insulina o no produce suficiente. Se maneja con dieta, ejercicio y medicamentos.';
    } else if (type.includes('gestacional')) {
      return 'La diabetes gestacional ocurre durante el embarazo y generalmente desaparece después del parto, aunque aumenta el riesgo de desarrollar diabetes tipo 2 en el futuro.';
    }
    return 'La diabetes afecta cómo tu cuerpo procesa la glucosa. Es importante mantener un seguimiento regular con tu médico.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center mb-3">
        <Heart className="w-5 h-5 text-red-500 mr-2" />
        <h3 className="text-lg font-semibold">Información Médica</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600">Tipo de Diabetes</p>
        <p className="text-lg font-medium">{userData.diabetesType || 'No especificado'}</p>
        <p className="text-xs text-gray-500 mt-1">{getDiabetesDescription()}</p>
      </div>
      
      <div className="border-t border-gray-100 pt-3">
        <p className="text-sm font-medium text-gray-600 mb-2">Recomendaciones Personalizadas</p>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
          <p className="text-sm text-gray-600">Próxima medicación: 2:00 PM</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicalInfo;