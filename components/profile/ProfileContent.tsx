import { useState } from "react";
import { FiEdit, FiCamera, FiActivity, FiHeart, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import { UserData } from "@/services/userService";
import GlucoseRecent from "./GlucoseRecent";
import FoodHabits from "./FoodHabits";
import ActivityStats from "./ActivityStats";
import MedicalInfo from "./MedicalInfo";
import AppEngagement from "./AppEngagement";

interface ProfileContentProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  previewURL: string | null;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveData: () => Promise<void>;
}

const ProfileContent = ({ userData, setUserData, previewURL, handlePhotoChange, handleSaveData }: ProfileContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con foto y nombre */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
      >
        <div className="relative h-40 bg-blue-50">
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                {previewURL ? (
                  <img
                    src={previewURL}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FiCamera className="text-4xl text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="bg-white p-2 rounded-full shadow-lg">
                      <FiEdit className="text-lg text-blue-600" />
                    </div>
                    <input
                      type="file"
                      id="photo-upload"
                      onChange={handlePhotoChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="ml-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-gray-500 text-sm">Miembro desde 2023</p>
            </div>
          </div>
        </div>
        <div className="pt-20 pb-4 px-8">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "personal" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiUser className="inline mr-2" /> Información Personal
            </button>
            <button 
              onClick={() => setActiveTab("health")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "health" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiHeart className="inline mr-2" /> Estadísticas de Salud
            </button>
            <button 
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "activity" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FiActivity className="inline mr-2" /> Actividad
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "personal" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiEdit className="text-sm" /> Editar
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Edad", key: "age", type: "number" },
                  { label: "Peso (kg)", key: "weight", type: "number" },
                  { label: "Altura (cm)", key: "height", type: "number" },
                  { label: "Teléfono", key: "phone", type: "text" },
                  { label: "Dirección", key: "address", type: "text" },
                ].map((field) => (
                  <div key={field.key} className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      <input
                        type={field.type}
                        value={userData[field.key as keyof UserData] || ""}
                        onChange={(e) =>
                          setUserData(prevData => 
                            prevData ? {
                              ...prevData,
                              [field.key]:
                                field.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value,
                            } : null
                          )
                        }
                        className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleSaveData();
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Edad", value: userData.age, unit: "años", icon: "🎂" },
                { label: "Peso", value: userData.weight, unit: "kg", icon: "⚖️" },
                { label: "Altura", value: userData.height, unit: "cm", icon: "📏" },
                { label: "Teléfono", value: userData.phone, unit: "", icon: "📱" },
                { label: "Dirección", value: userData.address, unit: "", icon: "🏠" },
                { label: "Tipo de Diabetes", value: userData.diabetesType, unit: "", icon: "🩸" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{item.icon}</span>
                    <p className="text-sm font-medium text-gray-500">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-lg font-medium text-gray-800">
                    {item.value || "No especificado"} {item.unit}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-8">
            <AppEngagement userId={userData.uid || ''} />
          </div>
        </motion.div>
      )}

      {activeTab === "health" && (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Monitoreo de Glucosa</h3>
              <GlucoseRecent userId={userData.uid || ''} />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Información Médica</h3>
                <MedicalInfo userData={userData} />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Hábitos Alimenticios</h3>
                <FoodHabits userId={userData.uid || ''} />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Mi Actividad Física</h3>
          <ActivityStats userId={userData.uid || ''} />
        </motion.div>
      )}
    </div>
  );
};

export default ProfileContent;













