// components/Toolbar.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit, Plus, Trash2, Upload, Save, FolderUpIcon } from "lucide-react";
import { Slider } from "@/components/Slider";
import { MapTile } from "@/lib/types";
import {
  activeClasses,
  cn,
  createMapTile,
  EMPTY_TILE,
  getRandomColor,
  getTileButtonTextColor,
} from "@/lib/utils";
import { useErrorToast } from "@/hooks/useErrorToast";
import { MapBuilderAction } from "@/lib/mapBuilderReducer";
import { useMapBuilder } from "@/hooks/useMapBuilder";
import useSaveShortcut from "@/hooks/useSaveShortcut";

export default function Toolbar() {
  const errorToast = useErrorToast();
  const {
    mapSize,
    selectedTile,
    toolbarTiles,
    dispatch,
    saveToFile: handleSave,
    loadFromFile: handleLoad,
  } = useMapBuilder();
  const [mapColumns, setMapColumns] = useState(mapSize.columns);
  const [mapRows, setMapRows] = useState(mapSize.rows);

  const handleToolbarAddTile = () => {
    const newTile: MapTile = createMapTile({
      name: `NewTile${toolbarTiles.length + 1}`,
      color: getRandomColor(toolbarTiles.map((tile) => tile.color)),
    });
    dispatch({
      type: MapBuilderAction.SET_TOOLBAR_TILES,
      payload: [...toolbarTiles, newTile],
    });
  };

  const handleToolbarEditTile = (index: number, updatedTile: MapTile) => {
    const newTiles = [...toolbarTiles];
    newTiles[index] = updatedTile;
    dispatch({ type: MapBuilderAction.SET_TOOLBAR_TILES, payload: newTiles });
    dispatch({ type: MapBuilderAction.UPDATE_MAP_TILES, payload: updatedTile });
  };

  const handleToolbarDeleteTile = (index: number) => {
    const newTiles = toolbarTiles.filter((_, i) => i !== index);
    dispatch({ type: MapBuilderAction.SET_TOOLBAR_TILES, payload: newTiles });
    const tileAtIndex = toolbarTiles[index];
    if (tileAtIndex === undefined) {
      return void errorToast("No tile at index");
    }
    if (selectedTile === tileAtIndex.id) {
      dispatch({
        type: MapBuilderAction.SET_SELECTED_TILE,
        payload: EMPTY_TILE.id,
      });
    }
  };

  const handleTextureUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return void errorToast("No file selected");
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result;
      if (typeof res !== "string") {
        return void errorToast("Failed to load texture.");
      }
      const texture = {
        filename: file.name,
        data: res,
      };
      const tileAtIndex = toolbarTiles[index];
      if (tileAtIndex === undefined) {
        return void errorToast("No tile at index");
      }
      handleToolbarEditTile(index, { ...tileAtIndex, texture });
    };
    reader.readAsDataURL(file);
  };

  useSaveShortcut(handleSave);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Toolbar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {toolbarTiles.map((tile, index) => (
              <div
                key={tile.id}
                className="relative group"
                aria-selected={selectedTile === tile.id}
              >
                <Button
                  className={cn`
                    border w-full h-12 bg-cover bg-center
                    ${activeClasses(selectedTile === tile.id)}
                  `}
                  style={{
                    backgroundColor: tile.color,
                    borderColor:
                      tile.id === EMPTY_TILE.id
                        ? "hsl(var(--border))"
                        : tile.color,
                    backgroundImage: tile.texture
                      ? `url(${tile.texture.data})`
                      : "none",
                  }}
                  onClick={() =>
                    dispatch({
                      type: MapBuilderAction.SET_SELECTED_TILE,
                      payload: tile.id,
                    })
                  }
                >
                  <span
                    className={`${getTileButtonTextColor(
                      tile,
                    )} -mt-1 absolute inset-0 flex items-center justify-center text-xs font-bold`}
                  >
                    {tile.name}
                  </span>
                </Button>
                {tile.id !== EMPTY_TILE.id && (
                  <Popover
                    onOpenChange={(open) => {
                      console.log(open ? "open" : "closed");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        tabIndex={-1}
                        size="icon"
                        variant="outline"
                        className={cn`
                          absolute -top-2 -right-2 w-6 h-6 p-0 transition-opacity
                          opacity-0 group-hover:opacity-100 sm:group-aria-selected:opacity-100
                        `}
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
                          <Label htmlFor={`tile-name-${index}`}>Name</Label>
                          <Input
                            id={`tile-name-${index}`}
                            value={tile.name}
                            onChange={(e) =>
                              handleToolbarEditTile(index, {
                                ...tile,
                                name: e.target.value,
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
                        <div className="flex justify-end">
                          <PopoverClose asChild>
                            <Button>Done</Button>
                          </PopoverClose>
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
            <Label htmlFor="map-columns">Columns: {mapColumns}</Label>
            <Slider
              label="Adjust Map Columns"
              min={5}
              max={20}
              step={1}
              values={[mapColumns]}
              onChange={([value]) =>
                value !== undefined && setMapColumns(value)
              }
              onFinalChange={([value]) =>
                value !== undefined &&
                dispatch({
                  type: MapBuilderAction.HANDLE_MAP_SIZE_CHANGE,
                  payload: { dimension: "columns", value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="map-rows">Rows: {mapRows}</Label>{" "}
            <Slider
              label="Adjust Map Rows"
              min={5}
              max={20}
              step={1}
              values={[mapRows]}
              onChange={([value]) => value !== undefined && setMapRows(value)}
              onFinalChange={([value]) =>
                value !== undefined &&
                dispatch({
                  type: MapBuilderAction.HANDLE_MAP_SIZE_CHANGE,
                  payload: { dimension: "rows", value },
                })
              }
            />
          </div>
          <div className="space-x-2">
            <Button
              onClick={handleSave}
              title="Save Map to File"
            >
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
              title="Load Map from File"
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
