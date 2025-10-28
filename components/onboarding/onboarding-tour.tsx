'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Rocket, Sparkles, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OnboardingTourProps {
  userId: string
  onboardingCompleted: boolean
}

export function OnboardingTour({ userId, onboardingCompleted }: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)
  const router = useRouter()

  // Check if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if user needs onboarding
  useEffect(() => {
    if (!onboardingCompleted) {
      // Small delay to let the page load
      setTimeout(() => {
        setShowWelcome(true)
      }, 500)
    }
  }, [onboardingCompleted])

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

  const handleStartTour = () => {
    setShowWelcome(false)
    
    // Build the steps array
    const tourSteps = [
      {
        popover: {
          title: 'Welcome to PlateProgress! 🎉',
          description: 'This is your workout tracking dashboard. Let\'s take a quick tour of the key features!',
        }
      },
      {
        element: '[data-tour="log-workout"]',
        popover: {
          title: 'Log Your Workouts',
          description: 'Click here to start logging your first workout. Track sets, reps, and weights!',
          side: 'bottom' as const,
          align: 'center' as const,
        }
      },
      {
        element: '[data-tour="level-progress"]',
        popover: {
          title: 'Level Up System',
          description: 'Earn XP and level up as you work out. Track your progress and unlock new ranks!',
          side: 'bottom' as const,
          align: 'start' as const,
        }
      },
      {
        element: '[data-tour="volume-stats"]',
        popover: {
          title: 'Volume Statistics',
          description: 'See how much total weight you\'ve moved. Watch your progress grow over time!',
          side: 'top' as const,
          align: 'start' as const,
        }
      },
      {
        element: '[data-tour="tools"]',
        popover: {
          title: 'Helpful Tools',
          description: 'Access calculators and trackers like 1RM Calculator, Plate Calculator, Weight & Hydration tracking.',
          side: 'top' as const,
          align: 'start' as const,
        }
      },
      {
        element: '[data-tour="nav-history"]',
        popover: {
          title: 'Review Your History',
          description: 'Look back at all your past workouts and see your journey.',
          side: 'top' as const,
          align: 'center' as const,
        }
      },
      {
        element: '[data-tour="nav-progress"]',
        popover: {
          title: 'Track Progress',
          description: 'View charts and PRs to see how your lifts are improving over time.',
          side: 'top' as const,
          align: 'center' as const,
        }
      },
      {
        element: '[data-tour="nav-social"]',
        popover: {
          title: 'Connect & Compete',
          description: 'Add friends, join gyms, and compete on leaderboards. Make fitness social!',
          side: 'top' as const,
          align: 'center' as const,
        }
      },
    ]

    // Add final step with mobile-specific home screen reminder
    tourSteps.push({
      popover: {
        title: isMobile ? '📱 Add to Home Screen!' : 'You\'re All Set! 💪',
        description: isMobile 
          ? `<div style="line-height: 1.6;">
            <p style="margin-bottom: 12px;"><strong>Get the best experience!</strong></p>
            <ul style="margin-left: 16px; margin-bottom: 12px;">
              <li style="margin-bottom: 6px;">✨ <strong>Fullscreen app</strong> - No browser bars</li>
              <li style="margin-bottom: 6px;">⚡ <strong>Faster loading</strong> - Works offline</li>
              <li style="margin-bottom: 6px;">📊 <strong>Better performance</strong> - Smoother experience</li>
            </ul>
            <p style="margin-bottom: 12px;"><strong>How to install:</strong> Tap the share button in your browser and select "Add to Home Screen".</p>
            <p style="font-weight: 600; color: #3b82f6;">See detailed instructions in Tips & Guides!</p>
          </div>`
          : 'Ready to start your fitness journey? Click "Log Workout" to record your first session!',
      }
    })
    
    const driverObj = driver({
      showProgress: true,
      steps: tourSteps,
      onDestroyStarted: async () => {
        await markOnboardingComplete()
        if (driverRef.current) {
          driverRef.current.destroy()
        }
      },
      onDestroyed: async () => {
        await markOnboardingComplete()
      },
      popoverClass: 'driverjs-theme-custom',
      stagePadding: 10,
      stageRadius: 12,
      allowClose: true,
      overlayOpacity: 0.3,
      smoothScroll: true,
      disableActiveInteraction: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish',
    })

    driverRef.current = driverObj
    driverObj.drive()
  }

  const handleSkip = async () => {
    setShowWelcome(false)
    await markOnboardingComplete()
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

      {/* Custom Driver.js Styles */}
      <style jsx global>{`
        .driver-popover.driverjs-theme-custom {
          background-color: white;
          color: #1f2937;
          max-width: 350px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .dark .driver-popover.driverjs-theme-custom {
          background-color: #1f2937;
          color: #f9fafb;
        }

        .driverjs-theme-custom .driver-popover-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .driverjs-theme-custom .driver-popover-description {
          font-size: 14px;
          line-height: 1.5;
        }

        .driverjs-theme-custom .driver-popover-progress-text {
          font-size: 13px;
          color: #6b7280;
        }

        .dark .driverjs-theme-custom .driver-popover-progress-text {
          color: #9ca3af;
        }

        .driverjs-theme-custom .driver-popover-footer button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .driverjs-theme-custom .driver-popover-next-btn {
          background-color: #3b82f6;
          color: white;
        }

        .driverjs-theme-custom .driver-popover-next-btn:hover {
          background-color: #2563eb;
        }

        .driverjs-theme-custom .driver-popover-prev-btn {
          background-color: #f3f4f6;
          color: #4b5563;
        }

        .dark .driverjs-theme-custom .driver-popover-prev-btn {
          background-color: #374151;
          color: #d1d5db;
        }

        .driverjs-theme-custom .driver-popover-prev-btn:hover {
          background-color: #e5e7eb;
        }

        .dark .driverjs-theme-custom .driver-popover-prev-btn:hover {
          background-color: #4b5563;
        }

        .driverjs-theme-custom .driver-popover-close-btn {
          color: #6b7280;
        }

        .driverjs-theme-custom .driver-popover-close-btn:hover {
          color: #374151;
        }

        .dark .driverjs-theme-custom .driver-popover-close-btn:hover {
          color: #f3f4f6;
        }

        /* Lighter overlay - was too dark */
        .driver-overlay {
          background-color: rgba(0, 0, 0, 0.3) !important;
        }

        /* Highlighted element with prominent glowing border */
        .driver-active-element {
          border-radius: 12px !important;
          /* Light mode: bright blue glowing border */
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 
                      0 0 0 8px rgba(59, 130, 246, 0.4),
                      0 0 20px 10px rgba(59, 130, 246, 0.3) !important;
          animation: pulse-highlight 2s ease-in-out infinite !important;
        }

        /* Dark mode: even brighter cyan/blue border for better visibility */
        .dark .driver-active-element {
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 1), 
                      0 0 0 8px rgba(96, 165, 250, 0.6),
                      0 0 25px 12px rgba(96, 165, 250, 0.5) !important;
        }

        /* Pulsing animation for highlighted elements */
        @keyframes pulse-highlight {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8), 
                        0 0 0 8px rgba(59, 130, 246, 0.4),
                        0 0 20px 10px rgba(59, 130, 246, 0.3);
          }
          50% {
            transform: scale(1.005);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 1), 
                        0 0 0 8px rgba(59, 130, 246, 0.6),
                        0 0 30px 15px rgba(59, 130, 246, 0.5);
          }
        }

        /* Dark mode pulse animation */
        .dark .driver-active-element {
          animation: pulse-highlight-dark 2s ease-in-out infinite !important;
        }

        @keyframes pulse-highlight-dark {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 1), 
                        0 0 0 8px rgba(96, 165, 250, 0.6),
                        0 0 25px 12px rgba(96, 165, 250, 0.5);
          }
          50% {
            transform: scale(1.005);
            box-shadow: 0 0 0 5px rgba(96, 165, 250, 1), 
                        0 0 0 10px rgba(96, 165, 250, 0.8),
                        0 0 35px 18px rgba(96, 165, 250, 0.7);
          }
        }
      `}</style>
    </>
  )
}

