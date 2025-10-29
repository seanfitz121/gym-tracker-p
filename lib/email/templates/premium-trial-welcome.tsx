import * as React from 'react'

interface PremiumTrialWelcomeEmailProps {
  displayName: string
  trialEndDate: string
}

export const PremiumTrialWelcomeEmail = ({
  displayName,
  trialEndDate,
}: PremiumTrialWelcomeEmailProps) => (
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .badge {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1f2937;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin: 20px 0;
        }
        .feature-list {
          margin: 30px 0;
        }
        .feature {
          display: flex;
          align-items: start;
          margin: 20px 0;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
          flex-shrink: 0;
        }
        .feature-text h3 {
          margin: 0 0 5px 0;
          color: #667eea;
          font-size: 16px;
        }
        .feature-text p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
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
        .trial-info {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
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
        <h1>💎 Welcome to Premium!</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '18px' }}>Your 7-day free trial has started</p>
      </div>
      
      <div className="content">
        <p>Hey {displayName},</p>
        
        <p>Welcome to <strong>Plate Progress Premium</strong>! 🎉</p>
        
        <p>Your 7-day free trial has begun, giving you full access to all premium features. Here's what you can do now:</p>
        
        <div className="feature-list">
          <div className="feature">
            <div className="feature-icon">⚖️</div>
            <div className="feature-text">
              <h3>Weight Tracker</h3>
              <p>Monitor your bodyweight progress with beautiful charts, weekly averages, and trend analysis</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">💧</div>
            <div className="feature-text">
              <h3>Hydration Tracker</h3>
              <p>Stay hydrated with daily water intake tracking and streak monitoring</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">📸</div>
            <div className="feature-text">
              <h3>Progress Photos</h3>
              <p>Upload transformation photos and compare them side-by-side with secure cloud storage</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">📊</div>
            <div className="feature-text">
              <h3>Export Workouts</h3>
              <p>Download your complete workout history, templates, and weekly summaries as CSV or PDF</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🏆</div>
            <div className="feature-text">
              <h3>Prestige Mode</h3>
              <p>Reset your level for exclusive prestige badges and infinite progression</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">✨</div>
            <div className="feature-text">
              <h3>Golden Name Flair</h3>
              <p>Stand out with your premium golden username displayed across the entire app</p>
            </div>
          </div>
        </div>
        
        <div className="trial-info">
          <strong>📅 Your trial ends on {trialEndDate}</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            You won't be charged until your trial ends. Cancel anytime from your settings.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a href="https://plateprogress.com/app/dashboard" className="cta-button">
            Start Exploring Premium Features →
          </a>
        </div>
        
        <p>If you have any questions or need help getting started, just reply to this email or reach out to <a href="mailto:support@plateprogress.com">support@plateprogress.com</a>.</p>
        
        <p>Let's make some gains! 💪</p>
        
        <p>
          Best,<br />
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
          You're receiving this email because you started a premium trial on Plate Progress.
        </p>
      </div>
    </body>
  </html>
)

export default PremiumTrialWelcomeEmail

