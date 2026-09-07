import { SOUND_CATALOG } from '@/audio/catalog'
import type { Preset, PresetTrack, SoundRole } from '@/audio/types'

export const LEGACY_PRESETS_KEY = 'tiselumi:custom_presets_v2'
export const GUEST_PRESETS_KEY = 'tiselumi:custom_presets_v3:guest'
const USER_PRESETS_KEY_PREFIX = 'tiselumi:custom_presets_v3:user:'
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

export function normalizePreset(value: unknown): Preset | null {
  if (!value || typeof value !== 'object') return null
  const p = value as Record<string, unknown>
  if (
    typeof p.id !== 'string' ||
    p.id.length === 0 ||
    p.id.length > 100 ||
    typeof p.name !== 'string' ||
    p.name.trim().length === 0 ||
    p.name.length > 80 ||
    (p.description !== undefined &&
      (typeof p.description !== 'string' || p.description.length > 280)) ||
    (p.icon !== undefined && (typeof p.icon !== 'string' || p.icon.length > 16)) ||
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
    name: p.name.trim(),
    description: typeof p.description === 'string' ? p.description : undefined,
    icon: typeof p.icon === 'string' ? p.icon : undefined,
    tracks,
  }
}

function parsePresets(raw: string | null): Preset[] {
  if (raw === null) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
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

export function getPresetsKey(userId: string | null): string {
  return userId ? `${USER_PRESETS_KEY_PREFIX}${userId}` : GUEST_PRESETS_KEY
}

export function readCustomPresets(userId: string | null): Preset[] {
  const key = getPresetsKey(userId)
  const current = localStorage.getItem(key)
  if (current !== null)
    return parsePresets(current).filter((preset) => preset.id.startsWith('preset-'))

  if (userId !== null) return []

  const legacy = parsePresets(localStorage.getItem(LEGACY_PRESETS_KEY)).filter((preset) =>
    preset.id.startsWith('preset-'),
  )
  if (legacy.length > 0) writeCustomPresets(null, legacy)
  return legacy
}

export function writeCustomPresets(userId: string | null, presets: Preset[]): void {
  localStorage.setItem(getPresetsKey(userId), JSON.stringify(presets))
}

export function clearGuestPresets(): void {
  localStorage.removeItem(GUEST_PRESETS_KEY)
  localStorage.removeItem(LEGACY_PRESETS_KEY)
}

/** @deprecated Use readCustomPresets for account-aware storage. */
export function readPresets(fallback: Preset[]): Preset[] {
  const presets = parsePresets(localStorage.getItem(LEGACY_PRESETS_KEY))
  return presets.length > 0 ? presets : fallback
}
