import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertCircle, Save, Upload, Trash2, Grid } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

interface Tile {
  type: number;
  x: number;
  y: number;
}

interface MapData {
  width: number;
  height: number;
  tiles: Tile[];
}

const TILE_SIZE = 30;
const TILE_TYPES = [
  { id: 0, name: 'Empty', color: '#ffffff' },
  { id: 1, name: 'Wall', color: '#000000' },
  { id: 2, name: 'Start', color: '#00ff00' },
  { id: 3, name: 'End', color: '#ff0000' },
  { id: 4, name: 'Item', color: '#ffff00' },
  { id: 5, name: 'Enemy', color: '#ff00ff' },
];

const App: React.FC = () => {
  const [mapData, setMapData] = useState<MapData>({
    width: 20,
    height: 15,
    tiles: [],
  });
  const [selectedTileType, setSelectedTileType] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<{ name: string; value: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    updateStats();
  }, [mapData]);

  const initializeMap = () => {
    const newTiles: Tile[] = [];
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        newTiles.push({ type: 0, x, y });
      }
    }
    setMapData({ ...mapData, tiles: newTiles });
  };

  const updateStats = () => {
    const newStats = TILE_TYPES.map((tileType) => ({
      name: tileType.name,
      value: mapData.tiles.filter((tile) => tile.type === tileType.id).length,
    }));
    setStats(newStats);
  };

  const handleTileChange = (x: number, y: number) => {
    setMapData((prevMapData) => ({
      ...prevMapData,
      tiles: prevMapData.tiles.map((tile) =>
        tile.x === x && tile.y === y ? { ...tile, type: selectedTileType } : tile
      ),
    }));
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    const { x, y } = getTileCoordinates(event);
    handleTileChange(x, y);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const { x, y } = getTileCoordinates(event);
    handleTileChange(x, y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
  };

  const getTileCoordinates = (event: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: -1, y: -1 };

    const rect = svg.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    return { x, y };
  };

  const handleSave = () => {
    const jsonData = JSON.stringify(mapData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map_data.json';
    a.click();
    URL.revokeObjectURL(url);
    setAlertMessage('Map saved successfully!');
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = JSON.parse(e.target?.result as string) as MapData;
          setMapData(loadedData);
          setAlertMessage('Map loaded successfully!');
        } catch (error) {
          setAlertMessage('Error loading map: Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    initializeMap();
    setAlertMessage('Map cleared!');
  };

  const handleResize = (newWidth: number, newHeight: number) => {
    const newTiles: Tile[] = [];
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const existingTile = mapData.tiles.find((tile) => tile.x === x && tile.y === y);
        newTiles.push(existingTile || { type: 0, x, y });
      }
    }
    setMapData({ width: newWidth, height: newHeight, tiles: newTiles });
  };

  const renderTile = useCallback(
    (tile: Tile) => {
      const tileType = TILE_TYPES.find((t) => t.id === tile.type);
      return (
        <rect
          key={`${tile.x}-${tile.y}`}
          x={tile.x * TILE_SIZE}
          y={tile.y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          fill={tileType?.color}
          stroke={showGrid ? '#ccc' : 'none'}
          strokeWidth={1}
        />
      );
    },
    [showGrid]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Map Builder</h1>
      <div className="flex mb-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tile Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TILE_TYPES.map((tileType) => (
                <div key={tileType.id} className="flex flex-col items-center">
                  <Button
                    size="sm"
                    variant={selectedTileType === tileType.id ? "default" : "outline"}
                    onClick={() => setSelectedTileType(tileType.id)}
                    className={`w-24`}
                  >
                    {tileType.name}
                  </Button>
                  <div
                    className="w-24 h-2 mt-1"
                    style={{ backgroundColor: tileType.color }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-1" size={16} /> Save
              </Button>
              <Button asChild>
                <label>
                  <Upload className="mr-1" size={16} /> Load
                  <input type="file" className="hidden" onChange={handleLoad} accept=".json" />
                </label>
              </Button>
              <Button variant="destructive" onClick={handleClear}>
                <Trash2 className="mr-1" size={16} /> Clear
              </Button>

            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="height">Rows:</Label>
                  <Input
                    id="height"
                    type="number"
                    value={mapData.height}
                    onChange={(e) => handleResize(mapData.width, parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="width">Columns:</Label>
                  <Input
                    id="width"
                    type="number"
                    value={mapData.width}
                    onChange={(e) => handleResize(parseInt(e.target.value), mapData.height)}
                    className="w-20"
                  />
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={() => setShowGrid(!showGrid)}>
                  <Grid className="mr-1" size={16} /> {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {alertMessage && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      <div className="flex">
        <Card className="mr-4">
          <CardHeader>
            <CardTitle>Map Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <svg
              ref={svgRef}
              width={mapData.width * TILE_SIZE}
              height={mapData.height * TILE_SIZE}
              className="border"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {mapData.tiles.map(renderTile)}
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;