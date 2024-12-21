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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center p-10 bg-white min-h-screen text-gray-900">
      {/* Título */}
      <div className="relative mb-6">
        <Image
          src="/nutricion.svg"
          alt="camp"
          width={50}
          height={50}
          className="absolute left-[-20px] top-[-15] w-8 lg:w-[50px]"
        />
        <h1 className="text-2xl lg:text-4xl font-bold ml-10 capitalize text-green-600">
          Tabla Nutricional de Alimentos
        </h1>
      </div>

      {/* Verificación de Correo Electrónico */}
      {!isEmailVerified && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Atención: </strong>
          <span className="block sm:inline">Por favor, verifica tu correo electrónico para acceder a esta sección.</span>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full lg:w-2/3 p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          disabled={!isEmailVerified}
        />
        <div className="flex items-center space-x-3 lg:w-1/3">
          <input
            type="checkbox"
            checked={showWithGlycemicIndex}
            onChange={handleCheckboxChange}
            className="w-5 h-5"
            disabled={!isEmailVerified}
          />
          <label className="text-lg text-gray-700">
            Mostrar solo con Índice Glucémico
          </label>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de alimentos */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 overflow-y-auto h-[600px]">
          {filteredFoodData.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No se encontraron alimentos</p>
          ) : (
            <ul className="space-y-3">
              {filteredFoodData.map((food) => (
                <li
                  key={food.Codigo}
                  onClick={() => handleFoodClick(food)}
                  className={`cursor-pointer hover:bg-green-600 hover:text-white p-3 rounded-lg transition-colors duration-200 ${
                    !isEmailVerified ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  style={{ pointerEvents: isEmailVerified ? "auto" : "none" }}
                >
                  <div className="flex items-center gap-2">
                    {food.IndiceGlucemico && (
                      <div 
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          food.IndiceGlucemico < 55 ? 'bg-green-500' :
                          food.IndiceGlucemico <= 69 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        title={`IG: ${food.IndiceGlucemico}`}
                      />
                    )}
                    <span className="flex-1">{food.Nombre}</span>
                    {food.IndiceGlucemico && (
                      <span className="text-sm text-gray-500 group-hover:text-white">
                        IG: {food.IndiceGlucemico}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Información Nutricional */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
          {selectedFood ? (
            <div className="grid grid-cols-1 gap-4">
              <h2 className="text-2xl font-semibold text-green-600">
                {selectedFood.Nombre}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p>
                  <strong>Agua:</strong> {selectedFood.Agua.toFixed(1)} %
                </p>
                <p>
                  <strong>Calorías:</strong> {selectedFood.Calorias.toFixed(1)} kcal
                </p>
                <p>
                  <strong>Proteína:</strong> {selectedFood.Proteina.toFixed(1)} g
                </p>
                <p>
                  <strong>Grasa:</strong> {selectedFood.Grasa.toFixed(1)} g
                </p>
                <p>
                  <strong>Carbohidratos:</strong> {selectedFood.Carbohidratos.toFixed(1)} g
                </p>
                <p>
                  <strong>Fibra:</strong> {selectedFood.Fibra.toFixed(1)} g
                </p>
                <p>
                  <strong>Calcio:</strong> {selectedFood.Calcio.toFixed(1)} mg
                </p>
                <p>
                  <strong>Potasio:</strong> {selectedFood.Potasio.toFixed(1)} mg
                </p>
                <p>
                  <strong>Zinc:</strong> {selectedFood.Zinc.toFixed(2)} mg
                </p>
                <p>
                  <strong>Magnesio:</strong> {selectedFood.Magnesio.toFixed(1)} mg
                </p>
                <p>
                  <strong>Índice Glucémico:</strong>{" "}
                  {selectedFood.IndiceGlucemico?.toFixed(1) ?? "No disponible"}
                </p>
              </div>

              {/* Calculo de Carga Glucémica */}
              {selectedFood.IndiceGlucemico && (
                <div className="flex flex-col mt-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="portionSize" className="text-sm text-gray-600">
                      Tamaño de porción (g)
                    </label>
                    <input
                      id="portionSize"
                      type="number"
                      value={portionSize}
                      onChange={(e) => setPortionSize(Math.max(0, Number(e.target.value)))}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Tamaño de porción (g)"
                      min="0"
                      disabled={!isEmailVerified}
                    />
                  </div>
                  <button
                    onClick={calculateGlycemicLoad}
                    className="mt-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isEmailVerified || portionSize <= 0}
                  >
                    Calcular Carga Glucémica
                  </button>
                  {glycemicLoad && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-800">
                        Carga Glucémica: {glycemicLoad.value.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600">
                        Clasificación: {glycemicLoad.category}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">
                Selecciona un alimento para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Clasificación */}
      {glycemicLoad && isVisible && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
            isVisible ? "animate-fadeIn" : "animate-fadeOut"
          }`}
        >
          <div
            className={`bg-white p-8 rounded-lg shadow-lg text-center transform transition-transform ${
              isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <h3 className="text-2xl font-bold text-green-600">
              Clasificación: {glycemicLoad.category}
            </h3>
          </div>
        </div>
      )}
    </section>
  );
};

export default FoodDashboard;
