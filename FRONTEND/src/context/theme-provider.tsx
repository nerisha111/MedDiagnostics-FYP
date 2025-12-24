import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeProviderState {
  theme: Theme;
  fontSize: number;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage immediately so it doesn't "flash" default values
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("app-theme") as Theme) || "light"
  );
  const [fontSize, setFontSize] = useState<number>(
    () => Number(localStorage.getItem("app-font-size")) || 16
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Apply Theme
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("app-theme", theme);

    // 2. Apply Font Size to CSS Variable
    root.style.setProperty("--font-size", `${fontSize}px`);
    localStorage.setItem("app-font-size", fontSize.toString());
  }, [theme, fontSize]);

  return (
    <ThemeProviderContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};