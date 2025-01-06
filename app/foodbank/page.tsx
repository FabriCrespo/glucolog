"use client";
import { useEffect, useState, useMemo } from "react";
import { get, ref, DatabaseReference } from "firebase/database";
import { auth, database } from "../firebase/config";
import Image from "next/image";
import "./animations.css";

interface FoodItem {
  Codigo: string;
  Nombre: string;
  Agua: number;
  Calorias: number;
  Proteina: number;
  Grasa: number;
  Carbohidratos: number;
  Fibra: number;
  Calcio: number;
  Potasio: number;
  Zinc: number;
  Magnesio: number;
  VitaminaB6: number;
  VitaminaB12: number;
  AcidoFolico: number;
  FolatoEquivFD: number;
  FraccionComestible: number;
  Categoria: string;
  CarbohidratosNetos: number;
  ClasificacionCarbohidratos: string;
  IndiceGlucemico?: number;
  GramHCO?: number;
}

interface GlycemicLoadInfo {
  value: number;
  category: 'Baja' | 'Media' | 'Alta';
}

interface NutrientDensity {
  caloriesPer100g: number;
  proteinDensity: number;
  fiberDensity: number;
  mineralDensity: number;
  vitaminDensity: number;
}

interface MicronutrientStatus {
  magnesium: { value: number; status: 'low' | 'good' | 'high' };
  zinc: { value: number; status: 'low' | 'good' | 'high' };
  calcium: { value: number; status: 'low' | 'good' | 'high' };
  potassium: { value: number; status: 'low' | 'good' | 'high' };
}

interface NutritionalRecommendation {
  type: 'complement' | 'caution' | 'tip';
  message: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700"></div>
  </div>
);

