import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BoxBreathingExerciseProps {
  onClose: () => void;
}

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export function BoxBreathingExercise({ onClose }: BoxBreathingExerciseProps) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const phaseText: Record<Phase, string> = {
    inhale: t('breathing.inhale'),
    hold1: t('breathing.hold'),
    exhale: t('breathing.exhale'),
    hold2: t('breathing.hold'),
  };

  const speakPhase = (phaseKey: Phase) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const voiceText: Record<Phase, string> = {
      inhale: t('voice.inhale'),
      hold1: t('voice.hold'),
      exhale: t('voice.exhale'),
      hold2: t('voice.hold'),
    };
    
    const utterance = new SpeechSynthesisUtterance(voiceText[phaseKey]);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.7;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
      setCount(prev => {
        if (prev <= 1) {
          setPhase(current => {
            let next: Phase;
            switch (current) {
              case 'inhale': next = 'hold1'; break;
              case 'hold1': next = 'exhale'; break;
              case 'exhale': next = 'hold2'; break;
              case 'hold2': 
                next = 'inhale';
                setCycles(c => c + 1);
                break;
              default: next = 'inhale';
            }
            speakPhase(next);
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, voiceEnabled]);

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(4);
    setCycles(0);
    setTotalTime(0);
    window.speechSynthesis?.cancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    speakPhase('inhale');
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

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

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 left-6"
        onClick={() => setVoiceEnabled(!voiceEnabled)}
      >
        {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </Button>

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t('interventions.boxBreathing')}</h2>
        <p className="text-muted-foreground mb-6">{t('interventions.boxBreathingDesc')}</p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{cycles}</p>
            <p className="text-xs text-muted-foreground">{t('breathing.cycle')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatTime(totalTime)}</p>
            <p className="text-xs text-muted-foreground">{t('meditation.duration')}</p>
          </div>
        </div>
        
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: isActive ? (phase === 'inhale' ? 1.3 : phase === 'exhale' ? 1 : 1.15) : 1,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-colors duration-1000 ${
              phase === 'inhale' ? 'bg-sage-light' :
              phase === 'hold1' || phase === 'hold2' ? 'bg-lavender-light' :
              'bg-coral-light'
            }`}
          >
            <div className="text-center">
              <motion.div
                key={count}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold text-foreground"
              >
                {count}
              </motion.div>
              <div className="text-lg text-muted-foreground mt-2">
                {isActive ? phaseText[phase] : t('common.start')}
              </div>
            </div>
          </motion.div>
          
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '12rem', height: '12rem', margin: 'auto' }}
            />
          )}
        </div>

        {/* Phase indicator */}
        <div className="flex justify-center gap-4 mb-8">
          {(['inhale', 'hold1', 'exhale', 'hold2'] as Phase[]).map((p) => (
            <div
              key={p}
              className={`flex flex-col items-center ${phase === p && isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-3 h-3 rounded-full mb-1 ${phase === p && isActive ? 'bg-primary' : 'bg-border'}`} />
              <span className="text-xs">{p === 'hold1' || p === 'hold2' ? t('breathing.hold') : p === 'inhale' ? t('breathing.inhale') : t('breathing.exhale')}</span>
              <span className="text-xs text-muted-foreground">4s</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant={isActive ? 'soft' : 'calm'}
            size="xl"
            onClick={() => {
              if (!isActive) {
                handleStart();
              } else {
                setIsActive(false);
                window.speechSynthesis?.cancel();
              }
            }}
          >
            {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isActive ? t('meditation.pause') : t('common.start')}
          </Button>
          
          {(cycles > 0 || totalTime > 0) && (
            <Button variant="ghost" size="icon" onClick={reset}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
