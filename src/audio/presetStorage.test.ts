import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createPresetId,
  getPresetsKey,
  readCustomPresets,
  readPresets,
  writeCustomPresets,
} from './presetStorage'

beforeEach(() => localStorage.clear())

describe('createPresetId', () => {
  it('uses a compatible fallback when randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto
    const getRandomValues = vi.fn((values: Uint32Array) => {
      values.set([1, 2, 3, 4])
      return values
    })

    vi.stubGlobal('crypto', { getRandomValues })

    expect(createPresetId()).toBe('preset-1234')
    expect(getRandomValues).toHaveBeenCalledOnce()

    vi.stubGlobal('crypto', originalCrypto)
  })
})

describe('readPresets', () => {
  it('migrates legacy volume-only tracks to foreground and background roles', () => {
    localStorage.setItem(
      'tiselumi:custom_presets_v2',
      JSON.stringify([
        {
          id: 'preset-legacy',
          name: 'Legacy scene',
          tracks: { 'rain-on-window': 0.6, 'night-crickets-calm': 0.3 },
        },
      ]),
    )

    expect(readPresets([])[0]?.tracks).toEqual({
      'rain-on-window': { volume: 0.6, role: 'foreground' },
      'night-crickets-calm': { volume: 0.3, role: 'background' },
    })
  })

  it('migrates only user-created mixes from the legacy shared collection', () => {
    localStorage.setItem(
      'tiselumi:custom_presets_v2',
      JSON.stringify([
        {
          id: 'deep-calm',
          name: 'Built in',
          tracks: { 'brown-noise': 0.5 },
        },
        {
          id: 'preset-personal',
          name: 'Personal',
          tracks: { 'rain-on-window': 0.5 },
        },
      ]),
    )

    expect(readCustomPresets(null).map((preset) => preset.id)).toEqual(['preset-personal'])
  })

  it('keeps cached mixes isolated by account', () => {
    const preset = {
      id: 'preset-one',
      name: 'One',
      tracks: { 'brown-noise': { volume: 0.5, role: 'foreground' as const } },
    }

    writeCustomPresets('user-one', [preset])

    expect(readCustomPresets('user-one')).toEqual([preset])
    expect(readCustomPresets('user-two')).toEqual([])
    expect(getPresetsKey('user-one')).not.toBe(getPresetsKey('user-two'))
  })
})
