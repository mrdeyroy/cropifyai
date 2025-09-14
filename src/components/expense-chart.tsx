'use client';

import { Pie, PieChart, Cell } from 'recharts';

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
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
        config[item.name] = {
            label: item.label,
            color: chartColors[index % chartColors.length]
        };
    });
    return config;
  }, [data]);
  
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name, item) => (
                     <div className='flex flex-col'>
                        <span className="text-xs text-muted-foreground">{item.payload.payload.label}</span>
                        <div className='flex items-center font-bold'>
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {Number(value).toLocaleString('en-IN')}
                        </div>
                    </div>
                )}
            />}
        />
        <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
        >
            {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                />
            ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
