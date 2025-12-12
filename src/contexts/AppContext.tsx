import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MoodEntry, UserProfile, CheckIn, JournalEntry, MoodLevel, EmergencyContact } from '@/types/mental-health';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  moodHistory: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  checkIns: CheckIn[];
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  currentView: 'onboarding' | 'home' | 'checkin' | 'interventions' | 'journal' | 'history' | 'settings' | 'crisis' | 'reports';
  setCurrentView: (view: AppContextType['currentView']) => void;
  completeOnboarding: (name: string, emergencyContacts: EmergencyContact[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<AppContextType['currentView']>('onboarding');

  const addMoodEntry = (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setMoodHistory(prev => [newEntry, ...prev]);
  };

  const addCheckIn = (checkIn: Omit<CheckIn, 'id'>) => {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: crypto.randomUUID(),
    };
    setCheckIns(prev => [newCheckIn, ...prev]);
    
    // Also add to mood history
    addMoodEntry({
      date: checkIn.date,
      mood: checkIn.mood,
      note: checkIn.notes,
      stressLevel: checkIn.stressLevel,
    });
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const completeOnboarding = (name: string, emergencyContacts: EmergencyContact[]) => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name,
      onboardingComplete: true,
      emergencyContacts,
      preferences: {
        notificationsEnabled: true,
        checkInReminders: true,
        reminderTime: '09:00',
        preferredInterventions: [],
      },
      createdAt: new Date(),
    };
    setUser(newUser);
    setCurrentView('home');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        moodHistory,
        addMoodEntry,
        checkIns,
        addCheckIn,
        journalEntries,
        addJournalEntry,
        currentView,
        setCurrentView,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
