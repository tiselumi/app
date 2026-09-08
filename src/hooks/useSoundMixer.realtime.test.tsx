import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const cloudMocks = vi.hoisted(() => ({
  readCloudPresetSnapshot: vi.fn(),
  removeCloudPreset: vi.fn(),
  saveCloudPreset: vi.fn(),
}))

const realtimeMocks = vi.hoisted(() => ({
  subscribeToCloudPresetChanges: vi.fn(),
}))

vi.mock('@/presets/cloudPresetStorage', () => cloudMocks)
vi.mock('@/presets/realtimePresetSync', () => realtimeMocks)

import { useSoundMixer } from './useSoundMixer'

const remotePreset = {
  id: 'preset-remote',
  name: 'Remote soundscape',
  tracks: {
    'rain-on-window': { volume: 0.5, role: 'foreground' as const },
  },
}

describe('useSoundMixer Realtime synchronization', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    cloudMocks.saveCloudPreset.mockResolvedValue(undefined)
  })

  it('reconciles cloud soundscapes after a Realtime change and cleans up the channel', async () => {
    const unsubscribe = vi.fn()
    let onRealtimeChange: (() => void) | undefined
    realtimeMocks.subscribeToCloudPresetChanges.mockImplementation(
      (_userId: string, onChange: () => void) => {
        onRealtimeChange = onChange
        return unsubscribe
      },
    )
    cloudMocks.readCloudPresetSnapshot
      .mockResolvedValueOnce({ presets: [], deletedPresetIds: new Set<string>() })
      .mockResolvedValueOnce({ presets: [remotePreset], deletedPresetIds: new Set<string>() })

    const { result, unmount } = renderHook(() => useSoundMixer('user-one'))

    await waitFor(() => expect(cloudMocks.readCloudPresetSnapshot).toHaveBeenCalledOnce())
    expect(realtimeMocks.subscribeToCloudPresetChanges).toHaveBeenCalledWith(
      'user-one',
      expect.any(Function),
    )

    act(() => onRealtimeChange?.())

    await waitFor(() =>
      expect(result.current.presets.some((preset) => preset.id === remotePreset.id)).toBe(true),
    )
    expect(localStorage.getItem('tiselumi:custom_presets_v3:user:user-one')).toContain(
      remotePreset.name,
    )

    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
