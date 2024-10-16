"use client";
import Image from "next/image";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from '@/app/firebase/config';
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Añadir un estado para errores
  const router = useRouter();

  const [createUserWithEmailAndPassword, , error] = useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(email, password);
      
      if (!userCredential) {
        throw new Error("Error en la creación del usuario");
      }

      const user = userCredential.user;

      if (user && user.uid) {
        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          email,
          gender,
          diabetesType
        });
        console.log("Usuario registrado y datos guardados en Firestore");
        
        // Resetear los campos del formulario
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setGender('');
        setDiabetesType('');
        
        // Redirigir al perfil
        router.push('/myprofile');
      } else {
        throw new Error("Usuario no válido.");
      }
    } catch (e) {
      console.error("Error en el registro o Firestore:", e);
      setErrorMessage("Error al registrar el usuario. Por favor, inténtalo de nuevo.");
    }
  };

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
            className="block mx-auto mt-4 p-3 w-1/2 mr-2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="block mx-auto mt-4 p-3 w-1/2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <input
          className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex">
          <select
            className="block mx-auto mt-4 p-3 w-1/3 mr-2 border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option disabled hidden value="">
              Sexo
            </option>
            <option value="male">M</option>
            <option value="female">F</option>
          </select>
          <select
            className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
            value={diabetesType}
            onChange={(e) => setDiabetesType(e.target.value)}
          >
            <option disabled hidden value="">
              Tipo de Diabetes
            </option>
            <option value="tipo1">Tipo 1</option>
            <option value="tipo2">Tipo 2</option>
            <option value="no">Ninguno</option>
          </select>
        </div>
        <input
          className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
          type="password"
          placeholder="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-500">
            {errorMessage}
          </p>
        )}
        <div className="mt-6 flex flex-col items-center w-full">
          <button 
            onClick={handleSignUp}
            className="w-full p-3 bg-green-50 rounded text-white font-bold border-r-2 hover:bg-green-700 transition "
          >
            Registrarse
          </button>
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
};

export default SignUp;
