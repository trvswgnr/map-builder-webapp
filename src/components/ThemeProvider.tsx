import { useEffect, useState } from "react";
import {
  type ThemeProviderProps,
  type Theme,
  ThemeProviderContext,
} from "@/hooks/useTheme";

export type ResolvedTheme = "dark" | "light";

export default function ThemeProvider({
  children,
  defaultTheme,
  storageKey,
  overrideTheme,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    overrideTheme ??
      (() => (localStorage.getItem(storageKey) as Theme) || defaultTheme),
  );

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
      return;
    }

    root.classList.add(theme);
    setResolvedTheme(theme);
  }, [theme]);

  const value = {
    theme: resolvedTheme,
    setTheme: (t: Theme) => {
      localStorage.setItem(storageKey, t);
      setTheme(t);
    },
  };

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={value}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}
