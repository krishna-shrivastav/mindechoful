import React from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { HomeScreen } from '@/components/home/HomeScreen';
import { CheckInScreen } from '@/components/checkin/CheckInScreen';
import { InterventionsScreen } from '@/components/interventions/InterventionsScreen';
import { JournalScreen } from '@/components/journal/JournalScreen';
import { HistoryScreen } from '@/components/history/HistoryScreen';
import { CrisisScreen } from '@/components/crisis/CrisisScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';

function AppContent() {
  const { currentView } = useApp();

  const screens = {
    onboarding: <OnboardingScreen />,
    home: <HomeScreen />,
    checkin: <CheckInScreen />,
    interventions: <InterventionsScreen />,
    journal: <JournalScreen />,
    history: <HistoryScreen />,
    crisis: <CrisisScreen />,
    settings: <SettingsScreen />,
  };

  return screens[currentView] || <HomeScreen />;
}

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default Index;
