"use client";
import { useState } from 'react';
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso');
      router.push('/myprofile'); // Redirige a /myprofile
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Verifique su correo electrónico y contraseña.');
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
          <Button
            type="button"
            onClick={handleEmailLogin} title={'Iniciar Sesión'} variant={'btn_dark_green'}          />
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿No tiene cuenta?{' '}
            <a href="/signup" className="text-blue-500 underline">
              Regístrese
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
