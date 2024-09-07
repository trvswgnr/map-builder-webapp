// hooks/MapBuilderContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { SaveData } from "@/lib/types";
import { useErrorToast } from "@/hooks/useErrorToast";
import { createTextureRefs, NEVER } from "@/lib/utils";
import {
  mapBuilderReducer,
  initialState,
  type MapBuilderState,
  Action,
  ReducerActions,
} from "@/hooks/mapBuilderReducer";

interface IMapBuilderContext extends MapBuilderState {
  dispatch: React.Dispatch<ReducerActions>;
  saveToFile: () => void;
  loadFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MapBuilderContext = createContext<IMapBuilderContext>(NEVER);

export const useMapBuilder = () => {
  const context = useContext(MapBuilderContext);
  if (!context) {
    throw new Error("useMapBuilder must be used within a MapBuilderProvider");
  }
  return context;
};

export function MapBuilderProvider({ children }: React.PropsWithChildren) {
  const errorToast = useErrorToast();
  const [state, dispatch] = useReducer(mapBuilderReducer, initialState);

  const saveToFile = useCallback(() => {
    const saveData: SaveData = {
      layers: state.layers.map((layer) =>
        layer.map((row) =>
          row.map((tile) => ({
            name: tile.name,
            color: tile.color,
            texture: tile.texture ? { filename: tile.texture.filename } : null,
          })),
        ),
      ),
      settings: {
        mapSize: state.mapSize,
        toolbarTiles: state.toolbarTiles.map((tile) => ({
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
        dispatch({ type: Action.LOAD_MAP, payload: saveData });
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
