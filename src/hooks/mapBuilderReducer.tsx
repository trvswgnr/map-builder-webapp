// hooks/mapBuilderReducer.tsx
import { Reducer } from "react";
import { MapSize, MapLayer, Tile, SaveData } from "@/lib/types";
import { EMPTY_TILE, DEFAULT_TOOLBAR_TILES } from "@/lib/utils";

// State type
export interface MapBuilderState {
  mapSize: MapSize;
  selectedTile: string;
  layers: MapLayer[];
  currentLayer: number;
  toolbarTiles: Tile[];
}

// Action types
type Action =
  | { type: "SET_MAP_SIZE"; payload: MapSize }
  | { type: "SET_SELECTED_TILE"; payload: string }
  | { type: "SET_LAYERS"; payload: MapLayer[] }
  | { type: "SET_CURRENT_LAYER"; payload: number }
  | { type: "SET_TOOLBAR_TILES"; payload: Tile[] }
  | { type: "HANDLE_TILE_CLICK"; payload: { row: number; col: number } }
  | { type: "ADD_LAYER" }
  | { type: "DELETE_LAYER"; payload: number }
  | {
      type: "HANDLE_MAP_SIZE_CHANGE";
      payload: { dimension: "columns" | "rows"; value: number };
    }
  | { type: "LOAD_MAP"; payload: SaveData };

// Initial state
export const initialState: MapBuilderState = {
  mapSize: { columns: 10, rows: 10 },
  selectedTile: "wall",
  layers: [
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(EMPTY_TILE)),
  ],
  currentLayer: 0,
  toolbarTiles: DEFAULT_TOOLBAR_TILES,
};

// Reducer function
export const mapBuilderReducer: Reducer<MapBuilderState, Action> = (
  state,
  action,
) => {
  switch (action.type) {
    case "SET_MAP_SIZE":
      return { ...state, mapSize: action.payload };
    case "SET_SELECTED_TILE":
      return { ...state, selectedTile: action.payload };
    case "SET_LAYERS":
      return { ...state, layers: action.payload };
    case "SET_CURRENT_LAYER":
      return { ...state, currentLayer: action.payload };
    case "SET_TOOLBAR_TILES":
      return { ...state, toolbarTiles: action.payload };
    case "HANDLE_TILE_CLICK": {
      const { row, col } = action.payload;
      const newLayers = [...state.layers];
      const selectedTileData = state.toolbarTiles.find(
        (tile) => tile.type === state.selectedTile,
      );
      if (selectedTileData) {
        newLayers[state.currentLayer] = newLayers[state.currentLayer].map(
          (r, i) =>
            i === row
              ? r.map((t, j) => (j === col ? { ...selectedTileData } : t))
              : r,
        );
      }
      return { ...state, layers: newLayers };
    }
    case "ADD_LAYER": {
      const newLayer = Array(state.mapSize.rows)
        .fill(null)
        .map(() => Array(state.mapSize.columns).fill(EMPTY_TILE));
      return {
        ...state,
        layers: [...state.layers, newLayer],
        currentLayer: state.layers.length,
      };
    }
    case "DELETE_LAYER": {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter((_, i) => i !== action.payload);
      return {
        ...state,
        layers: newLayers,
        currentLayer: Math.min(state.currentLayer, newLayers.length - 1),
      };
    }
    case "HANDLE_MAP_SIZE_CHANGE": {
      const { dimension, value } = action.payload;
      const newSize = { ...state.mapSize, [dimension]: value };
      const newLayers = state.layers.map((layer) =>
        Array(newSize.rows)
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
          ),
      );
      return { ...state, mapSize: newSize, layers: newLayers };
    }
    case "LOAD_MAP": {
      const { layers, settings } = action.payload;
      return {
        ...state,
        layers: layers.map((layer) =>
          layer.map((row) =>
            row.map((tile) => ({
              type: tile.type,
              color: tile.color,
              texture: tile.texture
                ? {
                    filename: tile.texture.filename,
                    data: settings.textureRefs[tile.texture.filename],
                  }
                : undefined,
            })),
          ),
        ),
        mapSize: settings.mapSize,
        toolbarTiles: settings.toolbarTiles.map((tile) => ({
          type: tile.type,
          color: tile.color,
          texture: tile.texture
            ? {
                filename: tile.texture.filename,
                data: settings.textureRefs[tile.texture.filename],
              }
            : undefined,
        })),
      };
    }
    default:
      return state;
  }
};
