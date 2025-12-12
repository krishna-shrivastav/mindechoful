import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Brain, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BreathingExercise478 } from './exercises/BreathingExercise478';
import { ThoughtChallenge } from './exercises/ThoughtChallenge';
import { GratitudeMoment } from './exercises/GratitudeMoment';
import { GroundingExercise } from './exercises/GroundingExercise';
import { BoxBreathingExercise } from './exercises/BoxBreathingExercise';

const iconMap = {
  wind: Wind,
  brain: Brain,
  leaf: Leaf,
  sparkles: Sparkles,
};

export function InterventionsScreen() {
  const { setCurrentView } = useApp();
  const { t } = useLanguage();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const interventions = {
    breathing: [
      {
        id: 'box-breathing',
        title: t('interventions.boxBreathing'),
        description: t('interventions.boxBreathingDesc'),
        duration: 4,
        icon: 'wind',
      },
      {
        id: '478-breathing',
        title: t('interventions.478Breathing'),
        description: t('interventions.478BreathingDesc'),
        duration: 5,
        icon: 'wind',
      },
    ],
    grounding: [
      {
        id: '5-senses',
        title: t('interventions.54321Grounding'),
        description: t('interventions.54321GroundingDesc'),
        duration: 5,
        icon: 'leaf',
      },
    ],
    cognitive: [
      {
        id: 'thought-challenge',
        title: t('interventions.thoughtChallenge'),
        description: t('interventions.thoughtChallengeDesc'),
        duration: 10,
        icon: 'brain',
      },
      {
        id: 'gratitude',
        title: t('interventions.gratitudeMoment'),
        description: t('interventions.gratitudeMomentDesc'),
        duration: 3,
        icon: 'sparkles',
      },
    ],
  };

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
            <h1 className="text-xl font-semibold text-foreground">{t('interventions.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('interventions.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Breathing Exercises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4" />
            {t('interventions.breathingExercises')}
          </h3>
          <div className="space-y-3">
            {interventions.breathing.map((intervention, index) => {
              const Icon = iconMap[intervention.icon as keyof typeof iconMap] || Wind;
              return (
                <motion.div
                  key={intervention.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="calm"
                    className="cursor-pointer hover:shadow-medium transition-all"
                    onClick={() => setSelectedExercise(intervention.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{intervention.title}</h4>
                        <p className="text-sm text-muted-foreground">{intervention.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {intervention.duration} min
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Grounding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            {t('interventions.groundingTechniques')}
          </h3>
          <div className="space-y-3">
            {interventions.grounding.map((intervention) => {
              const Icon = iconMap[intervention.icon as keyof typeof iconMap] || Leaf;
              return (
                <Card 
                  key={intervention.id} 
                  variant="mood"
                  className="cursor-pointer hover:shadow-medium transition-all"
                  onClick={() => setSelectedExercise(intervention.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-lavender" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{intervention.title}</h4>
                        <p className="text-sm text-muted-foreground">{intervention.duration} min • {t('interventions.interactive')}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{intervention.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* CBT & Mindfulness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {t('interventions.cognitiveMindfulness')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {interventions.cognitive.map((intervention) => {
              const Icon = iconMap[intervention.icon as keyof typeof iconMap] || Brain;
              return (
                <Card 
                  key={intervention.id} 
                  variant="default" 
                  className="cursor-pointer hover:shadow-medium transition-all"
                  onClick={() => setSelectedExercise(intervention.id)}
                >
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-coral" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">{intervention.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{intervention.duration} min • {t('interventions.aiPowered')}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Exercise Modals */}
      <AnimatePresence>
        {selectedExercise === 'box-breathing' && (
          <BoxBreathingExercise onClose={() => setSelectedExercise(null)} />
        )}
        {selectedExercise === '478-breathing' && (
          <BreathingExercise478 onClose={() => setSelectedExercise(null)} />
        )}
        {selectedExercise === '5-senses' && (
          <GroundingExercise onClose={() => setSelectedExercise(null)} />
        )}
        {selectedExercise === 'thought-challenge' && (
          <ThoughtChallenge onClose={() => setSelectedExercise(null)} />
        )}
        {selectedExercise === 'gratitude' && (
          <GratitudeMoment onClose={() => setSelectedExercise(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
