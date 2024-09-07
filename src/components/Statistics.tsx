// components/Statistics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapBuilder } from "@/hooks/useMapBuilder";

export default function Statistics() {
  const { layers, mapSize } = useMapBuilder();

  const tileStats = layers
    .flatMap((layer) => layer.flat())
    .reduce((acc, tile) => {
      acc[tile.id] = (acc[tile.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          <li>
            Size: {mapSize.columns}x{mapSize.rows} ={" "}
            {mapSize.columns * mapSize.rows} tiles
          </li>
          {Object.entries(tileStats).map(([type, count]) => (
            <li key={type}>
              {type}: {count}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
