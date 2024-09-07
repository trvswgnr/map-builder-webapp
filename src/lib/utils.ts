import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Tile, MapLayer } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMPTY_TILE: Tile = { type: "empty", color: "transparent" };
export const DEFAULT_TOOLBAR_TILES: Tile[] = [
  EMPTY_TILE,
  { type: "wall", color: "#1f2937" },
  { type: "start", color: "#41e5e5" },
  { type: "end", color: "#5cf671" },
  { type: "enemy", color: "#ef4444" },
];

export function getTileButtonTextColor(tile: Tile): string {
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
