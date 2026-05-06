"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cake,
  Camera,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Ruler,
  UserRound,
  Weight,
} from "lucide-react";
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
  handleSaveData: () => Promise<boolean>;
  saving?: boolean;
  pendingPhotoUpload?: boolean;
}

function formatDiabetesLabel(raw: string | undefined): string {
  if (!raw) return "No especificado";
  const map: Record<string, string> = {
    type1: "Tipo 1",
    type2: "Tipo 2",
    gestational: "Gestacional",
    other: "Otro",
  };
  return map[raw] ?? raw.replace(/_/g, " ");
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
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const tabBtn = (active: boolean) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
      active
        ? "border-b-2 border-vitality-primary text-vitality-primary"
        : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
    }`;

  const highlightStats = [
    {
      key: "age",
      label: "Edad",
      value: userData.age != null ? String(userData.age) : "—",
      suffix: userData.age != null ? "años" : "",
      icon: Cake,
    },
    {
      key: "weight",
      label: "Peso",
      value: userData.weight != null ? String(userData.weight) : "—",
      suffix: userData.weight != null ? "kg" : "",
      icon: Weight,
    },
    {
      key: "height",
      label: "Altura",
      value: userData.height != null ? String(userData.height) : "—",
      suffix: userData.height != null ? "cm" : "",
      icon: Ruler,
    },
  ];

  const infoRows = [
    {
      label: "Teléfono",
      value: userData.phone || "No especificado",
      icon: Phone,
    },
    {
      label: "Ubicación",
      value: userData.address || "No especificado",
      icon: MapPin,
    },
    {
      label: "Tipo de diabetes",
      value: formatDiabetesLabel(userData.diabetesType),
      icon: HeartPulse,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100/80"
      >
        <div className="relative h-44 bg-gradient-to-br from-emerald-100/90 via-white to-sky-100/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/30 via-transparent to-transparent" />
        </div>

        <div className="relative px-6 pb-0 pt-0 sm:px-10">
          <div className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="group relative shrink-0">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl ring-2 ring-white sm:h-32 sm:w-32">
                  {previewURL ? (
                    <img
                      src={previewURL}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/40">
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-vitality-primary shadow-lg">
                        <Pencil className="h-5 w-5" strokeWidth={2} />
                      </span>
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

              <div className="mb-1 min-w-0 pb-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {userData.firstName} {userData.lastName}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{userData.email}</span>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Perfil · Glucolog
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={tabBtn(activeTab === "personal")}
            >
              <UserRound className="h-4 w-4" strokeWidth={2} />
              Información
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("health")}
              className={tabBtn(activeTab === "health")}
            >
              <HeartPulse className="h-4 w-4" strokeWidth={2} />
              Salud
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={tabBtn(activeTab === "activity")}
            >
              <Activity className="h-4 w-4" strokeWidth={2} />
              Actividad
            </button>
          </div>

          {pendingPhotoUpload && (
            <div className="flex flex-col gap-3 border-t border-emerald-100 bg-emerald-50/95 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-emerald-950">
                Tienes una nueva foto de perfil lista. Guárdala para publicarla en
                tu cuenta.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveData()}
                className="shrink-0 rounded-xl bg-vitality-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-vitality-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar foto"}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {activeTab === "personal" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Información personal
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Datos que usamos para personalizar tu experiencia.
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-vitality-primary/35 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4 text-vitality-primary" />
                  Editar perfil
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-8 space-y-8">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Medidas
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      { label: "Edad", key: "age", type: "number" as const },
                      { label: "Peso (kg)", key: "weight", type: "number" as const },
                      {
                        label: "Altura (cm)",
                        key: "height",
                        type: "number" as const,
                      },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          {field.label}
                        </label>
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
                          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Contacto
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={userData.phone ?? ""}
                        onChange={(e) =>
                          setUserData((prev) =>
                            prev ? { ...prev, phone: e.target.value } : null
                          )
                        }
                        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={userData.address ?? ""}
                        onChange={(e) =>
                          setUserData((prev) =>
                            prev ? { ...prev, address: e.target.value } : null
                          )
                        }
                        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 transition-all focus:border-vitality-primary focus:outline-none focus:ring-2 focus:ring-vitality-primary/25"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
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
                    className="rounded-xl bg-vitality-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-colors hover:bg-vitality-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Resumen
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {highlightStats.map((s) => (
                      <div
                        key={s.key}
                        className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-center ring-1 ring-slate-100/80"
                      >
                        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                          <s.icon
                            className="h-4 w-4 text-vitality-primary"
                            strokeWidth={2}
                          />
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {s.label}
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                          {s.value}
                          {s.suffix ? (
                            <span className="ml-1 text-sm font-normal text-slate-500">
                              {s.suffix}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Contacto y salud
                  </p>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                    {infoRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center gap-4 px-4 py-4 sm:px-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                          <row.icon
                            className="h-5 w-5 text-slate-600"
                            strokeWidth={1.75}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {row.label}
                          </p>
                          <p className="mt-0.5 text-[15px] font-medium text-slate-900">
                            {row.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <AppEngagement userId={userData.uid || ""} />
          </div>
        </motion.div>
      )}

      {activeTab === "health" && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="p-6 sm:p-8">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Tu salud en los ultimos dias
              </h3>
              <p className="mb-6 text-sm text-slate-500">
                Vista interactiva de patrones, rangos y tendencia de glucosa.
              </p>
              <GlucoseRecent userId={userData.uid || ""} />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="p-6 sm:p-8">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Información médica
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Contexto clínico registrado.
                </p>
                <MedicalInfo userData={userData} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="p-6 sm:p-8">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Hábitos alimenticios
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Patrones asociados a tu perfil.
                </p>
                <FoodHabits userId={userData.uid || ""} />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Actividad física
          </h3>
          <p className="mb-6 text-sm text-slate-500">
            Resumen de movimiento vinculado a tu cuenta.
          </p>
          <ActivityStats userId={userData.uid || ""} />
        </motion.div>
      )}
    </div>
  );
};

export default ProfileContent;
