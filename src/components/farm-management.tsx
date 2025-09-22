'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { indianCities } from '@/lib/data';
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
  IndianRupee,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropSuggestions } from '@/ai/flows/generate-crop-suggestions';
import type { GenerateCropSuggestionsOutput } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Logo } from './icons';

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
  budget: z.coerce.number().min(0, 'Budget must be a positive number.'),
});

type FormSchemaType = z.infer<typeof formSchema>;

const FARM_DATA_STORAGE_KEY = 'farmManagementData';

const defaultFormValues: FormSchemaType = {
    name: '',
    location: '',
    soilType: 'Loam',
    ph: 7.0,
    moisture: 50,
    temperature: 25,
    nitrogen: 100,
    phosphorus: 50,
    potassium: 50,
    budget: 50000,
};

type StoredFarmData = {
  formData: FormSchemaType,
  suggestions: GenerateCropSuggestionsOutput | null;
}

export function FarmManagement() {
  const [suggestions, setSuggestions] =
    useState<GenerateCropSuggestionsOutput | null>(null);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });
  
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(FARM_DATA_STORAGE_KEY);
      if (savedData) {
        const { formData, suggestions: savedSuggestions } = JSON.parse(savedData) as StoredFarmData;
        form.reset(formData);
        if (savedSuggestions) {
          setSuggestions(savedSuggestions);
        }
      }
    } catch (error) {
        console.error("Failed to load farm data from localStorage", error);
    }
  }, [form]);

  // Save data to localStorage on change
  const watchedValues = form.watch();
  useEffect(() => {
    const dataToStore: StoredFarmData = {
      formData: watchedValues,
      suggestions,
    };
    try {
      localStorage.setItem(FARM_DATA_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Failed to save farm data to localStorage", error);
    }
  }, [watchedValues, suggestions]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startGeneratingTransition(async () => {
      setSuggestions(null);
      try {
        const result = await generateCropSuggestions({
          soilType: values.soilType,
          location: values.location,
          weatherDataLink: 'https://example.com/weather-api', // Placeholder
          pH: values.ph,
          moistureContent: `${values.moisture}%`,
          temperature: values.temperature,
          nutrientContent: `N:${values.nitrogen}, P:${values.phosphorus}, K:${values.potassium} ppm`,
          pastCropRotationData: 'Corn -> Soybeans -> Wheat', // Placeholder
          weatherForecast: 'Mild spring, hot summer expected.', // Placeholder
          budget: values.budget,
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

  const handleReset = () => {
    form.reset(defaultFormValues);
    setSuggestions(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem(FARM_DATA_STORAGE_KEY);
    }
    toast({
        title: 'Form Reset',
        description: 'All fields have been cleared.'
    })
  }

  const handleDownload = () => {
    if (!suggestions) return;

    const doc = new jsPDF();
    const formValues = form.getValues();

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Primary color
    doc.text('CropifyAI', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text('AI Crop Recommendation Report', 14, 28);
    
    // Line Separator
    doc.setDrawColor(221, 221, 221); // Border color
    doc.line(14, 32, 196, 32);

    // Farm Details Section
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Farm & Analysis Details', 14, 42);

    const farmDetailsContent = [
      [`Farm Name:`, formValues.name],
      [`Location:`, formValues.location],
      [`Soil Type:`, formValues.soilType],
      [`Budget:`, `₹${formValues.budget.toLocaleString('en-IN')}`],
      [`Temperature:`, `${formValues.temperature}°C`],
      [`Soil pH:`, `${formValues.ph}`],
      [`Moisture:`, `${formValues.moisture}%`],
      [`Nutrients (N-P-K):`, `${formValues.nitrogen}-${formValues.phosphorus}-${formValues.potassium} ppm`],
    ];
    (doc as any).autoTable({
        body: farmDetailsContent,
        startY: 48,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: 40 },
            1: { textColor: 80 }
        }
    });

    // AI Reasoning Section
    let lastY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text('AI Reasoning & Summary', 14, lastY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const reasoningLines = doc.splitTextToSize(suggestions.reasoning, 180);
    doc.text(reasoningLines, 14, lastY + 6);
    
    // Crop Suggestions Table
    lastY = doc.getTextDimensions(reasoningLines).h + lastY + 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text('Recommended Crops', 14, lastY);

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
      startY: lastY + 6,
      headStyles: { 
          fillColor: [41, 128, 185], // Primary color
          textColor: 255, 
          fontStyle: 'bold' 
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawCell: (data: any) => {
        if (data.column.index === 3 && data.cell.section === 'body') {
            const score = Number(data.cell.text[0]);
            const barWidth = (data.cell.width - 8) * (score / 100);
            doc.setFillColor(41, 128, 185); // Primary color
            doc.rect(data.cell.x + 4, data.cell.y + 4, barWidth, 4, 'F');
        }
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
        doc.text(`Report generated on ${new Date().toLocaleDateString()}`, 14, 285);
    }
    
    const fileName = `crop_recommendations_${formValues.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('farmManagement.farmDetailsTitle')}</CardTitle>
            <CardDescription>
              Enter your farm's details to get AI-powered crop recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
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
                      <FormItem>
                        <FormLabel>
                          {t('farmManagement.locationLabel')}
                        </FormLabel>
                        <FormControl>
                          <div>
                            <Input
                              {...field}
                              list="locations-datalist"
                              placeholder={t('farmManagement.locationPlaceholder')}
                            />
                            <datalist id="locations-datalist">
                              {[...new Set(indianCities)].map((location) => (
                                <option key={location} value={location} />
                              ))}
                            </datalist>
                          </div>
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
                          value={field.value}
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
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" {...field} className="pl-8" placeholder="e.g. 50000"/>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} placeholder="e.g. 25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ph"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('farmManagement.phLabel')}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} placeholder="e.g. 6.8" />
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
                            <Input type="number" {...field} placeholder="e.g. 35" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
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
                              <Input type="number" {...field} placeholder="e.g. 120" />
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
                              <Input type="number" {...field} placeholder="e.g. 50" />
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
                              <Input type="number" {...field} placeholder="e.g. 80" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={handleReset}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Fields
                    </Button>
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
                </div>
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
                  AI-powered suggestions based on your farm's data.
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
