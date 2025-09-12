'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { marketPrices } from "@/lib/data";
import { ArrowDown, ArrowUp } from "lucide-react";
import { MarketTrendChart } from "@/components/market-trend-chart";
import type { MarketPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function MarketWatchPage() {
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice>(marketPrices[1]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Market Watch
        </h1>
        <p className="text-muted-foreground">
          Track real-time market prices and trends for key commodities.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Commodity Prices</CardTitle>
              <CardDescription>
                Live prices from agricultural markets. Click a row to see the trend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead className="text-right">Price (INR)</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketPrices.map((item) => (
                    <TableRow 
                        key={item.crop} 
                        onClick={() => setSelectedCrop(item)}
                        className={cn("cursor-pointer", selectedCrop.crop === item.crop && "bg-muted/50")}
                    >
                      <TableCell className="font-medium">{item.crop}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{item.price.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          item.change >= 0 ? "text-green-600" : "text-red-600"
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
              <CardTitle>{selectedCrop.crop} Price Trend</CardTitle>
              <CardDescription>Last 6 months price history.</CardDescription>
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
