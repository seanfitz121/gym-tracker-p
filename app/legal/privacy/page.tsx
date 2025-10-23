import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - SFWeb Gym Tracker',
  description: 'Privacy policy and data handling practices for SFWeb Gym Tracker',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <article className="prose prose-gray dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>Introduction</h2>
          <p>
            Welcome to SFWeb Gym Tracker ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our app.
          </p>

          <h2>Information We Collect</h2>
          <h3>Account Information</h3>
          <ul>
            <li>Email address</li>
            <li>Display name (optional)</li>
            <li>Account credentials</li>
          </ul>

          <h3>Workout Data</h3>
          <ul>
            <li>Exercises performed</li>
            <li>Sets, reps, and weights</li>
            <li>Workout sessions and timestamps</li>
            <li>Personal records and progress data</li>
            <li>Templates and workout notes</li>
          </ul>

          <h3>Gamification Data</h3>
          <ul>
            <li>XP and level progression</li>
            <li>Streaks and badges</li>
            <li>Weekly goals</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the app's core functionality</li>
            <li>Track your workout progress and personal records</li>
            <li>Calculate statistics and generate charts</li>
            <li>Provide gamification features (streaks, XP, badges)</li>
            <li>Send important account-related notifications</li>
            <li>Improve and optimize the app</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <p>
            Your data is stored securely using Supabase's infrastructure with industry-standard encryption. We implement:
          </p>
          <ul>
            <li>Row-level security policies</li>
            <li>Encrypted connections (HTTPS/SSL)</li>
            <li>Regular security audits</li>
            <li>Secure authentication mechanisms</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. Your workout data remains private unless you explicitly choose to share progress cards.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your workout data</li>
            <li>Opt-out of non-essential communications</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. If you delete your account, all associated data will be permanently deleted within 30 days.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>Supabase (authentication and database)</li>
            <li>Vercel (hosting and analytics)</li>
            <li>Resend (email delivery, optional)</li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any significant changes via email or through the app.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at:
          </p>
          <p>
            Email: privacy@sfwebgym.com
          </p>
        </article>
      </div>
    </div>
  )
}


