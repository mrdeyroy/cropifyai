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
import { Label } from '@/components/ui/label';
import {
  ArrowDown,
  ArrowUp,
  Cloud,
  Droplets,
  PlusCircle,
  Stethoscope,
  Sun,
  Wind,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { marketPrices, indianCities } from '@/lib/data';
import { YieldChart } from '@/components/yield-chart';
import { useLanguage } from '@/hooks/use-language';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { getWeather } from '@/services/weather';
import type { WeatherData } from '@/services/weather';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const { t } = useLanguage();
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const { toast } = useToast();

  const fetchWeather = useCallback(async (currentLocation: string) => {
    setIsWeatherLoading(true);
    try {
      const data = await getWeather(currentLocation);
      setWeatherData(data);
    } catch (error) {
      console.error("Failed to fetch weather data", error);
      toast({
          variant: 'destructive',
          title: 'Failed to load weather',
          description: 'Could not fetch weather data for the selected location.'
      })
      setWeatherData(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWeather(location);
  }, [location, fetchWeather]);
  
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
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weatherTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.weatherDescription', { location: location })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="location-search">
                {t('farmManagement.locationLabel')}
              </Label>
              <Input
                id="location-search"
                type="text"
                list="dashboard-locations"
                defaultValue={location}
                onBlur={handleLocationChange}
                 onChange={(e) => {
                  // This is a workaround to allow datalist selection to be detected
                  // We check if the input value is a valid city before updating state on blur
                  if (indianCities.includes(e.target.value)) {
                    setLocation(e.target.value);
                  }
                }}
                placeholder={t('farmManagement.locationPlaceholder')}
              />
              <datalist id="dashboard-locations">
                {[...new Set(indianCities)].map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            {isWeatherLoading ? (
              <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : weatherData ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-4">
                  <Sun className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{weatherData.temp}°C</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {weatherData.condition}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span>
                      {t('dashboard.humidity')}: {weatherData.humidity}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-400" />
                    <span>
                      {t('dashboard.wind')}: {weatherData.wind} km/h
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-300" />
                    <span>
                      {t('dashboard.uvIndex')}: {weatherData.uv}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>Could not load weather data.</p>
                </div>
            )}
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
                      <div className="flex items-center justify-end font-mono">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {item.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`flex items-center justify-end gap-1 font-mono ${
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
