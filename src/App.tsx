import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Edit, Plus, Trash2 } from 'lucide-react'

interface Tile {
  type: string
  color: string
  height: number
}

export default function WorldBuilder() {
  const [mapSize, setMapSize] = useState({ columns: 10, rows: 10 })
  const [selectedTile, setSelectedTile] = useState<string>('Empty')
  const [map, setMap] = useState<Tile[][]>(
    Array(mapSize.rows).fill(null).map(() => Array(mapSize.columns).fill({ type: 'Empty', color: '#E5E7EB', height: 0 }))
  )
  const [isDragging, setIsDragging] = useState(false)
  const [tiles, setTiles] = useState<Tile[]>([
    { type: 'Empty', color: '#E5E7EB', height: 0 },
    { type: 'Wall', color: '#1F2937', height: 1 },
    { type: 'Start', color: '#10B981', height: 0 },
    { type: 'End', color: '#EF4444', height: 0 },
    { type: 'Item', color: '#F59E0B', height: 0 },
    { type: 'Enemy', color: '#8B5CF6', height: 0 },
  ])

  const handleTileClick = (row: number, col: number) => {
    const newMap = [...map]
    const selectedTileData = tiles.find(tile => tile.type === selectedTile)
    if (selectedTileData) {
      newMap[row][col] = { ...selectedTileData }
    }
    setMap(newMap)
  }

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    handleTileClick(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      handleTileClick(row, col)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    const jsonMap = JSON.stringify(map)
    const blob = new Blob([jsonMap], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'world-map.json'
    a.click()
  }

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const loadedMap = JSON.parse(content)
        setMap(loadedMap)
        setMapSize({ columns: loadedMap[0].length, rows: loadedMap.length })
      }
      reader.readAsText(file)
    }
  }

  const handleAddTile = () => {
    const newTile: Tile = { type: `New Tile ${tiles.length + 1}`, color: '#000000', height: 0 }
    setTiles([...tiles, newTile])
  }

  const handleEditTile = (index: number, updatedTile: Tile) => {
    const newTiles = [...tiles]
    newTiles[index] = updatedTile
    setTiles(newTiles)
  }

  const handleDeleteTile = (index: number) => {
    const newTiles = tiles.filter((_, i) => i !== index);
    setTiles(newTiles);
    
    // If the deleted tile was selected, reset the selection
    if (selectedTile === tiles[index].type) {
      setSelectedTile('Empty');
    }
    
    // Update the map to replace deleted tile with 'Empty'
    setMap(prevMap => prevMap.map(row => 
      row.map(tile => tile.type === tiles[index].type ? tiles[0] : tile)
    ));
  }

  const tileStats = map.flat().reduce((acc, tile) => {
    acc[tile.type] = (acc[tile.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(tileStats).map(([type, count]) => ({ type, count }))

  const handleMapSizeChange = (dimension: 'columns' | 'rows', value: number) => {
    setMapSize(prev => {
      const newSize = { ...prev, [dimension]: value };
      setMap(prevMap => {
        const newMap = Array(newSize.rows).fill(null).map((_, rowIndex) =>
          Array(newSize.columns).fill(null).map((_, colIndex) => {
            if (rowIndex < prevMap.length && colIndex < prevMap[0].length) {
              return prevMap[rowIndex][colIndex];
            }
            return { type: 'Empty', color: '#E5E7EB', height: 0 };
          })
        );
        return newMap;
      });
      return newSize;
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">World Builder</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Map Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${mapSize.columns}, minmax(0, 1fr))`,
                }}
              >
                {map.map((row, rowIndex) =>
                  row.map((tile, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-full pt-[100%] relative border border-gray-300`}
                      style={{ backgroundColor: tile.color, boxShadow: `inset 0 -${tile.height * 2}px 0 0 rgba(0,0,0,0.1)` }}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                    ></div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Toolbar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {tiles.map((tile, index) => (
                    <div key={tile.type} className="relative group">
                      <button
                        className={`w-full h-12 rounded ${selectedTile === tile.type ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ backgroundColor: tile.color }}
                        onClick={() => setSelectedTile(tile.type)}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow">
                          {tile.type}
                        </span>
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                  onClick={() => handleDeleteTile(index)}
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
                                onChange={(e) => handleEditTile(index, { ...tile, type: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`tile-color-${index}`}>Color</Label>
                              <div className="flex space-x-2">
                                <Input
                                  id={`tile-color-${index}`}
                                  type="color"
                                  value={tile.color}
                                  onChange={(e) => handleEditTile(index, { ...tile, color: e.target.value })}
                                  className="w-12 h-8 p-0"
                                />
                                <Input
                                  value={tile.color}
                                  onChange={(e) => handleEditTile(index, { ...tile, color: e.target.value })}
                                  className="flex-grow"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`tile-height-${index}`}>Height</Label>
                              <Slider
                                id={`tile-height-${index}`}
                                min={0}
                                max={5}
                                step={1}
                                value={[tile.height]}
                                onValueChange={(value) => handleEditTile(index, { ...tile, height: value[0] })}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                  <Button onClick={handleAddTile} className="h-12">
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor="map-columns">Map Columns</Label>
                  <Slider
                    id="map-columns"
                    min={5}
                    max={20}
                    step={1}
                    value={[mapSize.columns]}
                    onValueChange={(value) => handleMapSizeChange('columns', value[0])}
                  />
                </div>
                <div>
                  <Label htmlFor="map-rows">Map Rows</Label>
                  <Slider
                    id="map-rows"
                    min={5}
                    max={20}
                    step={1}
                    value={[mapSize.rows]}
                    onValueChange={(value) => handleMapSizeChange('rows', value[0])}
                  />
                </div>
                <div className="space-x-2">
                  <Button onClick={handleSave}>Save Map</Button>
                  <Button asChild>
                    <label>
                      Load Map
                      <Input type="file" className="hidden" onChange={handleLoad} accept=".json" />
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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}