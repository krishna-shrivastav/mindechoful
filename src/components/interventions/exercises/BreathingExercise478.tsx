import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreathingExercise478Props {
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASE_DURATIONS: Record<Phase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const PHASE_LABELS: Record<Phase, string> = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
};

export function BreathingExercise478({ onClose }: BreathingExercise478Props) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [count, setCount] = useState(PHASE_DURATIONS.inhale);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhase(current => {
            let next: Phase;
            switch (current) {
              case 'inhale':
                next = 'hold';
                break;
              case 'hold':
                next = 'exhale';
                break;
              case 'exhale':
                next = 'inhale';
                setCycles(c => c + 1);
                break;
              default:
                next = 'inhale';
            }
            return next;
          });
          
          // Return the duration for the next phase
          const nextPhase = phase === 'inhale' ? 'hold' : phase === 'hold' ? 'exhale' : 'inhale';
          return PHASE_DURATIONS[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(PHASE_DURATIONS.inhale);
    setCycles(0);
    setTotalTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-calm-blue-light';
      case 'hold':
        return 'bg-lavender-light';
      case 'exhale':
        return 'bg-sage-light';
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 1;
    if (phase === 'inhale') return 1.4;
    if (phase === 'exhale') return 0.9;
    return 1.2;
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
        className="text-center w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-2 text-foreground">4-7-8 Breathing</h2>
        <p className="text-muted-foreground mb-8">A natural tranquilizer for your nervous system</p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{cycles}</p>
            <p className="text-xs text-muted-foreground">Cycles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatTime(totalTime)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </div>

        {/* Breathing Circle */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: getCircleScale(),
            }}
            transition={{ duration: PHASE_DURATIONS[phase], ease: 'easeInOut' }}
            className={`w-56 h-56 mx-auto rounded-full flex items-center justify-center transition-colors duration-500 ${getPhaseColor()}`}
          >
            <div className="text-center">
              <motion.div
                key={count}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-foreground"
              >
                {count}
              </motion.div>
              <div className="text-lg text-muted-foreground mt-2">
                {isActive ? PHASE_LABELS[phase] : 'Ready'}
              </div>
            </div>
          </motion.div>

          {/* Animated ring */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/20"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: PHASE_DURATIONS[phase], repeat: Infinity }}
              style={{ width: '14rem', height: '14rem', margin: 'auto' }}
            />
          )}
        </div>

        {/* Phase indicator */}
        <div className="flex justify-center gap-4 mb-8">
          {(['inhale', 'hold', 'exhale'] as Phase[]).map((p) => (
            <div
              key={p}
              className={`flex flex-col items-center ${phase === p && isActive ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-3 h-3 rounded-full mb-1 ${phase === p && isActive ? 'bg-primary' : 'bg-border'}`} />
              <span className="text-xs capitalize">{p}</span>
              <span className="text-xs text-muted-foreground">{PHASE_DURATIONS[p]}s</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            variant={isActive ? 'soft' : 'calm'}
            size="xl"
            onClick={() => {
              if (!isActive) {
                setPhase('inhale');
                setCount(PHASE_DURATIONS.inhale);
              }
              setIsActive(!isActive);
            }}
          >
            {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          
          {(cycles > 0 || totalTime > 0) && (
            <Button variant="ghost" size="icon" onClick={reset}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>

        <p className="text-muted-foreground mt-8 text-sm max-w-xs mx-auto">
          Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. 
          Recommended: 4 cycles before sleep.
        </p>
      </motion.div>
    </motion.div>
  );
}
