export interface MoodDefinition {
  id: string
  icon: string
  tracks: Record<string, number>
}

export interface MoodHistoryItem {
  id: string
  moodIds: string[]
  timestamp: number
  tracks: Record<string, number>
}

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  {
    id: 'insomnia',
    icon: '🌙',
    tracks: {
      'rain-on-window': 0.5,
      'brown-noise': 0.6,
      'night-crickets-calm': 0.3,
    },
  },
  {
    id: 'anxiety',
    icon: '🕯️',
    tracks: {
      'brown-noise': 0.65,
      'ocean-waves-gentle': 0.45,
    },
  },
  {
    id: 'exhaustion',
    icon: '🌧️',
    tracks: {
      'rain-soft-thunder': 0.5,
      'forest-brook-summer': 0.45,
    },
  },
  {
    id: 'focus',
    icon: '☕',
    tracks: {
      'coffee-shop-ambience': 0.55,
      'pink-noise': 0.35,
    },
  },
  {
    id: 'deep-calm',
    icon: '🧘',
    tracks: {
      'forest-brook-gentle': 0.5,
      'book-pages-turning': 0.4,
      'pink-noise': 0.3,
    },
  },
  {
    id: 'night-journey',
    icon: '🚂',
    tracks: {
      'train-cabin-interior': 0.6,
      'rain-under-umbrella': 0.4,
    },
  },
]

export const LOCAL_STORAGE_KEY_MOOD_HISTORY = 'tiselumi:mood_history_v1'
export const LOCAL_STORAGE_KEY_MOOD_SEEN = 'tiselumi:mood_onboarding_seen_v1'

/**
 * Combine multiple selected moods into a unified, balanced track volume mapping.
 */
export function blendMoodTracks(moodIds: string[]): Record<string, number> {
  if (moodIds.length === 0) return {}

  const activeMoods = MOOD_DEFINITIONS.filter((m) => moodIds.includes(m.id))
  if (activeMoods.length === 0) return {}

  const trackWeights: Record<string, number[]> = {}

  for (const mood of activeMoods) {
    for (const [soundId, vol] of Object.entries(mood.tracks)) {
      if (!trackWeights[soundId]) {
        trackWeights[soundId] = []
      }
      trackWeights[soundId].push(vol)
    }
  }

  const result: Record<string, number> = {}
  for (const [soundId, vols] of Object.entries(trackWeights)) {
    const avg = vols.reduce((a, b) => a + b, 0) / vols.length
    result[soundId] = Math.round(Math.min(0.85, Math.max(0.15, avg)) * 100) / 100
  }

  return result
}

export function loadMoodHistory(): MoodHistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_MOOD_HISTORY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is MoodHistoryItem =>
            Boolean(
              item &&
              typeof item.id === 'string' &&
              Array.isArray(item.moodIds) &&
              item.moodIds.every((id: unknown) => typeof id === 'string') &&
              typeof item.timestamp === 'number' &&
              item.tracks &&
              typeof item.tracks === 'object',
            ),
          )
          .slice(0, 5)
      }
    }
  } catch {
    // Fallback
  }
  return []
}

export function saveMoodHistoryItem(
  moodIds: string[],
  tracks: Record<string, number>,
): MoodHistoryItem[] {
  if (moodIds.length === 0) return loadMoodHistory()

  const current = loadMoodHistory()
  const newItem: MoodHistoryItem = {
    id: `mood-${Date.now()}`,
    moodIds: [...moodIds],
    timestamp: Date.now(),
    tracks,
  }

  const top = current[0]
  const isDuplicate =
    top && top.moodIds.length === moodIds.length && top.moodIds.every((id) => moodIds.includes(id))

  const updated = isDuplicate ? [newItem, ...current.slice(1)] : [newItem, ...current].slice(0, 5)

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_MOOD_HISTORY, JSON.stringify(updated))
  } catch {
    // Ignore
  }

  return updated
}
