/**
 * Sound effects utility using Web Audio API
 * Generates simple, satisfying sounds without external files
 */

let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Check if sounds are enabled in user settings
 */
const areSoundsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const settingsStorage = localStorage.getItem('settings-storage')
    if (!settingsStorage) return true // Default to enabled
    
    const settings = JSON.parse(settingsStorage)
    return settings.state?.soundsEnabled ?? true
  } catch {
    return true // Default to enabled on error
  }
}

/**
 * Play a short beep sound
 */
const playBeep = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const ctx = getAudioContext()
  if (!ctx) return

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  // Envelope for smoother sound
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

/**
 * Play a pleasant "ding" sound - for starting events
 */
export const playStartSound = () => {
  if (!areSoundsEnabled()) return
  
  try {
    playBeep(800, 0.15, 'sine')
    setTimeout(() => playBeep(1000, 0.15, 'sine'), 100)
  } catch (error) {
    console.warn('Could not play start sound:', error)
  }
}

/**
 * Play a satisfying "success" sound - for completing events
 */
export const playCompleteSound = () => {
  if (!areSoundsEnabled()) return
  
  try {
    playBeep(523.25, 0.1, 'sine') // C5
    setTimeout(() => playBeep(659.25, 0.1, 'sine'), 100) // E5
    setTimeout(() => playBeep(783.99, 0.2, 'sine'), 200) // G5
  } catch (error) {
    console.warn('Could not play complete sound:', error)
  }
}

/**
 * Play a gentle "stop" sound - for canceling/stopping events
 */
export const playStopSound = () => {
  if (!areSoundsEnabled()) return
  
  try {
    playBeep(400, 0.15, 'sine')
    setTimeout(() => playBeep(300, 0.15, 'sine'), 80)
  } catch (error) {
    console.warn('Could not play stop sound:', error)
  }
}

/**
 * Play a celebration sound - for finishing workouts
 */
export const playCelebrationSound = () => {
  if (!areSoundsEnabled()) return
  
  try {
    // Ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playBeep(freq, 0.15, 'sine'), i * 100)
    })
  } catch (error) {
    console.warn('Could not play celebration sound:', error)
  }
}

/**
 * Play rest timer complete sound - subtle bell chime
 */
export const playRestCompleteSound = () => {
  if (!areSoundsEnabled()) return
  
  try {
    // Single quick bell chime - like a notification
    playBeep(1000, 0.2, 'sine')
  } catch (error) {
    console.warn('Could not play rest complete sound:', error)
  }
}

