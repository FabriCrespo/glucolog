import Image from "next/image";
import Button from "@/components/Button";
export default function dashboard() {
  return (
    <section className="flex justify-center h-screen">
      <div className="bg-green-200 mt-10 mb-10 w-11/12 border rounded-2xl h items-center shadow-lg">
        <div className="bg-white w-1/3 h-2/5 ml-4 mt-4 border rounded-lg">
          <div className="relative">
            <Image
              src="/registro.svg"
              alt="camp"
              width={50}
              height={50}
              className="absolute left-[-5px] top-[-28px]   w-5 lg:w-[50px]"
            />
            <h1 className="bold-20 lg:bold-32 mt-5 ml-10 capitalize">
              Registrar glucosa{" "}
            </h1>
          </div>

          <div className="flex flex-col gap-5 mt-2 ml-10 mr-10">
          <p className="italic">
              Por favor, ingrese sus datos de medida de glucosa más cercanos en
              miligramos (mg).
            </p>
            <div>
            <input type="number" className="w-5/6 h-10 border border-green-50 rounded-md text-center">
            </input>
            <label className="ml-2 font-bold">mg/dl</label>
            </div>
            <button className="w-5/6 h-10 bg-green-400 rounded-lg text-white "  type="submit" value="Submit" >
                Registrar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
