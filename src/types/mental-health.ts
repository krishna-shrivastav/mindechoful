export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'struggling';

export interface MoodEntry {
  id: string;
  date: Date;
  mood: MoodLevel;
  note?: string;
  activities?: string[];
  stressLevel?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  onboardingComplete: boolean;
  emergencyContacts: EmergencyContact[];
  preferences: UserPreferences;
  createdAt: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  checkInReminders: boolean;
  reminderTime?: string;
  preferredInterventions: string[];
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'cbt' | 'journaling' | 'mindfulness' | 'grounding';
  duration: number; // in minutes
  icon: string;
  steps?: string[];
}

export interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  mood?: MoodLevel;
  tags?: string[];
}

export interface CheckIn {
  id: string;
  date: Date;
  mood: MoodLevel;
  stressLevel: number;
  sleepQuality?: number;
  anxietyLevel?: number;
  notes?: string;
  interventionsSuggested?: string[];
}

export const MOOD_CONFIG: Record<MoodLevel, { label: string; emoji: string; color: string; description: string }> = {
  great: {
    label: 'Great',
    emoji: '😊',
    color: 'mood-great',
    description: 'Feeling wonderful and energized'
  },
  good: {
    label: 'Good',
    emoji: '🙂',
    color: 'mood-good',
    description: 'Things are going well'
  },
  okay: {
    label: 'Okay',
    emoji: '😐',
    color: 'mood-okay',
    description: 'Neither good nor bad'
  },
  low: {
    label: 'Low',
    emoji: '😔',
    color: 'mood-low',
    description: 'Feeling down today'
  },
  struggling: {
    label: 'Struggling',
    emoji: '😢',
    color: 'mood-struggling',
    description: 'Having a hard time'
  }
};
