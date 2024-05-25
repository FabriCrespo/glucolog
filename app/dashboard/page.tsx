import Image from "next/image";
import Button from "@/components/Button";
export default function dashboard() {
  return (
    <section className="flex justify-center h-screen">
      <div className="bg-green-200 mt-10 w-11/12 h-[200%] border rounded-2xl  items-center shadow-lg">
        <div className="h-auto flex ">
          <div className="bg-white lg:w-1/3  xl:w-1/3 xs:w-11/12  h-2/5  ml-4 mt-4 border rounded-lg ">
            <div className="relative">
              <Image
                src="/registro.svg"
                alt="camp"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12"
              />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
                Registrar glucosa{" "}
              </h1>
            </div>

            <div className="flex flex-col gap-5 mt-2 ml-10 mr-10">
              <p className="italic">
                Por favor, ingrese sus datos de medida de glucosa más cercanos
                en miligramos (mg).
              </p>
              <div>
                <input
                  type="number"
                  className="w-5/6 h-10 border border-green-50 rounded-md text-center"
                ></input>
                <label className="ml-2 font-bold">mg/dl</label>
              </div>
              <button
                className="w-full h-10 mb-5 font-semibold bg-green-700 rounded-lg text-white hover:bg-green-800  "
                type="submit"
                value="Submit"
              >
                Registrar
              </button>
            </div>
          </div>
          <div className="bg-white w-[63%] h-50 mt-4 ml-3 border rounded-2xl shadow-sm">
            <div className="relative ">
              <Image
                src="/historial.svg"
                alt="historial"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12"
              />
              <h1 className="bold-20 lg:bold-32 mt-5 ml-12 capitalize">
                Historial de Registros{" "}
              </h1>
              <div className="bg-green-200 w-5/6 h-40 ml-14 mt-2 rounded-lg shadow-lg overflow-hidden">
      <div className="h-full overflow-y-auto">
        <table className="w-full table-fixed border border-green-600">
          <thead className="bg-green-600 text-white uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2 border-b border-green-600">Fecha</th>
              <th className="px-4 py-2 border-b border-green-600">Nivel de Glucosa</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white even:bg-green-100 hover:bg-green-200">
              <td className="px-4 py-2 border-b border-green-600">04/06/2002</td>
              <td className="px-4 py-2 border-b border-green-600">35.26</td>
            </tr>
            {/* Agrega más filas aquí según sea necesario */}
          </tbody>
        </table>
      </div>
    </div>
            </div>
          </div>
        </div>
        <div className="bg-white mb-10  m-4 rounded-2xl border  h-[26%] w-[98%] shadow-lg ">
          <div className="relative">
          <Image
                src="/predictions.svg"
                alt="search"
                width={50}
                height={50}
                className="absolute left-[-5px] top-[-28px] w-5 lg:w-[50px] xs:w-12"
              />
            <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
              Predicciones{" "}
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