const FoodDashboard = () => {
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
      setIsVisible(true);

      // Auto-hide the modal after 2 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
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
      <div className="flex items-center justify-center mb-10">
        <div className="relative flex items-center">
          <Image
            src="/nutricion.svg"
            alt="nutrición"
            width={50}
            height={50}
            className="absolute -left-6 w-12 h-12"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-green-600 ml-8">
            Tabla Nutricional de Alimentos
          </h1>
        </div>
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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar alimento..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-gray-200 focus:border-green-600 focus:outline-none transition-colors"
                disabled={!isEmailVerified}
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="glycemicIndex"
              checked={showWithGlycemicIndex}
              onChange={handleCheckboxChange}
              className="w-5 h-5 accent-green-600"
              disabled={!isEmailVerified}
            />
            <label htmlFor="glycemicIndex" className="text-gray-700">
              Solo con Índice Glucémico
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de alimentos */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Alimentos</h2>
          </div>
          <div className="h-[600px] overflow-y-auto p-4">
            {filteredFoodData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No se encontraron alimentos</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredFoodData.map((food) => (
                  <li
                    key={food.Codigo}
                    onClick={() => handleFoodClick(food)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedFood?.Codigo === food.Codigo ? 'bg-green-600 text-white' : 'hover:bg-green-50'}
                      ${!isEmailVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ pointerEvents: isEmailVerified ? "auto" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      {food.IndiceGlucemico && (
                        <span className={`w-3 h-3 rounded-full flex-shrink-0
                          ${food.IndiceGlucemico < 55 ? 'bg-green-500' :
                            food.IndiceGlucemico <= 69 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      )}
                      <span className="flex-1 font-medium">{food.Nombre}</span>
                      {food.IndiceGlucemico && (
                        <span className={`text-sm ${selectedFood?.Codigo === food.Codigo ? 'text-white' : 'text-gray-500'}`}>
                          IG: {food.IndiceGlucemico}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Información Nutricional */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200">
          {selectedFood ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-6">{selectedFood.Nombre}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Información Básica</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Calorías', value: selectedFood.Calorias.toFixed(1), unit: 'kcal' },
                      { label: 'Proteína', value: selectedFood.Proteina.toFixed(1), unit: 'g' },
                      { label: 'Grasa', value: selectedFood.Grasa.toFixed(1), unit: 'g' },
                      { label: 'Carbohidratos', value: selectedFood.Carbohidratos.toFixed(1), unit: 'g' },
                      { label: 'Fibra', value: selectedFood.Fibra.toFixed(1), unit: 'g' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.value} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Minerales y Vitaminas</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Calcio', value: selectedFood.Calcio.toFixed(1), unit: 'mg' },
                      { label: 'Potasio', value: selectedFood.Potasio.toFixed(1), unit: 'mg' },
                      { label: 'Zinc', value: selectedFood.Zinc.toFixed(2), unit: 'mg' },
                      { label: 'Magnesio', value: selectedFood.Magnesio.toFixed(1), unit: 'mg' },
                      { label: 'Índice Glucémico', value: selectedFood.IndiceGlucemico?.toFixed(1) ?? 'No disponible', unit: '' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.value} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedFood.IndiceGlucemico && (
                <div className="mt-8 p-6 bg-green-400 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cálculo de Carga Glucémica</h3>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label htmlFor="portionSize" className="block text-sm font-medium text-gray-700 mb-2">
                        Tamaño de porción
                      </label>
                      <div className="relative">
                        <input
                          id="portionSize"
                          type="number"
                          value={portionSize}
                          onChange={(e) => setPortionSize(Math.max(0, Number(e.target.value)))}
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                          min="0"
                          disabled={!isEmailVerified}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">g</span>
                      </div>
                    </div>
                    <button
                      onClick={calculateGlycemicLoad}
                      className="h-12 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isEmailVerified || portionSize <= 0}
                    >
                      Calcular
                    </button>
                  </div>

                  {glycemicLoad && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Carga Glucémica: <span className="text-green-600">{glycemicLoad.value.toFixed(2)}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Clasificación: <span className="font-medium">{glycemicLoad.category}</span>
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full
                          ${glycemicLoad.category === 'Baja' ? 'bg-green-500' :
                            glycemicLoad.category === 'Media' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Selecciona un alimento para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Nuevas secciones de análisis nutricional */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance de Micronutrientes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Balance de Micronutrientes</h3>
          {micronutrientStatus && (
            <div className="space-y-4">
              {Object.entries(micronutrientStatus).map(([nutrient, data]) => (
                <div key={nutrient} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{nutrient}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.value.toFixed(1)}</span>
                    <div className={`px-2 py-1 rounded text-xs font-medium
                      ${data.status === 'good' ? 'bg-green-100 text-green-800' :
                        data.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {data.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculadora de Densidad Nutricional */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Densidad Nutricional</h3>
          {nutrientDensity && (
            <div>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Calorías por 100g</p>
                <p className="text-2xl font-bold text-green-600">
                  {nutrientDensity.caloriesPer100g.toFixed(1)} kcal
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Densidad Proteica', value: nutrientDensity.proteinDensity },
                  { label: 'Densidad de Fibra', value: nutrientDensity.fiberDensity },
                  { label: 'Densidad Mineral', value: nutrientDensity.mineralDensity },
                  { label: 'Densidad Vitamínica', value: nutrientDensity.vitaminDensity }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(item.value, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nueva sección de Recomendaciones Nutricionales */}
      {selectedFood && recommendations.length > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recomendaciones Nutricionales
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg flex items-start gap-3
                    ${rec.type === 'complement' ? 'bg-blue-50 border border-blue-200' :
                      rec.type === 'caution' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-green-50 border border-green-200'}`}
                >
                  <div className={`mt-1 flex-shrink-0
                    ${rec.type === 'complement' ? 'text-blue-500' :
                      rec.type === 'caution' ? 'text-yellow-500' :
                      'text-green-500'}`}
                  >
                    {rec.type === 'complement' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    ) : rec.type === 'caution' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm
                    ${rec.type === 'complement' ? 'text-blue-700' :
                      rec.type === 'caution' ? 'text-yellow-700' :
                      'text-green-700'}`}
                  >
                    {rec.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Clasificación */}
      {glycemicLoad && isVisible && (
        <div className="fixed inset-0 bg-green-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl transform transition-all">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full
                ${glycemicLoad.category === 'Baja' ? 'bg-green-500' :
                  glycemicLoad.category === 'Media' ? 'bg-yellow-500' : 'bg-red-500'}`}
              />
              <h3 className="text-2xl font-bold text-gray-800">
                Carga Glucémica: <span className="text-green-600">{glycemicLoad.category}</span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FoodDashboard;
