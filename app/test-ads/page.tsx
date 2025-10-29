import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestAdsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 AdSense Diagnostic Page</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This page helps diagnose if ads are loading correctly. Check your browser console (F12) for errors.
        </p>
      </div>

      {/* Test Ad Unit 1 */}
      <div className="border border-blue-500 rounded-lg p-4">
        <h2 className="font-bold mb-2">Test Ad #1 - Dashboard Ad</h2>
        <p className="text-sm text-gray-500 mb-4">Ad Slot: 7306690705</p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9610700167630671"
          data-ad-slot="7306690705"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </div>

      {/* Test Ad Unit 2 */}
      <div className="border border-green-500 rounded-lg p-4">
        <h2 className="font-bold mb-2">Test Ad #2 - Bottom Banner</h2>
        <p className="text-sm text-gray-500 mb-4">Ad Slot: 4020668929</p>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9610700167630671"
          data-ad-slot="4020668929"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </div>

      {/* Diagnostic Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
        <h2 className="font-bold text-lg">📋 Troubleshooting Checklist</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span>☐</span>
            <div>
              <strong>Check Browser Extensions:</strong> Open incognito/private mode and test again
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>☐</span>
            <div>
              <strong>Check Browser:</strong> Try a different browser (Chrome, Firefox, Safari)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>☐</span>
            <div>
              <strong>Check Network:</strong> Try a different network (mobile data vs WiFi)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>☐</span>
            <div>
              <strong>Check Console:</strong> Look for "adsbygoogle.push() error" messages
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span>☐</span>
            <div>
              <strong>AdSense Status:</strong> Verify account is fully approved (not "Getting ready")
            </div>
          </div>
        </div>
      </div>

      {/* Console Debug Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="font-bold text-lg mb-2">🔍 What to Look For in Console (F12)</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong className="text-red-600">❌ ERR_BLOCKED_BY_CLIENT:</strong>
            <p className="text-gray-600 dark:text-gray-400">
              = Something on YOUR system is blocking ads (extension, browser, antivirus, network)
            </p>
          </div>
          <div>
            <strong className="text-green-600">✅ No errors + blank space:</strong>
            <p className="text-gray-600 dark:text-gray-400">
              = Ads loaded but no inventory available yet (wait 24-48 hours after approval)
            </p>
          </div>
          <div>
            <strong className="text-yellow-600">⚠️ "adsbygoogle.push() error":</strong>
            <p className="text-gray-600 dark:text-gray-400">
              = Configuration issue (check ad slot IDs match AdSense dashboard)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

