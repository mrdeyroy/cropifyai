'use client';

import { DiseaseDetector } from '@/components/disease-detector';
import { useLanguage } from '@/hooks/use-language';

export default function DiseaseDetectionPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('diseaseDetectionPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('diseaseDetectionPage.description')}
        </p>
      </div>
      <DiseaseDetector />
    </div>
  );
}
