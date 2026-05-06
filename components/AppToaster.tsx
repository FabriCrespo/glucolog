"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/10",
          title: "text-slate-900 font-semibold",
          description: "text-slate-600 text-sm",
          success: "border-emerald-200/90",
          error: "border-red-200/90",
        },
      }}
    />
  );
}
