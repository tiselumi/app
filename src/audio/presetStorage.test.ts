import { describe, expect, it, vi } from 'vitest'

import { createPresetId } from './presetStorage'

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
