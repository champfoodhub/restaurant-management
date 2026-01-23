import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  resolvedMode: ThemeMode;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("light");

  const resolvedMode: ThemeMode =
    mode === "light" || mode === "dark" ? mode : system ?? "light";

  const toggle = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used inside ThemeModeProvider");
  }
  return ctx;
}
