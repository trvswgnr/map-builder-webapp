import { useState, useEffect } from 'react'
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Slider } from "src/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type TileType = 'Empty' | 'Wall' | 'Start' | 'End' | 'Item' | 'Enemy'

interface Tile {
  type: TileType
}

const tileColors: Record<TileType, string> = {
  Empty: 'bg-gray-200',
  Wall: 'bg-gray-800',
  Start: 'bg-green-500',
  End: 'bg-red-500',
  Item: 'bg-yellow-500',
  Enemy: 'bg-purple-500',
}

export default function WorldBuilder() {
  const [mapSize, setMapSize] = useState({ width: 10, height: 10 })
  const [selectedTile, setSelectedTile] = useState<TileType>('Empty')
  const [map, setMap] = useState<Tile[][]>(
    Array(mapSize.height).fill(null).map(() => Array(mapSize.width).fill({ type: 'Empty' }))
  )
  const [isDragging, setIsDragging] = useState(false)

  // Add useEffect to handle global mouse up event
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  const handleTileClick = (row: number, col: number) => {
    const newMap = [...map]
    newMap[row][col] = { type: selectedTile }
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
        setMapSize({ width: loadedMap[0].length, height: loadedMap.length })
      }
      reader.readAsText(file)
    }
  }

  const tileStats = map.flat().reduce((acc, tile) => {
    acc[tile.type] = (acc[tile.type] || 0) + 1
    return acc
  }, {} as Record<TileType, number>)

  const chartData = Object.entries(tileStats).map(([type, count]) => ({ type, count }))

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
                  gridTemplateColumns: `repeat(${mapSize.width}, minmax(0, 1fr))`,
                }}
              >
                {map.map((row, rowIndex) =>
                  row.map((tile, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-full pt-[100%] relative ${tileColors[tile.type]} border border-gray-300`}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
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
                <div>
                  <Label htmlFor="tile-select">Select Tile</Label>
                  <Select value={selectedTile} onValueChange={(value: TileType) => setSelectedTile(value)}>
                    <SelectTrigger id="tile-select">
                      <SelectValue placeholder="Select a tile" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(tileColors).map((tileType) => (
                        <SelectItem key={tileType} value={tileType}>
                          {tileType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="map-width">Map Width</Label>
                  <Slider
                    id="map-width"
                    min={5}
                    max={20}
                    step={1}
                    value={[mapSize.width]}
                    onValueChange={(value) => setMapSize((prev) => ({ ...prev, width: value[0] }))}
                  />
                </div>
                <div>
                  <Label htmlFor="map-height">Map Height</Label>
                  <Slider
                    id="map-height"
                    min={5}
                    max={20}
                    step={1}
                    value={[mapSize.height]}
                    onValueChange={(value) => setMapSize((prev) => ({ ...prev, height: value[0] }))}
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