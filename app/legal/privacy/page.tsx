import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - Plate Progress',
  description: 'Privacy policy and data handling practices for Plate Progress',
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
            Welcome to Plate Progress ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our app.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>1. Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li><strong>Email address</strong> - For account creation, authentication, and communication</li>
            <li><strong>Username</strong> - Your unique identifier within the application</li>
            <li><strong>Display name</strong> - Optional public-facing name</li>
            <li><strong>Password</strong> - Stored encrypted via Supabase authentication</li>
            <li><strong>Avatar image</strong> - Optional profile picture (if uploaded)</li>
          </ul>

          <h3>2. Workout and Fitness Data</h3>
          <p>To provide our core service, we collect and store:</p>
          <ul>
            <li><strong>Exercise logs</strong> - Names of exercises, sets, reps, weight, and rest periods</li>
            <li><strong>Workout sessions</strong> - Start/end times, duration, notes, and titles</li>
            <li><strong>Personal records</strong> - Your best performances for tracked exercises</li>
            <li><strong>Workout templates</strong> - Saved routines you create</li>
            <li><strong>Body metrics</strong> - Optional weight, height, and body composition data (Premium)</li>
            <li><strong>Progress photos</strong> - Optional transformation images with timestamps (Premium)</li>
            <li><strong>Hydration logs</strong> - Daily water intake tracking (Premium)</li>
          </ul>

          <h3>3. Gamification and Progress Data</h3>
          <ul>
            <li><strong>XP and levels</strong> - Experience points and leveling progress</li>
            <li><strong>Streaks</strong> - Consecutive workout days and longest streaks</li>
            <li><strong>Badges and achievements</strong> - Unlocked accomplishments</li>
            <li><strong>Weekly goals</strong> - Your fitness targets and progress</li>
            <li><strong>Rank and prestige</strong> - Competitive ranking data (Premium)</li>
          </ul>

          <h3>4. Social and Community Data</h3>
          <ul>
            <li><strong>Friend connections</strong> - Your friend list and pending requests</li>
            <li><strong>Gym memberships</strong> - Community gym affiliations (optional)</li>
            <li><strong>Leaderboard participation</strong> - Opt-in competitive rankings</li>
            <li><strong>Shared content</strong> - Any progress cards or data you choose to share</li>
          </ul>

          <h3>5. Payment Information (Premium Subscribers)</h3>
          <ul>
            <li><strong>Subscription data</strong> - Managed entirely by Stripe (not stored on our servers)</li>
            <li><strong>Billing history</strong> - Transaction records stored by Stripe</li>
            <li><strong>Payment methods</strong> - Securely stored by Stripe, not accessible to us</li>
          </ul>

          <h3>6. Technical and Analytics Data</h3>
          <ul>
            <li><strong>Device information</strong> - Browser type, device type, screen size</li>
            <li><strong>Usage analytics</strong> - Page views, feature usage, performance metrics (via Vercel Analytics)</li>
            <li><strong>Error logs</strong> - Technical errors for debugging and improvement</li>
            <li><strong>IP address</strong> - For security and fraud prevention</li>
            <li><strong>Cookies</strong> - Essential cookies for authentication and preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <h3>Legal Basis for Processing (GDPR)</h3>
          <p>We process your data based on the following legal bases:</p>
          <ul>
            <li><strong>Contractual necessity</strong> - To provide the service you've signed up for</li>
            <li><strong>Legitimate interests</strong> - To improve the app and prevent fraud</li>
            <li><strong>Consent</strong> - For optional features like analytics and marketing emails</li>
            <li><strong>Compliance</strong> - To meet legal obligations</li>
          </ul>

          <h3>Specific Uses</h3>
          <ul>
            <li><strong>Service delivery</strong> - Provide core workout tracking functionality</li>
            <li><strong>Progress tracking</strong> - Calculate PRs, generate charts, track achievements</li>
            <li><strong>Gamification</strong> - Compute XP, levels, streaks, and badges</li>
            <li><strong>Social features</strong> - Enable friend connections and leaderboards (opt-in)</li>
            <li><strong>Communication</strong> - Send essential emails (password resets, security alerts)</li>
            <li><strong>Premium services</strong> - Manage subscriptions via Stripe</li>
            <li><strong>Analytics</strong> - Understand usage patterns to improve the app</li>
            <li><strong>Security</strong> - Detect and prevent fraud, unauthorized access</li>
            <li><strong>Support</strong> - Respond to help requests and troubleshoot issues</li>
          </ul>

          <h2>Data Storage and Security</h2>
          
          <h3>Infrastructure</h3>
          <p>Your data is stored securely using:</p>
          <ul>
            <li><strong>Supabase</strong> - PostgreSQL database hosted on AWS (EU/US regions)</li>
            <li><strong>Vercel</strong> - Application hosting with global CDN</li>
            <li><strong>Supabase Storage</strong> - Encrypted file storage for images</li>
          </ul>

          <h3>Security Measures</h3>
          <ul>
            <li><strong>Encryption in transit</strong> - All connections use TLS/SSL (HTTPS)</li>
            <li><strong>Encryption at rest</strong> - Database and file storage encrypted</li>
            <li><strong>Row-Level Security</strong> - Database policies ensure users can only access their own data</li>
            <li><strong>Authentication</strong> - Secure password hashing with bcrypt</li>
            <li><strong>API security</strong> - Rate limiting and CORS protection</li>
            <li><strong>Regular updates</strong> - Dependencies and security patches applied promptly</li>
            <li><strong>Access controls</strong> - Minimal team access with audit logging</li>
          </ul>

          <h2>Data Sharing and Third Parties</h2>
          
          <h3>We DO NOT:</h3>
          <ul>
            <li>❌ Sell your personal data to anyone</li>
            <li>❌ Share your workout data with third parties</li>
            <li>❌ Use your data for advertising purposes</li>
            <li>❌ Track you across other websites</li>
          </ul>

          <h3>Third-Party Service Providers:</h3>
          <p>We share limited data with these services to operate the app:</p>
          <ul>
            <li><strong>Supabase</strong> - Database and authentication (see their <a href="https://supabase.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">privacy policy</a>)</li>
            <li><strong>Vercel</strong> - Hosting and analytics (see their <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">privacy policy</a>)</li>
            <li><strong>Stripe</strong> - Payment processing for Premium subscriptions (see their <a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">privacy policy</a>)</li>
            <li><strong>Resend</strong> - Transactional email delivery (see their <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">privacy policy</a>)</li>
          </ul>

          <h3>User-Controlled Sharing:</h3>
          <p>You may choose to share:</p>
          <ul>
            <li>Progress cards publicly (your explicit action)</li>
            <li>Profile visibility to friends (opt-in)</li>
            <li>Leaderboard participation (opt-in)</li>
          </ul>

          <h2>Your Rights and Control</h2>
          <p>Under GDPR and other privacy laws, you have the following rights:</p>
          
          <h3>1. Right to Access</h3>
          <p>Request a copy of all personal data we hold about you.</p>
          
          <h3>2. Right to Rectification</h3>
          <p>Correct inaccurate or incomplete data through your account settings.</p>
          
          <h3>3. Right to Erasure ("Right to be Forgotten")</h3>
          <p>Request permanent deletion of your account and all associated data.</p>
          
          <h3>4. Right to Data Portability</h3>
          <p>Export your workout data in machine-readable format (JSON/CSV).</p>
          
          <h3>5. Right to Restrict Processing</h3>
          <p>Limit how we process your data while maintaining your account.</p>
          
          <h3>6. Right to Object</h3>
          <p>Object to processing based on legitimate interests.</p>
          
          <h3>7. Right to Withdraw Consent</h3>
          <p>Withdraw consent for optional processing at any time.</p>

          <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
            <strong>To exercise your rights:</strong> Visit the Privacy &amp; Data section in your account settings or contact us at{' '}
            <a href="mailto:privacy@plateprogress.com" className="text-blue-600 hover:underline">privacy@plateprogress.com</a>
          </p>

          <h2>Data Retention</h2>
          <ul>
            <li><strong>Active accounts</strong> - Data retained as long as your account exists</li>
            <li><strong>Deleted accounts</strong> - All data permanently deleted within 30 days</li>
            <li><strong>Backups</strong> - Backup copies deleted within 90 days</li>
            <li><strong>Legal holds</strong> - Data may be retained longer if required by law</li>
            <li><strong>Analytics</strong> - Aggregated, anonymized data may be retained indefinitely</li>
          </ul>

          <h2>International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries outside your own. We ensure adequate protection through:
          </p>
          <ul>
            <li>EU-US Data Privacy Framework compliance (for US-based services)</li>
            <li>Standard Contractual Clauses with service providers</li>
            <li>Adequate safeguards as recognized by GDPR</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>We use minimal cookies essential for the app to function:</p>
          <ul>
            <li><strong>Authentication cookies</strong> - Keep you logged in securely (essential)</li>
            <li><strong>Preference cookies</strong> - Remember your settings like theme (essential)</li>
            <li><strong>Analytics cookies</strong> - Vercel Analytics for basic usage stats (optional)</li>
          </ul>
          <p>We do NOT use advertising cookies or third-party tracking pixels.</p>

          <h2>Children's Privacy</h2>
          <p>
            Plate Progress is not intended for users under 13 years of age. We do not knowingly collect personal data from children.
            If you believe a child has provided us with personal data, please contact us immediately at privacy@plateprogress.com.
          </p>

          <h2>California Privacy Rights (CCPA)</h2>
          <p>If you are a California resident, you have additional rights:</p>
          <ul>
            <li>Right to know what personal data is collected</li>
            <li>Right to delete personal data</li>
            <li>Right to opt-out of sale (we don't sell data)</li>
            <li>Right to non-discrimination for exercising rights</li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. 
            When we make significant changes, we will:
          </p>
          <ul>
            <li>Update the "Last Updated" date at the top</li>
            <li>Notify you via email (if you've opted in)</li>
            <li>Display a notice in the app</li>
            <li>Request new consent if required by law</li>
          </ul>
          <p>Continued use of the app after changes constitutes acceptance of the updated policy.</p>

          <h2>Contact Us</h2>
          <p>
            For any privacy-related questions, concerns, or to exercise your data rights:
          </p>
          <ul className="list-none">
            <li><strong>Privacy Email:</strong> <a href="mailto:privacy@plateprogress.com" className="text-blue-600 hover:underline">privacy@plateprogress.com</a></li>
            <li><strong>General Support:</strong> <a href="mailto:support@plateprogress.com" className="text-blue-600 hover:underline">support@plateprogress.com</a></li>
            <li><strong>Data Protection Officer:</strong> privacy@plateprogress.com</li>
          </ul>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            This privacy policy was last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            We are committed to transparency and protecting your privacy.
          </p>
        </article>
      </div>
    </div>
  )
}


