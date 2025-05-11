import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface FoodHabitsProps {
  userId: string;
}

const FoodHabits = ({ userId }: FoodHabitsProps) => {
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState({
    lastMeal: {
      name: 'Ensalada de pollo',
      type: 'almuerzo',
      time: '12:30 PM',
      glucoseImpact: 'bajo'
    },
    frequentFoods: [
      { name: 'Avena', count: 12 },
      { name: 'Pollo a la plancha', count: 8 },
      { name: 'Manzana', count: 7 }
    ],
    highImpactFoods: [
      { name: 'Pan blanco', impact: 'alto' },
      { name: 'Arroz blanco', impact: 'medio-alto' },
      { name: 'Pasta', impact: 'medio-alto' }
    ]
  });

  useEffect(() => {
    // Aquí iría la lógica para obtener los datos reales del usuario
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'desayuno':
        return <Coffee className="w-5 h-5 text-yellow-500" />;
      case 'almuerzo':
        return <Utensils className="w-5 h-5 text-green-500" />;
      case 'cena':
        return <Utensils className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-purple-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'alto':
        return 'text-red-500';
      case 'medio-alto':
        return 'text-orange-500';
      case 'medio':
        return 'text-yellow-500';
      case 'bajo':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
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
        <Utensils className="w-5 h-5 mr-2 text-green-600" />
        Hábitos Alimenticios
      </h3>

      <div className="space-y-6">
        {/* Última comida registrada */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h4 className="text-sm font-medium text-green-800 uppercase tracking-wider mb-2">
            Última Comida Registrada
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-800">{foodData.lastMeal.name}</p>
              <div className="flex items-center mt-1">
                {getMealIcon(foodData.lastMeal.type)}
                <span className="text-sm text-gray-600 ml-1 capitalize">{foodData.lastMeal.type} • {foodData.lastMeal.time}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full ${getImpactColor(foodData.lastMeal.glucoseImpact) === 'text-green-500' ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <span className={`text-sm font-medium ${getImpactColor(foodData.lastMeal.glucoseImpact)}`}>
                Impacto {foodData.lastMeal.glucoseImpact}
              </span>
            </div>
          </div>
        </div>

        {/* Alimentos más frecuentes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
            Alimentos Más Frecuentes
          </h4>
          <div className="space-y-2">
            {foodData.frequentFoods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="font-medium text-gray-800">{food.name}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {food.count} veces
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comidas que más afectan la glucosa */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-red-500" />
            Comidas con Mayor Impacto en Glucosa
          </h4>
          <div className="space-y-2">
            {foodData.highImpactFoods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="font-medium text-gray-800">{food.name}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  food.impact === 'alto' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  Impacto {food.impact}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start text-sm text-gray-600">
            <AlertCircle className="w-4 h-4 mr-1 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p>Considera reducir el consumo de estos alimentos para mantener niveles de glucosa más estables.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodHabits;