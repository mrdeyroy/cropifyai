'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ArrowDown,
  ArrowUp,
  Cloud,
  Droplets,
  PlusCircle,
  Stethoscope,
  Sun,
  Wind,
} from 'lucide-react';
import Link from 'next/link';
import { marketPrices } from '@/lib/data';
import { YieldChart } from '@/components/yield-chart';
import { useLanguage } from '@/hooks/use-language';

export default function DashboardPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weatherTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.weatherDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <Sun className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">28°C</div>
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.sunny')}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-400" />
                <span>{t('dashboard.humidity')}: 65%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-400" />
                <span>{t('dashboard.wind')}: 10 km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-gray-300" />
                <span>
                  {t('dashboard.uvIndex')}: {t('dashboard.uvIndexValue')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActionsTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.quickActionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline">
              <Link href="/farms">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('dashboard.addOrViewFarm')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/disease-detection">
                <Stethoscope className="mr-2 h-4 w-4" />
                {t('dashboard.detectCropDisease')}
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.marketWatchTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.marketWatchDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {marketPrices.slice(0, 3).map((item) => (
                  <TableRow key={item.crop}>
                    <TableCell className="font-medium">{item.crop}</TableCell>
                    <TableCell className="text-right">
                      ₹{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`flex items-center justify-end gap-1 ${
                        item.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.change > 0 ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      {Math.abs(item.change)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.yieldProjectionTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.yieldProjectionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YieldChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
