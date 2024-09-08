import { Maybe } from "@/lib/maybe";
import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme: Theme;
  overrideTheme?: ResolvedTheme;
  storageKey: string;
};

export type ThemeProviderState = {
  theme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<Maybe<ThemeProviderState>>(initialState);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (Maybe.isNone(context)) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
