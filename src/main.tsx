import "./globals.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import MapBuilder from "./MapBuilder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapBuilder />
  </StrictMode>,
);
