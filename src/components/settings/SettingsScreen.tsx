import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Bell, Shield, Phone, 
  HelpCircle, Heart, LogOut, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', description: 'Name and personal info' },
      { icon: Phone, label: 'Emergency Contacts', description: 'Manage trusted contacts' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Check-in reminders', hasToggle: true },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: Shield, label: 'Data & Privacy', description: 'How your data is used' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', description: 'FAQs and guides' },
      { icon: Heart, label: 'About MindfulMe', description: 'Version 1.0.0' },
    ],
  },
];

export function SettingsScreen() {
  const { setCurrentView, user, setUser } = useApp();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('onboarding');
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
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center">
                  <span className="text-2xl">
                    {user?.name?.charAt(0).toUpperCase() || '👤'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'Today'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {section.title}
            </h3>
            <Card variant="default">
              <CardContent className="p-0">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-4 p-4 ${
                        index < section.items.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.hasToggle ? (
                        <Switch 
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="soft"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Reset App
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This will clear all your data and start fresh
          </p>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          <p className="mb-1">MindfulMe v1.0.0</p>
          <p>Made with 💚 for your mental wellness</p>
        </motion.div>
      </div>
    </div>
  );
}
