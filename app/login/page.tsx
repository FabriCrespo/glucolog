"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/myprofile');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validaciones mejoradas
    if (!email.trim()) {
      setError("Por favor, ingrese un correo electrónico");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingrese un correo electrónico válido");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Por favor, ingrese una contraseña");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential) {
        setSuccess("¡Inicio de sesión exitoso!");
        
        // Pequeña demora para mostrar el mensaje de éxito
        setTimeout(() => {
          router.push('/myprofile');
        }, 500);
      }
    } catch (error: any) {
      // Mensajes de error más amigables y específicos
      const errorMessages: {[key: string]: string} = {
        "auth/wrong-password": "La contraseña ingresada es incorrecta",
        "auth/user-not-found": "No existe una cuenta con este correo electrónico",
        "auth/invalid-email": "El formato del correo electrónico no es válido",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intente más tarde o restablezca su contraseña",
        "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
        "auth/network-request-failed": "Error de conexión. Verifique su conexión a internet"
      };

      const errorMessage = errorMessages[error.code] || "Error al iniciar sesión. Verifique sus credenciales";
      setError(errorMessage);
      console.error('Error de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Por favor, ingrese su correo electrónico para restablecer la contraseña");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingrese un correo electrónico válido");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Se ha enviado un enlace para restablecer su contraseña. Revise su correo electrónico");
    } catch (error: any) {
      const errorMessages: {[key: string]: string} = {
        "auth/user-not-found": "No existe una cuenta con este correo electrónico",
        "auth/invalid-email": "El formato del correo electrónico no es válido",
        "auth/too-many-requests": "Demasiados intentos. Intente más tarde",
      };

      const errorMessage = errorMessages[error.code] || "Error al enviar el correo de restablecimiento";
      setError(errorMessage);
      console.error('Error al restablecer contraseña:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50/30 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-11/12 max-w-md p-8 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-green-50 p-4 rounded-full mb-4">
            <Image
              src="/food.svg"
              alt="Glucolog"
              width={50}
              height={50}
              className="w-12"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido a Glucolog</h2>
          <p className="text-gray-500 text-sm mt-1">Tu asistente para el control de la diabetes</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</label>
            <div className="relative">
              <input
                id="email"
                className="block w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-green-50 transition-all"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                className="block w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-green-50 transition-all"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <button 
                type="button"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 text-green-700 rounded-lg text-sm"
            >
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-50 hover:bg-green-90 hover:shadow-md'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <div className="w-full flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="px-3 text-sm text-gray-500">o</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <p className="text-center text-sm text-gray-600">
            ¿No tiene cuenta?{' '}
            <a 
              href="/signup" 
              className="font-medium text-green-50 hover:text-green-90 transition-colors"
            >
              Regístrese aquí
            </a>
          </p>
          
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isLoading}
            className="text-sm text-gray-600 hover:text-green-50 transition-colors"
          >
            ¿Olvidó su contraseña?
          </button>
        </div>
      </motion.div>
    </section>
  );
}
