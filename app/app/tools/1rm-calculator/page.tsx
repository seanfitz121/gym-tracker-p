import { Metadata } from 'next'
import { OneRMCalculator } from '@/components/tools/one-rm-calculator'

export const metadata: Metadata = {
  title: '1RM Calculator - Plate Progress',
  description: 'Calculate your one-rep max and working weight percentages',
}

export default function OneRMCalculatorPage() {
  return <OneRMCalculator />
}

