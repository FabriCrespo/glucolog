"use client";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase/config";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UserData, getUserData, updateUserData, uploadProfilePhoto } from "@/services/userService";
import ProfileContent from "@/components/profile/ProfileContent";

const MyProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        setIsVerified(user.emailVerified);

        try {
          const data = await getUserData(user.uid);
          if (data) {
            // Asegurarnos de que userData tenga el uid
            setUserData({
              ...data,
              uid: user.uid // Ahora uid es una propiedad válida en UserData
            });
            setPreviewURL(data.photoURL || null);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        alert(
          "Correo de verificación reenviado. Por favor revisa tu bandeja de entrada."
        );
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (error.code === "auth/too-many-requests") {
            alert(
              "Has enviado demasiadas solicitudes de verificación. Por favor, espera unos minutos antes de intentarlo nuevamente."
            );
          } else {
            alert(
              `Error al enviar el correo de verificación: ${error.message}`
            );
          }
          console.error("Error al enviar verificación:", error);
        } else {
          alert(
            "Ha ocurrido un error al enviar el correo de verificación. Inténtalo más tarde."
          );
        }
      }
    }
  };

  const handleSaveData = async () => {
    if (auth.currentUser && userData) {
      try {
        if (photo) {
          const photoURL = await uploadProfilePhoto(auth.currentUser, photo);
          setUserData((prevData) =>
            prevData ? { ...prevData, photoURL } : null
          );
          await updateUserData(auth.currentUser.uid, { ...userData, photoURL });
        } else {
          await updateUserData(auth.currentUser.uid, userData);
        }
      } catch (error) {
        console.error("Error al guardar:", error);
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
    return <LoadingSpinner />;
  }

  if (!userData) {
    return (
      <p className="text-center text-lg text-red-500">
        No hay datos de usuario disponibles
      </p>
    );
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
              Por favor, verifica tu correo electrónico para acceder a todas las
              funcionalidades.
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
    <ProfileContent 
      userData={userData}
      setUserData={setUserData}
      previewURL={previewURL}
      handlePhotoChange={handlePhotoChange}
      handleSaveData={handleSaveData}
    />
  );
};

export default MyProfile;
