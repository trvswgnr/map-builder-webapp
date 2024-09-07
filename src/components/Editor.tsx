// components/Editor.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activeClasses, NEVER } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/DeleteLayerModal";
import { useErrorToast } from "@/hooks/useErrorToast";
import { MapBuilderAction } from "@/lib/mapBuilderReducer";
import { MapTile } from "@/lib/types";
import { useMapBuilder } from "@/hooks/useMapBuilder";

export default Editor;

function Editor() {
  const { layers, currentLayer, mapSize, dispatch } = useMapBuilder();
  const [isDragging, setIsDragging] = useState(false);
  const [layerToDelete, setLayerToDelete] = useState<number | null>(null);

  const openDeleteLayerModal = (index: number) => setLayerToDelete(index);
  const closeDeleteLayerModal = () => setLayerToDelete(null);
  const confirmDeleteLayer = () => {
    if (layerToDelete !== null) {
      dispatch({ type: MapBuilderAction.DELETE_LAYER, payload: layerToDelete });
    }
    closeDeleteLayerModal();
  };

  const handleEditorMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    dispatch({
      type: MapBuilderAction.HANDLE_TILE_CLICK,
      payload: { row, col },
    });
  };

  const handleEditorMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      dispatch({
        type: MapBuilderAction.HANDLE_TILE_CLICK,
        payload: { row, col },
      });
    }
  };

  const handleEditorMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Editor</CardTitle>
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
                className={`border ${activeClasses(currentLayer === index)}`}
                onClick={() =>
                  dispatch({
                    type: MapBuilderAction.SET_CURRENT_LAYER,
                    payload: index,
                  })
                }
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
            onClick={() =>
              dispatch({ type: MapBuilderAction.ADD_LAYER, payload: NEVER })
            }
            className="py-0 px-2"
          >
            <Plus
              width={24}
              height={24}
            />
          </Button>
        </div>
        <div
          className="relative w-full touch-action-none border bg-background"
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
                  layerIndex <= currentLayer ? layers.length - layerIndex : 0,
                opacity:
                  layerIndex === currentLayer
                    ? 1
                    : layerIndex < currentLayer
                    ? 0.3
                    : 0,
                pointerEvents: layerIndex === currentLayer ? "auto" : "none",
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
                    <EditorTile
                      key={`${layerIndex}-${rowIndex}-${colIndex}`}
                      layerIndex={layerIndex}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      tile={tile}
                      currentLayer={currentLayer}
                      onMouseDown={handleEditorMouseDown}
                      onMouseEnter={handleEditorMouseEnter}
                      onMouseUp={handleEditorMouseUp}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <ConfirmDeleteModal
        isOpen={layerToDelete !== null}
        onClose={closeDeleteLayerModal}
        onConfirm={confirmDeleteLayer}
        title="Delete Layer"
        description={`Are you sure you want to delete Layer ${
          layerToDelete !== null ? layerToDelete + 1 : ""
        }? This action cannot be undone.`}
      />
    </Card>
  );
}

export type EditorTileProps = {
  layerIndex: number;
  rowIndex: number;
  colIndex: number;
  tile: MapTile;
  currentLayer: number;
  onMouseDown: (rowIndex: number, colIndex: number) => void;
  onMouseEnter: (rowIndex: number, colIndex: number) => void;
  onMouseUp: () => void;
};
export function EditorTile(props: EditorTileProps): JSX.Element {
  const {
    layerIndex,
    rowIndex,
    colIndex,
    tile,
    currentLayer,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  } = props;
  const errorToast = useErrorToast();
  return (
    <div
      key={`${layerIndex}-${rowIndex}-${colIndex}`}
      className="tile"
      style={{
        backgroundColor: tile.color,
        backgroundImage: tile.texture ? `url(${tile.texture.data})` : "none",
      }}
      onMouseDown={() =>
        layerIndex === currentLayer && onMouseDown(rowIndex, colIndex)
      }
      onMouseEnter={() =>
        layerIndex === currentLayer && onMouseEnter(rowIndex, colIndex)
      }
      onMouseUp={onMouseUp}
      onTouchStart={(e) => {
        e.preventDefault();
        if (layerIndex === currentLayer) {
          onMouseDown(rowIndex, colIndex);
        }
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (!touch) {
          errorToast("Touch event not found");
          return;
        }
        const element = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        ) as HTMLElement;
        const [touchRowIndex, touchColIndex] = (
          element.dataset.tileCoords ?? ""
        )
          .split(",")
          .map(Number);
        if (touchRowIndex === undefined || touchColIndex === undefined) {
          // fine to ignore
          return;
        }
        if (layerIndex === currentLayer) {
          onMouseEnter(touchRowIndex, touchColIndex);
        }
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseUp();
      }}
      data-tile-coords={`${rowIndex},${colIndex}`}
    ></div>
  );
}
