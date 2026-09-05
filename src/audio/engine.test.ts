import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SoundEngine } from './engine'

describe('SoundEngine background playback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('connects an audio-focus media element before file playback', async () => {
    const createMediaElementSource = vi.spyOn(AudioContext.prototype, 'createMediaElementSource')
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play')
    const engine = new SoundEngine()

    await engine.playTrack('rain-on-window', 0.5)

    expect(createMediaElementSource).toHaveBeenCalledOnce()
    expect(play).toHaveBeenCalledOnce()

    engine.dispose()
  })

  it('connects the audio-focus media element for procedural noise', async () => {
    const createMediaElementSource = vi.spyOn(AudioContext.prototype, 'createMediaElementSource')
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play')
    const engine = new SoundEngine()

    await engine.playTrack('brown-noise', 0.5)

    expect(createMediaElementSource).toHaveBeenCalledOnce()
    expect(play).toHaveBeenCalledOnce()

    engine.dispose()
  })

  it('schedules and cancels the sleep fade on the audio clock', () => {
    const createGain = vi.spyOn(AudioContext.prototype, 'createGain')
    const engine = new SoundEngine()

    engine.scheduleSleepTimer(60)

    const timerGain = createGain.mock.results.at(1)?.value
    if (!timerGain) throw new Error('Timer gain was not created')

    expect(timerGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 60)

    engine.cancelSleepTimer()

    expect(timerGain.gain.cancelScheduledValues).toHaveBeenLastCalledWith(0)
    expect(timerGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(1, 0, 0.03)

    engine.dispose()
  })
})
