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
  { crop: 'Mango', profit: 97500, icon: '🥭', fill: 'var(--chart-1)' },
  { crop: 'Citrus', profit: 78000, icon: '🍊', fill: 'var(--chart-2)' },
  { crop: 'Grapes', profit: 65000, icon: '🍇', fill: 'var(--chart-3)' },
  { crop: 'Tomato', profit: 58500, icon: '🍅', fill: 'var(--chart-4)' },
  { crop: 'Brinjal', profit: 45000, icon: '🍆', fill: 'var(--chart-5)' },
  { crop: 'Wheat', profit: 35000, icon: '🌾', fill: 'var(--chart-1)' },
];

const chartConfig = {
  profit: {
    label: 'Profit',
  },
  mango: {
    label: 'Mango',
    color: 'hsl(var(--chart-1))',
  },
  citrus: {
    label: 'Citrus',
    color: 'hsl(var(--chart-2))',
  },
   grapes: {
    label: 'Grapes',
    color: 'hsl(var(--chart-3))',
  },
  tomato: {
    label: 'Tomato',
    color: 'hsl(var(--chart-4))',
  },
  brinjal: {
    label: 'Brinjal',
    color: 'hsl(var(--chart-5))',
  },
   wheat: {
    label: 'Wheat',
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
          dataKey="icon"
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
            formatter={(value, name, props) => (
                <div className='flex flex-col'>
                    <span className="text-xs text-muted-foreground">{props.payload.crop}</span>
                    <div className='flex items-center font-bold'>
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {Number(value).toLocaleString('en-IN')}
                    </div>
                </div>
            )}
            indicator="dot" 
          />}
        />
        <Bar dataKey="profit" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
