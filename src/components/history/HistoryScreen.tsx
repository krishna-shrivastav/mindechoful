import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';

const moodToNumber: Record<MoodLevel, number> = {
  great: 5, good: 4, okay: 3, low: 2, struggling: 1,
};

export function HistoryScreen() {
  const { setCurrentView, moodHistory } = useApp();
  const { t, language } = useLanguage();

  const formatDate = (date: Date) => {
    const locale = language === 'hi' ? 'hi-IN' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  };

  const averageMood = moodHistory.length > 0
    ? moodHistory.reduce((sum, entry) => sum + moodToNumber[entry.mood], 0) / moodHistory.length : 0;

  const recentAvg = moodHistory.slice(0, Math.min(3, moodHistory.length))
    .reduce((sum, e) => sum + moodToNumber[e.mood], 0) / Math.min(3, moodHistory.length);
  const olderAvg = moodHistory.slice(3, Math.min(6, moodHistory.length))
    .reduce((sum, e) => sum + moodToNumber[e.mood], 0) / Math.max(1, Math.min(3, moodHistory.length - 3));
  
  const trend = moodHistory.length < 4 ? 'neutral' : 
    recentAvg > olderAvg + 0.3 ? 'up' : recentAvg < olderAvg - 0.3 ? 'down' : 'neutral';

  const groupedEntries = moodHistory.reduce((groups, entry) => {
    const date = new Date(entry.date).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, typeof moodHistory>);

  return (
    <div className="min-h-screen gradient-calm pb-24">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t('history.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('history.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {moodHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            <Card variant="calm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{t('history.average')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">
                    {averageMood >= 4.5 ? '😊' : averageMood >= 3.5 ? '🙂' : averageMood >= 2.5 ? '😐' : averageMood >= 1.5 ? '😔' : '😢'}
                  </span>
                  <span className="text-lg font-semibold text-foreground">{averageMood.toFixed(1)}/5</span>
                </div>
              </CardContent>
            </Card>
            <Card variant={trend === 'up' ? 'calm' : trend === 'down' ? 'coral' : 'mood'}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{t('history.trend')}</p>
                <div className="flex items-center gap-2">
                  {trend === 'up' ? (<><TrendingUp className="w-6 h-6 text-sage-dark" /><span className="font-semibold text-sage-dark">{t('history.improving')}</span></>) 
                  : trend === 'down' ? (<><TrendingDown className="w-6 h-6 text-coral" /><span className="font-semibold text-coral">{t('history.declining')}</span></>) 
                  : (<><Minus className="w-6 h-6 text-lavender" /><span className="font-semibold text-lavender">{t('history.stable')}</span></>)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {moodHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card variant="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />{t('history.timeline')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {moodHistory.slice(0, 14).reverse().map((entry, index) => {
                    const height = (moodToNumber[entry.mood] / 5) * 100;
                    return (
                      <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * 0.03, duration: 0.3 }}
                          className={`w-full rounded-t-md bg-mood-${entry.mood}`} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />{t('history.allEntries')}
          </h3>
          {moodHistory.length === 0 ? (
            <Card variant="gradient" className="text-center py-12">
              <CardContent>
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-semibold text-foreground mb-2">{t('history.empty')}</h3>
                <p className="text-muted-foreground mb-4">{t('history.empty.desc')}</p>
                <Button variant="calm" onClick={() => setCurrentView('checkin')}>{t('history.firstCheckin')}</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  {entries.map((entry, index) => {
                    const config = MOOD_CONFIG[entry.mood];
                    return (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <Card variant="default" className="mb-2">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{config.emoji}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">{config.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.date).toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                </div>
                                {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
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
