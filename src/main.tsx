import "./globals.css";

import { createRoot } from "react-dom/client";

import { StrictMode, useState, useEffect, Suspense, lazy } from "react";
import { Edit, Plus, Trash2, Upload, Save, FolderUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { Range } from "react-range";
import { Direction, ITrackBackground } from "react-range/lib/types";

const EMPTY_TILE: Tile = { type: "empty", color: "transparent" };

const DEFAULT_TOOLBAR_TILES: Tile[] = [
  EMPTY_TILE,
  { type: "wall", color: "#1f2937" },
  { type: "start", color: "#41e5e5" },
  { type: "end", color: "#5cf671" },
  { type: "enemy", color: "#ef4444" },
];

const DistributionChart = lazyLoadDistributionChart();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapBuilder />
  </StrictMode>,
);

interface Tile {
  type: string;
  color: string;
  texture?: {
    filename: string;
    data: string;
  };
}

type MapLayer = Tile[][];

interface MapSize {
  columns: number;
  rows: number;
}

type SaveDataTile = Omit<Tile, "texture"> & {
  texture: { filename: string } | undefined;
};

type SaveDataLayer = SaveDataTile[][];

interface SaveData {
  layers: SaveDataLayer[];
  settings: {
    mapSize: MapSize;
    toolbarTiles: SaveDataTile[];
    textureRefs: Record<string, string>;
  };
}

interface ChartData {
  type: string;
  count: number;
}

