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
  useFormField,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Edit, Check, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from '@/lib/firebase';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

function AvatarUpload() {
  const { user, updateProfile, loading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    const names = name.split(' ');
     if (names.length > 0 && names[0]) {
      return names[0][0].toUpperCase();
    }
    return '';
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);

      await updateProfile({ photoURL });
      
      toast({
        title: 'Profile Picture Updated',
        description: 'Your new avatar has been saved.',
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload your profile picture. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (loading || !user) return <div className="h-24 w-24 rounded-full bg-muted" />

  return (
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
          <AvatarFallback className="text-3xl">
            {getInitials(user.displayName || '')}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
      </div>
  );
}


export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const [priceAlerts, setPriceAlerts] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
      });
    }
  }, [user, form]);

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile({ displayName: values.name });
      toast({
        title: 'Profile Saved',
        description: 'Your changes have been saved successfully.',
      });
      setIsEditingName(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleCancelEdit = () => {
    form.reset({ name: user?.displayName || '' });
    setIsEditingName(false);
  };

  const handleSavePreferences = () => {
    // In a real app, you would save these preferences to a backend or local storage
    console.log('Preferences saved:', { language, theme, priceAlerts, weatherAlerts });
    toast({
      title: 'Preferences Saved',
      description: 'Your new preferences have been saved.',
    });
  };
  
  if (!mounted || !user || loading) {
    return null;
  }

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
          <div className="flex items-center gap-6">
            <AvatarUpload />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settingsPage.nameLabel')}</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            {isEditingName ? (
                              <div className="w-full space-y-2">
                                <Input {...field} />
                                <div className="flex gap-2">
                                    <Button size="sm" type="submit">
                                        Save
                                    </Button>
                                    <Button size="sm" variant="ghost" type="button" onClick={handleCancelEdit}>
                                        Cancel
                                    </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="flex-1 py-2">{field.value}</p>
                                <Button variant="outline" type="button" onClick={() => setIsEditingName(true)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                              </>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              <div className="space-y-2">
                  <Label htmlFor="email">{t('settingsPage.emailLabel')}</Label>
                  <Input type="email" id="email" value={user?.email || ''} disabled />
              </div>
            </div>
          </div>
        </CardContent>
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
              {mounted && (
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
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="price-alerts"
              checked={priceAlerts}
              onCheckedChange={setPriceAlerts}
            />
            <Label htmlFor="price-alerts">
              {t('settingsPage.priceAlertsLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="weather-alerts"
              checked={weatherAlerts}
              onCheckedChange={setWeatherAlerts}
            />
            <Label htmlFor="weather-alerts">
              {t('settingsPage.weatherAlertsLabel')}
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePreferences}>{t('settingsPage.savePreferences')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
