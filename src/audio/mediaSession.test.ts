import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearMediaSession, connectMediaSession } from './mediaSession'

class MockMediaMetadata {
  title = ''
  artist = ''
  album = ''

  constructor(init?: MediaMetadataInit) {
    this.title = init?.title ?? ''
    this.artist = init?.artist ?? ''
    this.album = init?.album ?? ''
  }
}

describe('media session', () => {
  const originalMediaSession = Object.getOwnPropertyDescriptor(navigator, 'mediaSession')
  const originalAudioSession = Object.getOwnPropertyDescriptor(navigator, 'audioSession')
  const handlers = new Map<string, (() => void) | null>()
  const mediaSession = {
    metadata: null,
    playbackState: 'none',
    setActionHandler: vi.fn((action: string, handler: (() => void) | null) => {
      handlers.set(action, handler)
    }),
  }
  const audioSession = { type: 'auto' }

  beforeEach(() => {
    handlers.clear()
    mediaSession.metadata = null
    mediaSession.playbackState = 'none'
    mediaSession.setActionHandler.mockClear()
    audioSession.type = 'auto'
    vi.stubGlobal('MediaMetadata', MockMediaMetadata)
    Object.defineProperty(navigator, 'mediaSession', {
      configurable: true,
      value: mediaSession,
    })
    Object.defineProperty(navigator, 'audioSession', {
      configurable: true,
      value: audioSession,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalMediaSession) {
      Object.defineProperty(navigator, 'mediaSession', originalMediaSession)
    } else {
      Reflect.deleteProperty(navigator, 'mediaSession')
    }
    if (originalAudioSession) {
      Object.defineProperty(navigator, 'audioSession', originalAudioSession)
    } else {
      Reflect.deleteProperty(navigator, 'audioSession')
    }
  })

  it('publishes the active mix and connects system transport controls', () => {
    const onPlay = vi.fn()
    const onPause = vi.fn()
    const onStop = vi.fn()

    const disconnect = connectMediaSession(new Set(['rain-on-window', 'brown-noise']), false, {
      onPlay,
      onPause,
      onStop,
    })

    expect(mediaSession.metadata).toMatchObject({
      title: 'Rain on Window + 1 more',
      artist: 'Tiselumi',
      album: 'Calm soundscape',
    })
    expect(mediaSession.playbackState).toBe('playing')
    expect(audioSession.type).toBe('playback')

    handlers.get('play')?.()
    handlers.get('pause')?.()
    handlers.get('stop')?.()

    expect(onPlay).toHaveBeenCalledOnce()
    expect(onPause).toHaveBeenCalledOnce()
    expect(onStop).toHaveBeenCalledOnce()

    disconnect()
    expect(handlers.get('play')).toBeNull()
    expect(handlers.get('pause')).toBeNull()
    expect(handlers.get('stop')).toBeNull()
  })

  it('reports paused playback and clears system media information when stopped', () => {
    connectMediaSession(new Set(['rain-on-window']), true, {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onStop: vi.fn(),
    })

    expect(mediaSession.playbackState).toBe('paused')
    expect(mediaSession.metadata).toMatchObject({ title: 'Rain on Window' })

    clearMediaSession()

    expect(mediaSession.playbackState).toBe('none')
    expect(mediaSession.metadata).toBeNull()
    expect(handlers.get('play')).toBeNull()
    expect(handlers.get('pause')).toBeNull()
    expect(handlers.get('stop')).toBeNull()
  })
})
