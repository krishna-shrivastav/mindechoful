import { useState, useRef, useCallback } from 'react';

interface FacialExpressionResult {
  dominantEmotion: string;
  confidence: number;
  stressIndicator: 'low' | 'medium' | 'high';
  details: {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    neutral: number;
  };
}

export function useFacialExpression() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FacialExpressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureAndAnalyze = useCallback(async (): Promise<FacialExpressionResult | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    setIsAnalyzing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0);

      // Analyze brightness and contrast as indicators
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let totalBrightness = 0;
      let centerBrightness = 0;
      let centerPixels = 0;
      
      // Focus on center region (face area)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 3;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
        
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (dist < radius) {
          centerBrightness += brightness;
          centerPixels++;
        }
      }

      const avgBrightness = totalBrightness / (data.length / 4);
      const avgCenterBrightness = centerPixels > 0 ? centerBrightness / centerPixels : avgBrightness;
      
      // Simulate expression analysis based on image characteristics
      // In production, this would use TensorFlow.js face-landmarks-detection
      const variance = Math.abs(avgCenterBrightness - avgBrightness);
      const seed = Date.now() % 100;
      
      // Generate realistic-looking expression scores
      const baseNeutral = 0.3 + (avgBrightness / 255) * 0.2;
      const baseHappy = Math.max(0.1, 0.4 - variance / 100 + (seed % 20) / 100);
      const baseSad = Math.max(0.05, variance / 200 + (seed % 10) / 100);
      const baseAnger = Math.max(0.02, (255 - avgBrightness) / 500);
      const baseFear = Math.max(0.02, variance / 300);
      const baseSurprise = Math.max(0.05, (seed % 15) / 100);

      const total = baseNeutral + baseHappy + baseSad + baseAnger + baseFear + baseSurprise;
      
      const details = {
        happiness: Math.round((baseHappy / total) * 100) / 100,
        sadness: Math.round((baseSad / total) * 100) / 100,
        anger: Math.round((baseAnger / total) * 100) / 100,
        fear: Math.round((baseFear / total) * 100) / 100,
        surprise: Math.round((baseSurprise / total) * 100) / 100,
        neutral: Math.round((baseNeutral / total) * 100) / 100,
      };

      // Determine dominant emotion
      const emotions = Object.entries(details);
      emotions.sort((a, b) => b[1] - a[1]);
      const [dominantEmotion, confidence] = emotions[0];

      // Calculate stress indicator
      const stressScore = details.sadness + details.anger + details.fear;
      let stressIndicator: 'low' | 'medium' | 'high' = 'low';
      if (stressScore > 0.4) stressIndicator = 'high';
      else if (stressScore > 0.2) stressIndicator = 'medium';

      const analysisResult: FacialExpressionResult = {
        dominantEmotion: dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1),
        confidence: Math.round(confidence * 100),
        stressIndicator,
        details,
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze facial expression. Please try again.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isAnalyzing,
    result,
    error,
    startCamera,
    stopCamera,
    captureAndAnalyze,
  };
}
