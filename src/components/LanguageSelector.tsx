import React from 'react';
import { motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { Language } from '@/i18n/translations';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGUAGES: { id: Language; name: string; nativeName: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { id: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish' },
];

interface LanguageSelectorProps {
  showLabel?: boolean;
  variant?: 'cards' | 'compact';
}

export function LanguageSelector({ showLabel = true, variant = 'cards' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border-none outline-none cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showLabel && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="w-5 h-5" />
          <span className="text-sm">{t('onboarding.language')}</span>
        </div>
      )}
      <div className="grid gap-3">
        {LANGUAGES.map((lang) => (
          <motion.button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`relative p-4 rounded-xl text-left transition-all ${
              language === lang.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lang.nativeName}</p>
                <p className={`text-sm ${language === lang.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {lang.name}
                </p>
              </div>
              {language === lang.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
