'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
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
import {
  Stethoscope,
  Loader2,
  Bot,
  Pill,
  Shield,
  Upload,
  Camera,
  Trees,
  XCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyCropDisease } from '@/ai/flows/identify-crop-disease';
import type { IdentifyCropDiseaseOutput } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { useOnlineStatus } from '@/hooks/use-online-status';

const toDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
const DISEASE_DETECTOR_STORAGE_KEY = 'diseaseDetectorState';

type StoredDiseaseState = {
  imagePreview: string | null;
  result: IdentifyCropDiseaseOutput | null;
  isPending: boolean;
}

export function DiseaseDetector() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyCropDiseaseOutput | null>(null);
  const [isAnalyzing, startAnalyzingTransition] = useTransition();
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const isOnline = useOnlineStatus();


  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(DISEASE_DETECTOR_STORAGE_KEY);
      if (savedState) {
        const { imagePreview: savedImage, result: savedResult, isPending: savedIsPending } = JSON.parse(savedState) as StoredDiseaseState;
        if (savedImage) setImagePreview(savedImage);
        if (savedResult) setResult(savedResult);
        if (savedIsPending) setIsPending(savedIsPending);
      }
    } catch (error) {
      console.error("Failed to load disease detector state from localStorage", error);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    const stateToStore: StoredDiseaseState = { imagePreview, result, isPending };
    try {
      localStorage.setItem(DISEASE_DETECTOR_STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (error) {
      console.error("Failed to save disease detector state to localStorage", error);
    }
  }, [imagePreview, result, isPending]);

    const handleAnalyze = useCallback((isSyncing = false) => {
    if (!imagePreview) {
      toast({
        variant: 'destructive',
        title: t('diseaseDetector.noImageToastTitle'),
        description: t('diseaseDetector.noImageToastDescription'),
      });
      return;
    }

    if (!isOnline) {
      setIsPending(true);
      toast({
        title: 'You are offline',
        description: 'The analysis is queued and will start when you are back online.',
      });
      return;
    }

    if (isSyncing) {
        window.dispatchEvent(new CustomEvent('sync-start'));
    }

    startAnalyzingTransition(async () => {
      try {
        setIsPending(false);
        const aiResult = await identifyCropDisease({
          photoDataUri: imagePreview,
        });

        setResult(aiResult);
        if (isSyncing) {
            toast({
                title: 'Sync Complete',
                description: 'Offline analysis has been completed.'
            });
        }
      } catch (error) {
        console.error('Failed to analyze disease:', error);
        toast({
          variant: 'destructive',
          title: t('diseaseDetector.analysisFailedToastTitle'),
          description: t('diseaseDetector.analysisFailedToastDescription'),
        });
      } finally {
         if (isSyncing) {
            window.dispatchEvent(new CustomEvent('sync-end'));
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview, isOnline, toast, t]);

  // Effect to run pending analysis when back online
  useEffect(() => {
    if (isOnline && isPending && imagePreview) {
      handleAnalyze(true);
    }
  }, [isOnline, isPending, imagePreview, handleAnalyze]);


  useEffect(() => {
    if (activeTab === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description:
              'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop camera stream when switching tabs
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [activeTab, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toDataUri(file).then(setImagePreview);
      setResult(null);
      setIsPending(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);
        setResult(null);
        setIsPending(false);
      }
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setIsPending(false);
    const pictureInput = document.getElementById('picture') as HTMLInputElement;
    if (pictureInput) {
        pictureInput.value = '';
    }
    if (typeof window !== 'undefined') {
        localStorage.removeItem(DISEASE_DETECTOR_STORAGE_KEY);
    }
    toast({
        title: 'Cleared',
        description: 'Image and analysis results have been cleared.'
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className='flex justify-between items-center'>
                <TabsList className="grid grid-cols-2">
                <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                </TabsTrigger>
                <TabsTrigger value="camera">
                    <Camera className="mr-2 h-4 w-4" />
                    Use Camera
                </TabsTrigger>
                </TabsList>
                 { (imagePreview || result) && (
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                )}
            </div>
          </CardHeader>
          <TabsContent value="upload">
            <CardContent className="space-y-4">
              <CardDescription>
                {t('diseaseDetector.uploadDescription')}
              </CardDescription>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">
                  {t('diseaseDetector.pictureLabel')}
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isAnalyzing || isPending}
                />
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="camera">
            <CardContent className="space-y-4">
              <CardDescription>
                Position the affected crop in front of the camera and capture a
                photo.
              </CardDescription>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <video
                  ref={videoRef}
                  className="w-full aspect-video rounded-md"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                {!hasCameraPermission && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Waiting for camera permission...
                    </p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCapture}
                disabled={!hasCameraPermission || isAnalyzing || isPending}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            </CardContent>
          </TabsContent>
        </Tabs>

        {imagePreview && (
          <CardContent>
            <Label>Preview</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border mt-2">
              <Image
                src={imagePreview}
                alt="Crop preview"
                fill
                className="object-cover"
                data-ai-hint="diseased leaf"
              />
            </div>
          </CardContent>
        )}

        <CardFooter>
          <Button
            onClick={() => handleAnalyze()}
            disabled={!imagePreview || isAnalyzing || isPending}
            className="w-full"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Stethoscope className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing
              ? t('diseaseDetector.analyzingButton')
              : isPending ? 'Analysis Queued' : t('diseaseDetector.analyzeButton')}
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
          ) : isPending ? (
            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg p-8">
                <Clock className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Analysis Queued</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    You are currently offline. The analysis will begin automatically when you reconnect.
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
          ) : result.isCrop === false ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>No Crop Detected</AlertTitle>
                <AlertDescription>
                  The AI could not detect a crop or plant in the image. Please try again with a clearer picture of a plant.
                </AlertDescription>
              </Alert>
          ) : result.diseaseIdentification.length > 0 ? (
            <div className="space-y-6">
              {result.diseaseIdentification.map((disease, index) => (
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
              <Trees className="h-4 w-4" />
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
