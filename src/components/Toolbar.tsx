// components/Toolbar.tsx
import React, { useState } from "react";
import { useMapBuilder } from "../hooks/MapBuilderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit, Plus, Trash2, Upload, Save, FolderUpIcon } from "lucide-react";
import { Slider } from "@/components/Slider";
import { MapTile } from "@/lib/types";
import {
  EMPTY_TILE,
  getRandomColor,
  getTileButtonTextColor,
} from "@/lib/utils";
import { useErrorToast } from "@/hooks/useErrorToast";
import { Action } from "@/hooks/mapBuilderReducer";

export const Toolbar: React.FC = () => {
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
    const newTile: MapTile = {
      name: `NewTile${toolbarTiles.length + 1}`,
      color: getRandomColor(toolbarTiles.map((tile) => tile.color)),
    };
    dispatch({
      type: Action.SET_TOOLBAR_TILES,
      payload: [...toolbarTiles, newTile],
    });
  };

  const handleToolbarEditTile = (index: number, updatedTile: MapTile) => {
    const newTiles = [...toolbarTiles];
    newTiles[index] = updatedTile;
    dispatch({ type: Action.SET_TOOLBAR_TILES, payload: newTiles });
  };

  const handleToolbarDeleteTile = (index: number) => {
    const newTiles = toolbarTiles.filter((_, i) => i !== index);
    dispatch({ type: Action.SET_TOOLBAR_TILES, payload: newTiles });
    const tileAtIndex = toolbarTiles[index];
    if (tileAtIndex === undefined) {
      return void errorToast("No tile at index");
    }
    if (selectedTile === tileAtIndex.name) {
      dispatch({ type: Action.SET_SELECTED_TILE, payload: "empty" });
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
                key={tile.name}
                className="relative group"
              >
                <button
                  className={`border w-full h-12 bg-cover bg-center ${
                    selectedTile === tile.name ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{
                    backgroundColor: tile.color,
                    borderColor:
                      tile.name === EMPTY_TILE.name ? "#eee" : tile.color,
                    backgroundImage: tile.texture
                      ? `url(${tile.texture.data})`
                      : "none",
                  }}
                  onClick={() =>
                    dispatch({
                      type: Action.SET_SELECTED_TILE,
                      payload: tile.name,
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
                </button>
                {tile.name !== EMPTY_TILE.name && (
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
              onChange={([value]) =>
                value !== undefined && setMapColumns(value)
              }
              onFinalChange={([value]) =>
                value !== undefined &&
                dispatch({
                  type: Action.HANDLE_MAP_SIZE_CHANGE,
                  payload: { dimension: "columns", value },
                })
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
              onChange={([value]) => value !== undefined && setMapRows(value)}
              onFinalChange={([value]) =>
                value !== undefined &&
                dispatch({
                  type: Action.HANDLE_MAP_SIZE_CHANGE,
                  payload: { dimension: "rows", value },
                })
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
  );
};
