import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Leaf, Eye, Hand, Ear, Wind, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface GroundingExerciseProps {
  onClose: () => void;
}

const SENSES = [
  { count: 5, sense: 'SEE', icon: Eye, color: 'sage', question: 'Name 5 things you can see right now' },
  { count: 4, sense: 'TOUCH', icon: Hand, color: 'calm-blue', question: 'Name 4 things you can physically feel' },
  { count: 3, sense: 'HEAR', icon: Ear, color: 'lavender', question: 'Name 3 things you can hear' },
  { count: 2, sense: 'SMELL', icon: Wind, color: 'coral', question: 'Name 2 things you can smell' },
  { count: 1, sense: 'TASTE', icon: Coffee, color: 'amber', question: 'Name 1 thing you can taste' },
];

export function GroundingExercise({ onClose }: GroundingExerciseProps) {
  const [currentSense, setCurrentSense] = useState(0);
  const [responses, setResponses] = useState<string[][]>(SENSES.map(s => Array(s.count).fill('')));
  const [currentInput, setCurrentInput] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isComplete) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  const sense = SENSES[currentSense];
  const senseResponses = responses[currentSense];
  const filledCount = senseResponses.filter(r => r.trim()).length;

  const handleInputChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentSense][currentInput] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentInput < sense.count - 1) {
      setCurrentInput(currentInput + 1);
    } else if (currentSense < SENSES.length - 1) {
      setCurrentSense(currentSense + 1);
      setCurrentInput(0);
    } else {
      setIsComplete(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && senseResponses[currentInput].trim()) {
      handleNext();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      sage: { bg: 'bg-sage-light', text: 'text-sage-dark' },
      'calm-blue': { bg: 'bg-calm-blue-light', text: 'text-calm-blue' },
      lavender: { bg: 'bg-lavender-light', text: 'text-lavender' },
      coral: { bg: 'bg-coral-light', text: 'text-coral' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    };
    return colors[color] || colors.sage;
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
              <Leaf className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">You're Grounded!</h2>
            <p className="text-muted-foreground">Completed in {formatTime(timer)}</p>
          </div>

          {/* Summary */}
          <div className="space-y-4 mb-6">
            {SENSES.map((s, senseIndex) => {
              const Icon = s.icon;
              const colors = getColorClasses(s.color);
              return (
                <motion.div
                  key={s.sense}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: senseIndex * 0.1 }}
                >
                  <Card variant="calm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <span className="font-medium text-foreground">{s.sense}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {responses[senseIndex].filter(r => r.trim()).map((response, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text}`}
                          >
                            {response}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card variant="glass" className="mb-6">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">
                The 5-4-3-2-1 technique helps bring you back to the present moment 
                by engaging all five senses. Use this whenever you feel anxious or overwhelmed.
              </p>
            </CardContent>
          </Card>

          <Button onClick={onClose} className="w-full" size="lg">
            Done
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const Icon = sense.icon;
  const colors = getColorClasses(sense.color);

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
        {/* Overall Progress */}
        <div className="flex gap-2 mb-6">
          {SENSES.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i < currentSense ? 'bg-primary' : i === currentSense ? 'bg-primary/50' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              key={currentSense}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center`}
            >
              <Icon className={`w-8 h-8 ${colors.text}`} />
            </motion.div>
            <div>
              <motion.div
                key={sense.count}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`text-4xl font-bold ${colors.text}`}
              >
                {sense.count}
              </motion.div>
              <p className="text-sm text-muted-foreground">things to {sense.sense.toLowerCase()}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-primary">{formatTime(timer)}</div>
            <p className="text-xs text-muted-foreground">elapsed</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSense}-${currentInput}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1"
          >
            <Card variant="glass" className="mb-6">
              <CardContent className="p-6">
                <p className="text-lg font-medium text-foreground mb-6">{sense.question}</p>
                
                {/* Progress dots */}
                <div className="flex justify-center gap-3 mb-6">
                  {Array(sense.count).fill(null).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: i === currentInput ? 1.2 : 1,
                        backgroundColor: i < filledCount ? 'hsl(var(--primary))' : 
                                        i === currentInput ? 'hsl(var(--primary) / 0.5)' : 
                                        'hsl(var(--border))',
                      }}
                      className="w-3 h-3 rounded-full"
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Item {currentInput + 1} of {sense.count}
                  </label>
                  <Input
                    value={senseResponses[currentInput]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`What do you ${sense.sense.toLowerCase()}?`}
                    className="h-12 rounded-xl text-lg"
                    autoFocus
                  />
                </div>

                {/* Previous entries */}
                {filledCount > 0 && currentInput > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {senseResponses.slice(0, currentInput).filter(r => r.trim()).map((r, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text}`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={handleNext}
          disabled={!senseResponses[currentInput].trim()}
          className="w-full"
          size="lg"
        >
          {currentSense === SENSES.length - 1 && currentInput === sense.count - 1 ? (
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
    </motion.div>
  );
}
