import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Phone, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { EmergencyContact } from '@/types/mental-health';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to MindfulMe',
    description: 'Your personal companion for mental wellness and stress management.',
    icon: Heart,
  },
  {
    id: 'name',
    title: "What's Your Name?",
    description: "Let's personalize your experience.",
    icon: Sparkles,
  },
  {
    id: 'emergency',
    title: 'Emergency Contacts',
    description: 'Add trusted contacts for crisis support. This is optional but recommended.',
    icon: Phone,
  },
];

export function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: '', phone: '', relationship: '' },
  ]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding(name, emergencyContacts.filter(c => c.name && c.phone));
    }
  };

  const canProceed = () => {
    if (steps[currentStep].id === 'name') {
      return name.trim().length > 0;
    }
    return true;
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addContact = () => {
    setEmergencyContacts(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', phone: '', relationship: '' },
    ]);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen gradient-calm flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Progress indicator */}
          <div className="flex gap-2 mb-8 justify-center">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-primary w-8' : 'bg-border w-4'
                }`}
              />
            ))}
          </div>

          <Card variant="glass" className="overflow-hidden">
            <CardContent className="p-8">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-sage-light flex items-center justify-center shadow-soft">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              {/* Title & Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-2xl font-bold mb-3 text-foreground">{step.title}</h1>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>

              {/* Step-specific content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {step.id === 'name' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">Your name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="mt-2 h-12 rounded-xl border-border/50 bg-background/50"
                      />
                    </div>
                  </div>
                )}

                {step.id === 'emergency' && (
                  <div className="space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={contact.id} className="space-y-3 p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Users className="w-4 h-4" />
                          Contact {index + 1}
                        </div>
                        <Input
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          className="h-10 rounded-lg"
                        />
                        <Input
                          placeholder="Phone number"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          className="h-10 rounded-lg"
                        />
                        <Input
                          placeholder="Relationship (e.g., Friend, Family)"
                          value={contact.relationship}
                          onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                          className="h-10 rounded-lg"
                        />
                      </div>
                    ))}
                    {emergencyContacts.length < 3 && (
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={addContact}
                        className="w-full"
                      >
                        + Add Another Contact
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      You can skip this and add contacts later in settings
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="w-full"
                  size="lg"
                >
                  {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Skip option */}
          {step.id === 'emergency' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4"
            >
              <Button
                variant="ghost"
                onClick={() => completeOnboarding(name, [])}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
