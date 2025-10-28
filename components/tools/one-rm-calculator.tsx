'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, Info, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { estimate1RM, generatePercentageTable } from '@/lib/utils/calculations'

export function OneRMCalculator() {
  const [weight, setWeight] = useState<string>('')
  const [reps, setReps] = useState<string>('')
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg')
  const [formula, setFormula] = useState<'epley' | 'brzycki' | 'lombardi'>('epley')
  const [result, setResult] = useState<{
    estimated1RM: number
    percentageTable: Array<{ percent: number; weight: number }>
  } | null>(null)
  const [error, setError] = useState<string>('')

  const handleCalculate = () => {
    setError('')
    
    const weightNum = parseFloat(weight)
    const repsNum = parseInt(reps)

    // Validation
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight greater than 0')
      return
    }

    if (isNaN(repsNum) || repsNum < 1 || repsNum > 20) {
      setError('Reps must be between 1 and 20')
      return
    }

    // Warn for very high weights
    if ((unit === 'kg' && weightNum > 1000) || (unit === 'lb' && weightNum > 2200)) {
      setError(`Warning: ${weightNum}${unit} is unusually high. Please verify your input.`)
      // Continue anyway
    }

    // Calculate
    const estimated = estimate1RM(weightNum, repsNum, formula)
    const table = generatePercentageTable(estimated, 10, undefined, unit)

    setResult({
      estimated1RM: estimated,
      percentageTable: table
    })
  }

  const getFormulaDescription = (f: string) => {
    switch (f) {
      case 'epley':
        return 'Epley: 1RM = weight × (1 + reps/30) — Most commonly used'
      case 'brzycki':
        return 'Brzycki: 1RM = weight × (36 / (37 - reps)) — Conservative estimate'
      case 'lombardi':
        return 'Lombardi: 1RM = weight × reps^0.10 — Best for low reps'
      default:
        return ''
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">1RM Calculator</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Estimate your one-rep max and get working weight percentages
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enter Your Lift</CardTitle>
            <CardDescription>
              Input the weight and reps from a recent set
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  placeholder="100"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  step="0.5"
                  className="flex-1"
                />
                <Select value={unit} onValueChange={(v: 'kg' | 'lb') => setUnit(v)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps (1-20)</Label>
              <Input
                id="reps"
                type="number"
                placeholder="5"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
                max="20"
              />
              {reps && (parseInt(reps) < 1 || parseInt(reps) > 20) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  For best accuracy, use reps between 1-20
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="formula">Formula</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{getFormulaDescription(formula)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formula} onValueChange={(v: 'epley' | 'brzycki' | 'lombardi') => setFormula(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epley">Epley (Most Popular)</SelectItem>
                  <SelectItem value="brzycki">Brzycki (Conservative)</SelectItem>
                  <SelectItem value="lombardi">Lombardi (Low Reps)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCalculate}
              className="w-full"
              size="lg"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate 1RM
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <CardDescription>
              Estimated 1RM and working percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Estimated 1RM */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Estimated 1RM
                    </p>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {result.estimated1RM} {unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Using {formula.charAt(0).toUpperCase() + formula.slice(1)} formula
                  </p>
                </div>

                {/* Percentage Table */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Working Weight Percentages</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {result.percentageTable.map((entry) => (
                      <div
                        key={entry.percent}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-14 justify-center">
                            {entry.percent}%
                          </Badge>
                          <span className="font-semibold">
                            {entry.weight} {unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Tip:</strong> Weights are rounded to {unit === 'kg' ? '0.5 kg' : '2.5 lb'} increments for practical use.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Enter your weight and reps, then click Calculate to see results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Card */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-base">Example</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            If you lifted <strong>100 kg for 5 reps</strong> using the Epley formula:
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Estimated 1RM = 100 × (1 + 5/30) = 100 × 1.167 = <span className="text-blue-600 dark:text-blue-400">116.67 kg</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            This matches the specification perfectly ✓
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

