// components/Insights.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapBuilder } from "@/hooks/useMapBuilder";
import { lazy, Suspense } from "react";
import { Skeleton } from "./ui/skeleton";

const DistributionChart = lazy(() => import("./DistributionChart"));

export default function Insights() {
  const { layers, mapSize } = useMapBuilder();

  const tileStats = layers
    .flatMap((layer) => layer.flat())
    .reduce((acc, tile) => {
      acc[tile.name] = (acc[tile.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-bold">Size:</p>
            <p className="text-sm">
              {mapSize.columns} x {mapSize.rows} x {layers.length} ={" "}
              {mapSize.columns * mapSize.rows * layers.length} tiles
            </p>
          </div>
          <div>
            <p className="font-bold">Tiles:</p>
            <ul>
              {Object.entries(tileStats).map(([name, count]) => (
                <li
                  key={name}
                  className="text-sm"
                >
                  <span className="font-bold">{name}:</span> {count}
                </li>
              ))}
            </ul>
          </div>
          <TileDistribution />
        </div>
      </CardContent>
    </Card>
  );
}

function TileDistribution(): React.ReactNode {
  const { layers } = useMapBuilder();

  const tileStats = layers
    .flatMap((layer) => layer.flat())
    .reduce((acc, tile) => {
      acc[tile.name] = (acc[tile.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(tileStats).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div>
      <p className="font-bold">Distribution</p>
      <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
        <DistributionChart data={chartData} />
      </Suspense>
    </div>
  );
}
