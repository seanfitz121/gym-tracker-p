'use client'

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Rocket, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OnboardingTourProps {
  userId: string
  onboardingCompleted: boolean
}

export function OnboardingTour({ userId, onboardingCompleted }: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [runTour, setRunTour] = useState(false)

  // Check if user needs onboarding
  useEffect(() => {
    if (!onboardingCompleted) {
      // Small delay to let the page load
      setTimeout(() => {
        setShowWelcome(true)
      }, 500)
    }
  }, [onboardingCompleted])

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3 p-2">
          <h3 className="text-xl font-bold">Welcome to PlateProgress! 🎉</h3>
          <p className="text-base">This is your workout tracking dashboard. Let's take a quick tour of the key features!</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="log-workout"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Log Your Workouts</h4>
          <p className="text-sm">Click here to start logging your first workout. Track sets, reps, and weights!</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="level-progress"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Level Up System</h4>
          <p className="text-sm">Earn XP and level up as you work out. Track your progress and unlock new ranks!</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="volume-stats"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Volume Statistics</h4>
          <p className="text-sm">See how much total weight you've moved. Watch your progress grow over time!</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="tools"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Helpful Tools</h4>
          <p className="text-sm">Access calculators and trackers like One Rep Max, Plate Calculator, Weight & Hydration tracking.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="nav-history"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Review Your History</h4>
          <p className="text-sm">Look back at all your past workouts and see your journey.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="nav-progress"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Track Progress</h4>
          <p className="text-sm">View charts and PRs to see how your lifts are improving over time.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="nav-social"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Connect & Compete</h4>
          <p className="text-sm">Add friends, join gyms, and compete on leaderboards. Make fitness social!</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3 p-2">
          <h3 className="text-xl font-bold">You're All Set! 💪</h3>
          <p className="text-base">Ready to start your fitness journey? Click "Log Workout" to record your first session!</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ]

  const handleStartTour = () => {
    setShowWelcome(false)
    setRunTour(true)
  }

  const handleSkip = async () => {
    setShowWelcome(false)
    await markOnboardingComplete()
  }

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRunTour(false)
      await markOnboardingComplete()
    }

    // Handle skip button
    if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
      setRunTour(false)
      await markOnboardingComplete()
    }
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
              Ready to transform your fitness journey? Let's show you around and get you started with the essential features!
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

      {/* Tour */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        scrollToFirstStep
        scrollOffset={200}
        disableScrolling={false}
        spotlightClicks={false}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            zIndex: 10000,
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
            beaconSize: 36,
          },
          tooltip: {
            fontSize: 15,
            borderRadius: 12,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 8,
            fontWeight: 600,
          },
          buttonBack: {
            marginRight: 12,
            fontSize: 14,
            color: '#6b7280',
            padding: '10px 16px',
          },
          buttonSkip: {
            fontSize: 14,
            color: '#6b7280',
            padding: '10px 16px',
          },
          spotlight: {
            borderRadius: 8,
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </>
  )
}

