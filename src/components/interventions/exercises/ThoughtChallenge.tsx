import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Brain, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThoughtChallengeProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Identify the Thought',
    question: 'What negative thought is bothering you right now?',
    placeholder: 'Write down the thought that\'s causing you distress...',
    tip: 'Be specific. Instead of "I\'m worried", try "I\'m worried I\'ll fail my presentation tomorrow."',
  },
  {
    title: 'Evidence For',
    question: 'What evidence supports this thought?',
    placeholder: 'List facts (not feelings) that support this thought...',
    tip: 'Focus on objective facts, not assumptions or interpretations.',
  },
  {
    title: 'Evidence Against',
    question: 'What evidence contradicts this thought?',
    placeholder: 'List facts that suggest this thought might not be entirely true...',
    tip: 'Think of times when the opposite was true, or facts you might be overlooking.',
  },
  {
    title: 'Friend Perspective',
    question: 'What would you tell a close friend in this situation?',
    placeholder: 'Imagine your best friend had this thought. What would you say to them?',
    tip: 'We\'re often kinder to others than ourselves. Use that compassion here.',
  },
  {
    title: 'Balanced Thought',
    question: 'What\'s a more balanced way to view this situation?',
    placeholder: 'Write a new thought that acknowledges both sides...',
    tip: 'This isn\'t about positive thinking – it\'s about realistic, balanced thinking.',
  },
];

export function ThoughtChallenge({ onClose }: ThoughtChallengeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(Array(STEPS.length).fill(''));
  const [isComplete, setIsComplete] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setIsLoadingAI(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: {
          type: 'journal-analysis',
          text: `Thought Challenge Exercise:
            
Original Thought: ${responses[0]}
Evidence For: ${responses[1]}
Evidence Against: ${responses[2]}
Friend Perspective: ${responses[3]}
Balanced Thought: ${responses[4]}

Please provide supportive feedback on this cognitive reframing exercise.`,
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
    newResponses[currentStep] = value;
    setResponses(newResponses);
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
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-sage-light flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
            <p className="text-muted-foreground">You've completed the thought challenge</p>
          </div>

          {/* Summary */}
          <Card variant="calm" className="mb-6">
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Original Thought</p>
                <p className="text-foreground">{responses[0]}</p>
              </div>
              <div className="border-t border-border/50 pt-4">
                <p className="text-sm font-medium text-primary mb-1">Your Balanced Thought</p>
                <p className="text-foreground font-medium">{responses[4]}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insight */}
          {isLoadingAI && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Getting personalized feedback...</span>
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
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">AI Insight</span>
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

  const step = STEPS[currentStep];

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
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-lavender-light flex items-center justify-center">
            <Brain className="w-6 h-6 text-lavender" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
            <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <Card variant="glass" className="flex-1 mb-6">
              <CardContent className="p-6 h-full flex flex-col">
                <p className="text-foreground font-medium mb-4">{step.question}</p>
                
                <Textarea
                  value={responses[currentStep]}
                  onChange={(e) => updateResponse(e.target.value)}
                  placeholder={step.placeholder}
                  className="flex-1 min-h-[150px] resize-none rounded-xl border-border/50"
                />

                <div className="mt-4 p-3 bg-sage-light/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">💡 Tip:</span> {step.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="soft" size="lg" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!responses[currentStep].trim()}
            className="flex-1"
            size="lg"
          >
            {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
            {currentStep < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
