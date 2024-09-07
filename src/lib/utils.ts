import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MapTile, MapLayer } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMPTY_TILE: MapTile = { name: "empty", color: "transparent" };
export const DEFAULT_TOOLBAR_TILES: MapTile[] = [
  EMPTY_TILE,
  { name: "wall", color: "#000000" },
  { name: "start", color: "#41e5e5" },
  { name: "end", color: "#5cf671" },
  { name: "enemy", color: "#ef4444" },
];

export function getTileButtonTextColor(tile: MapTile): string {
  if (tile.texture) {
    return "text-white [text-shadow:_2px_2px_0px_rgb(0_0_0_/_0.8)]";
  }

  if (tile.color === "transparent") {
    return "text-black dark:text-white";
  }

  const hex = tile.color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "text-black" : "text-white";
}

export function createTextureRefs(layers: MapLayer[]) {
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
  return isActive ? "ring-2 ring-blue-500" : "";
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
