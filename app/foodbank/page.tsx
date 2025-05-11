"use client";
import { useEffect, useState, useMemo } from "react";
import { get, ref, DatabaseReference } from "firebase/database";
import { auth, database } from "../firebase/config";
import Image from "next/image";
import "./animations.css";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/foodbank/SearchBar";
import FoodList from "@/components/foodbank/FoodList";
import FoodDetails from "@/components/foodbank/FoodDetails";
import MicronutrientBalance from "@/components/foodbank/MicronutrientBalance";
import NutrientDensityCalculator from "@/components/foodbank/NutrientDensityCalculator";
import { FoodItem, GlycemicLoadInfo, NutrientDensity, MicronutrientStatus, NutritionalRecommendation } from "@/types/food";
import NutrientRecommendations from "@/components/foodbank/NutrientRecommendations";

const FoodDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [glycemicLoad, setGlycemicLoad] = useState<GlycemicLoadInfo | null>(null);
  const [showWithGlycemicIndex, setShowWithGlycemicIndex] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nutrientDensity, setNutrientDensity] = useState<NutrientDensity | null>(null);
  const [micronutrientStatus, setMicronutrientStatus] = useState<MicronutrientStatus | null>(null);
  const [recommendations, setRecommendations] = useState<NutritionalRecommendation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = auth.currentUser;

        if (!user) {
          throw new Error("Usuario no autenticado");
        }

        await user.reload();
        setIsEmailVerified(user.emailVerified);

        const foodRef: DatabaseReference = ref(
          database,
          "/1rmN4Dh2X41q4VeLns1-hU4-RcZ8iYu24dlAjT7mCRh4/AlimentosDB"
        );
        const snapshot = await get(foodRef);

        if (!snapshot.exists()) {
          throw new Error("No se encontraron datos de alimentos");
        }

        const data = snapshot.val();
        const foodItems: FoodItem[] = Object.keys(data).map((key) => ({
          Codigo: key,
          Nombre: data[key].Nombre,
          Agua: parseFloat(data[key]["Agua (%)"]) || 0,
          Calorias: parseFloat(data[key].Calorias) || 0,
          Proteina: parseFloat(data[key]["Proteina (g)"]) || 0,
          Grasa: parseFloat(data[key]["Grasa Total (g)"]) || 0,
          Carbohidratos: parseFloat(data[key]["Carbohidratos (g)"]) || 0,
          Fibra: parseFloat(data[key]["Fibra Dietética (g)"]) || 0,
          Calcio: parseFloat(data[key]["Calcio (mg)"]) || 0,
          Potasio: parseFloat(data[key]["Potasio (mg)"]) || 0,
          Zinc: parseFloat(data[key]["Zinc (mg)"]) || 0,
          Magnesio: parseFloat(data[key]["Magnesio (mg)"]) || 0,
          VitaminaB6: parseFloat(data[key]["Vitamina B6 (mg)"]) || 0,
          VitaminaB12: parseFloat(data[key]["Vitamina B12 (mcg)"]) || 0,
          AcidoFolico: parseFloat(data[key]["Acido Folico (mcg)"]) || 0,
          FolatoEquivFD: parseFloat(data[key]["Folato Equiv. FD"]) || 0,
          FraccionComestible: parseFloat(data[key]["Fraccion Comestible (%)"]) || 0,
          Categoria: data[key]["Categoría"] || "",
          CarbohidratosNetos: parseFloat(data[key]["Carbohidratos Netos"]) || 0,
          ClasificacionCarbohidratos: data[key]["Clasificación Carbohidratos"] || "",
          IndiceGlucemico: data[key].IndiceGlucemico || null,
          GramHCO: data[key].GramHCO || null,
        }));
        setFoodData(foodItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize filtered food data
  const filteredFoodData = useMemo(() => {
    return foodData.filter((item) => {
      const matchesSearch = item.Nombre.toLowerCase().includes(
        searchTerm.toLowerCase()
      );
      const matchesGlycemicIndex = showWithGlycemicIndex
        ? item.IndiceGlucemico !== null
        : true;
      return matchesSearch && matchesGlycemicIndex;
    });
  }, [foodData, searchTerm, showWithGlycemicIndex]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = () => {
    setShowWithGlycemicIndex(!showWithGlycemicIndex);
  };

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setGlycemicLoad(null);
    setNutrientDensity(calculateNutrientDensity(food));
    setMicronutrientStatus(calculateMicronutrientStatus(food));
    setRecommendations(generateRecommendations(food));
  };

  const calculateGlycemicLoad = () => {
    if (
      selectedFood?.IndiceGlucemico &&
      selectedFood?.GramHCO &&
      portionSize > 0
    ) {
      const value =
        (selectedFood.IndiceGlucemico *
          (selectedFood.GramHCO / 100) *
          portionSize) /
        100;

      const category = value <= 10 ? 'Baja' : value <= 19 ? 'Media' : 'Alta';

      setGlycemicLoad({ value, category });
      setIsVisible(true); // Aseguramos que el modal se muestre

      // Auto-hide the modal after 5 seconds (aumentado de 2 a 5 segundos para mejor lectura)
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  };

  // Función para calcular el estado de los micronutrientes
  const calculateMicronutrientStatus = (food: FoodItem): MicronutrientStatus => {
    const getMicronutrientStatus = (value: number, lowThreshold: number, highThreshold: number) => {
      if (value < lowThreshold) return 'low';
      if (value > highThreshold) return 'high';
      return 'good';
    };

    return {
      magnesium: {
        value: food.Magnesio,
        status: getMicronutrientStatus(food.Magnesio, 30, 400)
      },
      zinc: {
        value: food.Zinc,
        status: getMicronutrientStatus(food.Zinc, 2, 15)
      },
      calcium: {
        value: food.Calcio,
        status: getMicronutrientStatus(food.Calcio, 100, 1000)
      },
      potassium: {
        value: food.Potasio,
        status: getMicronutrientStatus(food.Potasio, 300, 3500)
      }
    };
  };

  // Función para calcular la densidad nutricional
  const calculateNutrientDensity = (food: FoodItem): NutrientDensity => {
    const caloriesPer100g = food.Calorias;
    const proteinDensity = (food.Proteina * 4) / caloriesPer100g * 100;
    const fiberDensity = (food.Fibra * 2) / caloriesPer100g * 100;
    const mineralDensity = (food.Magnesio / 400 + food.Zinc / 15 + food.Calcio / 1000 + food.Potasio / 3500) * 100;
    const vitaminDensity = (food.VitaminaB6 / 2 + food.VitaminaB12 / 6 + food.AcidoFolico / 400) * 100;

    return {
      caloriesPer100g,
      proteinDensity,
      fiberDensity,
      mineralDensity,
      vitaminDensity
    };
  };

  // Función para generar recomendaciones basadas en el alimento seleccionado
  const generateRecommendations = (food: FoodItem): NutritionalRecommendation[] => {
    const recommendations: NutritionalRecommendation[] = [];

    // Recomendaciones basadas en proteínas
    if (food.Proteina < 5) {
      recommendations.push({
        type: 'complement',
        message: `Para complementar el bajo contenido proteico, combina con alimentos ricos en proteínas como huevos, pescado o legumbres.`
      });
    }

    // Recomendaciones basadas en el índice glucémico
    if (food.IndiceGlucemico && food.IndiceGlucemico > 70) {
      recommendations.push({
        type: 'caution',
        message: `Al tener un índice glucémico alto, combina con fibra o proteínas para ralentizar la absorción de azúcar. Ideal con verduras o proteínas magras.`
      });
    }

    // Recomendaciones basadas en minerales
    if (food.Calcio < 100) {
      recommendations.push({
        type: 'complement',
        message: `Para mejorar la absorción de nutrientes, combina con alimentos ricos en calcio como productos lácteos o verduras de hoja verde.`
      });
    }

    // Recomendaciones basadas en la fibra
    if (food.Fibra > 5) {
      recommendations.push({
        type: 'tip',
        message: `Rico en fibra. Para aprovechar mejor sus beneficios, asegúrate de mantener una buena hidratación.`
      });
    }

    return recommendations;
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="flex justify-center mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center bg-green-50 px-8 py-4 rounded-2xl shadow-md"
        >
          <div className="absolute -left-4 -top-4 bg-white p-3 rounded-full shadow-lg">
            <Image
              src="/nutricion.svg"
              alt="nutrición"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent text-white ml-8">
            Tabla Nutricional de Alimentos
          </h1>
        </motion.div>
      </div>

      {/* Alerta de Verificación */}
      {!isEmailVerified && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700">Por favor, verifica tu correo electrónico para acceder a esta sección.</p>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <SearchBar 
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        showWithGlycemicIndex={showWithGlycemicIndex}
        handleCheckboxChange={handleCheckboxChange}
        isEmailVerified={isEmailVerified}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de alimentos */}
        <FoodList 
          filteredFoodData={filteredFoodData}
          selectedFood={selectedFood}
          handleFoodClick={handleFoodClick}
          isEmailVerified={isEmailVerified}
        />

        {/* Información Nutricional */}
        <FoodDetails
          selectedFood={selectedFood}
          portionSize={portionSize}
          setPortionSize={setPortionSize}
          glycemicLoad={glycemicLoad}
          calculateGlycemicLoad={calculateGlycemicLoad}
          isEmailVerified={isEmailVerified}
        />
      </div>

      {/* Nuevas secciones de análisis nutricional */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance de Micronutrientes */}
        <MicronutrientBalance micronutrientStatus={micronutrientStatus} />

        {/* Calculadora de Densidad Nutricional */}
        <NutrientDensityCalculator nutrientDensity={nutrientDensity} />
      </div>

      {/* Componente de Recomendaciones Nutricionales */}
      <NutrientRecommendations 
        recommendations={recommendations} 
        selectedFood={selectedFood} 
      />

      {/* Modal de Clasificación Glucémica */}
      <AnimatePresence>
        {glycemicLoad && isVisible && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-green-100 overflow-hidden relative"
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-50 rounded-full"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-50 rounded-full"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Carga Glucémica</h3>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white
                      ${glycemicLoad.category === 'Baja' ? 'bg-green-500' :
                        glycemicLoad.category === 'Media' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    >
                      {glycemicLoad.category === 'Baja' ? '✓' : 
                       glycemicLoad.category === 'Media' ? '!' : '⚠'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">
                        {glycemicLoad.value.toFixed(1)}
                      </h4>
                      <p className={`text-sm font-medium
                        ${glycemicLoad.category === 'Baja' ? 'text-green-600' :
                          glycemicLoad.category === 'Media' ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {glycemicLoad.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full
                        ${glycemicLoad.category === 'Baja' ? 'bg-green-500' :
                          glycemicLoad.category === 'Media' ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((glycemicLoad.value / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>10</span>
                    <span>20+</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    {glycemicLoad.category === 'Baja' 
                      ? 'Excelente elección. Este alimento tiene un impacto mínimo en tus niveles de glucosa.' 
                      : glycemicLoad.category === 'Media'
                        ? 'Moderación recomendada. Este alimento tiene un impacto moderado en tus niveles de glucosa.'
                        : 'Precaución. Este alimento puede causar picos significativos en tus niveles de glucosa.'}
                  </p>
                </div>
                
                <button
                  onClick={() => setIsVisible(false)}
                  className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-medium transition-colors
                    ${glycemicLoad.category === 'Baja' ? 'bg-green-600 hover:bg-green-700' :
                      glycemicLoad.category === 'Media' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FoodDashboard;
