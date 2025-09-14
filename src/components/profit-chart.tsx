'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { IndianRupee } from 'lucide-react';

const chartData = [
  { month: 'Jan', profit: 18600 },
  { month: 'Feb', profit: 30500 },
  { month: 'Mar', profit: 23700 },
  { month: 'Apr', profit: 27300 },
  { month: 'May', profit: 20900 },
  { month: 'Jun', profit: 41400 },
];

const chartConfig = {
  profit: {
    label: 'Profit',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ProfitChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData}
        margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 5,
        }}
        >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value) => (
                <div className='flex items-center font-bold'>
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {Number(value).toLocaleString('en-IN')}
                </div>
            )}
            indicator="dot" 
          />}
        />
        <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
