"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TEXT_PREFERENCES,
  readTextPreferences,
  saveTextPreferences,
  type TextContrast,
  type TextPreferences,
  type TextSize,
  type AppTheme,
} from "@/lib/accessibility/textPreferences";

export function useTextPreferences() {
  const [prefs, setPrefs] = useState<TextPreferences>(DEFAULT_TEXT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readTextPreferences();
    setPrefs(stored);
    saveTextPreferences(stored);
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<TextPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveTextPreferences(next);
      return next;
    });
  }, []);

  const setSize = useCallback(
    (size: TextSize) => update({ size }),
    [update]
  );

  const setContrast = useCallback(
    (contrast: TextContrast) => update({ contrast }),
    [update]
  );

  const setTheme = useCallback(
    (theme: AppTheme) => update({ theme }),
    [update]
  );

  return { prefs, setSize, setContrast, setTheme, update, ready };
}
