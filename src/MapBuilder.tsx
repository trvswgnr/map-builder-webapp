// MapBuilder.tsx
import { Toaster } from "@/components/ui/toaster";
import { MapBuilderProvider } from "@/hooks/MapBuilderContext";
import Editor from "@/components/Editor";
import { Toolbar } from "@/components/Toolbar";
import { Statistics } from "@/components/Statistics";
import TileDistribution from "@/components/TileDistribution";

export default function MapBuilder() {
  return (
    <MapBuilderProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-5">Map Builder</h1>
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          <div className="panel col-span-2">
            <Editor />
          </div>
          <div className="panel">
            <Toolbar />
            <Statistics />
            <TileDistribution />
          </div>
        </div>
        <Toaster />
      </div>
    </MapBuilderProvider>
  );
}
