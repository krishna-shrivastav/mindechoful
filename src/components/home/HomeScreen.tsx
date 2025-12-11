import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Cloud, Heart, Brain, Wind, 
  BookOpen, History, Settings, AlertTriangle,
  Sparkles, TrendingUp, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: Cloud };
  return { text: 'Good evening', icon: Moon };
};

const quickActions = [
  { id: 'checkin', label: 'Check-in', icon: Heart, color: 'sage', view: 'checkin' as const },
  { id: 'breathe', label: 'Breathe', icon: Wind, color: 'calm-blue', view: 'interventions' as const },
  { id: 'journal', label: 'Journal', icon: BookOpen, color: 'lavender', view: 'journal' as const },
  { id: 'history', label: 'History', icon: History, color: 'coral', view: 'history' as const },
];

export function HomeScreen() {
  const { user, moodHistory, setCurrentView } = useApp();
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const recentMood = moodHistory[0];
  const todaysMoods = moodHistory.filter(
    m => new Date(m.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen gradient-calm">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center">
              <GreetingIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {greeting.text}, {user?.name?.split(' ')[0] || 'Friend'}
              </h1>
              <p className="text-sm text-muted-foreground">How are you feeling today?</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('settings')}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </motion.div>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Daily Check-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="gradient" className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Daily Check-in</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    {todaysMoods.length > 0 
                      ? "You've checked in today" 
                      : "Ready for your check-in?"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {todaysMoods.length > 0
                      ? "Take another moment to reflect on how you're feeling now."
                      : "Take a moment to reflect on your current state of mind."}
                  </p>
                  <Button
                    variant="calm"
                    onClick={() => setCurrentView('checkin')}
                  >
                    {todaysMoods.length > 0 ? 'Check-in Again' : 'Start Check-in'}
                  </Button>
                </div>
                {recentMood && (
                  <div className="text-5xl animate-float">
                    {MOOD_CONFIG[recentMood.mood].emoji}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => setCurrentView(action.view)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card shadow-soft border border-border/30 hover:shadow-medium transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    action.color === 'sage' ? 'bg-sage-light' :
                    action.color === 'calm-blue' ? 'bg-calm-blue-light' :
                    action.color === 'lavender' ? 'bg-lavender-light' :
                    'bg-coral-light'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      action.color === 'sage' ? 'text-sage-dark' :
                      action.color === 'calm-blue' ? 'text-calm-blue' :
                      action.color === 'lavender' ? 'text-lavender' :
                      'text-coral'
                    }`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Mood Trend */}
        {moodHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="default">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Recent Moods
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('history')}
                    className="text-xs"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {moodHistory.slice(0, 7).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex flex-col items-center gap-1 min-w-[60px]"
                    >
                      <span className="text-2xl">{MOOD_CONFIG[entry.mood].emoji}</span>
                      <span className="text-xs text-muted-foreground">
                        {index === 0 ? 'Now' : new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Interventions Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="calm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Mindfulness Exercises</h3>
                  <p className="text-sm text-muted-foreground">
                    Breathing techniques, CBT exercises & more
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView('interventions')}
                >
                  <span className="text-primary">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crisis Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="default" className="border-destructive/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Need Immediate Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Access crisis resources and support
                  </p>
                </div>
                <Button
                  variant="crisis"
                  size="sm"
                  onClick={() => setCurrentView('crisis')}
                >
                  Get Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-6 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { icon: Heart, label: 'Home', view: 'home' as const, active: true },
            { icon: Calendar, label: 'History', view: 'history' as const },
            { icon: Brain, label: 'Tools', view: 'interventions' as const },
            { icon: BookOpen, label: 'Journal', view: 'journal' as const },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
