'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { user } from '@/lib/data';
import { useLanguage } from '@/hooks/use-language';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('settingsPage.title')}
        </h1>
        <p className="text-muted-foreground">{t('settingsPage.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.profileTitle')}</CardTitle>
          <CardDescription>
            {t('settingsPage.profileDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('settingsPage.nameLabel')}</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">{t('settingsPage.emailLabel')}</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>{t('settingsPage.saveChanges')}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settingsPage.preferencesTitle')}</CardTitle>
          <CardDescription>
            {t('settingsPage.preferencesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">
                {t('settingsPage.languageLabel')}
              </Label>
              <Select
                value={language}
                onValueChange={(value) =>
                  setLanguage(value as 'en' | 'hi' | 'mr')
                }
              >
                <SelectTrigger id="language">
                  <SelectValue
                    placeholder={t('settingsPage.languagePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settingsPage.themeLabel')}</Label>
              <Select defaultValue="light">
                <SelectTrigger id="theme">
                  <SelectValue placeholder={t('settingsPage.themePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t('settingsPage.lightTheme')}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t('settingsPage.darkTheme')}
                  </SelectItem>
                  <SelectItem value="system">
                    {t('settingsPage.systemTheme')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="price-alerts" />
            <Label htmlFor="price-alerts">
              {t('settingsPage.priceAlertsLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="weather-alerts" defaultChecked />
            <Label htmlFor="weather-alerts">
              {t('settingsPage.weatherAlertsLabel')}
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button>{t('settingsPage.savePreferences')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