function MapBuilder() {
  const errorToast = useErrorToast();
  const [mapSize, setMapSize] = useState<MapSize>({ columns: 10, rows: 10 });
  const [selectedTile, setSelectedTile] = useState("wall");
  const initialLayer: MapLayer = Array(mapSize.rows)
    .fill(null)
    .map(() => Array(mapSize.columns).fill(EMPTY_TILE));
  const [layers, setLayers] = useState([initialLayer]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [toolbarTiles, setToolbarTiles] = useState(DEFAULT_TOOLBAR_TILES);
  const [layerToDelete, setLayerToDelete] = useState<number | null>(null);

  const handleTileClick = (row: number, col: number): void => {
    const newLayers = [...layers];
    const selectedTileData = toolbarTiles.find(
      (tile) => tile.type === selectedTile,
    );
    if (selectedTileData) {
      newLayers[currentLayer][row][col] = { ...selectedTileData };
    }
    setLayers(newLayers);
  };

  const handleEditorMouseDown = (row: number, col: number): void => {
    setIsDragging(true);
    handleTileClick(row, col);
  };

  const handleEditorMouseEnter = (row: number, col: number): void => {
    if (isDragging) {
      handleTileClick(row, col);
    }
  };

  const handleEditorMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleSave = (): void => {
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
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
                    data: saveData.settings.textureRefs[tile.texture.filename],
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
  };

  const handleToolbarAddTile = () => {
    const newTile: Tile = {
      type: `NewTile${toolbarTiles.length + 1}`,
      color: getRandomColor(toolbarTiles.map((tile) => tile.color)),
    };
    setToolbarTiles([...toolbarTiles, newTile]);
  };

  const handleToolbarEditTile = (index: number, updatedTile: Tile) => {
    const newTiles = [...toolbarTiles];
    newTiles[index] = updatedTile;
    setToolbarTiles(newTiles);

    // update the map to reflect the changes in tile properties
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        const newTiles = layer.map((row) =>
          row.map((tile) =>
            tile.type === updatedTile.type ? { ...tile, ...updatedTile } : tile,
          ),
        );
        return { ...layer, tiles: newTiles };
      }),
    );
  };

  const handleToolbarDeleteTile = (index: number) => {
    const newTiles = toolbarTiles.filter((_, i) => i !== index);
    setToolbarTiles(newTiles);

    // if the deleted tile was selected, reset the selection
    if (selectedTile === toolbarTiles[index].type) {
      setSelectedTile("empty");
    }

    // update the map to replace deleted tile with 'empty'
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        const newTiles = layer.map((row) =>
          row.map((tile) =>
            tile.type === toolbarTiles[index].type ? toolbarTiles[0] : tile,
          ),
        );
        return { ...layer, tiles: newTiles };
      }),
    );
  };

  function handleTextureUpload(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result;
        if (typeof res !== "string") {
          return void errorToast(
            "Failed to load texture. e.target.result is not a string. Please try again.",
          );
        }
        const texture = {
          filename: file.name,
          data: res,
        };
        handleToolbarEditTile(index, { ...toolbarTiles[index], texture });
      };
      reader.readAsDataURL(file);
    }
  }

  const tileStats = layers
    .flatMap((layer) => layer.flat())
    .reduce((acc, tile) => {
      acc[tile.type] = (acc[tile.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const chartData: ChartData[] = Object.entries(tileStats).map(
    ([type, count]) => ({ type, count }),
  );

  const [mapColumns, setMapColumns] = useState(mapSize.columns);
  const [mapRows, setMapRows] = useState(mapSize.rows);

  const handleMapSizeChange = (
    dimension: "columns" | "rows",
    value: number,
  ) => {
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
  };

  const addLayer = () => {
    const newLayer: MapLayer = Array(mapSize.rows)
      .fill(null)
      .map(() => Array(mapSize.columns).fill(EMPTY_TILE));
    setLayers([...layers, newLayer]);
    setCurrentLayer(layers.length);
  };

  const openDeleteLayerModal = (index: number): void => setLayerToDelete(index);
  const closeDeleteLayerModal = (): void => setLayerToDelete(null);

  const confirmDeleteLayer = () => {
    if (layerToDelete !== null && layers.length > 1) {
      const newLayers = layers.filter((_, i) => i !== layerToDelete);
      setLayers(newLayers);
      setCurrentLayer(Math.min(currentLayer, newLayers.length - 1));
    }
    closeDeleteLayerModal();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [mapSize]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-5">Map Builder</h1>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex space-x-2">
                {layers.map((_, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <Button
                      variant={currentLayer === index ? "secondary" : "outline"}
                      className={`
                        border
                        ${activeClasses(currentLayer === index)}
                      `}
                      onClick={() => setCurrentLayer(index)}
                    >
                      Layer {index + 1}
                    </Button>
                    {layers.length > 1 && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute z-10 -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive text-destructive hover:text-white"
                        onClick={() => openDeleteLayerModal(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={addLayer}
                  className="py-0 px-2"
                >
                  <Plus
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
              <div
                className="relative w-full touch-action-none"
                style={{
                  paddingBottom: `${(mapSize.rows / mapSize.columns) * 100}%`,
                  cursor: "crosshair",
                }}
              >
                {layers.map((layer, layerIndex) => (
                  <div
                    key={layerIndex}
                    className="absolute inset-0"
                    style={{
                      zIndex:
                        layerIndex <= currentLayer
                          ? layers.length - layerIndex
                          : 0,
                      opacity:
                        layerIndex === currentLayer
                          ? 1
                          : layerIndex < currentLayer
                          ? 0.3
                          : 0,
                      pointerEvents:
                        layerIndex === currentLayer ? "auto" : "none",
                    }}
                  >
                    <div
                      className="grid h-full w-full"
                      style={{
                        gridTemplateColumns: `repeat(${mapSize.columns}, 1fr)`,
                        gridTemplateRows: `repeat(${mapSize.rows}, 1fr)`,
                      }}
                    >
                      {layer.map((row, rowIndex) =>
                        row.map((tile, colIndex) => (
                          <div
                            key={`${layerIndex}-${rowIndex}-${colIndex}`}
                            className="tile border border-gray-300 hover:border-gray-500 hover:border-2 dark:border-gray-900 bg-cover bg-center"
                            style={{
                              backgroundColor: tile.color,
                              backgroundImage: tile.texture
                                ? `url(${tile.texture.data})`
                                : "none",
                            }}
                            onMouseDown={() =>
                              layerIndex === currentLayer &&
                              handleEditorMouseDown(rowIndex, colIndex)
                            }
                            onMouseEnter={() =>
                              layerIndex === currentLayer &&
                              handleEditorMouseEnter(rowIndex, colIndex)
                            }
                            onMouseUp={handleEditorMouseUp}
                            onTouchStart={(e) => {
                              e.preventDefault(); // Prevent window sliding
                              layerIndex === currentLayer &&
                                handleEditorMouseDown(rowIndex, colIndex);
                            }}
                            onTouchMove={(e) => {
                              e.preventDefault(); // Prevent window sliding
                              const touch = e.touches[0];
                              const element = document.elementFromPoint(
                                touch.clientX,
                                touch.clientY,
                              ) as HTMLElement;
                              const tileCoords = element.dataset.tileCoords;
                              if (tileCoords) {
                                const [touchRowIndex, touchColIndex] =
                                  tileCoords.split(",").map(Number);
                                layerIndex === currentLayer &&
                                  handleEditorMouseEnter(
                                    touchRowIndex,
                                    touchColIndex,
                                  );
                              }
                            }}
                            onTouchEnd={(e) => {
                              e.preventDefault(); // Prevent window sliding
                              handleEditorMouseUp();
                            }}
                            data-tile-coords={`${rowIndex},${colIndex}`}
                          ></div>
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div id="right">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Toolbar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {toolbarTiles.map((tile, index) => (
                    <div
                      key={tile.type}
                      className="relative group"
                    >
                      <button
                        className={c`
                          border w-full h-12 bg-cover bg-center
                          ${activeClasses(selectedTile === tile.type)}
                        `}
                        style={{
                          backgroundColor: tile.color,
                          borderColor:
                            tile.type === EMPTY_TILE.type ? "#eee" : tile.color,
                          backgroundImage: tile.texture
                            ? `url(${tile.texture.data})`
                            : "none",
                        }}
                        onClick={() => setSelectedTile(tile.type)}
                      >
                        <span
                          className={c`
                            ${getTileButtonTextColor(tile)}
                            -mt-1 absolute inset-0 flex items-center justify-center text-xs font-bold
                          `}
                        >
                          {tile.type}
                        </span>
                      </button>
                      {tile.type !== EMPTY_TILE.type && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h3 className="font-bold">Edit Tile</h3>
                                {index > 0 && (
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                      handleToolbarDeleteTile(index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`tile-type-${index}`}>
                                  Type
                                </Label>
                                <Input
                                  id={`tile-type-${index}`}
                                  value={tile.type}
                                  onChange={(e) =>
                                    handleToolbarEditTile(index, {
                                      ...tile,
                                      type: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`tile-color-${index}`}>
                                  Color
                                </Label>
                                <div className="flex space-x-2">
                                  <Input
                                    id={`tile-color-${index}`}
                                    type="color"
                                    value={tile.color}
                                    onChange={(e) =>
                                      handleToolbarEditTile(index, {
                                        ...tile,
                                        color: e.target.value,
                                      })
                                    }
                                    className="w-12 h-8 p-0"
                                  />
                                  <Input
                                    value={tile.color}
                                    onChange={(e) =>
                                      handleToolbarEditTile(index, {
                                        ...tile,
                                        color: e.target.value,
                                      })
                                    }
                                    className="flex-grow"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`tile-texture-${index}`}>
                                  Texture
                                </Label>
                                <div className="flex items-center space-x-2">
                                  {!tile.texture ? (
                                    <Button
                                      asChild
                                      variant="outline"
                                    >
                                      <label
                                        htmlFor={`tile-texture-${index}`}
                                        className="cursor-pointer"
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Texture
                                        <input
                                          id={`tile-texture-${index}`}
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) =>
                                            handleTextureUpload(index, e)
                                          }
                                        />
                                      </label>
                                    </Button>
                                  ) : null}
                                  {tile.texture && (
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        handleToolbarEditTile(index, {
                                          ...tile,
                                          texture: undefined,
                                        })
                                      }
                                    >
                                      Remove Texture
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={handleToolbarAddTile}
                    className="h-12 w-12 p-0"
                  >
                    <Plus
                      height={24}
                      width={24}
                    />
                  </Button>
                </div>
                <div>
                  <Label htmlFor="map-columns">Map Columns: {mapColumns}</Label>
                  <Slider
                    label="Adjust Map Columns"
                    min={5}
                    max={20}
                    step={1}
                    values={[mapColumns]}
                    onChange={(values) => setMapColumns(values[0])}
                    onFinalChange={(values) =>
                      handleMapSizeChange("columns", values[0])
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="map-rows">Map Rows: {mapRows}</Label>{" "}
                  <Slider
                    label="Adjust Map Rows"
                    min={5}
                    max={20}
                    step={1}
                    values={[mapRows]}
                    onChange={(values) => setMapRows(values[0])}
                    onFinalChange={(value) =>
                      handleMapSizeChange("rows", value[0])
                    }
                  />
                </div>
                <div className="space-x-2">
                  <Button onClick={handleSave}>
                    <Save
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    Save
                  </Button>
                  <Button
                    asChild
                    className="cursor-pointer"
                  >
                    <label>
                      <FolderUpIcon
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      Load
                      <Input
                        type="file"
                        className="hidden"
                        onChange={handleLoad}
                        accept=".json"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(tileStats).map(([type, count]) => (
                  <li key={type}>
                    {type}: {count}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tile Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
                <DistributionChart data={chartData} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={layerToDelete !== null}
        onOpenChange={closeDeleteLayerModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Layer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Layer{" "}
              {layerToDelete !== null ? layerToDelete + 1 : ""}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteLayerModal}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteLayer}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

function Slider({
  values,
  min,
  max,
  step,
  label,
  onChange,
  onFinalChange,
}: {
  values: number[];
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (values: number[]) => void;
  onFinalChange: (values: number[]) => void;
}) {
  return (
    <div className="flex justify-center flex-wrap">
      <Range
        label={label}
        values={values}
        step={step}
        min={min}
        max={max}
        rtl={false}
        onChange={onChange}
        onFinalChange={onFinalChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: "36px",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              ref={props.ref}
              className="h-1 w-full"
              style={{
                background: getTrackBackground({
                  values,
                  colors: ["#000", "#ccc"],
                  min,
                  max,
                  rtl: false,
                }),
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            key={props.key}
            style={props.style}
            className="outline-none"
          >
            <div
              style={{
                transition: "transform 0.1s",
                transform: isDragged
                  ? "scale(1.2) translateY(-5px)"
                  : "scale(1)",
              }}
              className={c`
              h-6 w-6 bg-white flex justify-center items-center border
              ${isDragged ? "border-black" : "border-gray-300"}
            `}
            >
              <div
                className={c`
                h-3 w-1
                ${isDragged ? "bg-black" : "bg-gray-300"}
              `}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}

function getTrackBackground({
  values,
  colors,
  min,
  max,
  direction = Direction.Right,
  rtl = false,
}: ITrackBackground) {
  if (rtl && direction === Direction.Right) {
    direction = Direction.Left;
  } else if (rtl && Direction.Left) {
    direction = Direction.Right;
  }
  // sort values ascending
  const progress = values
    .slice(0)
    .sort((a, b) => a - b)
    .map((value) => ((value - min) / (max - min)) * 100);
  const middle = progress.reduce(
    (acc, point, index) =>
      `${acc}, ${colors[index]} ${point}%, ${colors[index + 1]} ${point}%`,
    "",
  );
  return `linear-gradient(${direction}, ${colors[0]} 0%${middle}, ${
    colors[colors.length - 1]
  } 100%)`;
}

function lazyLoadDistributionChart() {
  return lazy(async () => {
    const {
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      Legend,
      ResponsiveContainer,
    } = await import("recharts");
    return {
      default: ({ data }: { data: ChartData[] }) => {
        return (
          <ResponsiveContainer
            width="100%"
            aspect={16 / 9}
          >
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#8884d8"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      },
    };
  });
}

function useErrorToast() {
  const { toast } = useToast();
  return (description: string) => {
    toast({
      title: "Error",
      description,
      variant: "destructive",
    } as const);
  };
}

function getTileButtonTextColor(tile: Tile): string {
  // if the tile has a texture, use white text with a shadow for better visibility
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

function createTextureRefs(layers: MapLayer[]) {
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

function getRandomColor(existingColors: string[]) {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  // if it's one of our existing colors, we need to generate a new one
  if (existingColors.includes(randomColor)) {
    return getRandomColor(existingColors);
  }
  return `#${randomColor}`;
}

function activeClasses(isActive: boolean) {
  return isActive ? "ring-2 ring-blue-500" : "";
}

function c(inputs: TemplateStringsArray, ...values: any[]): string {
  return String.raw({ raw: inputs }, ...values)
    .replace(/\s+/g, " ")
    .trim();
}
