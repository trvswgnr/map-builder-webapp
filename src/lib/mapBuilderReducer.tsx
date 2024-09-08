// hooks/mapBuilderReducer.tsx
import { MapSize, MapLayer, MapTile, SaveData, Dimension } from "@/lib/types";
import {
  EMPTY_TILE,
  DEFAULT_TOOLBAR_TILES,
  NEVER,
  WALL_TILE,
} from "@/lib/utils";

export interface MapBuilderState {
  mapSize: MapSize;
  selectedTile: number;
  layers: readonly MapLayer[];
  currentLayer: number;
  toolbarTiles: readonly MapTile[];
}

export enum MapBuilderAction {
  SET_MAP_SIZE = "SET_MAP_SIZE",
  SET_SELECTED_TILE = "SET_SELECTED_TILE",
  SET_LAYERS = "SET_LAYERS",
  SET_CURRENT_LAYER = "SET_CURRENT_LAYER",
  SET_TOOLBAR_TILES = "SET_TOOLBAR_TILES",
  HANDLE_TILE_CLICK = "HANDLE_TILE_CLICK",
  ADD_LAYER = "ADD_LAYER",
  DELETE_LAYER = "DELETE_LAYER",
  HANDLE_MAP_SIZE_CHANGE = "HANDLE_MAP_SIZE_CHANGE",
  LOAD_MAP = "LOAD_MAP",
  UPDATE_MAP_TILES = "UPDATE_MAP_TILES",
}

export type ActionEvent<T extends MapBuilderAction, P> = {
  readonly type: T;
  readonly payload: P;
};

// prettier-ignore
export type ReducerActions =
  | ActionEvent<MapBuilderAction.SET_MAP_SIZE, MapSize>
  | ActionEvent<MapBuilderAction.SET_SELECTED_TILE, number>
  | ActionEvent<MapBuilderAction.SET_LAYERS, MapLayer[]>
  | ActionEvent<MapBuilderAction.SET_CURRENT_LAYER, number>
  | ActionEvent<MapBuilderAction.SET_TOOLBAR_TILES, MapTile[]>
  | ActionEvent<MapBuilderAction.HANDLE_TILE_CLICK, { row: number; col: number }>
  | ActionEvent<MapBuilderAction.ADD_LAYER, never>
  | ActionEvent<MapBuilderAction.DELETE_LAYER, number>
  | ActionEvent<MapBuilderAction.HANDLE_MAP_SIZE_CHANGE, { dimension: Dimension; value: number }>
  | ActionEvent<MapBuilderAction.LOAD_MAP, SaveData>
  | ActionEvent<MapBuilderAction.UPDATE_MAP_TILES, MapTile>;

export const initialState: MapBuilderState = {
  mapSize: { columns: 10, rows: 10 },
  selectedTile: WALL_TILE.id,
  layers: [
    Array<MapTile[]>(10)
      .fill(NEVER)
      .map(() => Array<MapTile>(10).fill(EMPTY_TILE)),
  ],
  currentLayer: 0,
  toolbarTiles: DEFAULT_TOOLBAR_TILES,
};

// Reducer function
export function mapBuilderReducer(
  state: MapBuilderState,
  action: ReducerActions,
): MapBuilderState {
  switch (action.type) {
    case MapBuilderAction.SET_MAP_SIZE:
      return { ...state, mapSize: action.payload };
    case MapBuilderAction.SET_SELECTED_TILE:
      return { ...state, selectedTile: action.payload };
    case MapBuilderAction.SET_LAYERS:
      return { ...state, layers: action.payload };
    case MapBuilderAction.SET_CURRENT_LAYER:
      return { ...state, currentLayer: action.payload };
    case MapBuilderAction.SET_TOOLBAR_TILES:
      return { ...state, toolbarTiles: action.payload };
    case MapBuilderAction.HANDLE_TILE_CLICK: {
      const { row, col } = action.payload;
      const newLayers = [...state.layers];
      const selectedTileData = state.toolbarTiles.find(
        (tile) => tile.id === state.selectedTile,
      );
      const layer = newLayers[state.currentLayer];
      if (layer && selectedTileData) {
        newLayers[state.currentLayer] = layer.map((r, i) =>
          i === row
            ? r.map((t, j) => (j === col ? { ...selectedTileData } : t))
            : r,
        );
      }
      return { ...state, layers: newLayers };
    }
    case MapBuilderAction.ADD_LAYER: {
      const newLayer = Array(state.mapSize.rows)
        .fill(null)
        .map(() => Array(state.mapSize.columns).fill(EMPTY_TILE));
      return {
        ...state,
        layers: [...state.layers, newLayer],
        currentLayer: state.layers.length,
      };
    }
    case MapBuilderAction.DELETE_LAYER: {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter((_, i) => i !== action.payload);
      return {
        ...state,
        layers: newLayers,
        currentLayer: Math.min(state.currentLayer, newLayers.length - 1),
      };
    }
    case MapBuilderAction.HANDLE_MAP_SIZE_CHANGE: {
      const { dimension, value } = action.payload;
      const newSize = { ...state.mapSize, [dimension]: value };
      const newLayers = state.layers.map((layer) =>
        Array(newSize.rows)
          .fill(null)
          .map((_, rowIndex) =>
            Array(newSize.columns)
              .fill(null)
              .map((_, colIndex) => {
                if (
                  rowIndex < layer.length &&
                  colIndex < (layer[0]?.length ?? -Infinity)
                ) {
                  const row = layer[rowIndex];
                  if (!row) {
                    return EMPTY_TILE;
                  }
                  const tile = row[colIndex];
                  return tile ?? EMPTY_TILE;
                }
                return EMPTY_TILE;
              }),
          ),
      );
      return { ...state, mapSize: newSize, layers: newLayers };
    }
    case MapBuilderAction.LOAD_MAP: {
      const { layers, settings } = action.payload;
      return {
        ...state,
        layers: layers.map((layer) =>
          layer.map((row) =>
            row.map((tile) => ({
              id: tile.id,
              name: tile.name,
              color: tile.color,
              texture: tile.texture
                ? {
                    filename: tile.texture.filename,
                    data: settings.textureRefs[tile.texture.filename] ?? "",
                  }
                : undefined,
            })),
          ),
        ),
        mapSize: settings.mapSize,
        toolbarTiles: settings.toolbarTiles.map(
          (tile): MapTile => ({
            id: tile.id,
            name: tile.name,
            color: tile.color,
            texture: tile.texture
              ? {
                  filename: tile.texture.filename,
                  data: settings.textureRefs[tile.texture.filename] ?? "",
                }
              : undefined,
          }),
        ),
      };
    }
    case MapBuilderAction.UPDATE_MAP_TILES: {
      const updatedTile = action.payload as MapTile;
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.map((row) =>
            row.map((tile) =>
              tile.id === updatedTile.id ? { ...tile, ...updatedTile } : tile,
            ),
          ),
        ),
      };
    }
  }
}
