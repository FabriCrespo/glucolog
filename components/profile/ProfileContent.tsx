"use client";

import { useState } from "react";
import {
  Camera,
  Mail,
  Pencil,
  UserRound,
  FileText,
} from "lucide-react";
import { UserData } from "@/services/userService";
import DailyHealthReport from "@/components/profile/DailyHealthReport";
import GlucoseRecent from "@/components/profile/GlucoseRecent";
import FoodHabits from "@/components/profile/FoodHabits";
import ActivityStats from "@/components/profile/ActivityStats";
import MedicalInfo from "@/components/profile/MedicalInfo";
import AppEngagement from "@/components/profile/AppEngagement";
import { formatDiabetesType } from "@/lib/profile/dailyReport";

interface ProfileContentProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  previewURL: string | null;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveData: () => Promise<boolean>;
  saving?: boolean;
  pendingPhotoUpload?: boolean;
}

const ProfileContent = ({
  userData,
  setUserData,
  previewURL,
  handlePhotoChange,
  handleSaveData,
  saving = false,
  pendingPhotoUpload = false,
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState<"report" | "account">("report");
  const [isEditing, setIsEditing] = useState(false);

  const patientName = `${userData.firstName} ${userData.lastName}`.trim();
  const userId = userData.uid || "";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-emerald-800/45">
        <div className="flex min-w-0 items-center gap-4">
          <div className="group relative shrink-0">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 ring-2 ring-emerald-500/0 transition-shadow dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:ring-emerald-500/20 sm:h-20 sm:w-20">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Camera className="h-6 w-6 text-slate-400 dark:text-emerald-400/70" strokeWidth={1.5} />
                </div>
              )}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/0 opacity-0 transition-opacity group-hover:bg-slate-900/30 group-hover:opacity-100"
              >
                <Pencil className="h-4 w-4 text-white" strokeWidth={1.5} />
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
          <div className="min-w-0">
            <p className="dash-eyebrow">Expediente</p>
            <h2 className="dash-title mt-1 text-xl sm:text-2xl">{patientName}</h2>
            <p className="dash-muted mt-1 flex items-center gap-1.5 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {userData.email}
            </p>
            <p className="dash-muted mt-0.5">
              {formatDiabetesType(userData.diabetesType)}
            </p>
          </div>
        </div>
      </div>

      {pendingPhotoUpload ? (
        <div className="mb-6 flex flex-col gap-3 border border-emerald-200 bg-emerald-50/40 px-4 py-3 dark:border-emerald-700/55 dark:bg-emerald-950/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="dash-body text-emerald-950 dark:text-emerald-200">
            Tienes una foto nueva. Guárdala para actualizar tu perfil.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveData()}
            className="dash-btn-outline-active shrink-0 px-5 py-2.5 text-sm font-light"
          >
            {saving ? "Guardando…" : "Guardar foto"}
          </button>
        </div>
      ) : null}

      <div className="flex border-b border-slate-200 dark:border-emerald-800/45">
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`dash-tab flex items-center gap-2 ${
            activeTab === "report" ? "dash-tab-active" : "dash-tab-idle"
          }`}
        >
          <FileText className="h-4 w-4" strokeWidth={1.5} />
          Reporte diario
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`dash-tab flex items-center gap-2 ${
            activeTab === "account" ? "dash-tab-active" : "dash-tab-idle"
          }`}
        >
          <UserRound className="h-4 w-4" strokeWidth={1.5} />
          Mi cuenta
        </button>
      </div>

      {activeTab === "report" ? (
        <div className="space-y-10 pt-8">
          <DailyHealthReport
            userId={userId}
            patientName={patientName}
            diabetesType={userData.diabetesType}
          />

          <section className="border-t border-slate-200 pt-10 dark:border-emerald-800/40">
            <p className="dash-eyebrow">Glucosa</p>
            <h3 className="dash-title mt-2 text-lg">Detalle de lecturas</h3>
            <p className="dash-body mt-2">
              Evolución, tendencia y hallazgos de tus registros recientes.
            </p>
            <div className="mt-6">
              <GlucoseRecent userId={userId} />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-10 dark:border-emerald-800/40">
            <p className="dash-eyebrow">Nutrición</p>
            <h3 className="dash-title mt-2 text-lg">Alimentación y glucosa</h3>
            <p className="dash-body mt-2">
              Qué comiste y cómo reaccionó tu cuerpo según tus anotaciones.
            </p>
            <div className="mt-6">
              <FoodHabits userId={userId} />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-10 dark:border-emerald-800/40">
            <p className="dash-eyebrow">Actividad</p>
            <h3 className="dash-title mt-2 text-lg">Movimiento y constancia</h3>
            <p className="dash-body mt-2">
              Días activos y hábitos que apoyan el control de tu diabetes.
            </p>
            <div className="mt-6">
              <ActivityStats userId={userId} />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-10 dark:border-emerald-800/40">
            <p className="dash-eyebrow">Plan personal</p>
            <h3 className="dash-title mt-2 text-lg">Recomendaciones clínicas</h3>
            <p className="dash-body mt-2">
              Orientación según tu tipo de diabetes y rutina del día.
            </p>
            <div className="mt-6">
              <MedicalInfo userData={userData} />
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-8 pt-8">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="dash-eyebrow">Datos personales</p>
                <h3 className="dash-title mt-2 text-lg">Información de contacto</h3>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="dash-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-sm font-light"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  Editar
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-6 space-y-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {(
                    [
                      { label: "Edad", key: "age", type: "number" as const },
                      { label: "Peso (kg)", key: "weight", type: "number" as const },
                      { label: "Altura (cm)", key: "height", type: "number" as const },
                    ] as const
                  ).map((field) => (
                    <div key={field.key}>
                      <label className="dash-input-label">{field.label}</label>
                      <input
                        type={field.type}
                        value={
                          (userData[field.key as keyof UserData] as
                            | number
                            | string
                            | undefined) ?? ""
                        }
                        onChange={(e) =>
                          setUserData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  [field.key]:
                                    field.type === "number"
                                      ? Number(e.target.value)
                                      : e.target.value,
                                }
                              : null
                          )
                        }
                        className="dash-input mt-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="dash-input-label">Teléfono</label>
                    <input
                      type="text"
                      value={userData.phone ?? ""}
                      onChange={(e) =>
                        setUserData((prev) =>
                          prev ? { ...prev, phone: e.target.value } : null
                        )
                      }
                      className="dash-input mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="dash-input-label">Dirección</label>
                    <input
                      type="text"
                      value={userData.address ?? ""}
                      onChange={(e) =>
                        setUserData((prev) =>
                          prev ? { ...prev, address: e.target.value } : null
                        )
                      }
                      className="dash-input mt-2"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-emerald-800/40 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsEditing(false)}
                    className="dash-btn-outline px-6 py-3 text-sm font-light"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      const ok = await handleSaveData();
                      if (ok) setIsEditing(false);
                    }}
                    className="dash-btn-outline-active px-8 py-3 text-sm font-light"
                  >
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Edad",
                    value: userData.age != null ? `${userData.age} años` : "—",
                  },
                  {
                    label: "Peso",
                    value: userData.weight != null ? `${userData.weight} kg` : "—",
                  },
                  {
                    label: "Altura",
                    value: userData.height != null ? `${userData.height} cm` : "—",
                  },
                  { label: "Teléfono", value: userData.phone || "—" },
                  { label: "Dirección", value: userData.address || "—" },
                  {
                    label: "Diabetes",
                    value: formatDiabetesType(userData.diabetesType),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="dash-stat-cell border border-slate-200 px-4 py-4 dark:border-emerald-800/40"
                  >
                    <p className="dash-stat-label">{row.label}</p>
                    <p className="dash-stat-value mt-1 text-lg">{row.value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-slate-200 pt-8 dark:border-emerald-800/40">
            <AppEngagement userId={userId} />
          </section>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
