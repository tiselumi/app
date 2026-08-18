export type SoundCategory = 'nature' | 'comfort' | 'noise' | 'asmr'

export type SoundFilterCategory = 'all' | SoundCategory

export type SoundSourceType = 'procedural-noise' | 'audio-file'

export interface SoundItem {
  id: string
  title: string
  subtitle: string
  category: SoundCategory
  sourceType: SoundSourceType
  noiseType?: 'white' | 'pink' | 'brown'
  audioUrl?: string
  icon: string
  description: string
  license: string
}

export interface SoundTrackState {
  soundId: string
  isPlaying: boolean
  volume: number // 0 to 1
}

export interface Preset {
  id: string
  name: string
  description?: string
  icon?: string
  tracks: Record<string, number> // soundId -> volume (if included in preset)
}
