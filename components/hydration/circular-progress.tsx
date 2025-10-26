'use client'

interface CircularProgressProps {
  percentage: number
  current: number
  goal: number
  unit?: string
}

export function CircularProgress({ percentage, current, goal, unit = 'L' }: CircularProgressProps) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference

  // Always use blue color scheme
  const blueColor = '#3b82f6' // blue-500

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="none"
            className="text-blue-100 dark:text-blue-950"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={blueColor}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
            {current.toFixed(2)}{unit}
          </div>
          <div className="text-sm text-muted-foreground">
            of {goal.toFixed(2)}{unit}
          </div>
          <div className="text-2xl font-semibold mt-2 text-blue-600 dark:text-blue-400">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

