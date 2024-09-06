// hooks/useMapPersistence.ts
import { useCallback } from "react";
import { SaveData, MapLayer, Tile, MapSize } from "@/lib/types";
import { createTextureRefs } from "@/lib/utils";

export function useMapPersistence(
  layers: MapLayer[],
  mapSize: MapSize,
  toolbarTiles: Tile[],
  setLayers: (layers: MapLayer[]) => void,
  setMapSize: (size: MapSize) => void,
  setToolbarTiles: (tiles: Tile[]) => void,
) {
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
    (content: string) => {
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
                    data: saveData.settings.textureRefs[tile.texture.filename],
                  }
                : undefined,
            })),
          ),
        ),
      );
      setMapSize(saveData.settings.mapSize);
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
    },
    [setLayers, setMapSize, setToolbarTiles],
  );

  return { handleSave, handleLoad };
}
