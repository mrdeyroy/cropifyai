'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { IndianRupee } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type MarketTrendChartProps = {
    data: { date: string; price: number }[];
}

export function MarketTrendChart({ data }: MarketTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `₹${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            indicator="dot" 
            formatter={(value, name) => (
              <div className="flex items-center">
                <span className="capitalize mr-2">{name}:</span>
                <IndianRupee className="h-4 w-4 mr-1" />
                <span>{value}</span>
              </div>
            )}
          />}
        />
        <Area
          dataKey="price"
          type="monotone"
          fill="var(--color-price)"
          fillOpacity={0.4}
          stroke="var(--color-price)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
