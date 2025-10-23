import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveWorkout, ActiveExercise, ActiveSet, WeightUnit } from '../types'

interface WorkoutState {
  activeWorkout: ActiveWorkout | null
  restTimer: {
    active: boolean
    startTime: number | null
    duration: number // seconds
  }
  
  // Actions
  startWorkout: (title?: string) => void
  endWorkout: () => void
  updateWorkout: (updates: Partial<ActiveWorkout>) => void
  
  addExercise: (exerciseId: string, name: string, bodyPart?: string) => void
  removeExercise: (exerciseId: string) => void
  
  addSet: (exerciseId: string, set?: Partial<ActiveSet>) => void
  updateSet: (exerciseId: string, setId: string, updates: Partial<ActiveSet>) => void
  removeSet: (exerciseId: string, setId: string) => void
  duplicateSet: (exerciseId: string, setId: string) => void
  
  startRestTimer: (duration: number) => void
  stopRestTimer: () => void
  
  clearWorkout: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimer: {
        active: false,
        startTime: null,
        duration: 60,
      },
      
      startWorkout: (title) => {
        set({
          activeWorkout: {
            startedAt: new Date(),
            title,
            exercises: [],
          },
        })
      },
      
      endWorkout: () => {
        const { activeWorkout } = get()
        if (!activeWorkout) return
        
        // This will be handled by the component that calls it
        // to save to the database
        return activeWorkout
      },
      
      updateWorkout: (updates) => {
        set((state) => ({
          activeWorkout: state.activeWorkout
            ? { ...state.activeWorkout, ...updates }
            : null,
        }))
      },
      
      addExercise: (exerciseId, name, bodyPart) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          const existingExercise = state.activeWorkout.exercises.find(
            (ex) => ex.id === exerciseId
          )
          
          if (existingExercise) {
            // Exercise already in workout, just add a new set
            return state
          }
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: [
                ...state.activeWorkout.exercises,
                {
                  id: exerciseId,
                  name,
                  bodyPart,
                  sets: [],
                },
              ],
            },
          }
        })
      },
      
      removeExercise: (exerciseId) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: state.activeWorkout.exercises.filter(
                (ex) => ex.id !== exerciseId
              ),
            },
          }
        })
      },
      
      addSet: (exerciseId, setData) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          const exerciseIndex = state.activeWorkout.exercises.findIndex(
            (ex) => ex.id === exerciseId
          )
          
          if (exerciseIndex === -1) return state
          
          const exercise = state.activeWorkout.exercises[exerciseIndex]
          const previousSet = exercise.sets[exercise.sets.length - 1]
          
          const newSet: ActiveSet = {
            id: `temp-${Date.now()}-${Math.random()}`,
            exerciseId,
            setOrder: exercise.sets.length + 1,
            reps: previousSet?.reps || 10,
            weight: previousSet?.weight || 0,
            weightUnit: previousSet?.weightUnit || 'kg',
            rpe: previousSet?.rpe,
            isWarmup: false,
            ...setData,
          }
          
          const newExercises = [...state.activeWorkout.exercises]
          newExercises[exerciseIndex] = {
            ...exercise,
            sets: [...exercise.sets, newSet],
          }
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: newExercises,
            },
          }
        })
      },
      
      updateSet: (exerciseId, setId, updates) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          const exerciseIndex = state.activeWorkout.exercises.findIndex(
            (ex) => ex.id === exerciseId
          )
          
          if (exerciseIndex === -1) return state
          
          const exercise = state.activeWorkout.exercises[exerciseIndex]
          const setIndex = exercise.sets.findIndex((s) => s.id === setId)
          
          if (setIndex === -1) return state
          
          const newSets = [...exercise.sets]
          newSets[setIndex] = {
            ...newSets[setIndex],
            ...updates,
          }
          
          const newExercises = [...state.activeWorkout.exercises]
          newExercises[exerciseIndex] = {
            ...exercise,
            sets: newSets,
          }
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: newExercises,
            },
          }
        })
      },
      
      removeSet: (exerciseId, setId) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          const exerciseIndex = state.activeWorkout.exercises.findIndex(
            (ex) => ex.id === exerciseId
          )
          
          if (exerciseIndex === -1) return state
          
          const exercise = state.activeWorkout.exercises[exerciseIndex]
          const newSets = exercise.sets
            .filter((s) => s.id !== setId)
            .map((s, idx) => ({ ...s, setOrder: idx + 1 }))
          
          const newExercises = [...state.activeWorkout.exercises]
          newExercises[exerciseIndex] = {
            ...exercise,
            sets: newSets,
          }
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: newExercises,
            },
          }
        })
      },
      
      duplicateSet: (exerciseId, setId) => {
        set((state) => {
          if (!state.activeWorkout) return state
          
          const exerciseIndex = state.activeWorkout.exercises.findIndex(
            (ex) => ex.id === exerciseId
          )
          
          if (exerciseIndex === -1) return state
          
          const exercise = state.activeWorkout.exercises[exerciseIndex]
          const setToDuplicate = exercise.sets.find((s) => s.id === setId)
          
          if (!setToDuplicate) return state
          
          const newSet: ActiveSet = {
            ...setToDuplicate,
            id: `temp-${Date.now()}-${Math.random()}`,
            setOrder: exercise.sets.length + 1,
          }
          
          const newExercises = [...state.activeWorkout.exercises]
          newExercises[exerciseIndex] = {
            ...exercise,
            sets: [...exercise.sets, newSet],
          }
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              exercises: newExercises,
            },
          }
        })
      },
      
      startRestTimer: (duration) => {
        set({
          restTimer: {
            active: true,
            startTime: Date.now(),
            duration,
          },
        })
      },
      
      stopRestTimer: () => {
        set({
          restTimer: {
            active: false,
            startTime: null,
            duration: 60,
          },
        })
      },
      
      clearWorkout: () => {
        set({
          activeWorkout: null,
        })
      },
    }),
    {
      name: 'workout-storage',
    }
  )
)


