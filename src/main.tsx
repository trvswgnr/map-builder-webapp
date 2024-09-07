import "./globals.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import MapBuilder from "./MapBuilder";
import ThemeProvider from "@/components/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <MapBuilder />
    </ThemeProvider>
  </StrictMode>,
);
