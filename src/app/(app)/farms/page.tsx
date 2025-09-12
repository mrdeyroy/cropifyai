'use client';

import { FarmManagement } from '@/components/farm-management';
import { useLanguage } from '@/hooks/use-language';

export default function FarmsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('farmsPage.title')}
        </h1>
        <p className="text-muted-foreground">{t('farmsPage.description')}</p>
      </div>
      <FarmManagement />
    </div>
  );
}
