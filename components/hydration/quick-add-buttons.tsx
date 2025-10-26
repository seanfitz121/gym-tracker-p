'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Droplet, Plus } from 'lucide-react'

interface QuickAddButtonsProps {
  onAdd: (amount: number) => void
  loading?: boolean
}

export function QuickAddButtons({ onAdd, loading = false }: QuickAddButtonsProps) {
  const [customAmount, setCustomAmount] = useState('')

  const amounts = [
    { ml: 250, label: '250ml' },
    { ml: 500, label: '500ml' },
    { ml: 1000, label: '1L' },
  ]

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount)
    if (amount > 0 && amount <= 10000) {
      onAdd(amount)
      setCustomAmount('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomAdd()
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {amounts.map(({ ml, label }) => (
          <Button
            key={ml}
            onClick={() => onAdd(ml)}
            disabled={loading}
            size="lg"
            className="flex flex-col h-auto py-4 gap-2 bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-700"
          >
            <Droplet className="h-6 w-6" />
            <span className="font-semibold">{label}</span>
          </Button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="flex gap-2">
        <Input
          type="number"
          min="1"
          max="10000"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={handleCustomAdd}
          disabled={loading || !customAmount || parseInt(customAmount) <= 0}
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}

