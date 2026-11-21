"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = window.localStorage.getItem("gearvault-theme");
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("gearvault-theme", next);
  }
  return <button type="button" onClick={toggle} className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}<span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
  </button>;
}
