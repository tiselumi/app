import { SOUND_CATALOG } from '@/audio/catalog'
import type { Preset, PresetTrack, SoundRole } from '@/audio/types'

export const PRESETS_KEY = 'tiselumi:custom_presets_v2'
const soundIds = new Set(SOUND_CATALOG.map((sound) => sound.id))

export function createPresetId(): string {
  const cryptoApi = globalThis.crypto

  if (typeof cryptoApi?.randomUUID === 'function') {
    return `preset-${cryptoApi.randomUUID()}`
  }

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const randomParts = cryptoApi.getRandomValues(new Uint32Array(4))
    const suffix = Array.from(randomParts, (part) => part.toString(36)).join('')
    return `preset-${suffix}`
  }

  return `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function normalizeTrack(value: unknown, role: SoundRole): PresetTrack | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 && value <= 1 ? { volume: value, role } : null
  }

  if (!value || typeof value !== 'object') return null
  const track = value as Record<string, unknown>
  if (
    typeof track.volume !== 'number' ||
    !Number.isFinite(track.volume) ||
    track.volume < 0 ||
    track.volume > 1 ||
    (track.role !== 'foreground' && track.role !== 'background')
  ) {
    return null
  }

  return { volume: track.volume, role: track.role }
}

function normalizePreset(value: unknown): Preset | null {
  if (!value || typeof value !== 'object') return null
  const p = value as Record<string, unknown>
  if (
    typeof p.id !== 'string' ||
    p.id.length === 0 ||
    typeof p.name !== 'string' ||
    p.name.trim().length === 0 ||
    p.name.length > 80 ||
    (p.description !== undefined && typeof p.description !== 'string') ||
    (p.icon !== undefined && typeof p.icon !== 'string') ||
    !p.tracks ||
    typeof p.tracks !== 'object' ||
    Array.isArray(p.tracks)
  ) {
    return null
  }

  const entries = Object.entries(p.tracks)
  if (entries.length === 0) return null

  const tracks: Record<string, PresetTrack> = {}
  let foregroundAssigned = false
  for (const [id, value] of entries) {
    if (!soundIds.has(id)) return null
    const defaultRole: SoundRole = foregroundAssigned ? 'background' : 'foreground'
    const track = normalizeTrack(value, defaultRole)
    if (!track) return null
    if (track.role === 'foreground') {
      if (foregroundAssigned) track.role = 'background'
      foregroundAssigned = true
    }
    tracks[id] = track
  }

  if (!foregroundAssigned) {
    const firstTrack = Object.values(tracks)[0]
    if (firstTrack) firstTrack.role = 'foreground'
  }

  return {
    id: p.id,
    name: p.name,
    description: typeof p.description === 'string' ? p.description : undefined,
    icon: typeof p.icon === 'string' ? p.icon : undefined,
    tracks,
  }
}

export function readPresets(fallback: Preset[]): Preset[] {
  const raw = localStorage.getItem(PRESETS_KEY)
  if (raw === null) return fallback
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return fallback
  }
  if (!Array.isArray(data)) return fallback
  const seen = new Set<string>()
  return data
    .flatMap((value) => {
      const preset = normalizePreset(value)
      return preset ? [preset] : []
    })
    .filter((preset) => {
      if (seen.has(preset.id)) return false
      seen.add(preset.id)
      return true
    })
}
