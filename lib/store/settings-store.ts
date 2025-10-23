import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

interface SettingsState extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultWeightUnit: 'kg',
      defaultRestTimer: 60,
      chartSmoothing: 'low',
      privacyMode: true,
      
      updateSettings: (settings) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)


