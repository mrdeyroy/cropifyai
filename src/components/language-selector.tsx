'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

type LanguageSelectorProps = {
  isOpen: boolean;
  onOpenChangeAction: (isOpen: boolean) => void;
};

export function LanguageSelector({ isOpen, onOpenChange }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('languageSelector.title')}</DialogTitle>
          <DialogDescription>
            {t('languageSelector.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'hi' | 'mr' | 'bn')}>
            <SelectTrigger>
              <SelectValue placeholder={t('languageSelector.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
