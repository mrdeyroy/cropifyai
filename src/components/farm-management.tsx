'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { farms as initialFarms, indianCities } from '@/lib/data';
import type { Farm } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles,
  Loader2,
  Lightbulb,
  Bot,
  TrendingUp,
  Leaf,
  Target,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropSuggestions } from '@/ai/flows/generate-crop-suggestions';
import type { GenerateCropSuggestionsOutput } from '@/ai/flows/generate-crop-suggestions';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';
import { Label } from '@/components/ui/label';
import { Autocomplete } from '@/components/ui/autocomplete';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters.'),
  location: z.string().min(2, 'Location is required.'),
  soilType: z.string().min(2, 'Soil type is required.'),
  ph: z.coerce.number().min(0).max(14),
  moisture: z.coerce.number().min(0).max(100),
  temperature: z.coerce.number(),
  nitrogen: z.coerce.number().min(0),
  phosphorus: z.coerce.number().min(0),
  potassium: z.coerce.number().min(0),
});

const locations = [...new Set(indianCities)].map((location) => ({ value: location, label: location }));

export function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    initialFarms[0].id
  );
  const [suggestions, setSuggestions] =
    useState<GenerateCropSuggestionsOutput | null>(null);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useLanguage();

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedFarm.name,
      location: selectedFarm.location,
      soilType: selectedFarm.soilType,
      ph: selectedFarm.ph,
      moisture: selectedFarm.moisture,
      temperature: selectedFarm.temperature,
      nitrogen: selectedFarm.nutrients.nitrogen,
      phosphorus: selectedFarm.nutrients.phosphorus,
      potassium: selectedFarm.nutrients.potassium,
    },
  });

  useEffect(() => {
    const farm = farms.find((f) => f.id === selectedFarmId);
    if (farm) {
      form.reset({
        name: farm.name,
        location: farm.location,
        soilType: farm.soilType,
        ph: farm.ph,
        moisture: farm.moisture,
        temperature: farm.temperature,
        nitrogen: farm.nutrients.nitrogen,
        phosphorus: farm.nutrients.phosphorus,
        potassium: farm.nutrients.potassium,
      });
      setSuggestions(null);
    }
  }, [selectedFarmId, farms, form]);

  const handleFarmChange = (id: string) => {
    setSelectedFarmId(id);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startGeneratingTransition(async () => {
      setSuggestions(null);
      try {
        const result = await generateCropSuggestions({
          soilType: values.soilType,
          location: values.location,
          weatherDataLink: 'https://example.com/weather-api',
          pH: values.ph,
          moistureContent: `${values.moisture}%`,
          temperature: values.temperature,
          nutrientContent: `N:${values.nitrogen}, P:${values.phosphorus}, K:${values.potassium} ppm`,
          marketDemand: 'High demand for organic produce and grains.',
          pastCropRotationData: 'Corn -> Soybeans -> Wheat',
          weatherForecast: 'Mild spring, hot summer expected.',
          marketPrices: 'Corn: ₹1400, Soybeans: ₹3500',
        });
        setSuggestions(result);
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        toast({
          variant: 'destructive',
          title: t('farmManagement.errorToastTitle'),
          description: t('farmManagement.errorToastDescription'),
        });
      }
    });
  };

  const handleDownload = () => {
    if (!suggestions) return;

    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('AI Crop Recommendations', 14, 22);
    doc.setFontSize(12);
    doc.text(`For Farm: ${selectedFarm.name}`, 14, 30);
    doc.text(`Location: ${selectedFarm.location}`, 14, 36);
    
    // Add Reasoning
    doc.setFontSize(14);
    doc.text('AI Reasoning', 14, 50);
    const reasoningLines = doc.splitTextToSize(suggestions.reasoning, 180);
    doc.setFontSize(10);
    doc.text(reasoningLines, 14, 58);
    
    // Add Crop Suggestions Table
    const tableColumn = ["Crop", "Yield Forecast", "Profit Margin (%)", "Sustainability Score"];
    const tableRows: (string|number)[][] = [];

    suggestions.cropSuggestions.forEach(suggestion => {
      const suggestionData = [
        suggestion.cropName,
        suggestion.yieldForecast,
        suggestion.profitMargin.toFixed(1),
        suggestion.sustainabilityScore,
      ];
      tableRows.push(suggestionData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 75 }
    });

    const fileName = `crop_recommendations_${selectedFarm.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('farmManagement.farmDetailsTitle')}</CardTitle>
            <CardDescription>
              {t('farmManagement.farmDetailsDescription', {
                farmName: selectedFarm.name,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-select">Select a Farm</Label>
                    <Select
                      value={selectedFarmId}
                      onValueChange={handleFarmChange}
                    >
                      <SelectTrigger id="farm-select">
                        <SelectValue placeholder="Select a farm" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('farmManagement.farmNameLabel')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'farmManagement.farmNamePlaceholder'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {t('farmManagement.locationLabel')}
                        </FormLabel>
                        <FormControl>
                          <Autocomplete
                            options={locations}
                            placeholder={t(
                              'farmManagement.locationPlaceholder'
                            )}
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('farmManagement.soilTypeLabel')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'farmManagement.soilTypePlaceholder'
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Loam">Loam</SelectItem>
                            <SelectItem value="Silty Clay">
                              Silty Clay
                            </SelectItem>
                            <SelectItem value="Sandy Loam">
                              Sandy Loam
                            </SelectItem>
                            <SelectItem value="Clay">Clay</SelectItem>
                            <SelectItem value="Sand">Sand</SelectItem>
                            <SelectItem value="Peat">Peat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ph"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('farmManagement.phLabel')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="moisture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('farmManagement.moistureLabel')}
                          </FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {t('farmManagement.nutrientsLabel')}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="nitrogen"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>N</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phosphorus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>P</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="potassium"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>K</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating
                    ? t('farmManagement.generatingSuggestionsButton')
                    : t('farmManagement.generateSuggestionsButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="min-h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('farmManagement.recommendationsTitle')}</CardTitle>
                <CardDescription>
                  {t('farmManagement.recommendationsDescription', {
                    farmName: selectedFarm.name,
                  })}
                </CardDescription>
              </div>
              {suggestions && (
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Analysis as PDF</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">
                  {t('farmManagement.thinking')}
                </p>
              </div>
            )}
            {!isGenerating && !suggestions && (
              <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  {t('farmManagement.noSuggestionsTitle')}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('farmManagement.noSuggestionsDescription')}
                </p>
              </div>
            )}
            {suggestions && (
              <div className="space-y-6">
                <Alert className="bg-accent/20 border-accent/50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle className="font-semibold">
                    {t('farmManagement.reasoningTitle')}
                  </AlertTitle>
                  <AlertDescription>{suggestions.reasoning}</AlertDescription>
                </Alert>
                <div className="grid gap-6 md:grid-cols-2">
                  {suggestions.cropSuggestions.map((crop, index) => (
                    <Card key={index} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{crop.cropName}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-grow">
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            {t('farmManagement.yieldForecast')}
                          </h4>
                          <p className="text-sm text-muted-foreground ml-6">
                            {crop.yieldForecast}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {t('farmManagement.profitMargin')}
                          </h4>
                          <p className="text-sm text-muted-foreground ml-6">
                            {crop.profitMargin.toFixed(1)}%
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-primary" />
                            {t('farmManagement.sustainabilityScore')}
                          </h4>
                          <div className="flex items-center gap-2 ml-6">
                            <Progress
                              value={crop.sustainabilityScore}
                              className="h-2 w-full"
                            />
                            <span className="text-sm font-bold">
                              {crop.sustainabilityScore}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
