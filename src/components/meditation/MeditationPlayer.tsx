import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  CloudRain,
  Waves,
  Trees,
  Flame,
  Wind,
  VolumeX,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

type AmbientSound = 'rain' | 'ocean' | 'forest' | 'fire' | 'wind' | 'silence';

const AMBIENT_SOUNDS: { id: AmbientSound; icon: React.ElementType; frequency?: number }[] = [
  { id: 'rain', icon: CloudRain, frequency: 200 },
  { id: 'ocean', icon: Waves, frequency: 150 },
  { id: 'forest', icon: Trees, frequency: 300 },
  { id: 'fire', icon: Flame, frequency: 250 },
  { id: 'wind', icon: Wind, frequency: 100 },
  { id: 'silence', icon: VolumeX },
];

const DURATIONS = [5, 10, 15, 20, 30];

export function MeditationPlayer() {
  const { setCurrentView } = useApp();
  const { t } = useLanguage();
  const [duration, setDuration] = useState(10);
  const [selectedSound, setSelectedSound] = useState<AmbientSound>('rain');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [volume, setVolume] = useState(0.5);
  const [isComplete, setIsComplete] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ oscillator?: OscillatorNode; gain?: GainNode; noise?: AudioBufferSourceNode }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const createNoiseBuffer = (context: AudioContext) => {
    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };

  const startAmbientSound = () => {
    if (selectedSound === 'silence') return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const context = audioContextRef.current;
      
      // Create noise-based ambient sound
      const noiseBuffer = createNoiseBuffer(context);
      const noise = context.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      // Create filter for different sound textures
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      
      // Different frequency settings for each sound type
      const soundConfig = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
      filter.frequency.value = soundConfig?.frequency || 200;
      
      const gainNode = context.createGain();
      gainNode.gain.value = volume * 0.3;
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(context.destination);
      
      noise.start();
      
      nodesRef.current = [{ noise, gain: gainNode }];
    } catch (error) {
      console.error('Error creating ambient sound:', error);
    }
  };

  const stopAmbientSound = () => {
    nodesRef.current.forEach(node => {
      try {
        node.noise?.stop();
        node.oscillator?.stop();
      } catch (e) {}
    });
    nodesRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setTimeRemaining(duration * 60);
    setIsComplete(false);
    startAmbientSound();
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopAmbientSound();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleResume = () => {
    setIsPlaying(true);
    startAmbientSound();
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setIsComplete(true);
    stopAmbientSound();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsComplete(false);
    setTimeRemaining(duration * 60);
    stopAmbientSound();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    // Update volume in real-time
    nodesRef.current.forEach(node => {
      if (node.gain) {
        node.gain.gain.value = volume * 0.3;
      }
    });
  }, [volume]);

  useEffect(() => {
    setTimeRemaining(duration * 60);
  }, [duration]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  return (
    <div className="min-h-screen gradient-calm pb-24">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              handleReset();
              setCurrentView('home');
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t('meditation.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('meditation.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Card variant="glass">
                <CardContent className="p-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-4xl">🧘</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">{t('meditation.complete')}</h2>
                  <p className="text-muted-foreground mb-6">{t('meditation.complete.desc')}</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="soft" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('common.start')}
                    </Button>
                    <Button onClick={() => setCurrentView('home')}>
                      {t('common.done')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : isPlaying || timeRemaining < duration * 60 ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Timer Circle */}
              <Card variant="glass">
                <CardContent className="p-8">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={553}
                        strokeDashoffset={553 - (progress / 100) * 553}
                        initial={false}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-light text-foreground">
                        {formatTime(timeRemaining)}
                      </span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {t('meditation.duration')}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="soft"
                      size="icon"
                      className="w-12 h-12"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="w-16 h-16 rounded-full"
                      onClick={isPlaying ? handlePause : handleResume}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </Button>
                    <Button
                      variant="soft"
                      size="icon"
                      className="w-12 h-12"
                      onClick={handleComplete}
                    >
                      {t('meditation.end').slice(0, 3)}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Volume Control */}
              <Card variant="default">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <Slider
                      value={[volume * 100]}
                      onValueChange={([val]) => setVolume(val / 100)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Duration Selection */}
              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('meditation.duration')}</h3>
                  <div className="flex gap-2">
                    {DURATIONS.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          duration === dur
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {dur} {t('meditation.minutes')}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ambient Sound Selection */}
              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('meditation.sounds')}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {AMBIENT_SOUNDS.map(({ id, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedSound(id)}
                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          selectedSound === id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{t(`meditation.${id}`)}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full py-6 text-lg"
                onClick={handleStart}
              >
                <Play className="w-5 h-5 mr-2" />
                {t('meditation.start')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
