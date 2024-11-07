"use client";
import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/app/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { FiEdit } from 'react-icons/fi';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  diabetesType: string;
  gender: string;
  age?: number;
  weight?: number;
  height?: number;
  phone?: string;
  address?: string;
  photoURL?: string;
}

const MyProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        setIsVerified(user.emailVerified);

        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      } else {
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
      alert('Correo de verificación reenviado. Por favor revisa tu bandeja de entrada.');
    }
  };

  const handleSaveData = async () => {
    if (auth.currentUser && userData) {
      if (photo) {
        const photoRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
        await uploadBytes(photoRef, photo);
        const photoURL = await getDownloadURL(photoRef);
        setUserData((prevData) => prevData ? { ...prevData, photoURL } : null);
      }

      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDoc, userData, { merge: true });
      setIsEditing(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  if (loading) {
    return <p className="text-center text-lg text-gray-600">Cargando...</p>;
  }

  if (!userData) {
    return <p className="text-center text-lg text-red-500">No hay datos de usuario disponibles</p>;
  }

  if (!isVerified) {
    return (
      <section className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
          <h2 className="text-2xl font-bold text-center">¡Bienvenido de vuelta, {userData.firstName}!</h2>
          <p className="text-red-500 text-center">Por favor, verifica tu correo electrónico para acceder a todas las funcionalidades.</p>
          <button
            onClick={handleResendVerification}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Reenviar correo de verificación
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-white w-11/12 md:w-2/3 lg:w-3/5 mx-auto p-8 space-y-8 md:space-y-0 md:space-x-8 rounded-lg shadow-lg">
      {/* Left side: Photo and Welcome Message */}
      <div className="flex flex-col items-center md:w-1/3">
        <div className="relative">
          {userData.photoURL ? (
            <img src={userData.photoURL} alt="Foto de perfil" className="w-36 h-36 md:w-48 md:h-48 rounded-full border-4 border-green-500 shadow-lg object-cover" />
          ) : (
            <p>No hay foto de perfil</p>
          )}
          <label htmlFor="photo-upload" className="absolute bottom-2 right-2 bg-green-500 p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
            <FiEdit className="text-white" />
            <input type="file" id="photo-upload" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
        <h2 className="text-2xl font-bold text-center mt-4">¡Bienvenido, {userData.firstName}!</h2>
      </div>

      {/* Right side: User Information */}
      <div className="flex flex-col md:w-2/3 space-y-4">
        {isEditing ? (
          <>
            <label className="block text-sm font-semibold">Edad:
              <input
                type="number"
                value={userData.age || ''}
                onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) })}
                className="border p-2 rounded-md w-full mt-1"
              />
            </label>
            <label className="block text-sm font-semibold">Peso (kg):
              <input
                type="number"
                value={userData.weight || ''}
                onChange={(e) => setUserData({ ...userData, weight: parseFloat(e.target.value) })}
                className="border p-2 rounded-md w-full mt-1"
              />
            </label>
            <label className="block text-sm font-semibold">Altura (cm):
              <input
                type="number"
                value={userData.height || ''}
                onChange={(e) => setUserData({ ...userData, height: parseInt(e.target.value) })}
                className="border p-2 rounded-md w-full mt-1"
              />
            </label>
            <label className="block text-sm font-semibold">Teléfono:
              <input
                type="text"
                value={userData.phone || ''}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="border p-2 rounded-md w-full mt-1"
              />
            </label>
            <label className="block text-sm font-semibold">Dirección:
              <input
                type="text"
                value={userData.address || ''}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                className="border p-2 rounded-md w-full mt-1"
              />
            </label>
            <button onClick={handleSaveData} className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full">
              Guardar Información
            </button>
          </>
        ) : (
          <>
            <p className="text-lg"><strong>Edad:</strong> {userData.age}</p>
            <p className="text-lg"><strong>Peso:</strong> {userData.weight} kg</p>
            <p className="text-lg"><strong>Altura:</strong> {userData.height} cm</p>
            <p className="text-lg"><strong>Teléfono:</strong> {userData.phone}</p>
            <p className="text-lg"><strong>Dirección:</strong> {userData.address}</p>
            <button onClick={() => setIsEditing(true)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
              Editar Información
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
