// components/Insights.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapBuilder } from "@/hooks/useMapBuilder";
import { lazy, Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { ChartData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="flex flex-col gap-8">
          <div>
            <p className="font-bold border-b border-border mb-1">Size</p>
            <p className="text-xs">
              {mapSize.columns} x {mapSize.rows} x {layers.length} ={" "}
              {mapSize.columns * mapSize.rows * layers.length} tiles
            </p>
          </div>
          <div>
            <p className="font-bold border-b border-border mb-1">Tiles</p>
            <TileStatsTable tileStats={tileStats} />
          </div>
          <div>
            <TileDistribution />
          </div>
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
      acc[tile.name] = {
        count: (acc[tile.name]?.count ?? 0) + 1,
        color: tile.color,
      };
      return acc;
    }, {} as Record<string, { count: number; color: string }>);

  const chartData: ChartData[] = Object.entries(tileStats).map(
    ([type, data]) => ({
      type,
      count: data.count,
      color: data.color,
    }),
  );

  return (
    <div>
      <p className="font-bold border-b border-border mb-1">Distribution</p>
      <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
        <DistributionChart data={chartData} />
      </Suspense>
    </div>
  );
}

interface TileStatsTableProps {
  tileStats: Record<string, number>;
}

export function TileStatsTable({ tileStats }: TileStatsTableProps) {
  const sortedStats = Object.entries(tileStats).sort((a, b) => b[1] - a[1]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Name</TableHead>
          <TableHead className="font-bold text-right">Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedStats.map(([name, count], index) => (
          <TableRow 
            key={name} 
            className={index % 2 === 0 ? "bg-background" : "bg-transparent"}
          >
            <TableCell className="font-medium">{name}</TableCell>
            <TableCell className="text-right">{count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
