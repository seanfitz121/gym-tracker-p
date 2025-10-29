import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface AccountDeletionConfirmationEmailProps {
  displayName: string
  confirmationUrl: string
}

export default function AccountDeletionConfirmationEmail({
  displayName = 'there',
  confirmationUrl = '#',
}: AccountDeletionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Confirm Account Deletion</Heading>
          
          <Text style={text}>Hi {displayName},</Text>
          
          <Text style={text}>
            We received a request to permanently delete your Plate Progress account and all associated data.
          </Text>

          <div style={warningBox}>
            <Text style={warningText}>
              <strong>⚠️ This action is irreversible!</strong>
            </Text>
            <Text style={warningText}>
              Once confirmed, all your data will be permanently deleted within 30 days, including:
            </Text>
            <ul style={warningList}>
              <li>All workout logs and exercise history</li>
              <li>Personal records and progress tracking</li>
              <li>Progress photos and body metrics</li>
              <li>Templates, notes, and achievements</li>
              <li>Social connections and gym memberships</li>
              <li>Premium subscription (if applicable)</li>
            </ul>
          </div>

          <Text style={text}>
            <strong>Before you go:</strong> If you're deleting your account because of an issue, please let us know 
            at <a href="mailto:support@plateprogress.com" style={link}>support@plateprogress.com</a>. We'd love to help!
          </Text>

          <Section style={buttonContainer}>
            <Button style={dangerButton} href={confirmationUrl}>
              Yes, Delete My Account
            </Button>
          </Section>

          <Text style={smallText}>
            If you didn't request this deletion, please ignore this email and your account will remain active. 
            For security concerns, contact us at{' '}
            <a href="mailto:privacy@plateprogress.com" style={link}>
              privacy@plateprogress.com
            </a>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            © {new Date().getFullYear()} Plate Progress. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#dc2626',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
}

const warningBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fca5a5',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const warningText = {
  color: '#991b1b',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '8px 0',
}

const warningList = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  paddingLeft: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const dangerButton = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const footer = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  textAlign: 'center' as const,
}

