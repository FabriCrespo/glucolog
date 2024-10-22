"use client";
import { useState } from 'react';
import Image from "next/image";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null); // Para el mensaje de restablecimiento
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailLogin = async () => {
    // Validar que el correo y la contraseña no estén vacíos
    if (!email) {
      setError("Por favor, ingrese un correo electrónico.");
      return;
    }

    if (!password) {
      setError("Por favor, ingrese una contraseña.");
      return;
    }

    try {
      // Intentar iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verifica que userCredential no sea null y redirigir al perfil
      if (userCredential) {
        console.log('Inicio de sesión exitoso');
        router.push('/myprofile'); // Redirigir solo si hay inicio de sesión exitoso
      }
    } catch (error: any) {
      // Manejar errores específicos de Firebase
      if (error.code === "auth/wrong-password") {
        setError("Contraseña incorrecta. Por favor, inténtelo de nuevo.");
      } else if (error.code === "auth/user-not-found") {
        setError("No se encontró ninguna cuenta con este correo. Regístrese o verifique el correo ingresado.");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico ingresado no es válido.");
      } else {
        setError("Error al iniciar sesión. Verifique su correo electrónico y contraseña.");
      }

      // Asegurarse de que no se redirija cuando hay un error
      console.log('Error al iniciar sesión:', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Se ha enviado un correo para restablecer su contraseña.'); // Mensaje en español
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      setError('Error al enviar el correo de restablecimiento. Verifique su correo.');
      setResetMessage(null); // Limpiar mensaje de éxito si había
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
          <h2 className="text-2xl font-bold">Inicio de Sesión</h2>
        </div>
        <input
          className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={handleEmailChange}
        />
        <input
          className="block mx-auto mt-4 p-3 w-full border border-green-50 rounded-md shadow-sm transition duration-300 ease-in-out hover:border-green-300 hover:shadow-md hover:scale-105"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={handlePasswordChange}
        />
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <div className="mt-6 flex flex-col items-center w-full">
          <button
            type="button"
            onClick={handleEmailLogin}
            className="bg-green-500 text-white p-3 rounded-md w-full transition duration-300 ease-in-out hover:bg-green-600"
          >
            Iniciar Sesión
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿No tiene cuenta?{' '}
            <a href="/signup" className="text-blue-500 underline">
              Regístrese
            </a>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            <a
              href="#"
              onClick={handleResetPassword}
              className="text-blue-500 underline"
            >
              ¿Olvidó su contraseña?
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
