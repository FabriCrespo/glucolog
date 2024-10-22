"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const MyProfile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // Recargar los datos del usuario para obtener el estado de verificación
        setIsVerified(user.emailVerified); // Verificar si el correo está verificado

        // Obtener datos del usuario de Firestore
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      } else {
        // Redirigir a la página de inicio de sesión si no está autenticado
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!userData) {
    return <p>No hay datos de usuario disponibles</p>;
  }

  if (!isVerified) {
    return (
      <section className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">
            ¡Bienvenido de vuelta, {userData.firstName}!
          </h2>
          <p className="text-red-500">
            Por favor, verifica tu correo electrónico para acceder a todas las funcionalidades.
          </p>
          <p>Revisa tu bandeja de entrada o tu carpeta de spam.</p>
          {/* Aquí puedes añadir un botón para reenviar el correo de verificación si lo deseas */}
        </div>
      </section>
    );
  }

  return (
    <section className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">
          ¡Bienvenido de vuelta, {userData.firstName}!
        </h2>
        {/* Mostrar otros detalles del usuario aquí */}
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Tipo de Diabetes:</strong> {userData.diabetesType}</p>
        <p><strong>Sexo:</strong> {userData.gender}</p>
        <p><strong>Apellido:</strong> {userData.lastName}</p>
      </div>
    </section>
  );
};

export default MyProfile;
