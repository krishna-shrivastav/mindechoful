import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, Heart, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';

const crisisResources = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free 24/7 support for people in distress',
    phone: '988',
    type: 'primary',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    phone: '741741',
    type: 'text',
  },
  {
    name: 'National Alliance on Mental Illness',
    description: 'NAMI Helpline - Mon-Fri, 10am-10pm ET',
    phone: '1-800-950-NAMI',
    type: 'support',
  },
];

const copingStrategies = [
  { emoji: '🧊', title: 'Hold Ice Cubes', description: 'Physical sensation to ground yourself' },
  { emoji: '💧', title: 'Splash Cold Water', description: 'On your face to reset your nervous system' },
  { emoji: '🌬️', title: 'Breathe Slowly', description: '4 counts in, 4 counts out' },
  { emoji: '👁️', title: '5-4-3-2-1 Technique', description: 'Name things you can sense around you' },
];

export function CrisisScreen() {
  const { setCurrentView, user } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-destructive/10 p-6 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Crisis Support</h1>
            <p className="text-sm text-muted-foreground">You're not alone. Help is available.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    If you're in immediate danger
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please call 911 or go to your nearest emergency room immediately.
                  </p>
                  <Button
                    variant="crisis"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open('tel:911')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call 911
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contacts */}
        {user?.emergencyContacts && user.emergencyContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Your Emergency Contacts
            </h3>
            <div className="space-y-2">
              {user.emergencyContacts.map((contact) => (
                <Card key={contact.id} variant="calm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      </div>
                      <Button
                        variant="calm"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Crisis Hotlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Crisis Hotlines
          </h3>
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <Card key={index} variant="default">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <Button
                      variant={resource.type === 'primary' ? 'accent' : 'soft'}
                      size="sm"
                      onClick={() => window.open(`tel:${resource.phone}`)}
                    >
                      {resource.type === 'text' ? (
                        <>
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Text
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Immediate Coping Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Immediate Coping Strategies
          </h3>
          <Card variant="gradient">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {copingStrategies.map((strategy, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-card/50"
                  >
                    <span className="text-2xl mb-2 block">{strategy.emoji}</span>
                    <p className="font-medium text-foreground text-sm">{strategy.title}</p>
                    <p className="text-xs text-muted-foreground">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breathing Exercise Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="calm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🌬️</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Try a Breathing Exercise</p>
                  <p className="text-sm text-muted-foreground">
                    Calm your nervous system
                  </p>
                </div>
                <Button
                  variant="calm"
                  size="sm"
                  onClick={() => setCurrentView('interventions')}
                >
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground p-4"
        >
          <p>
            This app is not a substitute for professional mental health treatment.
            If you're experiencing a mental health crisis, please reach out to a
            qualified professional or use the crisis resources above.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
