'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Loader2, Bot, Pill, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyCropDisease } from '@/ai/flows/identify-crop-disease';
import type { DiseaseIdentification as DiseaseIDResult } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

const toDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function DiseaseDetector() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseIDResult[] | null>(null);
  const [isAnalyzing, startAnalyzingTransition] = useTransition();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toDataUri(file).then(setImagePreview);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!imagePreview) {
      toast({
        variant: 'destructive',
        title: t('diseaseDetector.noImageToastTitle'),
        description: t('diseaseDetector.noImageToastDescription'),
      });
      return;
    }

    startAnalyzingTransition(async () => {
      try {
        const aiResult = await identifyCropDisease({
          photoDataUri: imagePreview,
        });

        const mockData: DiseaseIDResult[] = aiResult.diseaseIdentification.map(
          (d) => ({
            ...d,
            treatment: [
              'Apply fungicide XYZ every 7-10 days.',
              'Remove and destroy infected leaves.',
              'Ensure proper air circulation.',
            ],
            prevention: [
              'Plant disease-resistant varieties.',
              'Water at the base of the plant to avoid wet foliage.',
              'Use mulch to prevent soil splash.',
            ],
          })
        );

        setResult(mockData);
      } catch (error) {
        console.error('Failed to analyze disease:', error);
        toast({
          variant: 'destructive',
          title: t('diseaseDetector.analysisFailedToastTitle'),
          description: t('diseaseDetector.analysisFailedToastDescription'),
        });
      }
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('diseaseDetector.uploadTitle')}</CardTitle>
          <CardDescription>
            {t('diseaseDetector.uploadDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">{t('diseaseDetector.pictureLabel')}</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {imagePreview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <Image
                src={imagePreview}
                alt="Crop preview"
                fill
                className="object-cover"
                data-ai-hint="diseased leaf"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAnalyze}
            disabled={!imagePreview || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Stethoscope className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing
              ? t('diseaseDetector.analyzingButton')
              : t('diseaseDetector.analyzeButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('diseaseDetector.analysisResultsTitle')}</CardTitle>
          <CardDescription>
            {t('diseaseDetector.analysisResultsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                {t('diseaseDetector.analyzingText')}
              </p>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg p-8">
              <Bot className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t('diseaseDetector.awaitingAnalysisTitle')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('diseaseDetector.awaitingAnalysisDescription')}
              </p>
            </div>
          ) : result.length > 0 ? (
            <div className="space-y-6">
              {result.map((disease, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-destructive">
                      {disease.diseaseName}
                    </h3>
                    <Badge variant="destructive">
                      {Math.round(disease.confidenceScore * 100)}%{' '}
                      {t('diseaseDetector.confidence')}
                    </Badge>
                  </div>
                  <Progress
                    value={disease.confidenceScore * 100}
                    className="h-2 mb-4"
                  />
                  <Tabs defaultValue="treatment">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="treatment">
                        <Pill className="mr-2 h-4 w-4" />
                        {t('diseaseDetector.treatmentTab')}
                      </TabsTrigger>
                      <TabsTrigger value="prevention">
                        <Shield className="mr-2 h-4 w-4" />
                        {t('diseaseDetector.preventionTab')}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="treatment" className="mt-4">
                      <ul className="list-disc space-y-2 pl-5 text-sm">
                        {disease.treatment.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="prevention" className="mt-4">
                      <ul className="list-disc space-y-2 pl-5 text-sm">
                        {disease.prevention.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>{t('diseaseDetector.noDiseaseTitle')}</AlertTitle>
              <AlertDescription>
                {t('diseaseDetector.noDiseaseDescription')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
