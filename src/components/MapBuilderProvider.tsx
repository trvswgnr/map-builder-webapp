// hooks/MapBuilderContext.tsx

import {
  mapBuilderReducer,
  initialState,
  MapBuilderAction,
} from "@/lib/mapBuilderReducer";
import { useErrorToast } from "@/hooks/useErrorToast";
import { MapBuilderContext } from "@/hooks/useMapBuilder";
import { SaveData } from "@/lib/types";
import { createTextureRefs } from "@/lib/utils";
import { useReducer, useCallback } from "react";

export default function MapBuilderProvider({
  children,
}: React.PropsWithChildren) {
  const errorToast = useErrorToast();
  const [state, dispatch] = useReducer(mapBuilderReducer, initialState);

  const saveToFile = useCallback(() => {
    const saveData: SaveData = {
      layers: state.layers.map((layer) =>
        layer.map((row) =>
          row.map((tile) => ({
            id: tile.id,
            name: tile.name,
            color: tile.color,
            texture: tile.texture ? { filename: tile.texture.filename } : null,
          })),
        ),
      ),
      settings: {
        mapSize: state.mapSize,
        toolbarTiles: state.toolbarTiles.map((tile) => ({
          id: tile.id,
          name: tile.name,
          color: tile.color,
          texture: tile.texture ? { filename: tile.texture.filename } : null,
        })),
        textureRefs: createTextureRefs(state.layers),
      },
    };
    const blob = new Blob([JSON.stringify(saveData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "map.json";
    a.click();
  }, [state]);

  const loadFromFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return void errorToast("No file selected. Please select a file.");
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content !== "string") {
          return void errorToast("Failed to load map. Please try again.");
        }
        const saveData: SaveData = JSON.parse(content);
        dispatch({ type: MapBuilderAction.LOAD_MAP, payload: saveData });
      };
      reader.readAsText(file);
    },
    [errorToast],
  );

  return (
    <MapBuilderContext.Provider
      value={{
        ...state,
        dispatch,
        saveToFile,
        loadFromFile,
      }}
    >
      {children}
    </MapBuilderContext.Provider>
  );
}
