import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { HomeScreen } from '@/components/home/HomeScreen';
import { CheckInScreen } from '@/components/checkin/CheckInScreen';
import { InterventionsScreen } from '@/components/interventions/InterventionsScreen';
import { JournalScreen } from '@/components/journal/JournalScreen';
import { HistoryScreen } from '@/components/history/HistoryScreen';
import { CrisisScreen } from '@/components/crisis/CrisisScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { MoodReportsScreen } from '@/components/reports/MoodReportsScreen';
import { MeditationPlayer } from '@/components/meditation/MeditationPlayer';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { supabase } from '@/integrations/supabase/client';

function AppContent() {
  const { currentView } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const screens: Record<string, React.ReactNode> = {
    onboarding: <OnboardingScreen />,
    home: <HomeScreen />,
    checkin: <CheckInScreen />,
    interventions: <InterventionsScreen />,
    journal: <JournalScreen />,
    history: <HistoryScreen />,
    crisis: <CrisisScreen />,
    settings: <SettingsScreen />,
    reports: <MoodReportsScreen />,
    meditation: <MeditationPlayer />,
  };

  return screens[currentView] || <HomeScreen />;
}

const Index = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <div className="min-h-screen bg-background">
          <AppContent />
        </div>
      </AppProvider>
    </LanguageProvider>
  );
};

export default Index;
