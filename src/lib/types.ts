// lib/types.ts
export type MapTile = {
  readonly name: string;
  readonly color: string;
  readonly texture?: {
    readonly filename: string;
    readonly data: string;
  };
};

/**
 * a matrix of Tiles with and width and height
 */
export type MapLayer = readonly MapTile[][];

export type MapSize = {
  readonly columns: number;
  readonly rows: number;
};

export type SaveDataTile = Readonly<
  Omit<MapTile, "texture"> & {
    readonly texture: { readonly filename: string } | null;
  }
>;

export type SaveDataLayer = readonly SaveDataTile[][];

export type SaveData = {
  readonly layers: readonly SaveDataLayer[];
  readonly settings: {
    readonly mapSize: MapSize;
    readonly toolbarTiles: readonly SaveDataTile[];
    readonly textureRefs: Readonly<Record<string, string>>;
  };
};

export type ChartData = {
  readonly type: string;
  readonly count: number;
};

export type Dimension = "columns" | "rows";

export type Some<T> = NonNullable<T>;
export type None = null | undefined;
export type Option<T> = Some<T> | None;
