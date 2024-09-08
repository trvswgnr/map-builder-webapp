import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "./tailwind.config.ts";
const tailwind = resolveConfig(tailwindConfig);
export type TailwindConfig = typeof tailwind;

// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // visualizer({
    //   filename: "stats.html",
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "~": "/",
      // react: "preact/compat",
      // "react-dom/test-utils": "preact/test-utils",
      // "react-dom": "preact/compat",
      // "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  // esbuild: {
  //   jsxFactory: "h",
  //   jsxFragment: "Fragment",
  // },
  define: {
    __GLOBALS__: {
      env: getEnv(),
      appVersion: process.env.npm_package_version,
      tailwind,
    },
  },
});

type Env = "prod" | "dev" | "unknown";
function getEnv(): Env {
  if (process.env.NODE_ENV === "production") {
    return "prod";
  }
  if (process.env.NODE_ENV === "development") {
    return "dev";
  }
  return "unknown";
}
