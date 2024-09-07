// components/Statistics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapBuilder } from "@/hooks/useMapBuilder";

export default function Statistics() {
  const { layers, mapSize } = useMapBuilder();

  const tileStats = layers
    .flatMap((layer) => layer.flat())
    .reduce((acc, tile) => {
      acc[tile.name] = (acc[tile.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-xl">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="font-bold">Size:</p>
          {mapSize.columns} x {mapSize.rows} x {layers.length} ={" "}
          {mapSize.columns * mapSize.rows * layers.length} tiles
        </div>
        <div>
          <p className="font-bold">Tiles:</p>
          <ul>
            {Object.entries(tileStats).map(([type, count]) => (
              <li key={type}>
                {type}: {count}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
