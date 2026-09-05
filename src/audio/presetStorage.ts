import { SOUND_CATALOG } from '@/audio/catalog'
import type { Preset } from '@/audio/types'

export const PRESETS_KEY = 'tiselumi:custom_presets_v2'
const soundIds = new Set(SOUND_CATALOG.map((sound) => sound.id))

function isPreset(value: unknown): value is Preset {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    p.name.length <= 80 &&
    (p.description === undefined || typeof p.description === 'string') &&
    (p.icon === undefined || typeof p.icon === 'string') &&
    !!p.tracks &&
    typeof p.tracks === 'object' &&
    !Array.isArray(p.tracks) &&
    Object.keys(p.tracks).length > 0 &&
    Object.entries(p.tracks).every(
      ([id, volume]) =>
        soundIds.has(id) &&
        typeof volume === 'number' &&
        Number.isFinite(volume) &&
        volume >= 0 &&
        volume <= 1,
    )
  )
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
  return data.filter(isPreset).filter((preset) => {
    if (seen.has(preset.id)) return false
    seen.add(preset.id)
    return true
  })
}
