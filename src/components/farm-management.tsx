'use client';

import { useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, Lightbulb, Mic, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCropSuggestions } from '@/ai/flows/generate-crop-suggestions';
import { transcribeVoiceInput } from '@/ai/flows/voice-input-farm-data';
import type { GenerateCropSuggestionsOutput } from '@/ai/flows/generate-crop-suggestions';

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
  const [isTranscribing, startTranscribingTransition] = useTransition();
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

  const handleFarmChange = (id: string) => {
    const farm = farms.find((f) => f.id === id);
    if (farm) {
      setSelectedFarmId(id);
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
          marketPrices: "Corn: $4.50/bushel, Soybeans: $11.75/bushel", // Placeholder
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

  const handleVoiceInput = (fieldName: keyof z.infer<typeof formSchema>) => {
    startTranscribingTransition(async () => {
      toast({
        title: 'Listening...',
        description: 'Please describe the soil type. (Simulating voice input)',
      });
      try {
        const result = await transcribeVoiceInput({
            // This is a placeholder for actual audio data
            audioDataUri: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        });
        // In a real app, the result would be more dynamic. Here we hardcode a plausible result for the demo.
        const simulatedTranscription = "Silty Clay";
        form.setValue(fieldName, simulatedTranscription);
        toast({
          title: 'Transcription complete',
          description: `Set ${fieldName} to "${simulatedTranscription}"`,
        });
      } catch (error) {
        console.error('Transcription failed:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not process voice input.',
        });
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Farm Profile</CardTitle>
            <CardDescription>Select a farm to view or edit details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <Select
                    onValueChange={handleFarmChange}
                    defaultValue={selectedFarmId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a farm profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                          <Input placeholder="e.g., Napa Valley, CA" {...field} />
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
                        <div className="relative">
                            <FormControl>
                            <Input placeholder="e.g., Loam" {...field} />
                            </FormControl>
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => handleVoiceInput('soilType')}
                            disabled={isTranscribing}
                            >
                            {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                            <span className="sr-only">Use voice input</span>
                            </Button>
                        </div>
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
              Based on your farm profile and market data.
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
                  Click the "Generate" button to get your recommendations.
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
                <Accordion type="single" collapsible className="w-full">
                  {suggestions.cropSuggestions.map((crop, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-lg font-medium">{crop}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                            <h4 className="font-semibold">Optimal Conditions (Placeholder)</h4>
                            <p className="text-sm text-muted-foreground">Temperature: 60-75°F, Rainfall: 25-30 inches</p>
                            <h4 className="font-semibold">Yield Potential (Placeholder)</h4>
                            <p className="text-sm text-muted-foreground">High (approx. 180 bushels/acre)</p>
                             <h4 className="font-semibold">Market Trends (Placeholder)</h4>
                            <p className="text-sm text-muted-foreground">Stable demand with potential for price increase due to organic trends.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
