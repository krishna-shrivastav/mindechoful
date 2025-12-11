import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';
import { FacialAnalysis } from './FacialAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const moodOptions: MoodLevel[] = ['great', 'good', 'okay', 'low', 'struggling'];

export function CheckInScreen() {
  const { addCheckIn, setCurrentView } = useApp();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [stressLevel, setStressLevel] = useState([5]);
  const [notes, setNotes] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showFacialAnalysis, setShowFacialAnalysis] = useState(false);
  const [facialResult, setFacialResult] = useState<{ emotion: string; stress: string; aiInsight?: string } | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleComplete = async () => {
    if (selectedMood) {
      addCheckIn({
        date: new Date(),
        mood: selectedMood,
        stressLevel: stressLevel[0],
        notes: notes || undefined,
      });
      
      // Get AI mood insight
      setIsLoadingAI(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-mood', {
          body: {
            type: 'mood-insight',
            mood: selectedMood,
            stressLevel: stressLevel[0],
            text: notes,
            facialExpression: facialResult,
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
      
      setIsComplete(true);
    }
  };

  const handleFacialResult = (result: { emotion: string; stress: string; aiInsight?: string }) => {
    setFacialResult(result);
    setShowFacialAnalysis(false);
    toast({
      title: 'Expression analyzed',
      description: `Detected: ${result.emotion} (${result.stress} stress)`,
    });
  };

  const getRecommendation = () => {
    if (!selectedMood) return '';
    if (selectedMood === 'struggling' || selectedMood === 'low') {
      return "I'm here for you. Would you like to try a calming breathing exercise?";
    }
    if (selectedMood === 'okay') {
      return "That's okay. Small steps count. How about some gentle mindfulness?";
    }
    return "Wonderful! Keep nurturing that positive energy.";
  };

  if (isComplete) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-sage-light flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">Check-in Complete</h2>
          <p className="text-muted-foreground mb-2">{getRecommendation()}</p>
          <div className="text-6xl my-6 animate-float">
            {selectedMood && MOOD_CONFIG[selectedMood].emoji}
          </div>

          {/* AI Insight */}
          {isLoadingAI && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing your mood...</span>
            </div>
          )}

          {aiInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass" className="mb-6 text-left">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">AI Insight</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{aiInsight}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {facialResult && (
            <Card variant="calm" className="mb-6 text-left">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Facial Analysis Result</p>
                <p className="font-medium text-foreground">
                  {facialResult.emotion} • {facialResult.stress} stress
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center mt-6">
            <Button variant="soft" onClick={() => setCurrentView('home')}>
              Go Home
            </Button>
            {(selectedMood === 'struggling' || selectedMood === 'low') && (
              <Button variant="calm" onClick={() => setCurrentView('interventions')}>
                Try Breathing
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
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
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Daily Check-in</h1>
            <p className="text-sm text-muted-foreground">Step {step + 1} of 3</p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-colors ${
                s <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Mood Selection */}
          {step === 0 && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="glass" className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">How are you feeling right now?</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    There's no right or wrong answer. Just be honest with yourself.
                  </p>
                  
                  {/* Facial Analysis Button */}
                  <Button
                    variant="soft"
                    className="w-full mb-4"
                    onClick={() => setShowFacialAnalysis(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {facialResult ? `Analyzed: ${facialResult.emotion}` : 'Analyze with Camera'}
                  </Button>
                  
                  <div className="space-y-3">
                    {moodOptions.map((mood) => {
                      const config = MOOD_CONFIG[mood];
                      const isSelected = selectedMood === mood;
                      return (
                        <motion.button
                          key={mood}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMood(mood)}
                          className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border ${
                            isSelected
                              ? 'bg-sage-light border-primary shadow-glow-sage'
                              : 'bg-card border-border/50 hover:border-border'
                          }`}
                        >
                          <span className="text-3xl">{config.emoji}</span>
                          <div className="text-left">
                            <div className="font-medium text-foreground">{config.label}</div>
                            <div className="text-sm text-muted-foreground">{config.description}</div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Button
                onClick={() => setStep(1)}
                disabled={!selectedMood}
                className="w-full"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Stress Level */}
          {step === 1 && (
            <motion.div
              key="stress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="glass" className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-2">How's your stress level?</h2>
                  <p className="text-muted-foreground mb-8">
                    Rate from 1 (very calm) to 10 (very stressed)
                  </p>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-5xl font-bold text-primary">{stressLevel[0]}</span>
                      <p className="text-muted-foreground mt-2">
                        {stressLevel[0] <= 3 ? 'Calm & Relaxed' :
                         stressLevel[0] <= 5 ? 'Manageable' :
                         stressLevel[0] <= 7 ? 'Somewhat Stressed' :
                         'High Stress'}
                      </p>
                    </div>
                    
                    <Slider
                      value={stressLevel}
                      onValueChange={setStressLevel}
                      min={1}
                      max={10}
                      step={1}
                      className="py-4"
                    />
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Very Calm</span>
                      <span>Very Stressed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button
                  variant="soft"
                  onClick={() => setStep(0)}
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Notes */}
          {step === 2 && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="glass" className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-2">Anything on your mind?</h2>
                  <p className="text-muted-foreground mb-6">
                    This is optional. Share what's going on or skip ahead.
                  </p>
                  
                  <Textarea
                    placeholder="I'm feeling this way because..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[150px] rounded-xl resize-none border-border/50"
                  />
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    Your notes are private and will be analyzed by AI to provide personalized insights.
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button
                  variant="soft"
                  onClick={() => setStep(1)}
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  size="lg"
                >
                  Complete Check-in
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Facial Analysis Modal */}
      <AnimatePresence>
        {showFacialAnalysis && (
          <FacialAnalysis
            onResult={handleFacialResult}
            onClose={() => setShowFacialAnalysis(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
