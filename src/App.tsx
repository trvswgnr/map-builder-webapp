import { useState, useEffect } from "preact/compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Edit, Plus, Trash2, Upload, Save, FolderUpIcon } from "lucide-react";
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

interface Tile {
  type: string;
  color: string;
  texture?: {
    filename: string;
    data: string;
  };
}

const EMPTY_TILE = { type: "empty", color: "transparent" } as const;

const DEFAULT_TOOLBAR_TILES: Tile[] = [
  EMPTY_TILE,
  { type: "wall", color: "#1f2937" },
  { type: "start", color: "#41e5e5" },
  { type: "end", color: "#5cf671" },
  { type: "enemy", color: "#ef4444" },
];

interface MapLayer {
  tiles: Tile[][];
}

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

export default function WorldBuilder() {
  const errorToast = useErrorToast();
  const [mapSize, setMapSize] = useState<MapSize>({ columns: 10, rows: 10 });
  const [selectedTile, setSelectedTile] = useState<string>("empty");
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      tiles: Array(mapSize.rows)
        .fill(null)
        .map(() => Array(mapSize.columns).fill(EMPTY_TILE)),
    },
  ]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [toolbarTiles, setToolbarTiles] = useState<Tile[]>(
    DEFAULT_TOOLBAR_TILES,
  );
  const [layerToDelete, setLayerToDelete] = useState<number | null>(null);

  const handleTileClick = (row: number, col: number) => {
    const newLayers = [...layers];
    const selectedTileData = toolbarTiles.find(
      (tile) => tile.type === selectedTile,
    );
    if (selectedTileData) {
      newLayers[currentLayer].tiles[row][col] = { ...selectedTileData };
    }
    setLayers(newLayers);
  };

  const handleEditorMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    handleTileClick(row, col);
  };

  const handleEditorMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      handleTileClick(row, col);
    }
  };

  const handleEditorMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const saveData: SaveData = {
      layers: layers.map((layer) =>
        layer.tiles.map((row) =>
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
    a.download = "world-map.json";
    a.click();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        saveData.layers.map((layer) => ({
          tiles: layer.map((row) =>
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
        })),
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

    // Update the map to reflect the changes in tile properties
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        const newTiles = layer.tiles.map((row) =>
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

    // If the deleted tile was selected, reset the selection
    if (selectedTile === toolbarTiles[index].type) {
      setSelectedTile("empty");
    }

    // Update the map to replace deleted tile with 'Empty'
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        const newTiles = layer.tiles.map((row) =>
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
    .flatMap((layer) => layer.tiles)
    .flat()
    .reduce((acc, tile) => {
      acc[tile.type] = (acc[tile.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(tileStats).map(([type, count]) => ({
    type,
    count,
  }));

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
                  if (
                    rowIndex < layer.tiles.length &&
                    colIndex < layer.tiles[0].length
                  ) {
                    return layer.tiles[rowIndex][colIndex];
                  }
                  return EMPTY_TILE;
                }),
            );
          return { ...layer, tiles: newTiles };
        }),
      );
      return newSize;
    });
  };

  const addLayer = () => {
    const newLayer: MapLayer = {
      tiles: Array(mapSize.rows)
        .fill(null)
        .map(() => Array(mapSize.columns).fill(EMPTY_TILE)),
    };
    setLayers([...layers, newLayer]);
    setCurrentLayer(layers.length);
  };

  const openDeleteLayerModal = (index: number) => {
    setLayerToDelete(index);
  };

  const closeDeleteLayerModal = () => {
    setLayerToDelete(null);
  };

  const confirmDeleteLayer = () => {
    if (layerToDelete !== null && layers.length > 1) {
      const newLayers = layers.filter((_, i) => i !== layerToDelete);
      setLayers(newLayers);
      setCurrentLayer(Math.min(currentLayer, newLayers.length - 1));
    }
    closeDeleteLayerModal();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-5">Map Builder</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      className={`border ${activeButtonClass(
                        currentLayer === index,
                      )}`}
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
                className="relative w-full"
                style={{
                  paddingBottom: `${(mapSize.rows / mapSize.columns) * 100}%`,
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
                      {layer.tiles.map((row, rowIndex) =>
                        row.map((tile, colIndex) => (
                          <div
                            key={`${layerIndex}-${rowIndex}-${colIndex}`}
                            className="border border-gray-300 dark:border-gray-900 bg-cover bg-center"
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
          <Toolbar
            toolbarTiles={toolbarTiles}
            selectedTile={selectedTile}
            mapSize={mapSize}
            setSelectedTile={setSelectedTile}
            handleToolbarAddTile={handleToolbarAddTile}
            handleToolbarDeleteTile={handleToolbarDeleteTile}
            handleToolbarEditTile={handleToolbarEditTile}
            handleTextureUpload={handleTextureUpload}
            handleMapSizeChange={handleMapSizeChange}
            handleSave={handleSave}
            handleLoad={handleLoad}
          />
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
          <Stats data={chartData} />
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

function getTileButtonTextColor(tile: Tile): string {
  // If the tile has a texture, use white text with a shadow for better visibility
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
    for (const row of layer.tiles) {
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

function activeButtonClass(isActive: boolean) {
  return isActive ? "ring-2 ring-blue-500" : "";
}

function EditToolbarTilePopover({
  tile,
  index,
  handleToolbarDeleteTile,
  handleToolbarEditTile,
  handleTextureUpload,
}: {
  tile: Tile;
  index: number;
  handleToolbarDeleteTile: (index: number) => void;
  handleToolbarEditTile: (index: number, tile: Tile) => void;
  handleTextureUpload: (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
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
                onClick={() => handleToolbarDeleteTile(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tile-type-${index}`}>Type</Label>
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
            <Label htmlFor={`tile-color-${index}`}>Color</Label>
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
            <Label htmlFor={`tile-texture-${index}`}>Texture</Label>
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
                      onChange={(e) => handleTextureUpload(index, e)}
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
  );
}

