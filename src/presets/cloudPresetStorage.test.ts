import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
  }
  return { from: vi.fn(), query }
})

vi.mock('@/lib/supabase', () => ({
  supabase: { from: supabaseMocks.from },
}))

import { readCloudPresetSnapshot, removeCloudPreset, saveCloudPreset } from './cloudPresetStorage'

const tracks = {
  'rain-on-window': { volume: 0.5, role: 'foreground' },
}

describe('cloud preset storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMocks.from.mockReturnValue(supabaseMocks.query)
    supabaseMocks.query.select.mockReturnValue(supabaseMocks.query)
    supabaseMocks.query.update.mockReturnValue(supabaseMocks.query)
  })

  it('separates active presets from soft-deletion tombstones', async () => {
    supabaseMocks.query.order.mockResolvedValue({
      data: [
        {
          id: 'preset-active',
          name: 'Active',
          description: null,
          icon: null,
          tracks,
          deleted_at: null,
        },
        {
          id: 'preset-removed',
          name: 'Removed',
          description: null,
          icon: null,
          tracks,
          deleted_at: '2026-09-07T19:00:00.000Z',
        },
      ],
      error: null,
    })

    const snapshot = await readCloudPresetSnapshot()

    expect(snapshot.presets.map((preset) => preset.id)).toEqual(['preset-active'])
    expect(snapshot.deletedPresetIds).toEqual(new Set(['preset-removed']))
  })

  it('soft deletes a preset by setting deleted_at', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-07T19:00:00.000Z'))
    supabaseMocks.query.eq.mockResolvedValue({ error: null })

    await removeCloudPreset('preset-evening')

    expect(supabaseMocks.query.update).toHaveBeenCalledWith({
      deleted_at: '2026-09-07T19:00:00.000Z',
    })
    expect(supabaseMocks.query.eq).toHaveBeenCalledWith('id', 'preset-evening')
    vi.useRealTimers()
  })

  it('saves active presets with a cleared deletion marker', async () => {
    supabaseMocks.query.upsert.mockResolvedValue({ error: null })

    await saveCloudPreset('user-one', {
      id: 'preset-evening',
      name: 'Evening',
      tracks: { 'rain-on-window': { volume: 0.5, role: 'foreground' } },
    })

    expect(supabaseMocks.query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: null }),
    )
  })
})
