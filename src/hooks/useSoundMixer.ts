import { useCallback, useEffect, useState } from 'react'

import { SOUND_CATALOG } from '@/audio/catalog'
import { soundEngine } from '@/audio/engine'
import type { Preset } from '@/audio/types'

const LOCAL_STORAGE_KEY_VOLUMES = 'tiselumi:sound_volumes_v2'
const LOCAL_STORAGE_KEY_PRESETS = 'tiselumi:custom_presets_v2'

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'deep-calm',
    name: 'Deep Calm',
    icon: '🧘',
    description: 'Warm Brown Noise and soft rain for grounding anxiety',
    tracks: {
      'brown-noise': 0.65,
      'rain-on-window': 0.45,
    },
  },
  {
    id: 'night-sleeper-train',
    name: 'Night Sleeper Train',
    icon: '🚂',
    description: 'Cozy train cabin sway with rhythmic tracks and rain',
    tracks: {
      'train-cabin-interior': 0.55,
      'train-rail-clatter': 0.35,
      'rain-on-window': 0.3,
    },
  },
  {
    id: 'ocean-sanctuary',
    name: 'Ocean Sanctuary',
    icon: '🌊',
    description: 'Rolling ocean waves and morning coastal breeze',
    tracks: {
      'ocean-waves-gentle': 0.6,
      'ocean-waves-foam': 0.35,
      'ocean-waves-birds': 0.25,
    },
  },
  {
    id: 'forest-haven',
    name: 'Forest Haven',
    icon: '🌲',
    description: 'Babbling woodland brook with night meadow crickets',
    tracks: {
      'forest-brook-gentle': 0.55,
      'night-crickets-calm': 0.4,
      'pink-noise': 0.25,
    },
  },
  {
    id: 'midnight-coffee',
    name: 'Midnight Coffee',
    icon: '☕',
    description: 'Warm cafe atmosphere sheltered from rain',
    tracks: {
      'coffee-shop-ambience': 0.5,
      'rain-under-umbrella': 0.4,
    },
  },
  {
    id: 'bedtime-reading',
    name: 'Bedtime Reading',
    icon: '📖',
    description: 'Gentle page turns with soothing brown noise',
    tracks: {
      'book-pages-turning': 0.6,
      'brown-noise': 0.45,
    },
  },
]

export function useSoundMixer() {
  // Track volume map: soundId -> volume (0 to 1)
  const [trackVolumes, setTrackVolumes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_VOLUMES)
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    const initial: Record<string, number> = {}
    for (const s of SOUND_CATALOG) {
      initial[s.id] = 0.5
    }
    return initial
  })

  // Active playing sound IDs
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set())

  // Master volume (0 to 1)
  const [masterVolume, setMasterVolumeState] = useState(0.8)

  // Sleep timer in minutes remaining (null if inactive)
  const [timerMinutesLeft, setTimerMinutesLeft] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Presets
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRESETS)
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return DEFAULT_PRESETS
  })

  // Save volumes on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_VOLUMES, JSON.stringify(trackVolumes))
    } catch {
      // Ignore
    }
  }, [trackVolumes])

  // Save presets on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRESETS, JSON.stringify(presets))
    } catch {
      // Ignore
    }
  }, [presets])

  // Toggle individual sound
  const toggleSound = useCallback(
    async (soundId: string) => {
      const isCurrentlyPlaying = playingSounds.has(soundId)
      if (isCurrentlyPlaying) {
        soundEngine.stopTrack(soundId)
        setPlayingSounds((prev) => {
          const next = new Set(prev)
          next.delete(soundId)
          return next
        })
      } else {
        const vol = trackVolumes[soundId] ?? 0.5
        await soundEngine.playTrack(soundId, vol)
        setPlayingSounds((prev) => new Set(prev).add(soundId))
      }
    },
    [playingSounds, trackVolumes],
  )

  // Set track volume
  const setVolume = useCallback((soundId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setTrackVolumes((prev) => ({ ...prev, [soundId]: clamped }))
    soundEngine.setTrackVolume(soundId, clamped)
  }, [])

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setMasterVolumeState(clamped)
    soundEngine.setMasterVolume(clamped)
  }, [])

  // Stop all sounds
  const stopAll = useCallback(() => {
    soundEngine.stopAll()
    setPlayingSounds(new Set())
  }, [])

  // Play a preset
  const applyPreset = useCallback(
    async (preset: Preset) => {
      soundEngine.stopAll()
      const newPlaying = new Set<string>()

      for (const [soundId, vol] of Object.entries(preset.tracks)) {
        if (vol > 0) {
          setVolume(soundId, vol)
          await soundEngine.playTrack(soundId, vol)
          newPlaying.add(soundId)
        }
      }

      setPlayingSounds(newPlaying)
    },
    [setVolume],
  )

  // Sleep Timer countdown & gentle fade-out logic
  useEffect(() => {
    if (!isTimerActive || timerMinutesLeft === null) return

    const interval = window.setInterval(() => {
      setTimerMinutesLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Timer finished: Stop all sounds gently
          setIsTimerActive(false)
          soundEngine.stopAll()
          setPlayingSounds(new Set())
          return null
        }
        return prev - 1
      })
    }, 60000)

    return () => window.clearInterval(interval)
  }, [isTimerActive, timerMinutesLeft])

  const startSleepTimer = useCallback((minutes: number) => {
    setTimerMinutesLeft(minutes)
    setIsTimerActive(true)
  }, [])

  const cancelSleepTimer = useCallback(() => {
    setIsTimerActive(false)
    setTimerMinutesLeft(null)
  }, [])

  const isAnyPlaying = playingSounds.size > 0

  const saveCurrentPreset = useCallback(
    (name: string, description?: string, icon = '✨') => {
      const activeTracks: Record<string, number> = {}
      for (const soundId of playingSounds) {
        activeTracks[soundId] = trackVolumes[soundId] ?? 0.5
      }

      const newPreset: Preset = {
        id: `preset-${Date.now()}`,
        name,
        icon,
        description,
        tracks: activeTracks,
      }

      setPresets((prev) => [...prev, newPreset])
    },
    [playingSounds, trackVolumes],
  )

  const deletePreset = useCallback((presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId))
  }, [])

  return {
    catalog: SOUND_CATALOG,
    playingSounds,
    trackVolumes,
    masterVolume,
    isAnyPlaying,
    timerMinutesLeft,
    isTimerActive,
    presets,
    toggleSound,
    setVolume,
    setMasterVolume,
    stopAll,
    applyPreset,
    saveCurrentPreset,
    deletePreset,
    startSleepTimer,
    cancelSleepTimer,
  }
}
