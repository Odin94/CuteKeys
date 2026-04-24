import { useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "cutekey-theme";

const getInitialTheme = (): Theme => {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "light";
  } catch {
    return "light";
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, toggle };
};
