'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { farms as initialFarms } from '@/lib/data';
import type { Farm } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Sparkles, Loader2, Lightbulb, Bot, MapPin, TrendingUp, Leaf, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropSuggestions } from '@/ai/flows/generate-crop-suggestions';
import type { GenerateCropSuggestionsOutput } from '@/ai/flows/generate-crop-suggestions';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters.'),
  location: z.string().min(2, 'Location is required.'),
  soilType: z.string().min(2, 'Soil type is required.'),
  ph: z.coerce.number().min(0).max(14),
  moisture: z.coerce.number().min(0).max(100),
  nitrogen: z.coerce.number().min(0),
  phosphorus: z.coerce.number().min(0),
  potassium: z.coerce.number().min(0),
});

export function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    initialFarms[0].id
  );
  const [suggestions, setSuggestions] = useState<GenerateCropSuggestionsOutput | null>(null);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedFarm.name,
      location: selectedFarm.location,
      soilType: selectedFarm.soilType,
      ph: selectedFarm.ph,
      moisture: selectedFarm.moisture,
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
          weatherDataLink: "https://example.com/weather-api", // Placeholder
          pH: values.ph,
          moistureContent: `${values.moisture}%`,
          nutrientContent: `N:${values.nitrogen}, P:${values.phosphorus}, K:${values.potassium} ppm`,
          marketDemand: "High demand for organic produce and grains.", // Placeholder
          pastCropRotationData: "Corn -> Soybeans -> Wheat", // Placeholder
          weatherForecast: "Mild spring, hot summer expected.", // Placeholder
          marketPrices: "Corn: ₹1400, Soybeans: ₹3500", // Placeholder
        });
        setSuggestions(result);
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate crop suggestions. Please try again.',
        });
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {farms.map((farm) => (
            <Card 
              key={farm.id}
              onClick={() => handleFarmChange(farm.id)}
              className={cn(
                  "cursor-pointer transition-all", 
                  selectedFarmId === farm.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              )}
            >
              <CardHeader>
                <CardTitle>{farm.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3"/>
                    {farm.location}
                </CardDescription>
              </CardHeader>
            </Card>
        ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>Edit the details for '{selectedFarm.name}'.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Green Valley Organics" {...field} />
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nashik, Maharashtra" {...field} />
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
                        <FormLabel>Soil Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a soil type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Loam">Loam</SelectItem>
                                <SelectItem value="Silty Clay">Silty Clay</SelectItem>
                                <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
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
                          <FormLabel>pH</FormLabel>
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
                          <FormLabel>Moisture (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Nutrients (ppm)</h4>
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

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Crop Suggestions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>AI Crop Recommendations</CardTitle>
            <CardDescription>
              Based on your farm profile and market data for '{selectedFarm.name}'.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">AI is thinking...</p>
              </div>
            )}
            {!isGenerating && !suggestions && (
              <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No suggestions yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a farm and fill out its details, then click "Generate" to get recommendations.
                </p>
              </div>
            )}
            {suggestions && (
              <div className="space-y-6">
                <Alert className="bg-accent/20 border-accent/50">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Reasoning</AlertTitle>
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
                            <h4 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Yield Forecast</h4>
                            <p className="text-sm text-muted-foreground ml-6">{crop.yieldForecast}</p>
                         </div>
                         <div className="space-y-2">
                             <h4 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Profit Margin</h4>
                            <p className="text-sm text-muted-foreground ml-6">{crop.profitMargin.toFixed(1)}%</p>
                         </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" />Sustainability Score</h4>
                            <div className="flex items-center gap-2 ml-6">
                                <Progress value={crop.sustainabilityScore} className="h-2 w-full" />
                                <span className="text-sm font-bold">{crop.sustainabilityScore}</span>
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
