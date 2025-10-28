'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Rocket, Sparkles, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface OnboardingTourProps {
  userId: string
  onboardingCompleted: boolean
}

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to PlateProgress! 🎉',
    description: 'Your all-in-one workout tracking companion. Let\'s explore the key features!',
    highlight: null,
  },
  {
    id: 'log-workout',
    title: 'Log Your Workouts',
    description: 'Click "Log Workout" to start tracking your training. Record sets, reps, and weights for any exercise.',
    highlight: '[data-tour="log-workout"]',
  },
  {
    id: 'level-up',
    title: 'Level Up System',
    description: 'Earn XP with every workout and level up! Unlock new ranks as you progress on your fitness journey.',
    highlight: '[data-tour="level-progress"]',
  },
  {
    id: 'stats',
    title: 'Track Your Progress',
    description: 'See your total volume lifted and watch your numbers grow over time. Consistency is key!',
    highlight: '[data-tour="volume-stats"]',
  },
  {
    id: 'history',
    title: 'Review Past Workouts',
    description: 'Access your complete workout history. Review past sessions and track your journey.',
    highlight: '[data-tour="nav-history"]',
  },
  {
    id: 'progress',
    title: 'Visualize Growth',
    description: 'View charts and personal records (PRs) to see how you\'re improving on each exercise.',
    highlight: '[data-tour="nav-progress"]',
  },
  {
    id: 'social',
    title: 'Connect & Compete',
    description: 'Add friends, join gyms, and compete on leaderboards. Make fitness social and fun!',
    highlight: '[data-tour="nav-social"]',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 💪',
    description: 'Ready to start your fitness journey? Log your first workout and begin tracking your progress!',
    highlight: null,
  },
]

export function OnboardingTour({ userId, onboardingCompleted }: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!onboardingCompleted) {
      setTimeout(() => {
        setShowWelcome(true)
      }, 500)
    }
  }, [onboardingCompleted])

  useEffect(() => {
    if (isActive && currentStep > 0 && tourSteps[currentStep].highlight) {
      const element = document.querySelector(tourSteps[currentStep].highlight!)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentStep, isActive])

  const handleStartTour = () => {
    setShowWelcome(false)
    setIsActive(true)
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = async () => {
    setShowWelcome(false)
    setIsActive(false)
    await markOnboardingComplete()
  }

  const handleComplete = async () => {
    setIsActive(false)
    await markOnboardingComplete()
  }

  const markOnboardingComplete = async () => {
    try {
      const supabase = createClient()
      await supabase
        .from('profile')
        .update({ onboarding_completed: true })
        .eq('id', userId)
    } catch (error) {
      console.error('Error marking onboarding complete:', error)
    }
  }

  const currentStepData = tourSteps[currentStep]

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Rocket className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Welcome to PlateProgress! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Ready to transform your fitness journey? Let's show you around and get you started!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleStartTour} 
              size="lg" 
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Show Me Around!
            </Button>
            <Button 
              onClick={handleSkip} 
              variant="ghost" 
              size="sm"
              className="w-full"
            >
              I'll explore on my own
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tour Overlay */}
      {isActive && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
            onClick={handleSkip}
          />

          {/* Highlight Effect */}
          {currentStepData.highlight && (
            <style jsx global>{`
              ${currentStepData.highlight} {
                position: relative;
                z-index: 101 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                border-radius: 8px;
                animation: pulse-highlight 2s infinite;
              }
              
              @keyframes pulse-highlight {
                0%, 100% {
                  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                }
                50% {
                  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                }
              }
            `}</style>
          )}

          {/* Tour Card */}
          <Card className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[102] shadow-2xl">
            <CardContent className="p-6 space-y-4">
              {/* Progress */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{currentStep + 1} of {tourSteps.length}</span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{currentStepData.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSkip}
                >
                  Skip Tour
                </Button>
                <Button 
                  onClick={handleNext}
                  size="sm"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}

