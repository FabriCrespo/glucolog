"use client";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { database } from "../firebase/config";
import Image from "next/image";

// Definir la interfaz para los datos de un alimento
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
}

const FoodDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [gi, setGi] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCarbClassification, setSelectedCarbClassification] =
    useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
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
        }));
        setFoodData(foodItems);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleCarbClassificationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCarbClassification(e.target.value);
  };

  const filteredFoodData = foodData.filter(
    (item) =>
      item.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "" || item.Categoria === selectedCategory) &&
      (selectedCarbClassification === "" ||
        item.ClasificacionCarbohidratos === selectedCarbClassification)
  );

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const calculateGlycemicLoad = () => {
    if (selectedFood && gi > 0 && carbs > 0) {
      const glycemicLoad = (gi * carbs) / 100;
      setResult(glycemicLoad);
    } else {
      setResult(null);
    }
  };

  return (
    <section className="flex flex-col h-screen p-8">
      <div className="flex flex-grow space-x-8">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col w-1/4 max-w-xs space-y-8">
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 mb-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mb-4">
            <label
              htmlFor="category"
              className="block mb-2 text-lg font-medium text-gray-600"
            >
              Categoría
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="11. VERDURAS, HORTALIZAS_nY OTROS VEGETALES">
                Verduras, Hortalizas y Otros Vegetales
              </option>
              <option value="20. ADEREZOS, SALSAS Y SOPAS">
                Aderezos, Salsas y Sopas
              </option>
              <option value="12. FRUTAS Y JUGOS DE FRUTAS">
                Frutas y Jugos de Frutas
              </option>
              <option value="13. CEREALES GRANOS SECOS, HARINAS,\nPASTAS, CEREALES DE DESAYUNO\nY OTRAS HARINAS ">
                Cereales, Granos Secos, Harinas, Pastas, Cereales de Desayuno y
                Otras Harinas
              </option>
              <option value="19. COMIDAS INFANTILES    ">
                Comidas Infantiles
              </option>
              <option value="17. BEBIDAS DIVERSAS">Bebidas Diversas</option>
              <option value="14. GALLETAS, PANES, TORTILLAS\nY SIMILARES ">
                Galletas, Panes, Tortillas y Similares
              </option>
              <option value="01. PRODUCTOS LÁCTEOS Y SIMILARES">
                Productos Lácteos y Similares
              </option>
              <option value="08. MARISCOS Y PESCADOS">
                Mariscos y Pescados
              </option>
              <option value="05. CARNE DE VACUNO ">Carne de Vacuno</option>
              <option value="03. CARNE DE AVES">Carne de Aves</option>
              <option value="18. POSTRES ELABORADOS">Postres Elaborados</option>
              <option value="07. EMBUTIDOS Y SIMILARES">
                Embutidos y Similares
              </option>
              <option value="09. LEGUMINOSAS, GRANOS SECOS\nY DERIVADOS ">
                Leguminosas, Granos Secos y Derivados
              </option>
              <option value="15. AZÚCARES, MIELES, DULCES\nY GOLOSINAS ">
                Azúcares, Mieles, Dulces y Golosinas
              </option>
              <option value="10. NUECES Y SEMILLAS">Nueces y Semillas</option>
              <option value="16. ACEITES Y GRASAS">Aceites y Grasas</option>
              <option value="04. CARNE DE CERDO ">Carne de Cerdo</option>
              <option value="Sin Categoría">Sin Categoría</option>
              <option value="06. CARNE DE ANIMALES DE CAZA ">
                Carne de Animales de Caza
              </option>
              <option value="02. HUEVOS">Huevos</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="carbClassification"
              className="block mb-2 text-lg font-medium text-gray-600"
            >
              Clasificación de Carbohidratos
            </label>
            <select
              id="carbClassification"
              value={selectedCarbClassification}
              onChange={handleCarbClassificationChange}
              className="w-full p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="Alto en Carbohidratos">Alto</option>
              <option value="Moderado en Carbohidratos">Moderado</option>
              <option value="Bajo en Carbohidratos">Bajo</option>
            </select>
          </div>
        </div>

        {/* Información Nutricional */}
        <div className="flex-grow-0 max-w-4xl w-full p-4 border h-[30rem] border-gray-300 rounded-lg shadow-md bg-white overflow-auto">
          {selectedFood ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedFood.Nombre}
                </h2>
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
              </div>
              <div className="space-y-2">
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
                  <strong>Vitamina B6:</strong> {selectedFood.VitaminaB6} mg
                </p>
                <p>
                  <strong>Vitamina B12:</strong> {selectedFood.VitaminaB12} mcg
                </p>
                <p>
                  <strong>Ácido Fólico:</strong> {selectedFood.AcidoFolico} mcg
                </p>
                <p>
                  <strong>Folato Equiv. FD:</strong>{" "}
                  {selectedFood.FolatoEquivFD} mcg
                </p>
                <p>
                  <strong>Fracción Comestible:</strong>{" "}
                  {selectedFood.FraccionComestible} %
                </p>
                <p>
                  <strong>Categoría:</strong> {selectedFood.Categoria}
                </p>
                <p>
                  <strong>Carbohidratos Netos:</strong>{" "}
                  {selectedFood.CarbohidratosNetos} g
                </p>
                <p>
                  <strong>Clasificación Carbohidratos:</strong>{" "}
                  {selectedFood.ClasificacionCarbohidratos}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-500">
              Selecciona un alimento para ver la información nutricional.
            </p>
          )}
        </div>

        {/* Lista de Alimentos */}
        {/* Lista de Alimentos */}
        <div className="w-[70%] max-w-xs border border-gray-300 rounded-lg shadow-md bg-white h-[30rem] overflow-y-auto">
          <ul className="p-4 space-y-2">
            {filteredFoodData.map((food) => (
              <li
                key={food.Codigo}
                onClick={() => handleFoodClick(food)}
                className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
              >
                {food.Nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Calculadora de carga glucémica */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          Calculadora de Carga Glucémica
        </h2>
        <div className="flex space-x-4">
          <input
            type="number"
            placeholder="Índice Glucémico"
            value={gi}
            onChange={(e) => setGi(parseFloat(e.target.value))}
            className="w-1/2 p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Carbohidratos (g)"
            value={carbs}
            onChange={(e) => setCarbs(parseFloat(e.target.value))}
            className="w-1/2 p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={calculateGlycemicLoad}
          className="mt-4 p-2 w-full bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
        >
          Calcular Carga Glucémica
        </button>
        {result !== null && (
          <p className="mt-4 text-lg font-semibold">
            Carga Glucémica: {result.toFixed(2)}
          </p>
        )}
      </div>
    </section>
  );
};

export default FoodDashboard;
