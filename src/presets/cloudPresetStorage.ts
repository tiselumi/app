import type { Preset } from '@/audio/types'
import { normalizePreset } from '@/audio/presetStorage'
import { supabase } from '@/lib/supabase'

interface MixRow {
  id: string
  name: string
  description: string | null
  icon: string | null
  tracks: unknown
  deleted_at: string | null
}

export interface CloudPresetSnapshot {
  presets: Preset[]
  deletedPresetIds: Set<string>
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

function rowToPreset(row: MixRow): Preset | null {
  const preset = normalizePreset({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    tracks: row.tracks,
  })
  return preset?.id.startsWith('preset-') ? preset : null
}

export async function readCloudPresetSnapshot(): Promise<CloudPresetSnapshot> {
  const { data, error } = await requireSupabase()
    .from('mixes')
    .select('id, name, description, icon, tracks, deleted_at')
    .order('created_at', { ascending: true })

  if (error) throw error
  const presets: Preset[] = []
  const deletedPresetIds = new Set<string>()
  for (const row of (data ?? []) as MixRow[]) {
    const preset = rowToPreset(row)
    if (!preset) continue
    if (row.deleted_at) deletedPresetIds.add(preset.id)
    else presets.push(preset)
  }
  return { presets, deletedPresetIds }
}

export async function saveCloudPreset(userId: string, preset: Preset): Promise<void> {
  const { error } = await requireSupabase()
    .from('mixes')
    .upsert({
      id: preset.id,
      user_id: userId,
      name: preset.name,
      description: preset.description ?? null,
      icon: preset.icon ?? null,
      tracks: preset.tracks,
      deleted_at: null,
    })
  if (error) throw error
}

export async function removeCloudPreset(presetId: string): Promise<void> {
  const { error } = await requireSupabase()
    .from('mixes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', presetId)
  if (error) throw error
}
