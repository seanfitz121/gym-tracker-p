import { Metadata } from 'next'
import { PlateCalculator } from '@/components/tools/plate-calculator'

export const metadata: Metadata = {
  title: 'Plate Calculator - Plate Progress',
  description: 'Calculate which plates to load on each side of the barbell',
}

export default function PlateCalculatorPage() {
  return <PlateCalculator />
}

