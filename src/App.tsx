// App.tsx

import MapBuilderProvider from "@/components/MapBuilderProvider";
import ThemeProvider from "@/components/ThemeProvider";
import MapBuilder from "./components/MapBuilder";

export default function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="uitheme"
    >
      <MapBuilderProvider>
        <MapBuilder />
      </MapBuilderProvider>
    </ThemeProvider>
  );
}
