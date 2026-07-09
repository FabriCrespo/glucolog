export type TextSize = "comfortable" | "large" | "xlarge";
export type TextContrast = "normal" | "strong";
export type AppTheme = "light" | "dark";

export interface TextPreferences {
  size: TextSize;
  contrast: TextContrast;
  theme: AppTheme;
}

export const TEXT_PREFERENCES_STORAGE_KEY = "glucolog-text-preferences";

export const DEFAULT_TEXT_PREFERENCES: TextPreferences = {
  size: "comfortable",
  contrast: "normal",
  theme: "light",
};

export function readTextPreferences(): TextPreferences {
  if (typeof window === "undefined") return DEFAULT_TEXT_PREFERENCES;
  try {
    const raw = localStorage.getItem(TEXT_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_TEXT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<TextPreferences>;
    return {
      size:
        parsed.size === "large" || parsed.size === "xlarge"
          ? parsed.size
          : "comfortable",
      contrast: parsed.contrast === "strong" ? "strong" : "normal",
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return DEFAULT_TEXT_PREFERENCES;
  }
}

export function applyTextPreferences(prefs: TextPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (prefs.size === "comfortable") {
    root.removeAttribute("data-text-size");
  } else {
    root.setAttribute("data-text-size", prefs.size);
  }

  if (prefs.contrast === "strong") {
    root.setAttribute("data-text-contrast", "strong");
  } else {
    root.removeAttribute("data-text-contrast");
  }

  if (prefs.theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function saveTextPreferences(prefs: TextPreferences) {
  applyTextPreferences(prefs);
  try {
    localStorage.setItem(TEXT_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
}

/** Inline script to apply saved prefs before first paint (avoid flash). */
export const TEXT_PREFERENCES_BOOT_SCRIPT = `(function(){try{var r=localStorage.getItem("${TEXT_PREFERENCES_STORAGE_KEY}");if(!r)return;var p=JSON.parse(r);var d=document.documentElement;if(p.size&&p.size!=="comfortable")d.setAttribute("data-text-size",p.size);if(p.contrast==="strong")d.setAttribute("data-text-contrast","strong");if(p.theme==="dark")d.classList.add("dark");}catch(e){}})();`;
