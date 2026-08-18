import { SOUND_CATALOG } from './catalog'
import { createNoiseBuffer } from './noise'
import type { SoundItem } from './types'

interface ActiveTrack {
  item: SoundItem
  sourceNode: AudioBufferSourceNode | null
  gainNode: GainNode
  buffer: AudioBuffer | null
  isPlaying: boolean
  targetVolume: number
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private tracks: Map<string, ActiveTrack> = new Map()
  private isMasterMuted = false
  private masterVolume = 0.8

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }

    return this.ctx
  }

  public async initTrack(item: SoundItem): Promise<ActiveTrack> {
    const existing = this.tracks.get(item.id)
    if (existing) return existing

    const ctx = this.getAudioContext()
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, ctx.currentTime)

    if (this.masterGain) {
      gainNode.connect(this.masterGain)
    }

    let buffer: AudioBuffer | null = null
    if (item.sourceType === 'procedural-noise' && item.noiseType) {
      buffer = createNoiseBuffer(ctx, item.noiseType, 6)
    } else if (item.audioUrl) {
      try {
        const response = await fetch(item.audioUrl)
        const arrayBuf = await response.arrayBuffer()
        buffer = await ctx.decodeAudioData(arrayBuf)
      } catch (err) {
        console.error(`Failed to load audio for sound ${item.id}:`, err)
      }
    }

    const track: ActiveTrack = {
      item,
      sourceNode: null,
      gainNode,
      buffer,
      isPlaying: false,
      targetVolume: 0.6,
    }

    this.tracks.set(item.id, track)
    return track
  }

  public async playTrack(soundId: string, volume = 0.6): Promise<void> {
    const ctx = this.getAudioContext()
    let track = this.tracks.get(soundId)

    if (!track) {
      const item = SOUND_CATALOG.find((s) => s.id === soundId)
      if (!item) return
      track = await this.initTrack(item)
    }

    if (!track.buffer) return

    track.targetVolume = volume

    if (!track.isPlaying) {
      // Create new buffer source node
      const source = ctx.createBufferSource()
      source.buffer = track.buffer
      source.loop = true
      source.connect(track.gainNode)
      source.start()

      track.sourceNode = source
      track.isPlaying = true
    }

    // Smooth fade-in
    const now = ctx.currentTime
    track.gainNode.gain.cancelScheduledValues(now)
    track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now)
    track.gainNode.gain.setTargetAtTime(volume, now, 0.05)
  }

  public stopTrack(soundId: string): void {
    const track = this.tracks.get(soundId)
    if (!track || !this.ctx || !track.isPlaying) return

    const now = this.ctx.currentTime
    track.targetVolume = 0

    // Smooth fade-out before disconnect
    track.gainNode.gain.cancelScheduledValues(now)
    track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now)
    track.gainNode.gain.setTargetAtTime(0, now, 0.05)

    const sourceToStop = track.sourceNode
    track.sourceNode = null
    track.isPlaying = false

    // Stop after fade
    window.setTimeout(() => {
      if (sourceToStop) {
        try {
          sourceToStop.stop()
          sourceToStop.disconnect()
        } catch {
          // Already stopped
        }
      }
    }, 150)
  }

  public setTrackVolume(soundId: string, volume: number): void {
    const track = this.tracks.get(soundId)
    if (!track || !this.ctx) return

    track.targetVolume = Math.max(0, Math.min(1, volume))

    if (track.isPlaying) {
      const now = this.ctx.currentTime
      track.gainNode.gain.cancelScheduledValues(now)
      track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now)
      track.gainNode.gain.setTargetAtTime(track.targetVolume, now, 0.03)
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (!this.ctx || !this.masterGain) return

    const effectiveVolume = this.isMasterMuted ? 0 : this.masterVolume
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.setTargetAtTime(effectiveVolume, now, 0.03)
  }

  public getMasterVolume(): number {
    return this.masterVolume
  }

  public stopAll(): void {
    for (const soundId of this.tracks.keys()) {
      this.stopTrack(soundId)
    }
  }

  public dispose(): void {
    this.stopAll()
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
      this.masterGain = null
    }
    this.tracks.clear()
  }
}

// Global singleton instance for the app
export const soundEngine = new SoundEngine()
