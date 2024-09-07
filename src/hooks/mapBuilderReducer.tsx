// hooks/mapBuilderReducer.tsx
import { MapSize, MapLayer, Tile, SaveData, Dimension } from "@/lib/types";
import { EMPTY_TILE, DEFAULT_TOOLBAR_TILES, NEVER } from "@/lib/utils";

// State type
export interface MapBuilderState {
  mapSize: MapSize;
  selectedTile: string;
  layers: MapLayer[];
  currentLayer: number;
  toolbarTiles: Tile[];
}

export enum Action {
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
}

// prettier-ignore
export type Actions =
  | Action.Event<Action.SET_MAP_SIZE, MapSize>
  | Action.Event<Action.SET_SELECTED_TILE, string>
  | Action.Event<Action.SET_LAYERS, MapLayer[]>
  | Action.Event<Action.SET_CURRENT_LAYER, number>
  | Action.Event<Action.SET_TOOLBAR_TILES, Tile[]>
  | Action.Event<Action.HANDLE_TILE_CLICK, { row: number; col: number }>
  | Action.Event<Action.ADD_LAYER, never>
  | Action.Event<Action.DELETE_LAYER, number>
  | Action.Event<Action.HANDLE_MAP_SIZE_CHANGE, { dimension: Dimension; value: number }>
  | Action.Event<Action.LOAD_MAP, SaveData>;

export namespace Action {
  export type Event<T extends Action, P> = {
    readonly type: T;
    readonly payload: P;
  };
}

export const initialState: MapBuilderState = {
  mapSize: { columns: 10, rows: 10 },
  selectedTile: "wall",
  layers: [
    Array<Tile[]>(10)
      .fill(NEVER)
      .map(() => Array<Tile>(10).fill(EMPTY_TILE)),
  ],
  currentLayer: 0,
  toolbarTiles: DEFAULT_TOOLBAR_TILES,
};

// Reducer function
export function mapBuilderReducer(
  state: MapBuilderState,
  action: Actions,
): MapBuilderState {
  switch (action.type) {
    case Action.SET_MAP_SIZE:
      return { ...state, mapSize: action.payload };
    case Action.SET_SELECTED_TILE:
      return { ...state, selectedTile: action.payload };
    case Action.SET_LAYERS:
      return { ...state, layers: action.payload };
    case Action.SET_CURRENT_LAYER:
      return { ...state, currentLayer: action.payload };
    case Action.SET_TOOLBAR_TILES:
      return { ...state, toolbarTiles: action.payload };
    case Action.HANDLE_TILE_CLICK: {
      const { row, col } = action.payload;
      const newLayers = [...state.layers];
      const selectedTileData = state.toolbarTiles.find(
        (tile) => tile.type === state.selectedTile,
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
    case Action.ADD_LAYER: {
      const newLayer = Array(state.mapSize.rows)
        .fill(null)
        .map(() => Array(state.mapSize.columns).fill(EMPTY_TILE));
      return {
        ...state,
        layers: [...state.layers, newLayer],
        currentLayer: state.layers.length,
      };
    }
    case Action.DELETE_LAYER: {
      if (state.layers.length <= 1) return state;
      const newLayers = state.layers.filter((_, i) => i !== action.payload);
      return {
        ...state,
        layers: newLayers,
        currentLayer: Math.min(state.currentLayer, newLayers.length - 1),
      };
    }
    case Action.HANDLE_MAP_SIZE_CHANGE: {
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
    case Action.LOAD_MAP: {
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
                    data: settings.textureRefs[tile.texture.filename] ?? "",
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
                data: settings.textureRefs[tile.texture.filename] ?? "",
              }
            : undefined,
        })),
      };
    }
  }
}
