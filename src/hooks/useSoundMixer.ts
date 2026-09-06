import { useCallback, useEffect, useState } from 'react'

import { SOUND_CATALOG } from '@/audio/catalog'
import { soundEngine } from '@/audio/engine'
import { clearMediaSession, connectMediaSession } from '@/audio/mediaSession'
import { PRESETS_KEY, createPresetId, readPresets } from '@/audio/presetStorage'
import type { Preset, PresetTrack, SoundRole } from '@/audio/types'

const LOCAL_STORAGE_KEY_VOLUMES = 'tiselumi:sound_volumes_v2'
const DEFAULT_BACKGROUND_VOLUME = 0.3

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'deep-calm',
    name: 'Deep Calm',
    icon: '🧘',
    description: 'Warm Brown Noise and soft rain for grounding anxiety',
    tracks: {
      'brown-noise': { volume: 0.65, role: 'foreground' },
      'rain-on-window': { volume: 0.3, role: 'background' },
    },
  },
  {
    id: 'night-sleeper-train',
    name: 'Night Sleeper Train',
    icon: '🚂',
    description: 'Cozy train cabin sway with rhythmic tracks and rain',
    tracks: {
      'train-cabin-interior': { volume: 0.55, role: 'foreground' },
      'train-rail-clatter': { volume: 0.3, role: 'background' },
      'rain-on-window': { volume: 0.25, role: 'background' },
    },
  },
  {
    id: 'ocean-sanctuary',
    name: 'Ocean Sanctuary',
    icon: '🌊',
    description: 'Rolling ocean waves and morning coastal breeze',
    tracks: {
      'ocean-waves-gentle': { volume: 0.6, role: 'foreground' },
      'ocean-waves-foam': { volume: 0.3, role: 'background' },
      'ocean-waves-birds': { volume: 0.22, role: 'background' },
    },
  },
  {
    id: 'forest-haven',
    name: 'Forest Haven',
    icon: '🌲',
    description: 'Babbling woodland brook with night meadow crickets',
    tracks: {
      'forest-brook-gentle': { volume: 0.55, role: 'foreground' },
      'night-crickets-calm': { volume: 0.3, role: 'background' },
      'pink-noise': { volume: 0.22, role: 'background' },
    },
  },
  {
    id: 'midnight-coffee',
    name: 'Midnight Coffee',
    icon: '☕',
    description: 'Warm cafe atmosphere sheltered from rain',
    tracks: {
      'coffee-shop-ambience': { volume: 0.5, role: 'foreground' },
      'rain-under-umbrella': { volume: 0.3, role: 'background' },
    },
  },
  {
    id: 'bedtime-reading',
    name: 'Bedtime Reading',
    icon: '📖',
    description: 'Gentle page turns with soothing brown noise',
    tracks: {
      'book-pages-turning': { volume: 0.6, role: 'foreground' },
      'brown-noise': { volume: 0.3, role: 'background' },
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
  const [trackRoles, setTrackRoles] = useState<Record<string, SoundRole>>({})

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

  const pauseAll = useCallback(async () => {
    if (playingSounds.size === 0 || isPaused) return
    await soundEngine.pauseAll()
    setIsPaused(true)
  }, [isPaused, playingSounds.size])

  const resumeAll = useCallback(async () => {
    if (playingSounds.size === 0 || !isPaused) return
    await soundEngine.resumeAll()
    setIsPaused(false)
  }, [isPaused, playingSounds.size])

  // Toggle master play/pause
  const togglePlayPause = useCallback(async () => {
    if (isPaused) {
      await resumeAll()
    } else {
      await pauseAll()
    }
  }, [isPaused, pauseAll, resumeAll])

  // Toggle individual sound
  const toggleSound = useCallback(
    async (soundId: string) => {
      const isCurrentlyPlaying = playingSounds.has(soundId)
      if (isCurrentlyPlaying) {
        soundEngine.stopTrack(soundId)
        const nextPlaying = new Set(playingSounds)
        nextPlaying.delete(soundId)
        const nextRoles = { ...trackRoles }
        const removedRole = nextRoles[soundId]
        delete nextRoles[soundId]
        if (removedRole === 'foreground') {
          const replacementId = nextPlaying.values().next().value as string | undefined
          if (replacementId) {
            nextRoles[replacementId] = 'foreground'
            soundEngine.setTrackRole(replacementId, 'foreground')
          }
        }
        setTrackRoles(nextRoles)
        setPlayingSounds(nextPlaying)
        if (nextPlaying.size === 0) setIsPaused(false)
      } else {
        if (isPaused) {
          await soundEngine.resumeAll()
          setIsPaused(false)
        }
        const role: SoundRole = playingSounds.size === 0 ? 'foreground' : 'background'
        const savedVolume = trackVolumes[soundId] ?? 0.5
        const vol =
          role === 'background' ? Math.min(savedVolume, DEFAULT_BACKGROUND_VOLUME) : savedVolume
        if (vol !== savedVolume) setTrackVolumes((prev) => ({ ...prev, [soundId]: vol }))
        await soundEngine.playTrack(soundId, vol, role)
        setTrackRoles((prev) => ({ ...prev, [soundId]: role }))
        setPlayingSounds((prev) => new Set(prev).add(soundId))
      }
    },
    [isPaused, playingSounds, trackRoles, trackVolumes],
  )

  // Set track volume
  const setVolume = useCallback((soundId: string, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setTrackVolumes((prev) => ({ ...prev, [soundId]: clamped }))
    soundEngine.setTrackVolume(soundId, clamped)
  }, [])

  const setRole = useCallback(
    (soundId: string, role: SoundRole) => {
      if (!playingSounds.has(soundId) || trackRoles[soundId] === role) return

      setTrackRoles((previous) => {
        const next = { ...previous }
        if (role === 'foreground') {
          for (const [activeId, activeRole] of Object.entries(next)) {
            if (activeRole === 'foreground') {
              next[activeId] = 'background'
              soundEngine.setTrackRole(activeId, 'background')
            }
          }
          next[soundId] = 'foreground'
          soundEngine.setTrackRole(soundId, 'foreground')
          return next
        }

        const replacementId = [...playingSounds].find((activeId) => activeId !== soundId)
        if (!replacementId) return previous
        next[soundId] = 'background'
        next[replacementId] = 'foreground'
        soundEngine.setTrackRole(soundId, 'background')
        soundEngine.setTrackRole(replacementId, 'foreground')
        return next
      })
    },
    [playingSounds, trackRoles],
  )

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume))
    setMasterVolumeState(clamped)
    soundEngine.setMasterVolume(clamped)
  }, [])

  // Stop all sounds and reset state
  const stopAll = useCallback(() => {
    soundEngine.cancelSleepTimer()
    soundEngine.stopAll()
    setIsPaused(false)
    setPlayingSounds(new Set())
    setTrackRoles({})
    setIsTimerActive(false)
    setTimerSecondsLeft(null)
    setTimerEndsAt(null)
  }, [])

  // Keep playback controllable from lock screens, notification areas, headsets,
  // and hardware media keys. Returning to the foreground also recovers audio
  // contexts that a mobile browser interrupted while the page was hidden.
  useEffect(() => {
    if (playingSounds.size === 0) {
      clearMediaSession()
      return
    }

    const disconnect = connectMediaSession(playingSounds, isPaused, {
      onPlay: () => void soundEngine.resumeAll().then(() => setIsPaused(false)),
      onPause: () => void soundEngine.pauseAll().then(() => setIsPaused(true)),
      onStop: stopAll,
    })

    const recoverPlayback = () => {
      if (!document.hidden && !isPaused) {
        void soundEngine.resumeAll()
      }
    }

    document.addEventListener('visibilitychange', recoverPlayback)
    window.addEventListener('pageshow', recoverPlayback)

    return () => {
      disconnect()
      document.removeEventListener('visibilitychange', recoverPlayback)
      window.removeEventListener('pageshow', recoverPlayback)
    }
  }, [isPaused, playingSounds, stopAll])

  // Play a preset
  const applyPreset = useCallback(
    async (preset: Preset) => {
      soundEngine.stopAll()
      if (isPaused) {
        await soundEngine.resumeAll()
        setIsPaused(false)
      }
      const newPlaying = new Set<string>()

      const nextRoles: Record<string, SoundRole> = {}
      for (const [soundId, track] of Object.entries(preset.tracks)) {
        if (track.volume > 0) {
          setVolume(soundId, track.volume)
          await soundEngine.playTrack(soundId, track.volume, track.role)
          nextRoles[soundId] = track.role
          newPlaying.add(soundId)
        }
      }

      setTrackRoles(nextRoles)
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
      const nextRoles: Record<string, SoundRole> = {}

      for (const [index, [soundId, originalVolume]] of Object.entries(tracks).entries()) {
        const role: SoundRole = index === 0 ? 'foreground' : 'background'
        const vol =
          role === 'background'
            ? Math.min(originalVolume, DEFAULT_BACKGROUND_VOLUME)
            : originalVolume
        if (vol > 0) {
          setVolume(soundId, vol)
          await soundEngine.playTrack(soundId, vol, role)
          nextRoles[soundId] = role
          newPlaying.add(soundId)
        }
      }

      setTrackRoles(nextRoles)
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
        stopAll()
        return
      }
      setTimerSecondsLeft(secondsLeft)
    }

    updateTimer()
    const interval = window.setInterval(updateTimer, 250)

    return () => window.clearInterval(interval)
  }, [isTimerActive, stopAll, timerEndsAt])

  const startSleepTimer = useCallback((durationSeconds: number) => {
    const seconds = Math.floor(durationSeconds)
    if (!Number.isFinite(seconds) || seconds <= 0) return

    setTimerSecondsLeft(seconds)
    setTimerEndsAt(Date.now() + seconds * 1000)
    setIsTimerActive(true)
    soundEngine.scheduleSleepTimer(seconds)
  }, [])

  const cancelSleepTimer = useCallback(() => {
    soundEngine.cancelSleepTimer()
    setIsTimerActive(false)
    setTimerSecondsLeft(null)
    setTimerEndsAt(null)
  }, [])

  const isAnyPlaying = playingSounds.size > 0

  const saveCurrentPreset = useCallback(
    (name: string, description?: string, icon = '✨') => {
      if (!name.trim() || name.trim().length > 80 || playingSounds.size === 0) return false
      const activeTracks: Record<string, PresetTrack> = {}
      for (const soundId of playingSounds) {
        activeTracks[soundId] = {
          volume: trackVolumes[soundId] ?? 0.5,
          role: trackRoles[soundId] ?? 'background',
        }
      }

      try {
        const newPreset: Preset = {
          id: createPresetId(),
          name: name.trim(),
          icon,
          description,
          tracks: activeTracks,
        }
        const next = [...readPresets(DEFAULT_PRESETS), newPreset]
        localStorage.setItem(PRESETS_KEY, JSON.stringify(next))
        setPresets(next)
        return true
      } catch {
        return false
      }
    },
    [playingSounds, trackRoles, trackVolumes],
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
    trackRoles,
    masterVolume,
    isAnyPlaying,
    isPaused,
    timerSecondsLeft,
    isTimerActive,
    presets,
    toggleSound,
    togglePlayPause,
    setVolume,
    setRole,
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
