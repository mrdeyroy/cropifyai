'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getMarketPrices } from '@/services/market-data';
import { ArrowDown, ArrowUp, IndianRupee, Loader2 } from 'lucide-react';
import { MarketTrendChart } from '@/components/market-trend-chart';
import type { MarketPrice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { indianCities } from '@/lib/data';

// Helper function to generate mock history data for the chart
const generateMockHistory = (basePrice: number): { date: string; price: number }[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
        date: month,
        price: Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.1)), // +/- 5% variation
    }));
};

export default function MarketWatchPage() {
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [marketData, setMarketData] = useState<MarketPrice[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  const fetchMarketData = useCallback(async (currentLocation: string) => {
    setIsLoading(true);
    setSelectedCrop(null);
    try {
      const prices = await getMarketPrices(currentLocation);
      const formattedData: MarketPrice[] = prices.map(item => ({
        crop: item.crop,
        price: item.price,
        change: (Math.random() - 0.5) * 100, // Mock change
        lastUpdated: 'Just now', // Mock update time
        history: generateMockHistory(item.price),
      }));
      setMarketData(formattedData);
      if(formattedData.length > 0) {
        setSelectedCrop(formattedData[0]);
      }
    } catch (error) {
      console.error('Failed to fetch market data', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load market data',
        description: 'Could not fetch prices for the selected location.',
      });
      setMarketData([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchMarketData(location);
  }, [location, fetchMarketData]);
  
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = event.target.value;
    if (indianCities.includes(newLocation)) {
      setLocation(newLocation);
    }
  };


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
      
       <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="location-search">
            {t('farmManagement.locationLabel')}
          </Label>
          <Input
            id="location-search"
            type="text"
            list="market-watch-locations"
            defaultValue={location}
            onBlur={handleLocationChange}
             onChange={(e) => {
              if (indianCities.includes(e.target.value)) {
                setLocation(e.target.value);
              }
            }}
            placeholder={t('farmManagement.locationPlaceholder')}
          />
          <datalist id="market-watch-locations">
            {[...new Set(indianCities)].map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
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
            <CardContent className="p-0 sm:p-6 sm:pt-0">
             {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : marketData.length > 0 ? (
                <>
                  <Table className="hidden sm:table">
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
                      {marketData.map((item) => (
                        <TableRow
                          key={item.crop}
                          onClick={() => setSelectedCrop(item)}
                          className={cn(
                            'cursor-pointer',
                            selectedCrop?.crop === item.crop && 'bg-muted/50'
                          )}
                        >
                          <TableCell className="font-medium">{item.crop}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end font-mono">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {item.price.toFixed(2)}
                            </div>
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
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-2 p-4">
                      {marketData.map((item) => (
                        <Card
                          key={item.crop}
                          onClick={() => setSelectedCrop(item)}
                          className={cn(
                            'cursor-pointer',
                            selectedCrop?.crop === item.crop && 'bg-muted/50 border-primary'
                          )}
                        >
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg">{item.crop}</p>
                              <p className="text-muted-foreground text-sm">{item.lastUpdated}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end font-mono text-lg">
                                <IndianRupee className="h-5 w-5 mr-1" />
                                {item.price.toFixed(2)}
                              </div>
                              <div
                                className={`flex items-center justify-end gap-1 font-mono text-sm ${
                                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {item.change >= 0 ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowDown className="h-4 w-4" />
                                )}
                                {item.change.toFixed(2)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  <p>No market data available for {location}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
             {isLoading ? (
                 <CardHeader>
                    <CardTitle>Loading Trend...</CardTitle>
                    <CardDescription>Please wait while we fetch the data.</CardDescription>
                 </CardHeader>
             ) : selectedCrop ? (
                <>
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
                </>
             ) : (
                <CardHeader>
                    <CardTitle>No Crop Selected</CardTitle>
                    <CardDescription>Select a crop to view its price trend.</CardDescription>
                </CardHeader>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
