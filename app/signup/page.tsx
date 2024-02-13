import Button from "@/components/Button";
import Image from "next/image";

export default function SignUp() {
  return (
    <section className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/food.svg"
            alt="camp"
            width={50}
            height={50}
            className="w-12 mr-2"
          />
          <h2 className="text-2xl font-bold">Registro</h2>
        </div>
        <div className="flex">
          <input
            className={`block mx-auto mt-4 p-3 w-1/2 mr-2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105`}
            type="text"
            placeholder="Nombre"
          />
          <input
            className={`block mx-auto mt-4 p-3 w-1/2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105`}
            type="text"
            placeholder="Apellido"
          />
        </div>
        <input
          className={`block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105`}
          type="email"
          placeholder="Correo Electrónico"
        />
        <div className="flex">
          <select className="block mx-auto mt-4 p-3 w-1/3 mr-2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105">
            <option disabled selected hidden value="">
              Sexo
            </option>
            <option value="male">M</option>
            <option value="female">F</option>
          </select>
          <select className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105">
            <option disabled selected hidden value="">
              Tipo de Diabetes
            </option>
            <option value="tipo1">Tipo 1</option>
            <option value="tipo2">Tipo 2</option>
            <option value="no">Ninguno</option>
          </select>
        </div>
        <input
          className={`block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105`}
          type="password"
          placeholder="Contraseña"
        />
        <input
          className={`block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105`}
          type="password"
          placeholder="Confirmar Contraseña"
        />
        <div className="mt-6 flex flex-col items-center  w-full">
          <Button type={"button"} title={"Registrarse"} variant={"btn_green"} />

          <Button
            type={"button"}
            title={"Registrarse con Gmail"}
            variant={"btn_google"}
          />
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tiene cuenta?{" "}
            <a href="/login" className="text-blue-500 underline">
              Inicie Sesión
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
