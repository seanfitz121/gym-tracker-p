'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Scale, Copy, Trash2, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  calculatePlateLoading,
  PLATE_PRESETS,
  BAR_WEIGHTS,
  PlateInventoryItem,
  PlateCalculatorResult
} from '@/lib/utils/plate-calculator'

export function PlateCalculator() {
  const [targetTotal, setTargetTotal] = useState<string>('')
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg')
  const [barWeight, setBarWeight] = useState<number>(20)
  const [plateInventory, setPlateInventory] = useState<PlateInventoryItem[]>(PLATE_PRESETS.kg_basic)
  const [result, setResult] = useState<PlateCalculatorResult | null>(null)
  const [alternatives, setAlternatives] = useState<PlateCalculatorResult[]>([])
  const [selectedAlt, setSelectedAlt] = useState<number>(-1)

  const handleUnitChange = (newUnit: 'kg' | 'lb') => {
    setUnit(newUnit)
    // Update bar weight and inventory to match unit
    if (newUnit === 'kg') {
      setBarWeight(20)
      setPlateInventory(PLATE_PRESETS.kg_basic)
    } else {
      setBarWeight(45)
      setPlateInventory(PLATE_PRESETS.lb_basic)
    }
  }

  const handlePresetChange = (preset: string) => {
    const presetMap: Record<string, PlateInventoryItem[]> = {
      'kg_standard': PLATE_PRESETS.kg_standard,
      'kg_basic': PLATE_PRESETS.kg_basic,
      'lb_standard': PLATE_PRESETS.lb_standard,
      'lb_basic': PLATE_PRESETS.lb_basic
    }
    setPlateInventory(presetMap[preset] || PLATE_PRESETS.kg_basic)
  }

  const handleCalculate = () => {
    const target = parseFloat(targetTotal)
    
    if (isNaN(target) || target <= 0) {
      setResult({
        success: false,
        perSidePlates: [],
        achievedTotal: barWeight,
        delta: barWeight - target,
        shortfallReason: 'Please enter a valid target weight'
      })
      return
    }

    const output = calculatePlateLoading({
      targetTotal: target,
      barWeight,
      plateInventory,
      roundingTolerance: 0.01,
      preference: 'largest_plates_first'
    })

    // Set achieved total correctly
    if (output.result.perSidePlates.length > 0) {
      const perSideTotal = output.result.perSidePlates.reduce((s, p) => s + p, 0)
      output.result.achievedTotal = barWeight + perSideTotal * 2
      output.result.delta = output.result.achievedTotal - target
    }

    setResult(output.result)
    setAlternatives(output.alternatives)
    setSelectedAlt(-1)
  }

  const handleSelectAlternative = (index: number) => {
    if (alternatives[index]) {
      setSelectedAlt(index)
      setResult(alternatives[index])
    }
  }

  const addPlateType = () => {
    setPlateInventory([...plateInventory, { value: 5, count: 2 }])
  }

  const updatePlate = (index: number, field: 'value' | 'count', value: number) => {
    const updated = [...plateInventory]
    updated[index][field] = value
    setPlateInventory(updated)
  }

  const removePlate = (index: number) => {
    setPlateInventory(plateInventory.filter((_, i) => i !== index))
  }

  const copyToClipboard = () => {
    if (!result || result.perSidePlates.length === 0) return
    
    const text = `Bar: ${barWeight}${unit}\nPer side: ${result.perSidePlates.join(` ${unit}, `)} ${unit}\nTotal: ${result.achievedTotal}${unit}`
    navigator.clipboard.writeText(text)
  }

  // Visual bar representation - shows both sides of barbell
  const renderPlateBar = (plates: number[]) => {
    if (plates.length === 0) return null

    const renderPlate = (plate: number, idx: number) => {
      const height = Math.min(56 + plate * 1.8, 96)
      const width = Math.max(32, Math.min(plate * 1.2, 56))
      return (
        <div
          key={idx}
          className="flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 border-2 border-blue-800 dark:border-blue-900 rounded flex-shrink-0"
          style={{ 
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <span className="text-sm font-bold text-white leading-none">
            {plate}
          </span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 justify-center my-4 flex-wrap">
        {/* Left side - plates in reverse order (inner to outer) */}
        {[...plates].reverse().map((plate, idx) => renderPlate(plate, `left-${idx}`))}
        
        {/* Barbell center */}
        <div className="w-20 h-3 bg-gray-400 dark:bg-gray-600 flex-shrink-0" />
        
        {/* Right side - plates in normal order (outer to inner) */}
        {plates.map((plate, idx) => renderPlate(plate, `right-${idx}`))}
      </div>
    )
  }

  const displayResult = selectedAlt >= 0 && alternatives[selectedAlt] ? alternatives[selectedAlt] : result

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Scale className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Plate Calculator</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Calculate which plates to load on each side of the barbell
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup</CardTitle>
            <CardDescription>
              Enter your target weight and bar configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Weight */}
            <div className="space-y-2">
              <Label htmlFor="target">Target Total Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="target"
                  type="number"
                  placeholder="100"
                  value={targetTotal}
                  onChange={(e) => setTargetTotal(e.target.value)}
                  min="0"
                  step="0.5"
                  className="flex-1"
                />
                <Select value={unit} onValueChange={(v: 'kg' | 'lb') => handleUnitChange(v)}>
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

            {/* Bar Weight */}
            <div className="space-y-2">
              <Label htmlFor="bar">Bar Weight</Label>
              <Select value={barWeight.toString()} onValueChange={(v) => setBarWeight(parseFloat(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAR_WEIGHTS[unit].map(bar => (
                    <SelectItem key={bar.value} value={bar.value.toString()}>
                      {bar.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plate Inventory Preset */}
            <div className="space-y-2">
              <Label htmlFor="preset">Plate Inventory Preset</Label>
              <Select onValueChange={handlePresetChange} defaultValue={unit === 'kg' ? 'kg_basic' : 'lb_basic'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unit === 'kg' ? (
                    <>
                      <SelectItem value="kg_standard">Standard (Full Set)</SelectItem>
                      <SelectItem value="kg_basic">Basic (Common Plates)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="lb_standard">Standard (Full Set)</SelectItem>
                      <SelectItem value="lb_basic">Basic (Common Plates)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Inventory */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Plates (Total Count)</Label>
                <Button size="sm" variant="outline" onClick={addPlateType}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {plateInventory.map((plate, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={plate.value}
                      onChange={(e) => updatePlate(idx, 'value', parseFloat(e.target.value) || 0)}
                      className="w-24"
                      step="0.5"
                      min="0"
                    />
                    <span className="text-sm text-gray-500">{unit} ×</span>
                    <Input
                      type="number"
                      value={plate.count}
                      onChange={(e) => updatePlate(idx, 'count', parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePlate(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Scale className="h-4 w-4 mr-2" />
              Calculate Plate Loading
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <CardDescription>
              Plate configuration for each side
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayResult ? (
              <div className="space-y-4">
                {/* Status */}
                {displayResult.success ? (
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Exact match ✅
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      {displayResult.shortfallReason || `Closest match: ${displayResult.delta > 0 ? '+' : ''}${displayResult.delta.toFixed(1)}${unit}`}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Visual Bar */}
                {displayResult.perSidePlates.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {renderPlateBar(displayResult.perSidePlates)}
                  </div>
                )}

                {/* Achieved Weight */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Weight</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {displayResult.achievedTotal} {unit}
                  </p>
                  {displayResult.delta !== 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Target: {targetTotal} {unit} ({displayResult.delta > 0 ? '+' : ''}{displayResult.delta.toFixed(1)}{unit})
                    </p>
                  )}
                </div>

                {/* Plate List */}
                {displayResult.perSidePlates.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Per Side Breakdown</h4>
                    <div className="space-y-1">
                      {displayResult.perSidePlates.reduce((acc: Array<{value: number, count: number}>, plate) => {
                        const existing = acc.find(p => p.value === plate)
                        if (existing) {
                          existing.count++
                        } else {
                          acc.push({ value: plate, count: 1 })
                        }
                        return acc
                      }, []).map((group, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          <span className="font-medium">{group.value} {unit}</span>
                          <Badge variant="outline">× {group.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && selectedAlt < 0 && (
                  <div className="pt-4 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-sm mb-2">Alternative Options</h4>
                    <div className="space-y-2">
                      {alternatives.slice(0, 3).map((alt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                          onClick={() => handleSelectAlternative(idx)}
                        >
                          <span>{alt.achievedTotal} {unit}</span>
                          <Badge variant="secondary">
                            {alt.delta > 0 ? '+' : ''}{alt.delta.toFixed(1)}{unit}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {displayResult.perSidePlates.length > 0 && (
                  <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                    <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    {selectedAlt >= 0 && (
                      <Button variant="outline" onClick={() => setSelectedAlt(-1)} className="flex-1">
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Enter target weight and click Calculate to see plate loading
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Case Examples */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-base">Example Test Cases</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-semibold mb-1">✅ Exact Match Test</p>
            <p className="text-gray-600 dark:text-gray-400">
              Target: 120kg, Bar: 20kg, Basic inventory → Result: 2×20kg + 2×10kg per side (exact match)
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">⚠️ Impossible Weight Test</p>
            <p className="text-gray-600 dark:text-gray-400">
              Target: 121kg with basic inventory → Shows closest alternatives with delta
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">❌ Invalid Input Test</p>
            <p className="text-gray-600 dark:text-gray-400">
              Target ≤ bar weight (e.g., 20kg) → Error: target must exceed bar weight
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

