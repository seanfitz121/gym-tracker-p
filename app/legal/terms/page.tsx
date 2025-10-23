import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - SFWeb Gym Tracker',
  description: 'Terms of service and usage agreement for SFWeb Gym Tracker',
}

export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using SFWeb Gym Tracker ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
          </p>

          <h2>Description of Service</h2>
          <p>
            SFWeb Gym Tracker is a mobile web application that allows users to:
          </p>
          <ul>
            <li>Log workout sessions and exercises</li>
            <li>Track personal records and progress</li>
            <li>View statistics and charts</li>
            <li>Create workout templates</li>
            <li>Participate in gamification features</li>
          </ul>

          <h2>User Accounts</h2>
          <h3>Registration</h3>
          <p>
            You must create an account to use the App. You agree to provide accurate, current, and complete information during registration.
          </p>

          <h3>Account Security</h3>
          <p>
            You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to maintain security.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the App for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to the App or related systems</li>
            <li>Interfere with or disrupt the App's functionality</li>
            <li>Upload malicious code or content</li>
            <li>Scrape or collect data without permission</li>
            <li>Impersonate others or misrepresent your affiliation</li>
          </ul>

          <h2>User Content</h2>
          <p>
            You retain all rights to the workout data and content you create in the App. By using share features, you grant us a license to display your shared content publicly.
          </p>

          <h2>Health Disclaimer</h2>
          <p className="font-semibold text-orange-600 dark:text-orange-400">
            IMPORTANT: This App is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <ul>
            <li>Always consult with a healthcare provider before starting any exercise program</li>
            <li>We are not responsible for any injuries or health issues resulting from app usage</li>
            <li>Exercise at your own risk</li>
            <li>Listen to your body and stop if you experience pain or discomfort</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The App's design, features, functionality, and code are owned by SFWeb Gym Tracker and are protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>Service Availability</h2>
          <p>
            We strive to keep the App available 24/7, but we do not guarantee uninterrupted access. We may:
          </p>
          <ul>
            <li>Perform maintenance and updates</li>
            <li>Modify or discontinue features</li>
            <li>Suspend accounts that violate these terms</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, SFWeb Gym Tracker shall not be liable for:
          </p>
          <ul>
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Loss of data or interruption of service</li>
            <li>Injuries or health issues related to workouts</li>
            <li>Third-party actions or content</li>
          </ul>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these terms. You may delete your account at any time from the settings page.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the App after changes constitutes acceptance of the new terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, contact us at:
          </p>
          <p>
            Email: legal@sfwebgym.com
          </p>
        </article>
      </div>
    </div>
  )
}