function Toolbar({
  toolbarTiles,
  selectedTile,
  mapSize,
  setSelectedTile,
  handleToolbarAddTile,
  handleToolbarDeleteTile,
  handleToolbarEditTile,
  handleTextureUpload,
  handleMapSizeChange,
  handleSave,
  handleLoad,
}: {
  toolbarTiles: Tile[];
  selectedTile: string;
  mapSize: { columns: number; rows: number };
  setSelectedTile: (tile: string) => void;
  handleToolbarAddTile: () => void;
  handleToolbarDeleteTile: (index: number) => void;
  handleToolbarEditTile: (index: number, tile: Tile) => void;
  handleTextureUpload: (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleMapSizeChange: (dimension: "columns" | "rows", value: number) => void;
  handleSave: () => void;
  handleLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
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
                  className={`border w-full h-12 bg-cover bg-center ${activeButtonClass(
                    selectedTile === tile.type,
                  )}`}
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
                    className={`
                            ${getTileButtonTextColor(tile)}
                            -mt-1 absolute inset-0 flex items-center justify-center text-xs font-bold
                          `}
                  >
                    {tile.type}
                  </span>
                </button>
                {tile.type !== EMPTY_TILE.type && (
                  <EditToolbarTilePopover
                    tile={tile}
                    index={index}
                    handleToolbarDeleteTile={handleToolbarDeleteTile}
                    handleToolbarEditTile={handleToolbarEditTile}
                    handleTextureUpload={handleTextureUpload}
                  />
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
            <Label htmlFor="map-columns">Map Columns: {mapSize.columns}</Label>
            <Slider
              id="map-columns"
              min={5}
              max={20}
              step={1}
              value={[mapSize.columns]}
              onValueChange={(value) =>
                handleMapSizeChange("columns", value[0])
              }
            />
          </div>
          <div>
            <Label htmlFor="map-rows">Map Rows: {mapSize.rows}</Label>{" "}
            <Slider
              id="map-rows"
              min={5}
              max={20}
              step={1}
              value={[mapSize.rows]}
              onValueChange={(value) => handleMapSizeChange("rows", value[0])}
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
  );
}

function Stats({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tile Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width="100%"
          height={200}
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
      </CardContent>
    </Card>
  );
}
