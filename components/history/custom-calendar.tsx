'use client'

import { useState, useMemo } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomCalendarProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date) => void
  workoutDates: Date[]
  getWorkoutCount: (date: Date) => number
}

export function CustomCalendar({ 
  selectedDate, 
  onSelectDate, 
  workoutDates,
  getWorkoutCount 
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = useMemo(() => {
    const daysArray: Date[] = []
    let day = startDate
    while (day <= endDate) {
      daysArray.push(day)
      day = addDays(day, 1)
    }
    return daysArray
  }, [startDate, endDate])

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const isWorkoutDate = (date: Date) => {
    return workoutDates.some(workoutDate => 
      isSameDay(startOfDay(date), startOfDay(workoutDate))
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const hasWorkout = isWorkoutDate(day)
          const workoutCount = hasWorkout ? getWorkoutCount(day) : 0
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative aspect-square min-h-[44px] sm:min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSelected && isCurrentMonth && "text-foreground",
                isToday && !isSelected && "bg-accent text-accent-foreground"
              )}
            >
              <span className={cn(
                "text-sm sm:text-base",
                hasWorkout && "font-semibold"
              )}>
                {format(day, 'd')}
              </span>
              {hasWorkout && (
                <div className="flex items-center gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {workoutCount > 1 && (
                    <span className="text-[8px] text-blue-600 font-bold leading-none">
                      {workoutCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

