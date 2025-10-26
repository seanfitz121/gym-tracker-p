'use client'

import { useState, useEffect } from 'react'
import { useBodyMetrics, useSaveBodyMetrics } from '@/lib/hooks/use-weight-goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ruler } from 'lucide-react'
import { toast } from 'sonner'

interface BodyMetricsFormProps {
  onSuccess?: () => void
}

export function BodyMetricsForm({ onSuccess }: BodyMetricsFormProps) {
  const { metrics, refresh } = useBodyMetrics()
  const { saveMetrics, loading } = useSaveBodyMetrics()

  const [height, setHeight] = useState('')
  const [waist, setWaist] = useState('')
  const [neck, setNeck] = useState('')
  const [hip, setHip] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (metrics) {
      setHeight(metrics.height_cm?.toString() || '')
      setWaist(metrics.waist_cm?.toString() || '')
      setNeck(metrics.neck_cm?.toString() || '')
      setHip(metrics.hip_cm?.toString() || '')
      setGender(metrics.gender || '')
    }
  }, [metrics])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const metricsData: any = {}
    if (height) metricsData.height_cm = parseFloat(height)
    if (waist) metricsData.waist_cm = parseFloat(waist)
    if (neck) metricsData.neck_cm = parseFloat(neck)
    if (hip) metricsData.hip_cm = parseFloat(hip)
    if (gender) metricsData.gender = gender

    const result = await saveMetrics(metricsData)

    if (result) {
      toast.success('Body metrics saved!')
      setShowForm(false)
      refresh()
      onSuccess?.()
    } else {
      toast.error('Failed to save metrics')
    }
  }

  if (!metrics && !showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Body Metrics
          </CardTitle>
          <CardDescription>
            Track body composition beyond just weight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
            Add Measurements
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!showForm && metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Body Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metrics.height_cm && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium">{metrics.height_cm} cm</span>
            </div>
          )}
          {metrics.waist_cm && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Waist:</span>
              <span className="font-medium">{metrics.waist_cm} cm</span>
            </div>
          )}
          {metrics.neck_cm && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Neck:</span>
              <span className="font-medium">{metrics.neck_cm} cm</span>
            </div>
          )}
          <Button variant="outline" onClick={() => setShowForm(true)} className="w-full mt-4">
            Update Measurements
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Body Measurements
        </CardTitle>
        <CardDescription>
          Used for body fat % and composition estimates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                placeholder="80"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neck">Neck (cm)</Label>
              <Input
                id="neck"
                type="number"
                step="0.1"
                placeholder="37"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                disabled={loading}
              />
            </div>

            {gender === 'female' && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="hip">Hip (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Measurements'}
            </Button>
            {showForm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


