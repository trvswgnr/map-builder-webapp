// components/DistributionChart.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { ChartData } from "@/lib/types";

interface DistributionChartProps {
  data: ChartData[];
}

export default function DistributionChart({
  data,
}: DistributionChartProps): React.ReactNode {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "10px",
            border: "1px solid #fff",
          }}
        >
          <p>{`${label}: ${payload?.[0]?.value ?? 0}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer
      width="100%"
      aspect={16 / 9}
    >
      <BarChart data={data}>
        <XAxis dataKey="type" />
        <YAxis width={42} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.3}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
