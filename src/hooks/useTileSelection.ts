// hooks/useTileSelection.ts
import { useState, useCallback } from "react";
import { Tile } from "@/lib/types";
import { DEFAULT_TOOLBAR_TILES } from "@/lib/utils";

export function useTileSelection() {
  const [selectedTile, setSelectedTile] = useState("wall");
  const [toolbarTiles, setToolbarTiles] = useState(DEFAULT_TOOLBAR_TILES);

  const addToolbarTile = useCallback((newTile: Tile) => {
    setToolbarTiles((prevTiles) => [...prevTiles, newTile]);
  }, []);

  const updateToolbarTile = useCallback((index: number, updatedTile: Tile) => {
    setToolbarTiles((prevTiles) => {
      const newTiles = [...prevTiles];
      newTiles[index] = updatedTile;
      return newTiles;
    });
  }, []);

  const deleteToolbarTile = useCallback(
    (index: number) => {
      setToolbarTiles((prevTiles) => {
        const newTiles = prevTiles.filter((_, i) => i !== index);
        if (selectedTile === prevTiles[index].type) {
          setSelectedTile("empty");
        }
        return newTiles;
      });
    },
    [selectedTile],
  );

  return {
    selectedTile,
    setSelectedTile,
    toolbarTiles,
    addToolbarTile,
    updateToolbarTile,
    deleteToolbarTile,
  };
}
