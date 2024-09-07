// hooks/MapBuilderContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { SaveData } from "@/lib/types";
import { useErrorToast } from "@/hooks/useErrorToast";
import { createTextureRefs } from "@/lib/utils";
import {
  mapBuilderReducer,
  initialState,
  MapBuilderState,
  Action,
  Actions,
} from "@/hooks/mapBuilderReducer";

type MapBuilderContextType = MapBuilderState & {
  dispatch: React.Dispatch<Actions>;
  handleSave: () => void;
  handleLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const MapBuilderContext = createContext<MapBuilderContextType | undefined>(
  undefined,
);

export const useMapBuilder = () => {
  const context = useContext(MapBuilderContext);
  if (!context) {
    throw new Error("useMapBuilder must be used within a MapBuilderProvider");
  }
  return context;
};

export const MapBuilderProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const errorToast = useErrorToast();
  const [state, dispatch] = useReducer(mapBuilderReducer, initialState);

  const handleSave = useCallback(() => {
    const saveData: SaveData = {
      layers: state.layers.map((layer) =>
        layer.map((row) =>
          row.map((tile) => ({
            type: tile.type,
            color: tile.color,
            texture: tile.texture
              ? { filename: tile.texture.filename }
              : undefined,
          })),
        ),
      ),
      settings: {
        mapSize: state.mapSize,
        toolbarTiles: state.toolbarTiles.map((tile) => ({
          type: tile.type,
          color: tile.color,
          texture: tile.texture
            ? { filename: tile.texture.filename }
            : undefined,
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

  const handleLoad = useCallback(
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
        handleSave,
        handleLoad,
      }}
    >
      {children}
    </MapBuilderContext.Provider>
  );
};
