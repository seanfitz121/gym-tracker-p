import * as React from 'react'

interface PremiumSubscriptionActiveEmailProps {
  displayName: string
  nextBillingDate: string
  amount: string
}

export const PremiumSubscriptionActiveEmail = ({
  displayName,
  nextBillingDate,
  amount,
}: PremiumSubscriptionActiveEmailProps) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .success-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin: 20px 0;
        }
        .billing-box {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .billing-row:last-child {
          border-bottom: none;
          font-weight: 600;
          font-size: 18px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .info-box {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          padding: 30px 20px;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <h1>✅ Your Subscription is Active!</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '18px' }}>Premium features unlocked</p>
      </div>
      
      <div className="content">
        <p>Hey {displayName},</p>
        
        <p>Your free trial has ended and your <strong>Plate Progress Premium</strong> subscription is now active! 🎉</p>
        
        <p>You now have unlimited access to all premium features:</p>
        
        <ul style={{ lineHeight: '2', color: '#4b5563' }}>
          <li>⚖️ Weight Tracker with charts and insights</li>
          <li>💧 Hydration Tracker with daily goals</li>
          <li>📸 Progress Photos with secure storage</li>
          <li>📊 Export Workouts to CSV/PDF</li>
          <li>🏆 Prestige Mode for infinite progression</li>
          <li>✨ Golden Name Flair across the app</li>
        </ul>
        
        <div className="billing-box">
          <h3 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Subscription Details</h3>
          <div className="billing-row">
            <span>Plan:</span>
            <span><strong>Premium Monthly</strong></span>
          </div>
          <div className="billing-row">
            <span>Amount:</span>
            <span><strong>{amount}/month</strong></span>
          </div>
          <div className="billing-row">
            <span>Next billing date:</span>
            <span><strong>{nextBillingDate}</strong></span>
          </div>
        </div>
        
        <div className="info-box">
          <strong>💡 Manage Your Subscription</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            You can update your payment method, view invoices, or cancel anytime from your account settings.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a href="https://plateprogress.com/app/premium" className="cta-button">
            Manage Subscription →
          </a>
        </div>
        
        <p>Thank you for supporting Plate Progress! Your subscription helps us continue building amazing features and keeping the app running smoothly for everyone.</p>
        
        <p>Questions? Just reply to this email or contact us at <a href="mailto:support@plateprogress.com">support@plateprogress.com</a>.</p>
        
        <p>
          Keep crushing those PRs! 💪<br />
          The Plate Progress Team
        </p>
      </div>
      
      <div className="footer">
        <p>
          <a href="https://plateprogress.com">Plate Progress</a> |
          <a href="https://plateprogress.com/app/premium" style={{ margin: '0 10px' }}>Manage Subscription</a> |
          <a href="mailto:support@plateprogress.com">Support</a>
        </p>
        <p style={{ marginTop: '10px', fontSize: '12px' }}>
          You're receiving this email because you have an active premium subscription on Plate Progress.
        </p>
      </div>
    </body>
  </html>
)

export default PremiumSubscriptionActiveEmail

