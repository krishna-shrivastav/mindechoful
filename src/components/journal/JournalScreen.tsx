import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, Calendar, Edit3, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MOOD_CONFIG, MoodLevel } from '@/types/mental-health';

export function JournalScreen() {
  const { setCurrentView, journalEntries, addJournalEntry } = useApp();
  const { t, language } = useLanguage();
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

  const prompts = [
    t('journal.placeholder'),
  ];

  const randomPrompt = prompts[0];

  const handleSave = () => {
    if (content.trim()) {
      addJournalEntry({ date: new Date(), content: content.trim(), mood: selectedMood || undefined });
      setContent('');
      setSelectedMood(null);
      setIsWriting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen gradient-calm pb-24">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{t('journal.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('journal.subtitle')}</p>
            </div>
          </div>
          {!isWriting && (
            <Button variant="calm" size="sm" onClick={() => setIsWriting(true)}>
              <Plus className="w-4 h-4 mr-1" />{t('journal.newEntry')}
            </Button>
          )}
        </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {isWriting ? (
            <motion.div key="writing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card variant="glass">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{t('journal.newEntry')}</span>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => { setIsWriting(false); setContent(''); setSelectedMood(null); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-sage-light rounded-xl p-3 mb-4">
                    <p className="text-sm text-sage-dark italic">💭 {randomPrompt}</p>
                  </div>
                  <Textarea placeholder={t('journal.placeholder')} value={content} onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] rounded-xl resize-none border-border/50 mb-4" autoFocus />
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">{t('checkin.mood')}</p>
                    <div className="flex gap-2">
                      {(['great', 'good', 'okay', 'low', 'struggling'] as MoodLevel[]).map((mood) => (
                        <button key={mood} onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                          className={`text-2xl p-2 rounded-xl transition-all ${selectedMood === mood ? 'bg-sage-light scale-110' : 'hover:bg-secondary'}`}>
                          {MOOD_CONFIG[mood].emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="soft" onClick={() => { setIsWriting(false); setContent(''); setSelectedMood(null); }}>{t('common.cancel')}</Button>
                    <Button className="flex-1" onClick={handleSave} disabled={!content.trim()}>
                      <Check className="w-4 h-4 mr-2" />{t('journal.saveEntry')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {journalEntries.length === 0 ? (
                <Card variant="gradient" className="text-center py-12">
                  <CardContent>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sage-light flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{t('journal.empty')}</h3>
                    <p className="text-muted-foreground mb-4">{t('journal.empty.desc')}</p>
                    <Button variant="calm" onClick={() => setIsWriting(true)}>{t('journal.firstEntry')}</Button>
                  </CardContent>
                </Card>
              ) : (
                journalEntries.map((entry, index) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card variant="default">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {entry.mood && <span className="text-2xl">{MOOD_CONFIG[entry.mood].emoji}</span>}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Calendar className="w-3 h-3" />{formatDate(entry.date)}
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">
                              {entry.content.length > 200 ? entry.content.slice(0, 200) + '...' : entry.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
