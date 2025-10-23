import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  Download, 
  Dumbbell, 
  TrendingUp, 
  Target,
  Clock,
  Trophy,
  Zap,
  Settings,
  BarChart3,
  Calendar,
  Share2
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tips & Guides - Plate Progress',
  description: 'Learn how to get the most out of Plate Progress',
}

export default function TipsPage() {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tips & Guides</h1>
        <p className="text-muted-foreground">
          Learn how to get the most out of Plate Progress
        </p>
      </div>

      <Separator />

      {/* PWA Installation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <CardTitle>Install as an App</CardTitle>
          </div>
          <CardDescription>
            Add Plate Progress to your home screen for a native app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">📱</span> iPhone (iOS)
            </h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li><strong>Sign in</strong> to your account first, then open <strong>plateprogress.com</strong> in Safari</li>
              <li>Tap the <strong>Share</strong> button <Share2 className="inline h-4 w-4" /> (bottom center)</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top right</li>
              <li>The app icon will appear on your home screen! 🎉</li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mt-3">
              <p className="text-sm">
                <strong>✨ Pro tip:</strong> Once installed, the app opens in fullscreen mode just like a native app!
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">🤖</span> Android
            </h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li><strong>Sign in</strong> to your account first, then open <strong>plateprogress.com</strong> in Chrome</li>
              <li>Tap the <strong>menu</strong> (⋮) in the top right</li>
              <li>Select <strong>"Add to Home screen"</strong></li>
              <li>Tap <strong>"Add"</strong> or <strong>"Install"</strong></li>
              <li>The app will install and appear on your home screen! 🎉</li>
            </ol>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mt-3">
              <p className="text-sm">
                <strong>✨ Pro tip:</strong> Once installed, the app opens in fullscreen mode just like a native app!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logging Workouts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-600" />
            <CardTitle>Logging Workouts</CardTitle>
          </div>
          <CardDescription>
            Quick guide to tracking your training sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <h4 className="font-semibold">Start Your Workout</h4>
                <p className="text-sm text-muted-foreground">
                  Tap <strong>"Ready to Train"</strong> on the Log page to begin tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <h4 className="font-semibold">Add Exercises</h4>
                <p className="text-sm text-muted-foreground">
                  Search from 100+ exercises or create your own custom ones
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <h4 className="font-semibold">Log Your Sets</h4>
                <p className="text-sm text-muted-foreground">
                  Enter weight, reps, and optional RPE (Rate of Perceived Exertion)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div>
                <h4 className="font-semibold">Track Rest Time</h4>
                <p className="text-sm text-muted-foreground">
                  Rest timer starts automatically after each set
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">5</Badge>
              <div>
                <h4 className="font-semibold">Finish Workout</h4>
                <p className="text-sm text-muted-foreground">
                  Tap <strong>"End Workout"</strong> to save and earn XP!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" /> Quick Tips:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Mark warm-up sets to exclude from PRs</li>
              <li>• Tap the previous set to copy weight/reps</li>
              <li>• Swipe left on a set to delete it</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Viewing Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>Tracking Your Progress</CardTitle>
          </div>
          <CardDescription>
            Understand your stats and charts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold">Exercise Charts</h4>
                <p className="text-sm text-muted-foreground">
                  Tap any exercise on the Progress page to see detailed charts showing:
                  <strong> 1RM estimates, top sets, and volume trends</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-semibold">Personal Records</h4>
                <p className="text-sm text-muted-foreground">
                  PRs are automatically detected! Check the Progress page to see your best lifts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Coach Yourself Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Get automatic feedback on volume trends, muscle group balance, and PR streaks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
              <div>
                <h4 className="font-semibold">Workout History</h4>
                <p className="text-sm text-muted-foreground">
                  Review past sessions grouped by week with detailed stats
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <CardTitle>Gamification & Motivation</CardTitle>
          </div>
          <CardDescription>
            Level up and stay motivated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                ⚡ XP & Levels
              </h4>
              <p className="text-sm text-muted-foreground">
                Earn XP for completing workouts. The longer and more intense your session, the more XP you earn!
              </p>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                🔥 Streaks
              </h4>
              <p className="text-sm text-muted-foreground">
                Build your workout streak by training consistently. Don't break the chain!
              </p>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                🏆 Ranks
              </h4>
              <p className="text-sm text-muted-foreground">
                Progress through ranks as you accumulate total XP. Check your rank in the header!
              </p>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2">
                🎯 Weekly Goals
              </h4>
              <p className="text-sm text-muted-foreground">
                Set and track weekly workout goals to stay accountable
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
            <p className="text-sm">
              <strong>🛡️ Anti-Cheat Protection:</strong> The app prevents gaming the system with workout cooldowns and daily XP caps to keep things fair!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings & Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <CardTitle>Settings & Customization</CardTitle>
          </div>
          <CardDescription>
            Personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div>
              <h4 className="font-semibold">Profile</h4>
              <p className="text-sm text-muted-foreground">
                Upload a profile picture and set a nickname in Settings
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Theme</h4>
              <p className="text-sm text-muted-foreground">
                Switch between Light, Dark, or System theme
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Units</h4>
              <p className="text-sm text-muted-foreground">
                Choose between Kilograms (kg) or Pounds (lb)
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Rest Timer</h4>
              <p className="text-sm text-muted-foreground">
                Set your default rest time between sets (30s - 3min)
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Chart Smoothing</h4>
              <p className="text-sm text-muted-foreground">
                Adjust how smooth your progress charts appear
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <CardTitle>Pro Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span><strong>Use Templates:</strong> Save your favorite workouts as templates for quick access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span><strong>Track RPE:</strong> Rate your sets 1-10 to monitor fatigue and recovery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span><strong>Review Weekly Stats:</strong> Check the History page for weekly volume and training frequency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span><strong>Check Insights:</strong> The Progress page shows if you're neglecting any muscle groups</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">•</span>
              <span><strong>Stay Consistent:</strong> Build your streak for maximum XP and momentum!</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            We're here to support you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you have questions or run into any issues, feel free to reach out:
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href="mailto:support@plateprogress.com" 
              className="text-sm text-blue-600 hover:underline"
            >
              📧 support@plateprogress.com
            </a>
            <a 
              href="https://github.com/seanfitz121" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              💬 Report an issue on GitHub
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>Happy training! 💪</p>
      </div>
    </div>
  )
}

