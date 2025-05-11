"use client";
import Image from "next/image";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from '@/app/firebase/config';
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FirebaseError } from 'firebase/app';
import { sendEmailVerification } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    diabetesType: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const router = useRouter();

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores al cambiar cualquier campo
    setErrorMessage('');
    setDetailedError(null);
  };

  const validateForm = () => {
    // Validar campos vacíos individualmente para mensajes más específicos
    if (!formData.firstName.trim()) {
      setErrorMessage("El campo Nombre es obligatorio");
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setErrorMessage("El campo Apellido es obligatorio");
      return false;
    }
    
    if (!formData.email.trim()) {
      setErrorMessage("El campo Correo Electrónico es obligatorio");
      return false;
    }
    
    if (!formData.gender) {
      setErrorMessage("Por favor, selecciona tu sexo");
      return false;
    }
    
    if (!formData.diabetesType) {
      setErrorMessage("Por favor, selecciona tu tipo de diabetes");
      return false;
    }
    
    if (!formData.password) {
      setErrorMessage("El campo Contraseña es obligatorio");
      return false;
    }
    
    if (!formData.confirmPassword) {
      setErrorMessage("Por favor, confirma tu contraseña");
      return false;
    }
    
    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return false;
    }
    
    // Validación de seguridad de contraseña
    if (formData.password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    // Validación de complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      setErrorMessage("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número");
      return false;
    }
    
    // Validación avanzada de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Por favor, introduce un correo electrónico válido");
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setDetailedError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(formData.email, formData.password);
  
      if (!userCredential) {
        throw new Error("Error en la creación del usuario");
      }
  
      const user = userCredential.user;
  
      if (user && user.uid) {
        try {
          // Guardar datos adicionales en Firestore
          await setDoc(doc(db, "users", user.uid), {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            gender: formData.gender,
            diabetesType: formData.diabetesType,
            createdAt: new Date().toISOString()
          });
        } catch (firestoreError) {
          // Capturar específicamente errores de Firestore
          console.error("Error al guardar datos en Firestore:", firestoreError);
          setDetailedError(`Error al guardar datos de usuario: ${firestoreError instanceof Error ? firestoreError.message : 'Error desconocido'}`);
          throw firestoreError;
        }
  
        try {
          // Enviar correo de verificación
          await sendEmailVerification(user);
        } catch (emailError) {
          // Capturar específicamente errores de envío de email
          console.error("Error al enviar email de verificación:", emailError);
          setDetailedError(`Error al enviar email de verificación: ${emailError instanceof Error ? emailError.message : 'Error desconocido'}`);
          // No lanzamos el error para permitir continuar con el registro
        }
  
        // Resetear el formulario
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          gender: '',
          diabetesType: '',
          password: '',
          confirmPassword: ''
        });
  
        setSuccessMessage("¡Registro exitoso! Se ha enviado un correo de verificación. Por favor, verifica tu correo antes de iniciar sesión.");
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (e: unknown) {
      console.error("Error completo:", e);
      
      if (e instanceof FirebaseError) {
        // Mapa detallado de códigos de error de Firebase
        const firebaseErrorMap: Record<string, string> = {
          "auth/email-already-in-use": "El correo electrónico ya está registrado. Por favor, utiliza otro o inicia sesión.",
          "auth/invalid-email": "El formato del correo electrónico no es válido.",
          "auth/weak-password": "La contraseña es demasiado débil. Usa al menos 6 caracteres.",
          "auth/operation-not-allowed": "El registro con email y contraseña no está habilitado.",
          "auth/network-request-failed": "Error de conexión. Verifica tu conexión a internet.",
          "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
          "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
          "auth/quota-exceeded": "Se ha excedido la cuota de operaciones. Intenta más tarde.",
          "auth/internal-error": "Error interno del servidor de autenticación."
        };
        
        const errorMessage = firebaseErrorMap[e.code] || `Error de Firebase: ${e.code}`;
        setErrorMessage(errorMessage);
        setDetailedError(`Código de error: ${e.code}. Mensaje: ${e.message}`);
      } else if (e instanceof Error) {
        setErrorMessage("Ha ocurrido un error durante el registro.");
        setDetailedError(`Error: ${e.name}. Mensaje: ${e.message}`);
      } else {
        setErrorMessage("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
        setDetailedError(`Error desconocido: ${String(e)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50/30 to-white py-10">
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
          <h2 className="text-2xl font-bold text-gray-800">Únete a Glucolog</h2>
          <p className="text-gray-500 text-sm mt-1">Tu asistente para el control de la diabetes</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
                type="text"
                placeholder="Tu nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
                type="text"
                placeholder="Tu apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select
                id="gender"
                name="gender"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="" disabled>Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label htmlFor="diabetesType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Diabetes</label>
              <select
                id="diabetesType"
                name="diabetesType"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
                value={formData.diabetesType}
                onChange={handleChange}
              >
                <option value="" disabled>Seleccionar</option>
                <option value="tipo1">Tipo 1</option>
                <option value="tipo2">Tipo 2</option>
                <option value="gestacional">Gestacional</option>
                <option value="no">Ninguno</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              id="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-50 focus:border-transparent transition"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            {errorMessage}
          </motion.div>
        )}

        {detailedError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs font-mono"
          >
            <p className="font-semibold mb-1">Detalles del error:</p>
            {detailedError}
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
          >
            {successMessage}
          </motion.div>
        )}

        <div className="mt-6">
          <button 
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full p-3 bg-green-500 rounded-lg text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : "Crear cuenta"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-green-600 font-medium hover:text-green-700 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default SignUp;
