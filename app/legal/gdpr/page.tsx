import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Download, Trash2, Eye, Edit, UserX, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GDPR Compliance - Plate Progress',
  description: 'GDPR compliance and data protection information for Plate Progress',
}

export default function GDPRPage() {
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
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h1 className="mb-0">GDPR Compliance</h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 my-6">
            <h3 className="mt-0 text-blue-900 dark:text-blue-100">EU General Data Protection Regulation (GDPR)</h3>
            <p className="mb-0">
              Plate Progress is committed to protecting your privacy and complying with the General Data Protection 
              Regulation (GDPR) and other data protection laws. This page explains your rights under GDPR and how to 
              exercise them.
            </p>
          </div>

          <h2>Your Rights Under GDPR</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), United Kingdom, or Switzerland, you have the 
            following data protection rights:
          </p>

          <div className="space-y-6 my-8">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">1. Right of Access</h3>
                  <p className="mb-2">
                    You have the right to request and receive a copy of all personal data we hold about you.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Go to Settings → Privacy & Data → Request Data Export, or email privacy@plateprogress.com
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <Edit className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">2. Right to Rectification</h3>
                  <p className="mb-2">
                    You have the right to correct any inaccurate or incomplete personal data.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Update your information directly in Settings, or contact support@plateprogress.com
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">3. Right to Erasure ("Right to be Forgotten")</h3>
                  <p className="mb-2">
                    You have the right to request deletion of your personal data under certain circumstances.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Go to Settings → Privacy & Data → Request Account Deletion, or email privacy@plateprogress.com
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <Download className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">4. Right to Data Portability</h3>
                  <p className="mb-2">
                    You have the right to receive your personal data in a structured, commonly used, machine-readable format.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Use the data export feature in Settings to download your data in JSON/CSV format
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <UserX className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">5. Right to Restrict Processing</h3>
                  <p className="mb-2">
                    You have the right to request that we limit the processing of your personal data under certain conditions.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Contact privacy@plateprogress.com with your specific request
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">6. Right to Object</h3>
                  <p className="mb-2">
                    You have the right to object to processing of your personal data based on legitimate interests or for direct marketing.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Contact privacy@plateprogress.com or adjust your communication preferences in Settings
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mt-0 mb-2">7. Right to Withdraw Consent</h3>
                  <p className="mb-2">
                    Where processing is based on consent, you have the right to withdraw that consent at any time.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    <strong>How to exercise:</strong> Manage your consent preferences in Settings or contact privacy@plateprogress.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2>How to Exercise Your Rights</h2>
          
          <h3>Online (Fastest)</h3>
          <ol>
            <li>Log into your Plate Progress account</li>
            <li>Go to <strong>Settings → Privacy & Data</strong></li>
            <li>Use the self-service buttons for data export or account deletion</li>
            <li>You'll receive a confirmation email when your request is processed</li>
          </ol>

          <h3>By Email</h3>
          <p>Send your request to: <a href="mailto:privacy@plateprogress.com" className="text-blue-600 hover:underline">privacy@plateprogress.com</a></p>
          <p>Please include:</p>
          <ul>
            <li>Your full name and email address associated with your account</li>
            <li>The specific right you wish to exercise</li>
            <li>Any additional details or context</li>
          </ul>

          <h3>Response Time</h3>
          <p>We will respond to your request within:</p>
          <ul>
            <li><strong>Data Export:</strong> Within 48 hours (usually immediate)</li>
            <li><strong>Account Deletion:</strong> Within 30 days, with confirmation email</li>
            <li><strong>Other Requests:</strong> Within 30 days as required by GDPR</li>
          </ul>

          <h2>Legal Basis for Processing</h2>
          <p>We process your personal data based on the following legal grounds:</p>
          
          <h3>Contractual Necessity</h3>
          <p>
            Processing is necessary to provide the Service you've signed up for (e.g., storing workout data, 
            managing your account, processing Premium subscriptions).
          </p>

          <h3>Legitimate Interests</h3>
          <p>
            We have legitimate interests in processing your data to improve the Service, prevent fraud, and ensure 
            security. We balance these interests against your privacy rights.
          </p>

          <h3>Consent</h3>
          <p>
            For optional features like analytics, marketing emails, or social features, we process data based on 
            your explicit consent, which you can withdraw at any time.
          </p>

          <h3>Legal Obligations</h3>
          <p>
            We may process data to comply with legal requirements, such as responding to lawful requests from authorities.
          </p>

          <h2>Data Protection Measures</h2>
          
          <h3>Technical Safeguards</h3>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
            <li><strong>Row-Level Security:</strong> Database policies prevent unauthorized access to user data</li>
            <li><strong>Secure Authentication:</strong> Industry-standard password hashing and session management</li>
            <li><strong>Regular Audits:</strong> Security assessments and vulnerability scans</li>
          </ul>

          <h3>Organizational Safeguards</h3>
          <ul>
            <li><strong>Access Controls:</strong> Minimal team access with role-based permissions</li>
            <li><strong>Data Minimization:</strong> We only collect data necessary for the Service</li>
            <li><strong>Privacy by Design:</strong> Privacy considerations built into all features</li>
            <li><strong>Staff Training:</strong> Team members trained on data protection best practices</li>
          </ul>

          <h2>Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in the United States and other countries. We ensure 
            adequate protection through:
          </p>
          <ul>
            <li><strong>Standard Contractual Clauses (SCCs)</strong> - Approved by the European Commission</li>
            <li><strong>EU-US Data Privacy Framework</strong> - For US-based service providers</li>
            <li><strong>Adequate Safeguards</strong> - As recognized under GDPR Article 46</li>
          </ul>

          <h3>Our Service Providers</h3>
          <ul>
            <li><strong>Supabase (Database & Auth)</strong> - EU and US regions available</li>
            <li><strong>Vercel (Hosting)</strong> - Global CDN with EU data centers</li>
            <li><strong>Stripe (Payments)</strong> - GDPR-compliant payment processor</li>
            <li><strong>Resend (Emails)</strong> - Transactional email service</li>
          </ul>

          <h2>Data Retention</h2>
          <table className="min-w-full border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Data Type</th>
                <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Active Account Data</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Duration of account + 30 days</td>
              </tr>
              <tr>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Deleted Account Data</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">30 days for recovery, then permanent deletion</td>
              </tr>
              <tr>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Backup Copies</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">90 days maximum</td>
              </tr>
              <tr>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Analytics (Aggregated)</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Indefinitely (anonymized)</td>
              </tr>
              <tr>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Legal Hold Data</td>
                <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">As required by law</td>
              </tr>
            </tbody>
          </table>

          <h2>Automated Decision-Making</h2>
          <p>
            We do <strong>NOT</strong> engage in automated decision-making or profiling that produces legal effects 
            or similarly significantly affects you. Features like XP calculations, PR tracking, and leaderboards 
            are purely informational and for gamification purposes.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our Service is not directed at children under 13 (or the applicable age of consent in your country). 
            We do not knowingly collect personal data from children. If we become aware that a child has provided 
            us with personal data, we will delete it immediately.
          </p>

          <h2>Data Breach Notification</h2>
          <p>
            In the event of a data breach that affects your personal data, we will:
          </p>
          <ul>
            <li>Notify the relevant supervisory authority within 72 hours (if required by GDPR)</li>
            <li>Inform affected users without undue delay if the breach poses a high risk</li>
            <li>Provide details about the breach and steps we're taking to address it</li>
            <li>Offer guidance on protecting yourself from potential consequences</li>
          </ul>

          <h2>Supervisory Authority</h2>
          <p>
            You have the right to lodge a complaint with a data protection supervisory authority if you believe 
            we have not complied with GDPR. You can contact your local authority or:
          </p>
          <ul className="list-none">
            <li><strong>EU:</strong> Find your authority at <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener" className="text-blue-600 hover:underline">edpb.europa.eu</a></li>
            <li><strong>UK:</strong> Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener" className="text-blue-600 hover:underline">ico.org.uk</a></li>
          </ul>

          <h2>Contact Our Data Protection Officer</h2>
          <p>
            For any GDPR-related questions or to exercise your rights:
          </p>
          <ul className="list-none">
            <li><strong>Email:</strong> <a href="mailto:privacy@plateprogress.com" className="text-blue-600 hover:underline">privacy@plateprogress.com</a></li>
            <li><strong>Subject Line:</strong> "GDPR Request" or "Data Protection Inquiry"</li>
          </ul>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this GDPR compliance page to reflect changes in our practices or legal requirements. 
            Significant changes will be communicated via email and in-app notification.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 mt-8">
            <h3 className="mt-0 text-green-900 dark:text-green-100">Quick Access</h3>
            <p>
              To manage your data and exercise your GDPR rights right now:
            </p>
            <div className="flex gap-4 mt-4">
              <Button asChild>
                <Link href="/app/settings">Go to Settings</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/legal/privacy">Read Privacy Policy</Link>
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p>
              This GDPR compliance page was last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
            <p className="mt-2">
              We are committed to transparency, data protection, and respecting your privacy rights under GDPR and other applicable laws.
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

