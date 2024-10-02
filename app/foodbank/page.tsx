"use client";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { database } from "../firebase/config";
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
}

const FoodDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodData, setFoodData] = useState<FoodItem[]>([]);
  const [gramAmount, setGramAmount] = useState(100);
  const [sugarAmount, setSugarAmount] = useState(0);
  const [glycemicLoad, setGlycemicLoad] = useState(0);

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

  const filteredFoodData = foodData.filter((item) =>
    item.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
  };
  const calculateSugar = (food: FoodItem) => {
    const totalCarbs = food.CarbohidratosNetos;
    const sugarContent = (gramAmount / 100) * totalCarbs;
    setSugarAmount(sugarContent);
  };

  const calculateGlycemicLoad = (food: FoodItem) => {
    const glycemicIndex = 50; // Puedes ajustar el valor del índice glucémico
    const glycemicLoadValue =
      (glycemicIndex * food.CarbohidratosNetos * gramAmount) / 100;
    setGlycemicLoad(glycemicLoadValue);
  };

  const handleGramAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setGramAmount(value);
    if (selectedFood) {
      calculateSugar(selectedFood);
      calculateGlycemicLoad(selectedFood);
    }
  };
  return (
    <section className="flex flex-col items-center p-10 bg-white min-h-screen text-gray-90">
      {/* Título */}
      <div className="relative">
        <Image
          src="/nutricion.svg"
          alt="camp"
          width={50}
          height={50}
          className="absolute left-[-15px] top-2 w-5 lg:w-[50px] xs:w-12"
        />
        <h1 className="bold-20 lg:bold-32 m-5 ml-10 capitalize text-green-50 ">
          {" "}
          Tabla Nutricional de Alimentos
        </h1>
      </div>

      {/* Barra de búsqueda */}
      <div className="w-full max-w-5xl m-4">
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-4 mb-4 text-lg border border-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-50"
        />
      </div>
      <div className="flex gap-4">
        {/* Lista de alimentos */}
        <div className="w-full max-w-lg overflow-y-auto h-72 bg-white border border-gray-30 rounded-lg shadow-lg p-4 mb-4">
          <ul className="space-y-3">
            {filteredFoodData.map((food) => (
              <li
                key={food.Codigo}
                onClick={() => handleFoodClick(food)}
                className="cursor-pointer hover:bg-green-50 hover:text-white p-3 rounded-lg transition-colors duration-200"
              >
                {food.Nombre}
              </li>
            ))}
          </ul>
        </div>

        {/* Información Nutricional */}
        <div className="w-full max-w-lg bg-white border border-gray-30 rounded-lg shadow-lg p-6">
          {selectedFood ? (
            <div className="grid grid-cols-1 gap-4">
              <h2 className="text-2xl font-semibold text-green-50">
                {selectedFood.Nombre}
              </h2>
              <div className="flex flex-col space-y-2">
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
                  <strong>Vitamina B6:</strong> {selectedFood.VitaminaB6} mg
                </p>
                <p>
                  <strong>Vitamina B12:</strong> {selectedFood.VitaminaB12} mcg
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-50 text-center">
              Selecciona un alimento para ver la información nutricional.
            </p>
          )}
        </div>
      </div>

     
    </section>
  );
};

export default FoodDashboard;
