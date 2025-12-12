import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Bell, Shield, Phone, 
  HelpCircle, Heart, LogOut, ChevronRight, Globe, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';

const languageOptions: { value: Language; label: string; nativeLabel: string }[] = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { value: 'hinglish', label: 'Hinglish', nativeLabel: 'Hinglish' },
];

export function SettingsScreen() {
  const { setCurrentView, user, setUser } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('onboarding');
  };

  const currentLanguageLabel = languageOptions.find(l => l.value === language)?.nativeLabel || 'English';

  const settingsSections = [
    {
      title: t('settings.account'),
      items: [
        { icon: User, label: t('settings.profile') || 'Profile', description: t('settings.profileDesc') || 'Name and personal info' },
        { icon: Phone, label: t('settings.emergencyContacts') || 'Emergency Contacts', description: t('settings.emergencyContactsDesc') || 'Manage trusted contacts' },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: Globe, label: t('settings.language'), description: currentLanguageLabel, isLanguage: true },
        { icon: Bell, label: t('settings.notifications'), description: t('settings.notificationsDesc') || 'Check-in reminders', hasToggle: true },
      ],
    },
    {
      title: t('settings.privacy'),
      items: [
        { icon: Shield, label: t('settings.dataPrivacy') || 'Data & Privacy', description: t('settings.dataPrivacyDesc') || 'How your data is used' },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        { icon: HelpCircle, label: t('settings.helpCenter') || 'Help Center', description: t('settings.helpCenterDesc') || 'FAQs and guides' },
        { icon: Heart, label: t('settings.about') || 'About MindCare', description: `${t('settings.version')} 1.0.0` },
      ],
    },
  ];

  return (
    <div className="min-h-screen gradient-calm pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t('settings.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.customize') || 'Customize your experience'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center">
                  <span className="text-2xl">
                    {user?.name?.charAt(0).toUpperCase() || '👤'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.memberSince') || 'Member since'} {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', year: 'numeric' })
                      : t('common.today') || 'Today'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {section.title}
            </h3>
            <Card variant="default">
              <CardContent className="p-0">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors ${
                        index < section.items.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                      onClick={() => {
                        if ((item as any).isLanguage) {
                          setShowLanguageSelector(true);
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {(item as any).hasToggle ? (
                        <Switch 
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="soft"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('settings.resetApp') || 'Reset App'}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('settings.resetAppDesc') || 'This will clear all your data and start fresh'}
          </p>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          <p className="mb-1">{t('app.name')} v1.0.0</p>
          <p>{t('settings.madeWith') || 'Made with 💚 for your mental wellness'}</p>
        </motion.div>
      </div>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center p-4"
          onClick={() => setShowLanguageSelector(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-md bg-card rounded-3xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-semibold text-foreground">{t('onboarding.language')}</h2>
              <p className="text-sm text-muted-foreground">{t('onboarding.language.desc')}</p>
            </div>
            <div className="p-4 space-y-2">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setLanguage(option.value);
                    setShowLanguageSelector(false);
                  }}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                    language === option.value
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-secondary/50 border-2 border-transparent hover:border-border'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium text-foreground">{option.nativeLabel}</p>
                    <p className="text-sm text-muted-foreground">{option.label}</p>
                  </div>
                  {language === option.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border/50">
              <Button
                variant="soft"
                className="w-full"
                onClick={() => setShowLanguageSelector(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
