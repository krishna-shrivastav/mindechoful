import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, Heart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function CrisisScreen() {
  const { setCurrentView, user } = useApp();
  const { t } = useLanguage();

  const crisisResources = [
    {
      name: t('crisis.vandrevalaFoundation'),
      description: t('crisis.vandrevalaDesc'),
      phone: '1860-2662-345',
      type: 'primary',
    },
    {
      name: t('crisis.iCall'),
      description: t('crisis.iCallDesc'),
      phone: '9152987821',
      type: 'support',
    },
    {
      name: t('crisis.nimhans'),
      description: t('crisis.nimhansDesc'),
      phone: '080-46110007',
      type: 'support',
    },
  ];

  const copingStrategies = [
    { emoji: '🧊', title: t('crisis.holdIce'), description: t('crisis.holdIceDesc') },
    { emoji: '💧', title: t('crisis.splashWater'), description: t('crisis.splashWaterDesc') },
    { emoji: '🌬️', title: t('crisis.breatheSlowly'), description: t('crisis.breatheSlowlyDesc') },
    { emoji: '👁️', title: t('crisis.grounding'), description: t('crisis.groundingDesc') },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-destructive/10 p-6 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t('crisis.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('crisis.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {t('crisis.immediate')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('crisis.call112')}
                  </p>
                  <Button
                    variant="crisis"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open('tel:112')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t('crisis.callButton')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contacts */}
        {user?.emergencyContacts && user.emergencyContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t('crisis.contacts')}
            </h3>
            <div className="space-y-2">
              {user.emergencyContacts.map((contact) => (
                <Card key={contact.id} variant="calm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      </div>
                      <Button
                        variant="calm"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {t('common.call')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Crisis Hotlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t('crisis.hotline')}
          </h3>
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <Card key={index} variant="default">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <Button
                      variant={resource.type === 'primary' ? 'accent' : 'soft'}
                      size="sm"
                      onClick={() => window.open(`tel:${resource.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {t('common.call')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Immediate Coping Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t('crisis.copingStrategies')}
          </h3>
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {copingStrategies.map((strategy, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-card/50"
                  >
                    <span className="text-2xl mb-2 block">{strategy.emoji}</span>
                    <p className="font-medium text-foreground text-sm">{strategy.title}</p>
                    <p className="text-xs text-muted-foreground">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breathing Exercise Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="calm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🌬️</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t('crisis.breathingLink')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('crisis.breathingDesc')}
                  </p>
                </div>
                <Button
                  variant="calm"
                  size="sm"
                  onClick={() => setCurrentView('interventions')}
                >
                  {t('common.start')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground p-4"
        >
          <p>{t('crisis.disclaimer')}</p>
        </motion.div>
      </div>
    </div>
  );
}
