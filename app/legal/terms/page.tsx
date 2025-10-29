import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - Plate Progress',
  description: 'Terms of service and usage agreement for Plate Progress',
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

          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") 
            and Plate Progress ("Company," "we," "us," or "our"), a company based in Ireland, governing your access to 
            and use of the Plate Progress web application and related services (collectively, the "Service").
          </p>
          <p>
            By creating an account, accessing, or using the Service in any manner, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, 
            you must not access or use the Service.
          </p>
          <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <strong>EU Consumers:</strong> If you are a consumer based in the EU, you have certain statutory rights that 
            cannot be limited by contract. Nothing in these Terms affects those rights.
          </p>

          <h2>2. Eligibility</h2>
          <p>You must meet the following requirements to use the Service:</p>
          <ul>
            <li>Be at least 13 years of age (or the age of majority in your jurisdiction)</li>
            <li>Have the legal capacity to enter into a binding contract</li>
            <li>Not be prohibited from using the Service under applicable laws</li>
            <li>Provide accurate and complete registration information</li>
          </ul>
          <p>
            Users under 18 should obtain parental or guardian consent before using the Service. 
            We reserve the right to request proof of age or parental consent at any time.
          </p>

          <h2>3. Description of Service</h2>
          <p>
            Plate Progress is a comprehensive fitness tracking platform providing:
          </p>
          <ul>
            <li><strong>Workout logging</strong> - Record exercises, sets, reps, weights, and rest periods</li>
            <li><strong>Progress tracking</strong> - Monitor personal records, body metrics, and achievements</li>
            <li><strong>Analytics and visualization</strong> - Charts, statistics, and progress reports</li>
            <li><strong>Template management</strong> - Create and save reusable workout routines</li>
            <li><strong>Gamification</strong> - XP, levels, streaks, badges, and achievements</li>
            <li><strong>Social features</strong> - Friend connections, leaderboards, and gym communities (optional)</li>
            <li><strong>Premium features</strong> - Advanced tools including progress photos, hydration tracking, and enhanced analytics (subscription required)</li>
            <li><strong>Calculator tools</strong> - 1RM calculator, plate calculator, and other utilities</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any feature or aspect of the Service at any time, 
            with or without notice, for any reason including maintenance, updates, or business decisions.
          </p>

          <h2>4. User Accounts</h2>
          
          <h3>4.1 Account Registration</h3>
          <p>
            To access the Service, you must create an account by providing:
          </p>
          <ul>
            <li>A valid email address</li>
            <li>A unique username</li>
            <li>A secure password</li>
            <li>Optional profile information (display name, avatar)</li>
          </ul>
          <p>
            You represent and warrant that all information you provide is accurate, current, and complete. 
            You agree to update your information promptly if it changes.
          </p>

          <h3>4.2 Account Security</h3>
          <p>You are solely responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access or security breach</li>
          </ul>
          <p>
            We are not liable for any loss or damage arising from your failure to protect your account credentials. 
            You agree not to share your account with others or allow others to access your account.
          </p>

          <h3>4.3 Account Termination</h3>
          <p>We reserve the right to suspend or terminate your account at any time if:</p>
          <ul>
            <li>You violate these Terms or our Privacy Policy</li>
            <li>You engage in fraudulent, abusive, or illegal activity</li>
            <li>Your account has been inactive for an extended period</li>
            <li>We are required to do so by law or legal process</li>
          </ul>
          <p>
            You may delete your account at any time through the Settings page. Account deletion is permanent 
            and results in the loss of all associated data within 30 days.
          </p>

          <h2>5. Acceptable Use Policy</h2>
          
          <h3>5.1 Prohibited Conduct</h3>
          <p>You agree NOT to:</p>
          <ul>
            <li>❌ Use the Service for any unlawful purpose or in violation of any applicable laws</li>
            <li>❌ Attempt to gain unauthorized access to the Service, other user accounts, or related systems</li>
            <li>❌ Interfere with, disrupt, or create an undue burden on the Service or its networks</li>
            <li>❌ Upload, transmit, or distribute viruses, malware, or other malicious code</li>
            <li>❌ Scrape, crawl, or use automated means to collect data without permission</li>
            <li>❌ Impersonate any person or entity or misrepresent your affiliation</li>
            <li>❌ Harass, abuse, threaten, or intimidate other users</li>
            <li>❌ Post false, misleading, or fraudulent information</li>
            <li>❌ Reverse engineer, decompile, or attempt to extract the source code</li>
            <li>❌ Use the Service to compete with us or develop a competing product</li>
            <li>❌ Circumvent any security measures or access controls</li>
            <li>❌ Share or sell your account credentials</li>
          </ul>

          <h3>5.2 Consequences of Violations</h3>
          <p>
            Violations of this Acceptable Use Policy may result in:
          </p>
          <ul>
            <li>Immediate account suspension or termination</li>
            <li>Removal of prohibited content</li>
            <li>Legal action and cooperation with law enforcement</li>
            <li>Liability for damages caused by violations</li>
          </ul>

          <h2>6. User Content and Data</h2>
          
          <h3>6.1 Ownership</h3>
          <p>
            You retain all ownership rights to the content and data you create in the Service, including:
          </p>
          <ul>
            <li>Workout logs and exercise data</li>
            <li>Progress photos and body metrics</li>
            <li>Notes, comments, and custom templates</li>
            <li>Any other user-generated content</li>
          </ul>

          <h3>6.2 License to Use</h3>
          <p>
            By using the Service, you grant us a limited, non-exclusive, royalty-free license to:
          </p>
          <ul>
            <li>Store, process, and display your content to provide the Service</li>
            <li>Create backups and copies for redundancy and security</li>
            <li>Use aggregated, anonymized data for analytics and improvement</li>
          </ul>

          <h3>6.3 Public Sharing</h3>
          <p>
            When you use sharing features (e.g., progress cards, public profiles), you grant us an additional 
            license to display that content publicly. You may revoke this license by deleting the shared content.
          </p>

          <h3>6.4 Content Responsibility</h3>
          <p>
            You are solely responsible for your content. You represent that you have all necessary rights to 
            upload and share your content, and that it does not violate any laws or third-party rights.
          </p>

          <h2>7. Premium Subscription</h2>
          
          <h3>7.1 Free Trial</h3>
          <p>
            Premium subscriptions include a free trial period. You will not be charged during the trial. 
            After the trial ends, your subscription will automatically renew at the regular price unless you cancel.
          </p>

          <h3>7.2 Billing and Payments</h3>
          <ul>
            <li>Subscriptions are billed monthly or annually depending on your selected plan</li>
            <li>Payments are processed securely through Stripe</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>You authorize us to charge your payment method on file</li>
            <li>Prices may change with 30 days' notice</li>
          </ul>

          <h3>7.3 Cancellation and Refunds</h3>
          <p>
            You may cancel your subscription at any time through your account settings or the Stripe customer portal. 
            Cancellation takes effect at the end of the current billing period. You will retain Premium access until then. 
            We do not offer pro-rated refunds for partial months.
          </p>

          <h3>7.4 Premium Features</h3>
          <p>
            Premium subscriptions unlock additional features which may change over time. We reserve the right to modify, 
            add, or remove Premium features with reasonable notice to subscribers.
          </p>

          <h2>8. Health and Medical Disclaimer</h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800 my-4">
            <p className="font-semibold text-orange-600 dark:text-orange-400 text-lg mb-2">
              ⚠️ IMPORTANT MEDICAL DISCLAIMER
            </p>
            <p className="font-medium mb-2">
              The Service is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <ul className="space-y-1">
              <li>✓ Always consult a qualified healthcare provider before starting any exercise program</li>
              <li>✓ Seek medical advice if you have pre-existing health conditions</li>
              <li>✓ Stop immediately if you experience pain, dizziness, or discomfort</li>
              <li>✓ We are not liable for injuries, health issues, or medical problems</li>
              <li>✓ Exercise at your own risk and within your physical capabilities</li>
              <li>✓ The Service does not provide medical, nutritional, or therapeutic advice</li>
            </ul>
          </div>

          <h2>9. Intellectual Property Rights</h2>
          
          <h3>9.1 Our Intellectual Property</h3>
          <p>
            All aspects of the Service, including but not limited to design, graphics, code, features, functionality, 
            text, logos, and trademarks ("Plate Progress," "PlateProgress"), are owned by us and protected by copyright, 
            trademark, patent, and other intellectual property laws.
          </p>

          <h3>9.2 Limited License</h3>
          <p>
            We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service 
            for personal, non-commercial purposes in accordance with these Terms. This license does not include:
          </p>
          <ul>
            <li>Reselling or commercial use of the Service</li>
            <li>Derivative works or modifications</li>
            <li>Copying, reproducing, or downloading content (except your own data)</li>
            <li>Use of data mining, robots, or similar data gathering tools</li>
          </ul>

          <h2>10. Service Availability and Changes</h2>
          <p>
            We strive to maintain 24/7 availability but do not guarantee uninterrupted, error-free, or secure access. 
            We reserve the right to:
          </p>
          <ul>
            <li>Perform scheduled or emergency maintenance with reasonable notice</li>
            <li>Modify, update, or discontinue features or the entire Service</li>
            <li>Implement usage limits or restrictions</li>
            <li>Suspend or restrict access for security, legal, or operational reasons</li>
          </ul>
          <p>
            We are not liable for any downtime, service interruptions, or data loss resulting from maintenance, 
            technical issues, or service modifications.
          </p>

          <h2>11. Disclaimers and Limitations of Liability</h2>
          
          <h3>11.1 "AS IS" Disclaimer</h3>
          <p className="font-semibold">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3>11.2 No Liability for Injuries or Health Issues</h3>
          <p>
            We disclaim all liability for physical injuries, health problems, or medical conditions arising from or 
            related to your use of the Service or participation in exercises tracked through the Service.
          </p>

          <h3>11.3 Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PLATE PROGRESS SHALL NOT BE LIABLE FOR:
          </p>
          <ul>
            <li>Indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Personal injury or property damage</li>
            <li>Service interruptions or data loss</li>
            <li>Third-party content, actions, or services</li>
            <li>Unauthorized access to your account or data</li>
          </ul>
          <p>
            Our total liability to you for all claims shall not exceed the greater of $100 USD or the amount you paid 
            to us in the 12 months preceding the claim.
          </p>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Plate Progress, its affiliates, officers, directors, 
            employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
            arising from:
          </p>
          <ul>
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your content or data</li>
          </ul>

          <h2>13. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. When we make material changes, we will:
          </p>
          <ul>
            <li>Update the "Last Updated" date</li>
            <li>Provide notice via email or in-app notification</li>
            <li>Give you 30 days to review before changes take effect</li>
          </ul>
          <p>
            Continued use of the Service after changes constitutes acceptance. If you do not agree to modified Terms, 
            you must stop using the Service and may delete your account.
          </p>

          <h2>14. Dispute Resolution and Arbitration</h2>
          
          <h3>14.1 Informal Resolution</h3>
          <p>
            Before filing any claim, you agree to contact us at legal@plateprogress.com to attempt to resolve the 
            dispute informally within 60 days.
          </p>

          <h3>14.2 Mediation and Arbitration</h3>
          <p>
            If informal resolution fails, disputes may be referred to mediation or arbitration, subject to applicable 
            Irish and EU consumer protection laws. Nothing in these Terms affects your statutory rights under Irish or 
            EU law, including your right to bring proceedings before the courts.
          </p>

          <h3>14.3 Consumer Rights</h3>
          <p>
            If you are a consumer based in the EU, you retain all statutory rights provided under EU consumer protection 
            law, which cannot be waived by contract. This includes your right to access national courts and consumer 
            dispute resolution mechanisms.
          </p>

          <h2>15. Governing Law and Jurisdiction</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of Ireland, without regard 
            to conflict of law principles. Any disputes shall be resolved in the courts of Ireland or through 
            arbitration as specified above, subject to your rights under the EU Online Dispute Resolution Regulation.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            EU users may also access the European Commission's Online Dispute Resolution platform at{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
              https://ec.europa.eu/consumers/odr
            </a>
          </p>

          <h2>16. Miscellaneous</h2>
          
          <h3>16.1 Entire Agreement</h3>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Plate Progress.
          </p>

          <h3>16.2 Severability</h3>
          <p>
            If any provision is found unenforceable, the remaining provisions shall remain in full effect.
          </p>

          <h3>16.3 No Waiver</h3>
          <p>
            Our failure to enforce any right or provision does not constitute a waiver of that right.
          </p>

          <h3>16.4 Assignment</h3>
          <p>
            You may not assign or transfer these Terms. We may assign our rights without restriction.
          </p>

          <h2>17. Contact Information</h2>
          <p>
            For questions, concerns, or notices regarding these Terms:
          </p>
          <ul className="list-none">
            <li><strong>Email:</strong> <a href="mailto:support@plateprogress.com" className="text-blue-600 hover:underline">support@plateprogress.com</a></li>
            <li><strong>Legal:</strong> <a href="mailto:legal@plateprogress.com" className="text-blue-600 hover:underline">legal@plateprogress.com</a></li>
          </ul>

          <div className="text-sm text-gray-600 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p>
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mt-2">
              By using Plate Progress, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}


