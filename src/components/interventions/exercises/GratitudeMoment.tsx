import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface GratitudeMomentProps {
  onClose: () => void;
}

const PROMPTS = [
  {
    title: 'Something that made you smile',
    question: 'What made you smile today, even if just for a moment?',
    emoji: '😊',
    placeholder: 'A kind word, a funny moment, a small win...',
  },
  {
    title: 'Someone who supports you',
    question: 'Think of someone who has been there for you. What do you appreciate about them?',
    emoji: '💝',
    placeholder: 'A friend, family member, colleague, or even a stranger who showed kindness...',
  },
  {
    title: 'Something to look forward to',
    question: "What's something you're looking forward to, big or small?",
    emoji: '✨',
    placeholder: 'An upcoming event, a meal you love, a show to watch, rest...',
  },
];

export function GratitudeMoment({ onClose }: GratitudeMomentProps) {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(PROMPTS.length).fill(''));
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(60); // 1 minute per prompt
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (!isTimerActive || isComplete) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Auto-advance when timer runs out
          if (currentPrompt < PROMPTS.length - 1) {
            setCurrentPrompt(c => c + 1);
            return 60;
          } else {
            handleComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, currentPrompt, isComplete]);

  const handleNext = () => {
    if (currentPrompt < PROMPTS.length - 1) {
      setCurrentPrompt(currentPrompt + 1);
      setTimer(60);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsTimerActive(false);
    setIsLoadingAI(true);

    try {
      const gratitudeList = responses
        .map((r, i) => `${i + 1}. ${PROMPTS[i].title}: ${r || '(skipped)'}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: {
          type: 'journal-analysis',
          text: `Gratitude Practice:\n${gratitudeList}\n\nPlease provide a warm, encouraging reflection on these gratitude entries.`,
        },
      });

      if (!error && data?.analysis) {
        setAiInsight(data.analysis);
      }
    } catch (err) {
      console.error('AI insight error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const updateResponse = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentPrompt] = value;
    setResponses(newResponses);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 overflow-y-auto"
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
          className="w-full max-w-md my-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-coral-light flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-coral" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Beautiful!</h2>
            <p className="text-muted-foreground">Your gratitude list for today</p>
          </div>

          {/* Gratitude Cards */}
          <div className="space-y-3 mb-6">
            {PROMPTS.map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card variant="calm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{prompt.emoji}</span>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{prompt.title}</p>
                        <p className="text-foreground">{responses[i] || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* AI Insight */}
          {isLoadingAI && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating your reflection...</span>
            </div>
          )}

          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass" className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Reflection</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{aiInsight}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Button onClick={onClose} className="w-full" size="lg">
            Done
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const prompt = PROMPTS[currentPrompt];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col p-6"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full pt-12">
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {PROMPTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i <= currentPrompt ? 'bg-coral' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-coral-light flex items-center justify-center">
              <span className="text-2xl">{prompt.emoji}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{currentPrompt + 1} of {PROMPTS.length}</p>
              <h2 className="text-lg font-semibold text-foreground">{prompt.title}</h2>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-right">
            <motion.div
              key={timer}
              initial={{ scale: timer <= 10 ? 1.1 : 1 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${timer <= 10 ? 'text-coral' : 'text-primary'}`}
            >
              {formatTime(timer)}
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setIsTimerActive(!isTimerActive)}
            >
              {isTimerActive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPrompt}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <Card variant="glass" className="flex-1 mb-6">
              <CardContent className="p-6 h-full flex flex-col">
                <p className="text-foreground font-medium mb-4">{prompt.question}</p>
                
                <Textarea
                  value={responses[currentPrompt]}
                  onChange={(e) => updateResponse(e.target.value)}
                  placeholder={prompt.placeholder}
                  className="flex-1 min-h-[120px] resize-none rounded-xl border-border/50"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={handleNext}
            className="flex-1"
            size="lg"
          >
            {currentPrompt === PROMPTS.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Take your time. There are no wrong answers.
        </p>
      </div>
    </motion.div>
  );
}
