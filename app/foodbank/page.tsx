import Image from "next/image";

export default function FoodBank() {
  return (
    <section className="flex justify-center h-screen">
      <div className="bg-green-200 mt-10 w-11/12 h-[200%] border rounded-2xl  items-center shadow-lg">
        <div className="h-auto flex ">
          <div className="bg-white lg:w-1/3 xl:w-1/3 xs:w-11/12  h-2/5  ml-4 mt-4 border rounded-lg ">
            <div className="relative">
              <Image
                src="/search.svg"
                alt="search"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12"
              />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
                Buscar Alimentos{" "}
              </h1>
            </div>

            <div className="flex flex-col gap-5 mt-2 ml-10 mr-10">
              <p className="italic">
                Por favor, ingrese el nombre del alimento que desea buscar.
              </p>
              <input
                type="text"
                className="w-full h-10 border border-green-50 rounded-md text-center"
                placeholder="Nombre del alimento"
              />
              <button
                className="w-full h-10 mb-5 font-semibold bg-green-700 rounded-lg text-white hover:bg-green-800"
                type="submit"
                value="Submit"
              >
                Buscar
              </button>
            </div>
          </div>
          <div className="bg-white w-[63%] h-50 mt-4 ml-3 border rounded-2xl shadow-sm">
            <div className="relative">
              <Image
                src="/categories.svg"
                alt="categories"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12"
              />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-12 capitalize">
                Categorías de Alimentos{" "}
              </h1>
            </div>
          </div>
        </div>
        <div className="bg-white mb-10  m-4 rounded-2xl border  h-[26%] w-[98%] shadow-lg ">
          <div className="relative">
            <Image
              src="/food.svg"
              alt="food"
              width={50}
              height={50}
              className="absolute left-[-5px] top-[-38px] w-5 lg:w-[50px] xs:w-12"
            />
            <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
              Detalles del Alimento{" "}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
