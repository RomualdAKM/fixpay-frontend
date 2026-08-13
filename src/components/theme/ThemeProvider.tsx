"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Resolve the theme the same way the pre-paint script does: explicit choice
 * first, then the OS setting. Deliberately independent from the DOM attribute
 * so the provider can restore it if React ever rebuilds <html> at hydration.
 */
function resolveTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable: fall through to the OS preference.
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Owns the app theme: reflects it on `<html data-theme>` (which drives every
 * design token, see globals.css) and persists the user's choice.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR/first render uses the dark default (matching the markup); the effect
  // below reconciles with the real preference right after mount.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const resolved = resolveTheme();
    setThemeState(resolved);
    // Re-assert the attribute: cheap, and it repairs the rare case where
    // hydration rebuilt <html> and dropped what the pre-paint script wrote.
    document.documentElement.dataset.theme = resolved;
  }, []);

  // Follow the OS while the user has made no explicit choice.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        // Storage unavailable — keep following the OS.
      }
      const next: Theme = media.matches ? "light" : "dark";
      setThemeState(next);
      document.documentElement.dataset.theme = next;
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled: the theme still applies for the
      // current session, it just is not remembered.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Read/'write the current theme. Must be used under `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return context;
}
