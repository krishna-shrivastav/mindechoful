import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, BarChart3, PieChart, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';
import { supabase } from '@/integrations/supabase/client';

const moodToNumber: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

export function MoodReportsScreen() {
  const { setCurrentView, moodHistory, checkIns } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const cutoff = timeRange === 'week' 
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : timeRange === 'month'
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);
    
    return moodHistory.filter(entry => new Date(entry.date) >= cutoff);
  }, [moodHistory, timeRange]);

  const stats = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        averageMood: 0,
        averageStress: 0,
        totalCheckins: 0,
        moodDistribution: {} as Record<MoodLevel, number>,
        trend: 'neutral' as const,
        bestDay: null as string | null,
        worstDay: null as string | null,
        streakDays: 0,
      };
    }

    // Average mood
    const averageMood = filteredHistory.reduce((sum, e) => sum + moodToNumber[e.mood], 0) / filteredHistory.length;

    // Average stress
    const stressEntries = filteredHistory.filter(e => e.stressLevel !== undefined);
    const averageStress = stressEntries.length > 0
      ? stressEntries.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / stressEntries.length
      : 0;

    // Mood distribution
    const moodDistribution = filteredHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodLevel, number>);

    // Trend calculation
    const halfLength = Math.floor(filteredHistory.length / 2);
    const recentHalf = filteredHistory.slice(0, halfLength);
    const olderHalf = filteredHistory.slice(halfLength);
    
    const recentAvg = recentHalf.length > 0 
      ? recentHalf.reduce((sum, e) => sum + moodToNumber[e.mood], 0) / recentHalf.length 
      : 0;
    const olderAvg = olderHalf.length > 0 
      ? olderHalf.reduce((sum, e) => sum + moodToNumber[e.mood], 0) / olderHalf.length 
      : 0;
    
    const trend = filteredHistory.length < 4 ? 'neutral' : 
      recentAvg > olderAvg + 0.3 ? 'up' : 
      recentAvg < olderAvg - 0.3 ? 'down' : 'neutral';

    // Best and worst days
    const byDate = filteredHistory.reduce((acc, entry) => {
      const date = new Date(entry.date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, typeof filteredHistory>);

    let bestDay: string | null = null;
    let bestDayAvg = 0;
    let worstDay: string | null = null;
    let worstDayAvg = 6;

    Object.entries(byDate).forEach(([date, entries]) => {
      const avg = entries.reduce((sum, e) => sum + moodToNumber[e.mood], 0) / entries.length;
      if (avg > bestDayAvg) {
        bestDayAvg = avg;
        bestDay = date;
      }
      if (avg < worstDayAvg) {
        worstDayAvg = avg;
        worstDay = date;
      }
    });

    // Calculate streak
    const sortedDates = [...new Set(filteredHistory.map(e => new Date(e.date).toDateString()))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streakDays = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streakDays = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i]);
        const prev = new Date(sortedDates[i - 1]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff <= 1.5) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    return {
      averageMood,
      averageStress,
      totalCheckins: filteredHistory.length,
      moodDistribution,
      trend,
      bestDay,
      worstDay,
      streakDays,
    };
  }, [filteredHistory]);

  const generateAIReport = async () => {
    setIsLoadingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: {
          type: 'weekly-report',
          moodData: filteredHistory.map(e => ({
            mood: e.mood,
            stressLevel: e.stressLevel,
            date: e.date,
            note: e.note,
          })),
          stats: {
            averageMood: stats.averageMood,
            averageStress: stats.averageStress,
            trend: stats.trend,
            totalCheckins: stats.totalCheckins,
          },
        },
      });

      if (!error && data?.analysis) {
        setAiReport(data.analysis);
      }
    } catch (err) {
      console.error('AI report error:', err);
      setAiReport('Based on your check-ins, you\'ve been maintaining awareness of your mental health. Keep up the good work with regular check-ins and self-reflection.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const getMoodEmoji = (avg: number) => {
    if (avg >= 4.5) return '😊';
    if (avg >= 3.5) return '🙂';
    if (avg >= 2.5) return '😐';
    if (avg >= 1.5) return '😔';
    return '😢';
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
            <h1 className="text-xl font-semibold text-foreground">Mood Reports</h1>
            <p className="text-sm text-muted-foreground">Insights into your wellness journey</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Time Range Tabs */}
        <Tabs defaultValue="week" onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="week" className="flex-1">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Month</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredHistory.length === 0 ? (
          <Card variant="gradient" className="text-center py-12">
            <CardContent>
              <div className="text-5xl mb-4">📊</div>
              <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your mood to see insights.
              </p>
              <Button variant="calm" onClick={() => setCurrentView('checkin')}>
                First Check-in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <Card variant="calm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Average Mood</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getMoodEmoji(stats.averageMood)}</span>
                    <span className="text-2xl font-bold text-foreground">
                      {stats.averageMood.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card variant={stats.trend === 'up' ? 'calm' : stats.trend === 'down' ? 'coral' : 'mood'}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <div className="flex items-center gap-2">
                    {stats.trend === 'up' ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-sage-dark" />
                        <span className="font-semibold text-sage-dark">Improving</span>
                      </>
                    ) : stats.trend === 'down' ? (
                      <>
                        <TrendingDown className="w-6 h-6 text-coral" />
                        <span className="font-semibold text-coral">Declining</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-6 h-6 text-lavender" />
                        <span className="font-semibold text-lavender">Stable</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Avg Stress</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      stats.averageStress <= 3 ? 'text-sage' :
                      stats.averageStress <= 6 ? 'text-amber-500' :
                      'text-coral'
                    }`}>
                      {stats.averageStress.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Check-in Streak</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stats.streakDays}</span>
                    <span className="text-muted-foreground">days</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Mood Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(MOOD_CONFIG).map(([mood, config]) => {
                      const count = stats.moodDistribution[mood as MoodLevel] || 0;
                      const percentage = stats.totalCheckins > 0 
                        ? (count / stats.totalCheckins) * 100 
                        : 0;
                      
                      return (
                        <div key={mood} className="flex items-center gap-3">
                          <span className="text-2xl">{config.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">{config.label}</span>
                              <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-border rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`h-full rounded-full bg-mood-${mood}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Timeline Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Mood Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-32">
                    {filteredHistory.slice(0, 21).reverse().map((entry, index) => {
                      const height = (moodToNumber[entry.mood] / 5) * 100;
                      return (
                        <div
                          key={entry.id}
                          className="flex-1 flex flex-col items-center"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.02, duration: 0.3 }}
                            className={`w-full rounded-t-sm bg-mood-${entry.mood}`}
                            title={`${MOOD_CONFIG[entry.mood].label} - ${new Date(entry.date).toLocaleDateString()}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Older</span>
                    <span>Recent</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Best/Worst Days */}
            {(stats.bestDay || stats.worstDay) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {stats.bestDay && (
                  <Card variant="calm">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Best Day</p>
                      <p className="font-medium text-foreground text-sm">
                        {new Date(stats.bestDay).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {stats.worstDay && (
                  <Card variant="coral">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Challenging Day</p>
                      <p className="font-medium text-foreground text-sm">
                        {new Date(stats.worstDay).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* AI Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card variant="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiReport ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{aiReport}</p>
                  ) : (
                    <div className="text-center py-4">
                      <Button
                        variant="calm"
                        onClick={generateAIReport}
                        disabled={isLoadingReport}
                      >
                        {isLoadingReport ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
