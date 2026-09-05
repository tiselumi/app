import { SOUND_CATALOG } from './catalog'

type MediaSessionAction = 'play' | 'pause' | 'stop'

interface AudioSessionNavigator extends Navigator {
  audioSession?: {
    type: 'ambient' | 'playback' | 'transient' | 'transient-solo' | 'auto' | 'play-and-record'
  }
}

interface MediaSessionCallbacks {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
}

function setActionHandler(
  session: MediaSession,
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null,
): void {
  try {
    session.setActionHandler(action, handler)
  } catch {
    // Browsers expose different subsets of Media Session actions.
  }
}

function buildTitle(soundIds: ReadonlySet<string>): string {
  const titles = SOUND_CATALOG.filter((sound) => soundIds.has(sound.id)).map((sound) => sound.title)

  if (titles.length === 0) return 'Calm soundscape'
  if (titles.length === 1) return titles[0] ?? 'Calm soundscape'
  return `${titles[0]} + ${titles.length - 1} more`
}

/**
 * Connect active playback to lock-screen, notification, headset, and keyboard
 * media controls when the browser supports them.
 */
export function connectMediaSession(
  soundIds: ReadonlySet<string>,
  isPaused: boolean,
  callbacks: MediaSessionCallbacks,
): () => void {
  if (!('mediaSession' in navigator)) return () => undefined

  const session = navigator.mediaSession
  const audioSession = (navigator as AudioSessionNavigator).audioSession

  if (audioSession) {
    try {
      audioSession.type = 'playback'
    } catch {
      // Audio Session is experimental and may be exposed as read-only.
    }
  }

  try {
    session.metadata = new MediaMetadata({
      title: buildTitle(soundIds),
      artist: 'Tiselumi',
      album: 'Calm soundscape',
    })
  } catch {
    // Metadata is optional; transport controls can still work without it.
  }

  session.playbackState = isPaused ? 'paused' : 'playing'

  setActionHandler(session, 'play', callbacks.onPlay)
  setActionHandler(session, 'pause', callbacks.onPause)
  setActionHandler(session, 'stop', callbacks.onStop)

  return () => {
    setActionHandler(session, 'play', null)
    setActionHandler(session, 'pause', null)
    setActionHandler(session, 'stop', null)
  }
}

export function clearMediaSession(): void {
  if (!('mediaSession' in navigator)) return

  const session = navigator.mediaSession
  session.playbackState = 'none'
  session.metadata = null
  setActionHandler(session, 'play', null)
  setActionHandler(session, 'pause', null)
  setActionHandler(session, 'stop', null)
}
