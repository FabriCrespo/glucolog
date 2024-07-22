"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const MyProfile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      } else {
        // Redirect to login page if not authenticated
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data available</p>;
  }

  return (
    <section className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">
          ¡Bienvenido de vuelta, {userData.firstName}!
        </h2>
        {/* Display other user details here */}
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Tipo de Diabetes:</strong> {userData.diabetesType}</p>
        <p><strong>Sexo:</strong> {userData.gender}</p>
        <p><strong>Apellido:</strong> {userData.lastName}</p>
      </div>
    </section>
  );
};

export default MyProfile;
