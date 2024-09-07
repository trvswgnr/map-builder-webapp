// components/TileDistribution.tsx
import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapBuilder } from "@/hooks/useMapBuilder";

const DistributionChart = lazy(() => import("./DistributionChart"));

export default function TileDistribution(): React.ReactNode {
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
    <Card>
      <CardHeader>
        <CardTitle>Tile Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
          <DistributionChart data={chartData} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
