import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Heart, Info, Shield } from "lucide-react";
import { UserData } from "@/services/userService";

interface MedicalInfoProps {
  userData: UserData;
}

function formatDiabetesType(type?: string) {
  if (!type) return "No especificado";
  const map: Record<string, string> = {
    type1: "Tipo 1",
    type2: "Tipo 2",
    gestational: "Gestacional",
    other: "Otro",
  };
  return map[type] ?? type;
}

const MedicalInfo = ({ userData }: MedicalInfoProps) => {
  const [checks, setChecks] = useState({
    hydration: false,
    medication: false,
    movement: false,
  });

  const diabetesType = formatDiabetesType(userData.diabetesType);

  const recommendations = useMemo(() => {
    const type = (userData.diabetesType ?? "").toLowerCase();
    if (type.includes("type1") || type.includes("tipo 1")) {
      return [
        "Monitorea glucosa con frecuencia durante el dia.",
        "Planifica carbohidratos y dosis con tu equipo medico.",
        "Mantener horarios estables suele reducir variaciones bruscas.",
      ];
    }
    if (type.includes("type2") || type.includes("tipo 2")) {
      return [
        "Combina actividad diaria con alimentacion de bajo indice glucemico.",
        "Revisa tendencia semanal y no solo lecturas aisladas.",
        "Prioriza sueno y manejo de estres para apoyar el control.",
      ];
    }
    if (type.includes("gest")) {
      return [
        "Sigue controles frecuentes segun indicacion profesional.",
        "Distribuye comidas en porciones mas pequenas durante el dia.",
        "Consulta de inmediato ante cambios marcados en lecturas.",
      ];
    }
    return [
      "Construye una rutina simple de medicion y registro.",
      "Busca evaluacion profesional para personalizar tu plan.",
      "Sostenibilidad > perfeccion: cambios pequenos, consistentes.",
    ];
  }, [userData.diabetesType]);

  const profileScore = useMemo(() => {
    const fields = [
      userData.age,
      userData.weight,
      userData.height,
      userData.phone,
      userData.address,
      userData.diabetesType,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [
    userData.address,
    userData.age,
    userData.diabetesType,
    userData.height,
    userData.phone,
    userData.weight,
  ]);

  const completedChecks = Object.values(checks).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Heart className="h-5 w-5 text-rose-500" />
            Informacion medica personalizada
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Contexto rapido para tomar mejores decisiones cada dia.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Perfil {profileScore}%
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tipo de diabetes
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{diabetesType}</p>
          <p className="mt-1 text-xs text-slate-500">
            Estos datos no reemplazan orientacion medica profesional.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Checklist de hoy
          </p>
          <p className="mt-1 text-lg font-semibold text-vitality-primary">
            {completedChecks}/3 completados
          </p>
          <p className="mt-1 text-xs text-slate-500">Construye consistencia diaria.</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recomendaciones clave
        </p>
        <ul className="space-y-2">
          {recommendations.map((rec) => (
            <li key={rec} className="flex items-start gap-2 text-sm text-slate-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rutina rapida
        </p>
        {[
          { id: "hydration", label: "Mantener buena hidratacion" },
          { id: "medication", label: "Cumplir medicacion indicada" },
          { id: "movement", label: "Realizar algo de movimiento hoy" },
        ].map((task) => (
          <label key={task.id} className="mb-2 flex cursor-pointer items-center gap-2 last:mb-0">
            <input
              type="checkbox"
              checked={checks[task.id as keyof typeof checks]}
              onChange={() =>
                setChecks((prev) => ({ ...prev, [task.id]: !prev[task.id as keyof typeof prev] }))
              }
              className="h-4 w-4 rounded border-slate-300 text-vitality-primary focus:ring-vitality-primary/30"
            />
            <span className="text-sm text-slate-700">{task.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800">
        {completedChecks === 3 ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : completedChecks === 0 ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>
          {completedChecks === 3
            ? "Excelente. Cumpliste tu bloque esencial del dia."
            : "Tip: completar este checklist suele mejorar la estabilidad de tus lecturas."}
        </span>
      </div>
    </motion.div>
  );
};

export default MedicalInfo;
