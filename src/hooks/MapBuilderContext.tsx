// context/MapBuilderContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Tile, MapLayer, MapSize, SaveData } from "@/lib/types";
import { useErrorToast } from "@/hooks/useErrorToast";
import {
  createTextureRefs,
  DEFAULT_TOOLBAR_TILES,
  EMPTY_TILE,
} from "@/lib/utils";

type MapBuilderContextType = {
  mapSize: MapSize;
  setMapSize: React.Dispatch<React.SetStateAction<MapSize>>;
  selectedTile: string;
  setSelectedTile: React.Dispatch<React.SetStateAction<string>>;
  layers: MapLayer[];
  setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>;
  currentLayer: number;
  setCurrentLayer: React.Dispatch<React.SetStateAction<number>>;
  toolbarTiles: Tile[];
  setToolbarTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
  handleTileClick: (row: number, col: number) => void;
  handleSave: () => void;
  handleLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMapSizeChange: (dimension: 'columns' | 'rows', value: number) => void;
  addLayer: () => void;
  deleteLayer: (index: number) => void;
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
  const [mapSize, setMapSize] = useState<MapSize>({ columns: 10, rows: 10 });
  const [selectedTile, setSelectedTile] = useState("wall");
  const initialLayer: MapLayer = Array(mapSize.rows)
    .fill(null)
    .map(() => Array(mapSize.columns).fill(EMPTY_TILE));
  const [layers, setLayers] = useState([initialLayer]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [toolbarTiles, setToolbarTiles] = useState(DEFAULT_TOOLBAR_TILES);

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      setLayers((prevLayers) => {
        const newLayers = [...prevLayers];
        const selectedTileData = toolbarTiles.find(
          (tile) => tile.type === selectedTile,
        );
        if (selectedTileData) {
          newLayers[currentLayer] = newLayers[currentLayer].map((r, i) =>
            i === row
              ? r.map((t, j) => (j === col ? { ...selectedTileData } : t))
              : r,
          );
        }
        return newLayers;
      });
    },
    [currentLayer, selectedTile, toolbarTiles],
  );

  const handleSave = useCallback(() => {
    const saveData: SaveData = {
      layers: layers.map((layer) =>
        layer.map((row) =>
          row.map((tile) => ({
            type: tile.type,
            color: tile.color,
            texture: tile.texture
              ? {
                  filename: tile.texture.filename,
                }
              : undefined,
          })),
        ),
      ),
      settings: {
        mapSize: mapSize,
        toolbarTiles: toolbarTiles.map((tile) => ({
          type: tile.type,
          color: tile.color,
          texture: tile.texture
            ? {
                filename: tile.texture.filename,
              }
            : undefined,
        })),
        textureRefs: createTextureRefs(layers),
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
  }, [layers, mapSize, toolbarTiles]);

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
        setLayers(
          saveData.layers.map((layer) =>
            layer.map((row) =>
              row.map((tile) => ({
                type: tile.type,
                color: tile.color,
                texture: tile.texture
                  ? {
                      filename: tile.texture.filename,
                      data: saveData.settings.textureRefs[
                        tile.texture.filename
                      ],
                    }
                  : undefined,
              })),
            ),
          ),
        );
        setMapSize({
          columns: saveData.settings.mapSize.columns,
          rows: saveData.settings.mapSize.rows,
        });
        setToolbarTiles(
          saveData.settings.toolbarTiles.map((tile) => ({
            type: tile.type,
            color: tile.color,
            texture: tile.texture
              ? {
                  filename: tile.texture.filename,
                  data: saveData.settings.textureRefs[tile.texture.filename],
                }
              : undefined,
          })),
        );
      };
      reader.readAsText(file);
    },
    [errorToast],
  );

  const addLayer = useCallback(() => {
    setLayers((prevLayers) => [
      ...prevLayers,
      Array(mapSize.rows)
        .fill(null)
        .map(() => Array(mapSize.columns).fill(EMPTY_TILE)),
    ]);
    setCurrentLayer((prevLayer) => prevLayer + 1);
  }, [mapSize]);

  const deleteLayer = useCallback(
    (index: number) => {
      if (layers.length > 1) {
        setLayers((prevLayers) => prevLayers.filter((_, i) => i !== index));
        setCurrentLayer((prevLayer) => Math.min(prevLayer, layers.length - 2));
      }
    },
    [layers],
  );

  const handleMapSizeChange = useCallback((dimension: 'columns' | 'rows', value: number) => {
    setMapSize((prev) => {
      const newSize = { ...prev, [dimension]: value };
      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          const newTiles = Array(newSize.rows)
            .fill(null)
            .map((_, rowIndex) =>
              Array(newSize.columns)
                .fill(null)
                .map((_, colIndex) => {
                  if (rowIndex < layer.length && colIndex < layer[0].length) {
                    return layer[rowIndex][colIndex];
                  }
                  return EMPTY_TILE;
                }),
            );
          return newTiles;
        }),
      );
      return newSize;
    });
  }, []);


  return (
    <MapBuilderContext.Provider
      value={{
        mapSize,
        setMapSize,
        selectedTile,
        setSelectedTile,
        layers,
        setLayers,
        currentLayer,
        setCurrentLayer,
        toolbarTiles,
        setToolbarTiles,
        handleTileClick,
        handleSave,
        handleLoad,
        handleMapSizeChange,
        addLayer,
        deleteLayer,
      }}
    >
      {children}
    </MapBuilderContext.Provider>
  );
};
