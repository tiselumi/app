import { useCallback, useEffect, useState } from 'react'

import { SOUND_CATALOG } from '@/audio/catalog'
import { soundEngine } from '@/audio/engine'
import { PRESETS_KEY, readPresets } from '@/audio/presetStorage'
import type { Preset } from '@/audio/types'

const LOCAL_STORAGE_KEY_VOLUMES = 'tiselumi:sound_volumes_v2'

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

  // Master pause state (preserves active tracks and volumes without resetting)
  const [isPaused, setIsPaused] = useState(false)

  // Master volume (0 to 1)
  const [masterVolume, setMasterVolumeState] = useState(0.8)

  // Sleep timer in seconds remaining (null if inactive).
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null)
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Presets
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      return readPresets(DEFAULT_PRESETS)
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

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key !== PRESETS_KEY && event.key !== null) return
      try {
        setPresets(readPresets(DEFAULT_PRESETS))
      } catch {
        /* Keep current mixes */
      }
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  // Toggle master play/pause
  const togglePlayPause = useCallback(async () => {
    if (playingSounds.size === 0) return
    if (isPaused) {
      await soundEngine.resumeAll()
      setIsPaused(false)
    } else {
      await soundEngine.pauseAll()
      setIsPaused(true)
    }
  }, [isPaused, playingSounds.size])

  // Toggle individual sound
  const toggleSound = useCallback(
    async (soundId: string) => {
      const isCurrentlyPlaying = playingSounds.has(soundId)
      if (isCurrentlyPlaying) {
        soundEngine.stopTrack(soundId)
        setPlayingSounds((prev) => {
          const next = new Set(prev)
          next.delete(soundId)
          if (next.size === 0) {
            setIsPaused(false)
          }
          return next
        })
      } else {
        if (isPaused) {
          await soundEngine.resumeAll()
          setIsPaused(false)
        }
        const vol = trackVolumes[soundId] ?? 0.5
        await soundEngine.playTrack(soundId, vol)
        setPlayingSounds((prev) => new Set(prev).add(soundId))
      }
    },
    [isPaused, playingSounds, trackVolumes],
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

  // Stop all sounds and reset state
  const stopAll = useCallback(() => {
    soundEngine.stopAll()
    if (isPaused) {
      void soundEngine.resumeAll()
    }
    setIsPaused(false)
    setPlayingSounds(new Set())
  }, [isPaused])

  // Play a preset
  const applyPreset = useCallback(
    async (preset: Preset) => {
      soundEngine.stopAll()
      if (isPaused) {
        await soundEngine.resumeAll()
        setIsPaused(false)
      }
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
    [isPaused, setVolume],
  )

  // Apply raw tracks (e.g. from mood matcher)
  const applyTracks = useCallback(
    async (tracks: Record<string, number>) => {
      soundEngine.stopAll()
      if (isPaused) {
        await soundEngine.resumeAll()
        setIsPaused(false)
      }
      const newPlaying = new Set<string>()

      for (const [soundId, vol] of Object.entries(tracks)) {
        if (vol > 0) {
          setVolume(soundId, vol)
          await soundEngine.playTrack(soundId, vol)
          newPlaying.add(soundId)
        }
      }

      setPlayingSounds(newPlaying)
    },
    [isPaused, setVolume],
  )

  // Sleep timer countdown. Deriving the remaining time from its end timestamp
  // keeps the display correct when the browser temporarily throttles intervals.
  useEffect(() => {
    if (!isTimerActive || timerEndsAt === null) return

    const updateTimer = () => {
      const secondsLeft = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000))
      if (secondsLeft === 0) {
        setIsTimerActive(false)
        setTimerEndsAt(null)
        setTimerSecondsLeft(null)
        soundEngine.stopAll()
        setPlayingSounds(new Set())
        return
      }
      setTimerSecondsLeft(secondsLeft)
    }

    updateTimer()
    const interval = window.setInterval(updateTimer, 250)

    return () => window.clearInterval(interval)
  }, [isTimerActive, timerEndsAt])

  const startSleepTimer = useCallback((durationSeconds: number) => {
    const seconds = Math.floor(durationSeconds)
    if (!Number.isFinite(seconds) || seconds <= 0) return

    setTimerSecondsLeft(seconds)
    setTimerEndsAt(Date.now() + seconds * 1000)
    setIsTimerActive(true)
  }, [])

  const cancelSleepTimer = useCallback(() => {
    setIsTimerActive(false)
    setTimerSecondsLeft(null)
    setTimerEndsAt(null)
  }, [])

  const isAnyPlaying = playingSounds.size > 0

  const saveCurrentPreset = useCallback(
    (name: string, description?: string, icon = '✨') => {
      if (!name.trim() || name.trim().length > 80 || playingSounds.size === 0) return false
      const activeTracks: Record<string, number> = {}
      for (const soundId of playingSounds) {
        activeTracks[soundId] = trackVolumes[soundId] ?? 0.5
      }

      const newPreset: Preset = {
        id: `preset-${crypto.randomUUID()}`,
        name: name.trim(),
        icon,
        description,
        tracks: activeTracks,
      }

      try {
        const next = [...readPresets(DEFAULT_PRESETS), newPreset]
        localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
        setPresets(next)
        return true
      } catch {
        return false
      }
    },
    [playingSounds, trackVolumes],
  )

  const deletePreset = useCallback((presetId: string) => {
    try {
      const next = readPresets(DEFAULT_PRESETS).filter((p) => p.id !== presetId)
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
      setPresets(next)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    catalog: SOUND_CATALOG,
    playingSounds,
    trackVolumes,
    masterVolume,
    isAnyPlaying,
    isPaused,
    timerSecondsLeft,
    isTimerActive,
    presets,
    toggleSound,
    togglePlayPause,
    setVolume,
    setMasterVolume,
    stopAll,
    applyPreset,
    applyTracks,
    saveCurrentPreset,
    deletePreset,
    startSleepTimer,
    cancelSleepTimer,
  }
}
