import React, { useState, useEffect } from 'react';
import { NutritionalRecommendation } from '@/types/food';
import { motion, AnimatePresence } from 'framer-motion';

interface NutrientRecommendationsProps {
  recommendations: NutritionalRecommendation[];
  selectedFood: any;
}

const NutrientRecommendations = ({ recommendations, selectedFood }: NutrientRecommendationsProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Reset expanded state when food changes
    setExpandedIndex(null);
    
    // Show confetti animation when we have positive recommendations
    if (recommendations.filter(rec => rec.type === 'tip').length > 0) {      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedFood, recommendations]);

  if (!selectedFood || recommendations.length === 0) return null;

  const getEmoji = (type: string) => {
    switch (type) {
      case 'complement': return '🔄';
      case 'caution': return '⚠️';
      case 'positive': return '✨';
      default: return 'ℹ️';
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'complement': return 'Complementa con';
      case 'caution': return 'Ten precaución';
      case 'positive': return '¡Excelente elección!';
      default: return 'Información';
    }
  };

  const getAnimation = (type: string) => {
    switch (type) {
      case 'complement': return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } };
      case 'caution': return { rotate: [-1, 1, -1], transition: { repeat: Infinity, duration: 0.5 } };
      case 'positive': return { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } };
      default: return {};
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 relative"
    >
      {/* Confetti effect for positive recommendations */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                top: "-10%", 
                left: `${Math.random() * 100}%`,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                top: "100%", 
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: 2 + Math.random() * 3,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: [
                  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72AA'
                ][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl border border-green-100 p-6 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-600 text-white p-3 rounded-full shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">
              Recomendaciones Personalizadas
            </h3>
            <div className="ml-auto flex items-center bg-green-100 px-3 py-1 rounded-full text-sm font-medium text-green-800">
              {recommendations.length} consejos
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {recommendations.map((rec, index) => (
                <motion.div 
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300
                    ${rec.type === 'complement' ? 'bg-blue-50 border border-blue-200' :
                      rec.type === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-green-50 border border-green-200'}`}
                >
                  <div 
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={getAnimation(rec.type)}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl
                          ${rec.type === 'complement' ? 'bg-blue-100 text-blue-600' :
                            rec.type === 'caution' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'}`}
                      >
                        {getEmoji(rec.type)}
                      </motion.div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium
                          ${rec.type === 'complement' ? 'text-blue-700' :
                            rec.type === 'caution' ? 'text-yellow-700' :
                            'text-green-700'}`}
                        >
                          {getTitle(rec.type)}
                        </h4>
                        <p className={`text-sm mt-1
                          ${rec.type === 'complement' ? 'text-blue-600' :
                            rec.type === 'caution' ? 'text-yellow-600' :
                            'text-green-600'}`}
                        >
                          {rec.message}
                        </p>
                      </div>
                      
                      <div className={`
                        ${rec.type === 'complement' ? 'text-blue-500' :
                          rec.type === 'caution' ? 'text-yellow-500' :
                          'text-green-500'}`}
                      >
                        <svg 
                          className={`w-5 h-5 transform transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Expanded content */}
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-dashed"
                        >
                          <div className={`p-3 rounded-lg text-sm
                            ${rec.type === 'complement' ? 'bg-blue-100/50 text-blue-800' :
                              rec.type === 'caution' ? 'bg-yellow-100/50 text-yellow-800' :
                              'bg-green-100/50 text-green-800'}`}
                          >
                            <p className="mb-2 font-medium">¿Por qué es importante?</p>
                            <p>
                              {rec.type === 'complement' 
                                ? 'Combinar alimentos de manera inteligente puede mejorar la absorción de nutrientes y equilibrar tu dieta.' 
                                : rec.type === 'caution'
                                  ? 'Algunos alimentos pueden afectar tus niveles de glucosa o interactuar con medicamentos. Es importante estar informado.'
                                  : 'Este alimento tiene propiedades nutricionales que benefician especialmente a personas con diabetes.'}
                            </p>
                            
                            <div className="flex justify-end mt-2">
                              <button className={`text-xs font-medium px-3 py-1 rounded-full
                                ${rec.type === 'complement' ? 'bg-blue-600 text-white' :
                                  rec.type === 'caution' ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'}`}
                              >
                                Más información
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Interactive tip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex items-center justify-center"
          >
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Haz clic en una recomendación para más detalles</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NutrientRecommendations;
