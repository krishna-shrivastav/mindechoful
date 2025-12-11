import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';

const moodToNumber: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

export function HistoryScreen() {
  const { setCurrentView, moodHistory } = useApp();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Calculate average mood
  const averageMood = moodHistory.length > 0
    ? moodHistory.reduce((sum, entry) => sum + moodToNumber[entry.mood], 0) / moodHistory.length
    : 0;

  // Calculate trend (comparing recent to older entries)
  const recentAvg = moodHistory.slice(0, Math.min(3, moodHistory.length))
    .reduce((sum, e) => sum + moodToNumber[e.mood], 0) / Math.min(3, moodHistory.length);
  const olderAvg = moodHistory.slice(3, Math.min(6, moodHistory.length))
    .reduce((sum, e) => sum + moodToNumber[e.mood], 0) / Math.max(1, Math.min(3, moodHistory.length - 3));
  
  const trend = moodHistory.length < 4 ? 'neutral' : 
    recentAvg > olderAvg + 0.3 ? 'up' : 
    recentAvg < olderAvg - 0.3 ? 'down' : 'neutral';

  // Group entries by date
  const groupedEntries = moodHistory.reduce((groups, entry) => {
    const date = new Date(entry.date).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof moodHistory>);

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
            <h1 className="text-xl font-semibold text-foreground">Mood History</h1>
            <p className="text-sm text-muted-foreground">Track your emotional journey</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Stats Cards */}
        {moodHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <Card variant="calm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Average Mood</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">
                    {averageMood >= 4.5 ? '😊' :
                     averageMood >= 3.5 ? '🙂' :
                     averageMood >= 2.5 ? '😐' :
                     averageMood >= 1.5 ? '😔' : '😢'}
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {averageMood.toFixed(1)}/5
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card variant={trend === 'up' ? 'calm' : trend === 'down' ? 'coral' : 'mood'}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  {trend === 'up' ? (
                    <>
                      <TrendingUp className="w-6 h-6 text-sage-dark" />
                      <span className="font-semibold text-sage-dark">Improving</span>
                    </>
                  ) : trend === 'down' ? (
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
          </motion.div>
        )}

        {/* Mood Timeline */}
        {moodHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Mood Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {moodHistory.slice(0, 14).reverse().map((entry, index) => {
                    const height = (moodToNumber[entry.mood] / 5) * 100;
                    return (
                      <div
                        key={entry.id}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          className={`w-full rounded-t-md ${
                            entry.mood === 'great' ? 'bg-mood-great' :
                            entry.mood === 'good' ? 'bg-mood-good' :
                            entry.mood === 'okay' ? 'bg-mood-okay' :
                            entry.mood === 'low' ? 'bg-mood-low' :
                            'bg-mood-struggling'
                          }`}
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
        )}

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            All Entries
          </h3>
          
          {moodHistory.length === 0 ? (
            <Card variant="gradient" className="text-center py-12">
              <CardContent>
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-semibold text-foreground mb-2">No entries yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your mood with daily check-ins.
                </p>
                <Button variant="calm" onClick={() => setCurrentView('checkin')}>
                  First Check-in
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {entries.map((entry, index) => {
                    const config = MOOD_CONFIG[entry.mood];
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card variant="default" className="mb-2">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{config.emoji}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">{config.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.date).toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {entry.note}
                                  </p>
                                )}
                                {entry.stressLevel && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Stress level: {entry.stressLevel}/10
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
