import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    setTheme(stored ?? "dark");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <>{children}</>;
}

export function useTheme() {
  const isDark = () => document.documentElement.classList.contains("dark");
  const theme = isDark() ? "dark" : "light";

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = isDark() ? "light" : "dark";
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  return { toggleTheme, theme };
}
