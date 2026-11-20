"use client";
import { createContext, useContext, useEffect, useState } from "react";
const C = createContext({ dark: false, toggle: () => {} });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("gv_theme");
    const d = saved ? saved === "dark" : true;
    setDark(d);
    document.documentElement.dataset.theme = d ? "dark" : "light";
  }, []);
  const toggle = () =>
    setDark((v) => {
      const n = !v;
      localStorage.setItem("gv_theme", n ? "dark" : "light");
      document.documentElement.dataset.theme = n ? "dark" : "light";
      return n;
    });
  return <C.Provider value={{ dark, toggle }}>{children}</C.Provider>;
}
export const useTheme = () => useContext(C);
