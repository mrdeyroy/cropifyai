'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CloudRain, Info, Tag, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const notifications = {
  all: [
    {
      id: 1,
      type: 'price',
      title: 'Soybean Price Alert',
      message: 'Soybean prices have increased by 5% to ₹3675 in your local market.',
      time: '10m ago',
    },
    {
      id: 2,
      type: 'weather',
      title: 'Rainfall Expected',
      message: 'Light to moderate rainfall expected in the next 24 hours. Plan irrigation accordingly.',
      time: '1h ago',
    },
    {
      id: 3,
      type: 'general',
      title: 'New Crop Suggestion',
      message: 'Based on recent soil data, consider planting Millet for the next cycle.',
      time: '3h ago',
    },
    {
      id: 4,
      type: 'price',
      title: 'Wheat Price Drop',
      message: 'Wheat prices have dropped by 3%. Current market rate is ₹2134.',
      time: '1d ago',
    },
    {
        id: 5,
        type: 'weather',
        title: 'Heatwave Warning',
        message: 'Temperatures may exceed 40°C over the next 3 days. Ensure crops are well-hydrated.',
        time: '2d ago',
    }
  ],
  price: [
    {
      id: 1,
      type: 'price',
      title: 'Soybean Price Alert',
      message: 'Soybean prices have increased by 5% to ₹3675 in your local market.',
      time: '10m ago',
    },
    {
      id: 4,
      type: 'price',
      title: 'Wheat Price Drop',
      message: 'Wheat prices have dropped by 3%. Current market rate is ₹2134.',
      time: '1d ago',
    },
  ],
  weather: [
    {
      id: 2,
      type: 'weather',
      title: 'Rainfall Expected',
      message: 'Light to moderate rainfall expected in the next 24 hours. Plan irrigation accordingly.',
      time: '1h ago',
    },
    {
        id: 5,
        type: 'weather',
        title: 'Heatwave Warning',
        message: 'Temperatures may exceed 40°C over the next 3 days. Ensure crops are well-hydrated.',
        time: '2d ago',
    }
  ],
};

const iconMap = {
    price: <Tag className="h-5 w-5 text-primary" />,
    weather: <CloudRain className="h-5 w-5 text-blue-500" />,
    general: <Info className="h-5 w-5 text-yellow-500" />
}

type Notification = {
    id: number;
    type: 'price' | 'weather' | 'general';
    title: string;
    message: string;
    time: string;
};

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-start gap-4 p-4 border-b">
      <div className="mt-1">
        {iconMap[notification.type]}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{notification.title}</p>
          <p className="text-xs text-muted-foreground">{notification.time}</p>
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
    const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('notificationsPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('notificationsPage.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('notificationsPage.recentAlerts')}</CardTitle>
            <CardDescription>{t('notificationsPage.alertsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="m-4">
              <TabsTrigger value="all">{t('notificationsPage.allTab')}</TabsTrigger>
              <TabsTrigger value="price">{t('notificationsPage.priceTab')}</TabsTrigger>
              <TabsTrigger value="weather">{t('notificationsPage.weatherTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                {notifications.all.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </TabsContent>
            <TabsContent value="price">
                {notifications.price.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </TabsContent>
            <TabsContent value="weather">
                {notifications.weather.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
