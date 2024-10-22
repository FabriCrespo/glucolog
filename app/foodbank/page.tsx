"use client";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { auth, database } from "../firebase/config"; // Asegúrate de importar auth
import Image from "next/image";

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

const FoodDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [portionSize, setPortionSize] = useState<number>(100);
  const [glycemicLoad, setGlycemicLoad] = useState<number | null>(null);
  const [showWithGlycemicIndex, setShowWithGlycemicIndex] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false); // Estado para la verificación del correo

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;

      if (user) {
        // Verificar el estado del correo electrónico
        await user.reload(); // Recargar el usuario para obtener la información actualizada
        setIsEmailVerified(user.emailVerified); // Actualizar el estado de verificación

        const foodRef = ref(
          database,
          "/1rmN4Dh2X41q4VeLns1-hU4-RcZ8iYu24dlAjT7mCRh4/AlimentosDB"
        );
        const snapshot = await get(foodRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const foodItems: FoodItem[] = Object.keys(data).map((key) => ({
            Codigo: key,
            Nombre: data[key].Nombre,
            Agua: parseFloat(data[key]["Agua (%)"]),
            Calorias: parseFloat(data[key].Calorias),
            Proteina: parseFloat(data[key]["Proteina (g)"]),
            Grasa: parseFloat(data[key]["Grasa Total (g)"]),
            Carbohidratos: parseFloat(data[key]["Carbohidratos (g)"]),
            Fibra: parseFloat(data[key]["Fibra Dietética (g)"]),
            Calcio: parseFloat(data[key]["Calcio (mg)"]),
            Potasio: parseFloat(data[key]["Potasio (mg)"]),
            Zinc: parseFloat(data[key]["Zinc (mg)"]),
            Magnesio: parseFloat(data[key]["Magnesio (mg)"]),
            VitaminaB6: parseFloat(data[key]["Vitamina B6 (mg)"]),
            VitaminaB12: parseFloat(data[key]["Vitamina B12 (mcg)"]),
            AcidoFolico: parseFloat(data[key]["Acido Folico (mcg)"]),
            FolatoEquivFD: parseFloat(data[key]["Folato Equiv. FD"]),
            FraccionComestible: parseFloat(data[key]["Fraccion Comestible (%)"]),
            Categoria: data[key]["Categoría"],
            CarbohidratosNetos: parseFloat(data[key]["Carbohidratos Netos"]),
            ClasificacionCarbohidratos: data[key]["Clasificación Carbohidratos"],
            IndiceGlucemico: data[key].IndiceGlucemico || null,
            GramHCO: data[key].GramHCO || null,
          }));
          setFoodData(foodItems);
        }
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = () => {
    setShowWithGlycemicIndex(!showWithGlycemicIndex);
  };

  const filteredFoodData = foodData.filter((item) => {
    const matchesSearch = item.Nombre.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchesGlycemicIndex = showWithGlycemicIndex
      ? item.IndiceGlucemico !== null
      : true;
    return matchesSearch && matchesGlycemicIndex;
  });

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setGlycemicLoad(null);
  };

  const calculateGlycemicLoad = () => {
    if (
      selectedFood &&
      selectedFood.IndiceGlucemico &&
      selectedFood.GramHCO &&
      portionSize
    ) {
      const glycemicLoad =
        (selectedFood.IndiceGlucemico *
          (selectedFood.GramHCO / 100) *
          portionSize) /
        100;
      setGlycemicLoad(glycemicLoad);
    }
  };

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
        <p className="text-red-500 mb-4">
          Por favor, verifica tu correo electrónico para acceder a esta sección.
        </p>
      )}

      {/* Barra de búsqueda */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full lg:w-2/3 p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          disabled={!isEmailVerified} // Deshabilitar si no está verificado
        />
        {/* Checkbox para filtrar por índice glucémico */}
        <div className="flex items-center space-x-3 lg:w-1/3">
          <input
            type="checkbox"
            checked={showWithGlycemicIndex}
            onChange={handleCheckboxChange}
            className="w-5 h-5"
            disabled={!isEmailVerified} // Deshabilitar si no está verificado
          />
          <label className="text-lg text-gray-700">
            Mostrar solo con Índice Glucémico
          </label>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de alimentos */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 overflow-y-auto h-96">
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
                {food.Nombre}
              </li>
            ))}
          </ul>
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
                  <strong>Agua:</strong> {selectedFood.Agua} %
                </p>
                <p>
                  <strong>Calorías:</strong> {selectedFood.Calorias} kcal
                </p>
                <p>
                  <strong>Proteína:</strong> {selectedFood.Proteina} g
                </p>
                <p>
                  <strong>Grasa:</strong> {selectedFood.Grasa} g
                </p>
                <p>
                  <strong>Carbohidratos:</strong> {selectedFood.Carbohidratos} g
                </p>
                <p>
                  <strong>Fibra:</strong> {selectedFood.Fibra} g
                </p>
                <p>
                  <strong>Calcio:</strong> {selectedFood.Calcio} mg
                </p>
                <p>
                  <strong>Potasio:</strong> {selectedFood.Potasio} mg
                </p>
                <p>
                  <strong>Zinc:</strong> {selectedFood.Zinc} mg
                </p>
                <p>
                  <strong>Magnesio:</strong> {selectedFood.Magnesio} mg
                </p>
                <p>
                  <strong>Índice Glucémico:</strong>{" "}
                  {selectedFood.IndiceGlucemico ?? "No disponible"}
                </p>
              </div>

              {/* Calculo de Carga Glucémica */}
              {selectedFood.IndiceGlucemico && (
                <div className="flex flex-col mt-4">
                  <input
                    type="number"
                    value={portionSize}
                    onChange={(e) => setPortionSize(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded"
                    placeholder="Tamaño de porción (g)"
                    min={100}
                    disabled={!isEmailVerified} 
                  />
                  <button
                    onClick={calculateGlycemicLoad}
                    className="mt-2 bg-green-600 text-white py-2 rounded"
                    disabled={!isEmailVerified} 
                  >
                    Calcular Carga Glucémica
                  </button>
                  {glycemicLoad !== null && (
                    <p className="mt-2 text-lg font-semibold">
                      Carga Glucémica: {glycemicLoad.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-lg text-gray-700">Selecciona un alimento para ver sus detalles.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoodDashboard;
