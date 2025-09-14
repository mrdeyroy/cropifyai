'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { IndianRupee } from 'lucide-react';
import { useMemo } from 'react';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type ExpenseChartProps = {
  data: { name: string; value: number; label: string }[];
};

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    if (data) {
      data.forEach((item, index) => {
        config[item.name] = {
          label: item.label,
          color: chartColors[index % chartColors.length],
        };
      });
    }
    return config;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 10,
          right: 30,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={80}
          className="text-xs"
        />
        <XAxis dataKey="value" type="number" hide />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name, item) => (
                     <div className='flex flex-col'>
                        <span className="text-xs text-muted-foreground">{item.payload.label}</span>
                        <div className='flex items-center font-bold'>
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {Number(value).toLocaleString('en-IN')}
                        </div>
                    </div>
                )}
            />}
        />
        <Bar dataKey="value" layout="vertical" radius={4}>
            {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
