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
import { useLanguage } from '@/hooks/use-language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Script from 'next/script';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
    });
  }, [user, form]);

  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    setUser({ ...user, ...values });
    toast({
      title: 'Profile Saved',
      description: 'Your changes have been saved successfully.',
    });
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('settingsPage.title')}
        </h1>
        <p className="text-muted-foreground">{t('settingsPage.description')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsPage.profileTitle')}</CardTitle>
              <CardDescription>
                {t('settingsPage.profileDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settingsPage.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settingsPage.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">{t('settingsPage.saveChanges')}</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

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
              <Select value={theme} onValueChange={setTheme}>
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
