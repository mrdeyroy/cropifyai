'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { date: 'Jan', price: 10.5 },
  { date: 'Feb', price: 10.8 },
  { date: 'Mar', price: 11.2 },
  { date: 'Apr', price: 11.1 },
  { date: 'May', price: 11.5 },
  { date: 'Jun', price: 11.8 },
  { date: 'Jul', price: 11.75 },
];

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function MarketTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
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
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
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