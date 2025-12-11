import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Brain, BookOpen, Sparkles, Leaf, X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Intervention } from '@/types/mental-health';

const interventions: Intervention[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A calming technique used by Navy SEALs to reduce stress.',
    type: 'breathing',
    duration: 4,
    icon: 'wind',
    steps: ['Breathe in for 4 seconds', 'Hold for 4 seconds', 'Breathe out for 4 seconds', 'Hold for 4 seconds'],
  },
  {
    id: '478-breathing',
    title: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system.',
    type: 'breathing',
    duration: 5,
    icon: 'wind',
    steps: ['Breathe in for 4 seconds', 'Hold for 7 seconds', 'Breathe out for 8 seconds'],
  },
  {
    id: '5-senses',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present moment.',
    type: 'grounding',
    duration: 5,
    icon: 'leaf',
    steps: ['Name 5 things you can see', 'Name 4 things you can touch', 'Name 3 things you can hear', 'Name 2 things you can smell', 'Name 1 thing you can taste'],
  },
  {
    id: 'thought-challenge',
    title: 'Thought Challenge',
    description: 'Identify and reframe negative thought patterns.',
    type: 'cbt',
    duration: 10,
    icon: 'brain',
    steps: ['What thought is bothering you?', 'What evidence supports it?', 'What evidence contradicts it?', 'What would you tell a friend?', 'What\'s a balanced perspective?'],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Moment',
    description: 'Focus on three things you\'re grateful for right now.',
    type: 'mindfulness',
    duration: 3,
    icon: 'sparkles',
    steps: ['Think of something that made you smile today', 'Think of someone who supports you', 'Think of something you\'re looking forward to'],
  },
];

const iconMap = {
  wind: Wind,
  brain: Brain,
  leaf: Leaf,
  sparkles: Sparkles,
  book: BookOpen,
};

function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(4);

  React.useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(current => {
            switch (current) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': return 'inhale';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const phaseText = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-8 text-foreground">Box Breathing</h2>
        
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: isActive ? (phase === 'inhale' ? 1.3 : phase === 'exhale' ? 1 : undefined) : 1,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-colors duration-1000 ${
              phase === 'inhale' ? 'bg-sage-light' :
              phase === 'hold1' || phase === 'hold2' ? 'bg-lavender-light' :
              'bg-coral-light'
            }`}
          >
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground">{count}</div>
              <div className="text-lg text-muted-foreground mt-2">
                {isActive ? phaseText[phase] : 'Ready'}
              </div>
            </div>
          </motion.div>
          
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          )}
        </div>

        <Button
          variant={isActive ? 'soft' : 'calm'}
          size="xl"
          onClick={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setPhase('inhale');
              setCount(4);
            }
          }}
        >
          {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>

        <p className="text-muted-foreground mt-8 max-w-sm">
          Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, hold for 4 seconds. Repeat.
        </p>
      </motion.div>
    </motion.div>
  );
}

export function InterventionsScreen() {
  const { setCurrentView } = useApp();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const groupedInterventions = {
    breathing: interventions.filter(i => i.type === 'breathing'),
    grounding: interventions.filter(i => i.type === 'grounding'),
    cbt: interventions.filter(i => i.type === 'cbt'),
    mindfulness: interventions.filter(i => i.type === 'mindfulness'),
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
            <h1 className="text-xl font-semibold text-foreground">Wellness Tools</h1>
            <p className="text-sm text-muted-foreground">Exercises to calm your mind</p>
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
            Breathing Exercises
          </h3>
          <div className="space-y-3">
            {groupedInterventions.breathing.map((intervention, index) => {
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
            Grounding Techniques
          </h3>
          <div className="space-y-3">
            {groupedInterventions.grounding.map((intervention) => {
              const Icon = iconMap[intervention.icon as keyof typeof iconMap] || Leaf;
              return (
                <Card key={intervention.id} variant="mood">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-lavender" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{intervention.title}</h4>
                        <p className="text-sm text-muted-foreground">{intervention.duration} min</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{intervention.description}</p>
                    <div className="space-y-2">
                      {intervention.steps?.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-lavender/20 flex items-center justify-center text-xs text-lavender font-medium">
                            {i + 1}
                          </span>
                          <span className="text-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
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
            Cognitive & Mindfulness
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[...groupedInterventions.cbt, ...groupedInterventions.mindfulness].map((intervention) => {
              const Icon = iconMap[intervention.icon as keyof typeof iconMap] || Brain;
              return (
                <Card key={intervention.id} variant="default" className="cursor-pointer hover:shadow-medium transition-all">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-coral" />
                    </div>
                    <h4 className="font-medium text-foreground text-sm">{intervention.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{intervention.duration} min</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedExercise === 'box-breathing' && (
          <BreathingExercise onClose={() => setSelectedExercise(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
