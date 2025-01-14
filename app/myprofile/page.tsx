"use client";
import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/app/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { FiEdit, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        setIsVerified(user.emailVerified);

        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setPreviewURL(data.photoURL || null);
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
      try {
        if (photo) {
          const photoRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
          await uploadBytes(photoRef, photo);
          const photoURL = await getDownloadURL(photoRef);
          setUserData((prevData) => prevData ? { ...prevData, photoURL } : null);
          await setDoc(doc(db, 'users', auth.currentUser.uid), { ...userData, photoURL }, { merge: true });
        } else {
          await setDoc(doc(db, 'users', auth.currentUser.uid), userData, { merge: true });
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <p className="text-center text-lg text-red-500">No hay datos de usuario disponibles</p>;
  }

  if (!isVerified) {
    return (
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-50 to-blue-50"
      >
        <div className="bg-white w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 p-8 rounded-2xl shadow-xl">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
              ¡Bienvenido de vuelta, {userData.firstName}!
            </h2>
            <p className="text-red-500 text-center mt-4">
              Por favor, verifica tu correo electrónico para acceder a todas las funcionalidades.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResendVerification}
              className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl w-full font-medium shadow-lg transition-all duration-300"
            >
              Reenviar correo de verificación
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 bg-gradient-to-r from-green-50 to-blue-50"
    >
      <div className="relative max-w-4xl mx-auto">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <motion.div 
          className="relative bg-white backdrop-blur-lg bg-opacity-90 p-8 rounded-3xl shadow-2xl overflow-hidden"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-green-100 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-100 rounded-full"></div>

          <div className="flex flex-col md:flex-row gap-12 relative">
            {/* Left side: Photo and Welcome Message */}
            <motion.div 
              className="flex flex-col items-center md:w-1/3"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-green-400 shadow-xl"
                >
                  {previewURL ? (
                    <img 
                      src={previewURL} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                      <FiCamera className="text-4xl text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <label htmlFor="photo-upload" className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white p-3 rounded-full shadow-lg">
                        <FiEdit className="text-xl text-green-500" />
                      </div>
                      <input type="file" id="photo-upload" onChange={handlePhotoChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </motion.div>
              </div>
              <motion.h2 
                className="text-2xl font-bold mt-6 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ¡Hola, {userData.firstName}!
              </motion.h2>
            </motion.div>

            {/* Right side: User Information */}
            <motion.div 
              className="flex flex-col md:w-2/3 space-y-6"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {[
                    { label: 'Edad', key: 'age', type: 'number' },
                    { label: 'Peso (kg)', key: 'weight', type: 'number' },
                    { label: 'Altura (cm)', key: 'height', type: 'number' },
                    { label: 'Teléfono', key: 'phone', type: 'text' },
                    { label: 'Dirección', key: 'address', type: 'text' },
                  ].map((field) => (
                    <motion.div
                      key={field.key}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        <input
                          type={field.type}
                          value={userData[field.key as keyof UserData] || ''}
                          onChange={(e) => setUserData({ 
                            ...userData, 
                            [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                          })}
                          className="mt-1 block w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </label>
                    </motion.div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveData}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Guardar Cambios
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {[
                    { label: 'Edad', value: userData.age, unit: 'años' },
                    { label: 'Peso', value: userData.weight, unit: 'kg' },
                    { label: 'Altura', value: userData.height, unit: 'cm' },
                    { label: 'Teléfono', value: userData.phone },
                    { label: 'Dirección', value: userData.address },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl"
                    >
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {item.value || 'No especificado'} {item.unit}
                      </p>
                    </motion.div>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Editar Información
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
