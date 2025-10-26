'use client'

import { useMemo } from 'react'
import { BodyMetrics } from '@/lib/types/weight-goals'
import { analyzeBodyComposition } from '@/lib/utils/body-composition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

interface BodyCompositionDisplayProps {
  weightKg: number
  metrics: BodyMetrics | null
}

export function BodyCompositionDisplay({ weightKg, metrics }: BodyCompositionDisplayProps) {
  const composition = useMemo(() => {
    return analyzeBodyComposition(weightKg, metrics)
  }, [weightKg, metrics])

  if (!metrics || !composition.bmi) {
    return null
  }

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-yellow-600'
    if (bmi < 25) return 'text-green-600'
    if (bmi < 30) return 'text-orange-600'
    return 'text-red-600'
  }

  const getBodyFatColor = (bf: number | null, gender: string | null) => {
    if (!bf || !gender) return 'text-gray-600'
    const isMale = gender === 'male'
    if (isMale) {
      if (bf < 8) return 'text-yellow-600'
      if (bf < 20) return 'text-green-600'
      if (bf < 25) return 'text-orange-600'
      return 'text-red-600'
    } else {
      if (bf < 15) return 'text-yellow-600'
      if (bf < 25) return 'text-green-600'
      if (bf < 32) return 'text-orange-600'
      return 'text-red-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Body Composition
        </CardTitle>
        <CardDescription>
          Estimated based on your measurements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BMI */}
        {composition.bmi && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">BMI</span>
              <Badge variant="outline">{composition.bmiCategory}</Badge>
            </div>
            <div className={`text-3xl font-bold ${getBMIColor(composition.bmi)}`}>
              {composition.bmi}
            </div>
          </div>
        )}

        {/* Body Fat % */}
        {composition.bodyFatPercentage && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Body Fat %</span>
            <div className={`text-3xl font-bold ${getBodyFatColor(composition.bodyFatPercentage, metrics.gender)}`}>
              {composition.bodyFatPercentage}%
            </div>
          </div>
        )}

        {/* Lean vs Fat Mass */}
        {composition.leanMass && composition.fatMass && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lean Mass</span>
                <span className="font-medium">{composition.leanMass} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fat Mass</span>
                <span className="font-medium">{composition.fatMass} kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Waist-to-Height Ratio */}
        {composition.waistToHeightRatio && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waist-to-Height Ratio</span>
              <Badge variant="outline">{composition.waistToHeightCategory}</Badge>
            </div>
            <div className="text-xl font-semibold">
              {composition.waistToHeightRatio}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          * Estimates based on US Navy formula. For medical advice, consult a healthcare professional.
        </p>
      </CardContent>
    </Card>
  )
}


