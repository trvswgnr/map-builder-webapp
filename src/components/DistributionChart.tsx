// components/DistributionChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/lib/types';

interface DistributionChartProps {
  data: ChartData[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" aspect={16 / 9}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DistributionChart;