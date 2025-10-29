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

interface DataExportReadyEmailProps {
  displayName: string
  downloadUrl: string
  expiresAt: string
}

export default function DataExportReadyEmail({
  displayName = 'there',
  downloadUrl = '#',
  expiresAt = '7 days',
}: DataExportReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📦 Your Data Export is Ready</Heading>
          
          <Text style={text}>Hi {displayName},</Text>
          
          <Text style={text}>
            Your requested data export from Plate Progress is now ready for download.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={downloadUrl}>
              Download Your Data
            </Button>
          </Section>

          <Text style={smallText}>
            This download link will expire in {expiresAt}. The export includes all your:
          </Text>

          <ul style={list}>
            <li>Account information</li>
            <li>Workout logs and exercise data</li>
            <li>Personal records and progress</li>
            <li>Templates and notes</li>
            <li>Body metrics and measurements</li>
            <li>Progress photos (if applicable)</li>
            <li>Social connections</li>
          </ul>

          <Hr style={hr} />

          <Text style={smallText}>
            If you didn't request this export, please contact us immediately at{' '}
            <a href="mailto:privacy@plateprogress.com" style={link}>
              privacy@plateprogress.com
            </a>
          </Text>

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
  color: '#1a1a1a',
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

const list = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  paddingLeft: '20px',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
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

