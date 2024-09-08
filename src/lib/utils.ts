import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MapTile, MapLayer } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const idGenerator = (function* () {
  let id = 0;
  while (true) {
    yield id++;
  }
})();

export function getNextId(): number {
  return idGenerator.next().value;
}

export function createMapTile(mapTile: Omit<MapTile, "id">): MapTile {
  return {
    id: getNextId(),
    ...mapTile,
  };
}

export const DEFAULT_TOOLBAR_TILES = [
  createMapTile({ name: "empty", color: "hsl(var(--map-background))" }),
  createMapTile({ name: "wall", color: "#000000" }),
  createMapTile({ name: "start", color: "#41e5e5" }),
  createMapTile({ name: "end", color: "#5cf671" }),
  createMapTile({ name: "enemy", color: "#ef4444" }),
] as const;

export const [EMPTY_TILE] = DEFAULT_TOOLBAR_TILES;

export enum TileType {
  EMPTY = DEFAULT_TOOLBAR_TILES[0].id,
  WALL = DEFAULT_TOOLBAR_TILES[1].id,
  START = DEFAULT_TOOLBAR_TILES[2].id,
  END = DEFAULT_TOOLBAR_TILES[3].id,
  ENEMY = DEFAULT_TOOLBAR_TILES[4].id,
}

export function getTileButtonTextColor(tile: MapTile): string {
  if (tile.texture) {
    return "text-white [text-shadow:_2px_2px_0px_rgb(0_0_0_/_0.8)]";
  }

  if (tile.id === TileType.EMPTY) {
    return "text-foreground";
  }

  const hex = tile.color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "text-black" : "text-white";
}

export function createTextureRefs(layers: readonly MapLayer[]) {
  const texturesMap: Record<string, string> = {};
  for (const layer of layers) {
    for (const row of layer) {
      for (const tile of row) {
        if (tile.texture) {
          texturesMap[tile.texture.filename] = tile.texture.data;
        }
      }
    }
  }
  return texturesMap;
}

export function getRandomColor(existingColors: string[]) {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  if (existingColors.includes(randomColor)) {
    return getRandomColor(existingColors);
  }
  return `#${randomColor}`;
}

export function activeClasses(isActive: boolean) {
  return isActive ? "ring-2 ring-ring" : "";
}

export const NEVER: never = undefined!;

/**
 * An error that can be recovered from.
 */
export class Recoverable extends Error {
  private recoveryFn: <T, U>(value: T) => U;

  public constructor(message: string, recoveryFn: <T, U>(value: T) => U) {
    super(message);
    this.recoveryFn = recoveryFn;
  }

  public recover<T, U>(value: T): U {
    return this.recoveryFn<T, U>(value);
  }
}

export function isRecoverable(value: unknown): value is Recoverable {
  return value instanceof Recoverable;
}
