'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { IndianRupee, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { ProfitChart } from '@/components/profit-chart';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const financialData = {
    totalProfit: 389000,
    crops: [
        { name: 'Mango', profit: 97500, icon: '🥭' },
        { name: 'Citrus', profit: 78000, icon: '🍊' },
        { name: 'Grapes', profit: 65000, icon: '🍇' },
        { name: 'Tomato', profit: 58500, icon: '🍅' },
        { name: 'Brinjal', profit: 45000, icon: '🍆' },
        { name: 'Wheat', profit: 45000, icon: '🌾' },
    ]
}


export default function FinancialOverviewPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('financialOverviewPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('financialOverviewPage.description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <div>
                        <CardTitle>{t('financialOverviewPage.totalProfit')}</CardTitle>
                        <CardDescription>
                            {t('financialOverviewPage.last6Months')}
                        </CardDescription>
                    </div>
                    <div className='flex items-center font-bold text-2xl'>
                        <IndianRupee className='h-6 w-6' />
                        {financialData.totalProfit.toLocaleString('en-IN')}
                    </div>
                </CardHeader>
                <CardContent>
                    <ProfitChart />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card className="bg-primary/10 border-primary/30">
                <CardHeader>
                    <CardTitle>{t('financialOverviewPage.estimatedTotalProfit')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-3xl font-bold text-primary">
                        <IndianRupee className="h-7 w-7" />
                        {financialData.totalProfit.toLocaleString('en-IN')}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('financialOverviewPage.yourCrops')}</CardTitle>
                        <Button variant="ghost" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('financialOverviewPage.add')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='p-0'>
                    <Table>
                        <TableBody>
                            {financialData.crops.map(crop => (
                                <TableRow key={crop.name} className="cursor-pointer">
                                    <TableCell className="font-medium flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback className="bg-background">
                                                {crop.icon}
                                            </AvatarFallback>
                                        </Avatar>
                                        {crop.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end font-mono">
                                            <IndianRupee className="h-4 w-4 mr-1" />
                                            {crop.profit.toLocaleString('en-IN')}
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                                     </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
