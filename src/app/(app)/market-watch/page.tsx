'use client';

import { useState } from 'react';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { marketPrices } from '@/lib/data';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { MarketTrendChart } from '@/components/market-trend-chart';
import type { MarketPrice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

export default function MarketWatchPage() {
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice>(
    marketPrices[1]
  );
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('marketWatchPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('marketWatchPage.description')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('marketWatchPage.pricesTitle')}</CardTitle>
              <CardDescription>
                {t('marketWatchPage.pricesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('marketWatchPage.cropHeader')}</TableHead>
                    <TableHead className="text-right">
                      {t('marketWatchPage.priceHeader')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('marketWatchPage.changeHeader')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('marketWatchPage.lastUpdatedHeader')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketPrices.map((item) => (
                    <TableRow
                      key={item.crop}
                      onClick={() => setSelectedCrop(item)}
                      className={cn(
                        'cursor-pointer',
                        selectedCrop.crop === item.crop && 'bg-muted/50'
                      )}
                    >
                      <TableCell className="font-medium">{item.crop}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{item.price.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          item.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {item.change >= 0 ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          {item.change.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.lastUpdated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('marketWatchPage.trendTitle', { cropName: selectedCrop.crop })}
              </CardTitle>
              <CardDescription>
                {t('marketWatchPage.trendDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketTrendChart data={selectedCrop.history} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
