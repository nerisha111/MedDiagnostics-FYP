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
  // Initialize from localStorage immediately
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem("app-theme") as Theme) || "light"
  );
  const [fontSize, setFontSizeState] = useState<number>(
    () => Number(localStorage.getItem("app-font-size")) || 16
  );

  // Apply visual changes to the DOM (Real-time Preview)
  // This runs whenever theme or fontSize changes in the state
  useEffect(() => {
    const root = window.document.documentElement;

    // Apply Theme
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Apply Font Size
    root.style.setProperty("--font-size", `${fontSize}px`);
  }, [theme, fontSize]);

  // PERSISTENCE LOGIC
  // These functions update the state AND localStorage (Saving "for good")
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  const setFontSize = (newSize: number) => {
    setFontSizeState(newSize);
    localStorage.setItem("app-font-size", newSize.toString());
  };

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