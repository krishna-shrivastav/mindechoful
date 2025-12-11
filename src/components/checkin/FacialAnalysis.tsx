import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Loader2, AlertCircle, Smile, Frown, Meh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFacialExpression } from '@/hooks/useFacialExpression';
import { supabase } from '@/integrations/supabase/client';

interface FacialAnalysisProps {
  onResult: (result: { emotion: string; stress: string; aiInsight?: string }) => void;
  onClose: () => void;
}

export function FacialAnalysis({ onResult, onClose }: FacialAnalysisProps) {
  const {
    videoRef,
    canvasRef,
    isAnalyzing,
    result,
    error,
    startCamera,
    stopCamera,
    captureAndAnalyze,
  } = useFacialExpression();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const init = async () => {
      const success = await startCamera();
      if (success) {
        setIsCameraReady(true);
      }
    };
    init();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(async () => {
      const analysisResult = await captureAndAnalyze();
      
      if (analysisResult) {
        // Get AI insight
        setIsLoadingAI(true);
        try {
          const { data, error } = await supabase.functions.invoke('analyze-mood', {
            body: {
              type: 'facial-analysis',
              facialExpression: analysisResult,
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
      }
    }, 3000);
  };

  const handleUseResult = () => {
    if (result) {
      onResult({
        emotion: result.dominantEmotion,
        stress: result.stressIndicator,
        aiInsight: aiInsight || undefined,
      });
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const lower = emotion.toLowerCase();
    if (lower === 'happiness' || lower === 'surprise') return <Smile className="w-8 h-8 text-sage" />;
    if (lower === 'sadness' || lower === 'fear' || lower === 'anger') return <Frown className="w-8 h-8 text-coral" />;
    return <Meh className="w-8 h-8 text-lavender" />;
  };

  const getStressColor = (stress: string) => {
    if (stress === 'low') return 'text-sage';
    if (stress === 'medium') return 'text-amber-500';
    return 'text-coral';
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

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
          Facial Expression Analysis
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          We'll analyze your facial expression to help understand how you're feeling
        </p>

        {/* Camera View */}
        <Card variant="glass" className="mb-6 overflow-hidden">
          <CardContent className="p-0 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <motion.span
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-6xl font-bold text-primary"
                >
                  {countdown}
                </motion.span>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="calm" className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getEmotionIcon(result.dominantEmotion)}
                    <div>
                      <p className="font-semibold text-foreground">{result.dominantEmotion}</p>
                      <p className="text-sm text-muted-foreground">{result.confidence}% confidence</p>
                    </div>
                  </div>
                  <div className={`text-right ${getStressColor(result.stressIndicator)}`}>
                    <p className="text-sm font-medium">Stress Level</p>
                    <p className="font-bold capitalize">{result.stressIndicator}</p>
                  </div>
                </div>

                {/* Emotion breakdown */}
                <div className="space-y-2">
                  {Object.entries(result.details).map(([emotion, value]) => (
                    <div key={emotion} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 capitalize">{emotion}</span>
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                {isLoadingAI && (
                  <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Getting AI insights...</span>
                  </div>
                )}

                {aiInsight && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-sage-light/50 rounded-xl"
                  >
                    <p className="text-sm text-foreground">{aiInsight}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Button onClick={handleUseResult} className="w-full" size="lg">
              Use This Analysis
            </Button>
          </motion.div>
        )}

        {/* Capture Button */}
        {!result && isCameraReady && (
          <Button
            onClick={handleCapture}
            disabled={isAnalyzing || countdown !== null}
            className="w-full"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isAnalyzing ? 'Analyzing...' : countdown !== null ? 'Get ready...' : 'Capture & Analyze'}
          </Button>
        )}

        {!isCameraReady && !error && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Starting camera...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
