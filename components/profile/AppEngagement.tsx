import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

interface AppEngagementProps {
  userId: string;
}

const AppEngagement = ({ userId }: AppEngagementProps) => {
  const [lastLogin, setLastLogin] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          const lastLoginTime = auth.currentUser?.metadata.lastSignInTime;
          if (lastLoginTime) {
            const lastDate = new Date(lastLoginTime);
            setLastLogin(
              lastDate.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          }

          const requiredFields = [
            "firstName",
            "lastName",
            "email",
            "diabetesType",
            "gender",
          ];
          const optionalFields = [
            "age",
            "weight",
            "height",
            "phone",
            "address",
            "photoURL",
          ];

          let completedRequired = 0;
          let completedOptional = 0;

          requiredFields.forEach((field) => {
            if (userData[field]) completedRequired++;
          });

          optionalFields.forEach((field) => {
            if (userData[field]) completedOptional++;
          });

          const completionPercentage = Math.round(
            ((completedRequired / requiredFields.length) * 0.7 +
              (completedOptional / optionalFields.length) * 0.3) *
              100
          );

          setProfileCompletion(completionPercentage);
        }
      } catch (error) {
        console.error("Error fetching engagement data:", error);
      }
    };

    if (userId) {
      void fetchEngagementData();
    }
  }, [userId]);

  return (
    <div>
      <p className="dash-eyebrow">Seguimiento</p>
      <h3 className="dash-title mt-2 text-lg">Uso de la app</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="dash-stat-cell border border-slate-200 px-4 py-4 dark:border-emerald-800/40">
          <p className="dash-stat-label">Último acceso</p>
          <p className="dash-stat-value mt-1 text-base">
            {lastLogin || "Hoy"}
          </p>
        </div>
        <div className="dash-stat-cell border border-slate-200 px-4 py-4 dark:border-emerald-800/40">
          <p className="dash-stat-label">Perfil completo</p>
          <p className="dash-stat-value mt-1 text-base tabular-nums">
            {profileCompletion}%
          </p>
          <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-emerald-950/50">
            <div
              className="h-1 bg-vitality-primary transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>
      {profileCompletion < 100 ? (
        <p className="dash-muted mt-3">
          Completa tu perfil para un informe más preciso.
        </p>
      ) : null}
    </div>
  );
};

export default AppEngagement;
