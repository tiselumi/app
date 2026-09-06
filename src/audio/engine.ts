import { SOUND_CATALOG } from './catalog'
import { createNoiseBuffer } from './noise'
import type { SoundItem, SoundRole } from './types'

const FOREGROUND_FILTER_FREQUENCY = 20_000
const BACKGROUND_FILTER_FREQUENCY = 6_000
const BACKGROUND_REVERB_LEVEL = 0.09
const ROLE_TRANSITION_SECONDS = 0.18

interface ActiveTrack {
  item: SoundItem
  sourceNode: AudioBufferSourceNode | null
  gainNode: GainNode
  filterNode: BiquadFilterNode
  dryGainNode: GainNode
  convolverNode: ConvolverNode
  reverbGainNode: GainNode
  buffer: AudioBuffer | null
  isPlaying: boolean
  targetVolume: number
  role: SoundRole
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private timerGain: GainNode | null = null
  private audioFocusElement: HTMLAudioElement | null = null
  private audioFocusSource: MediaElementAudioSourceNode | null = null
  private audioFocusGain: GainNode | null = null
  private audioFocusPlayPending = false
  private tracks: Map<string, ActiveTrack> = new Map()
  private isMasterMuted = false
  private masterVolume = 0.8
  private reverbImpulse: AudioBuffer | null = null

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime)
      this.timerGain = this.ctx.createGain()
      this.timerGain.gain.setValueAtTime(1, this.ctx.currentTime)
      this.masterGain.connect(this.timerGain)
      this.timerGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }

    return this.ctx
  }

  private createMediaElement(audioUrl: string): HTMLAudioElement {
    const element = document.createElement('audio')
    element.src = audioUrl
    element.loop = true
    element.preload = 'auto'
    element.setAttribute('playsinline', '')
    return element
  }

  /**
   * Build a short room impulse locally for ConvolverNode. Keeping it procedural
   * avoids another download and gives every background track the same calm space.
   */
  private getReverbImpulse(ctx: AudioContext): AudioBuffer {
    if (this.reverbImpulse) return this.reverbImpulse

    const durationSeconds = 1.25
    const length = Math.floor(ctx.sampleRate * durationSeconds)
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate)

    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const samples = impulse.getChannelData(channel)
      for (let index = 0; index < length; index += 1) {
        const progress = index / length
        samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 3.5)
      }
    }

    this.reverbImpulse = impulse
    return impulse
  }

  private startAudioFocusElement(): void {
    const ctx = this.getAudioContext()

    if (!this.audioFocusElement) {
      const element = this.createMediaElement('/sounds/rain-on-window.opus')
      const source = ctx.createMediaElementSource(element)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      source.connect(gain)
      if (this.masterGain) gain.connect(this.masterGain)

      this.audioFocusElement = element
      this.audioFocusSource = source
      this.audioFocusGain = gain
    }

    if (this.audioFocusElement.paused && !this.audioFocusPlayPending) {
      this.audioFocusPlayPending = true
      void this.audioFocusElement.play().then(
        () => {
          this.audioFocusPlayPending = false
        },
        () => {
          this.audioFocusPlayPending = false
          // A later user or system play action will retry the media element.
        },
      )
    }
  }

  private stopAudioFocusElement(): void {
    if (!this.audioFocusElement) return
    this.audioFocusPlayPending = false
    this.audioFocusElement.pause()
    try {
      this.audioFocusElement.currentTime = 0
    } catch {
      // The media metadata may not have loaded yet.
    }
  }

  private syncAudioFocusElement(): void {
    if ([...this.tracks.values()].some((track) => track.isPlaying)) {
      this.startAudioFocusElement()
    } else {
      this.stopAudioFocusElement()
    }
  }

  public async initTrack(item: SoundItem): Promise<ActiveTrack> {
    const existing = this.tracks.get(item.id)
    if (existing) return existing

    const ctx = this.getAudioContext()
    const gainNode = ctx.createGain()
    const filterNode = ctx.createBiquadFilter()
    const dryGainNode = ctx.createGain()
    const convolverNode = ctx.createConvolver()
    const reverbGainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    filterNode.type = 'lowpass'
    filterNode.frequency.setValueAtTime(FOREGROUND_FILTER_FREQUENCY, ctx.currentTime)
    filterNode.Q.setValueAtTime(0.5, ctx.currentTime)
    dryGainNode.gain.setValueAtTime(1, ctx.currentTime)
    convolverNode.buffer = this.getReverbImpulse(ctx)
    reverbGainNode.gain.setValueAtTime(0, ctx.currentTime)

    gainNode.connect(filterNode)
    filterNode.connect(dryGainNode)
    filterNode.connect(convolverNode)
    convolverNode.connect(reverbGainNode)
    if (this.masterGain) {
      dryGainNode.connect(this.masterGain)
      reverbGainNode.connect(this.masterGain)
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
      filterNode,
      dryGainNode,
      convolverNode,
      reverbGainNode,
      buffer,
      isPlaying: false,
      targetVolume: 0.6,
      role: 'foreground',
    }

    this.tracks.set(item.id, track)
    return track
  }

  public async playTrack(
    soundId: string,
    volume = 0.6,
    role: SoundRole = 'foreground',
  ): Promise<void> {
    const ctx = this.getAudioContext()
    // Chrome for Android grants audio focus and creates a media notification
    // only when an HTML media element participates in the Web Audio graph.
    // Start it before awaiting sound loading so the user gesture is preserved.
    this.startAudioFocusElement()
    let track = this.tracks.get(soundId)

    if (!track) {
      const item = SOUND_CATALOG.find((s) => s.id === soundId)
      if (!item) return
      track = await this.initTrack(item)
    }

    if (!track.buffer) {
      this.syncAudioFocusElement()
      return
    }

    track.targetVolume = volume
    this.applyTrackRole(track, role)

    if (!track.isPlaying) {
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

  private applyTrackRole(track: ActiveTrack, role: SoundRole): void {
    if (!this.ctx) return

    track.role = role
    const now = this.ctx.currentTime
    const cutoff = role === 'background' ? BACKGROUND_FILTER_FREQUENCY : FOREGROUND_FILTER_FREQUENCY
    const reverbLevel = role === 'background' ? BACKGROUND_REVERB_LEVEL : 0

    track.filterNode.frequency.cancelScheduledValues(now)
    track.filterNode.frequency.setValueAtTime(track.filterNode.frequency.value, now)
    track.filterNode.frequency.setTargetAtTime(cutoff, now, ROLE_TRANSITION_SECONDS)
    track.reverbGainNode.gain.cancelScheduledValues(now)
    track.reverbGainNode.gain.setValueAtTime(track.reverbGainNode.gain.value, now)
    track.reverbGainNode.gain.setTargetAtTime(reverbLevel, now, ROLE_TRANSITION_SECONDS)
  }

  public setTrackRole(soundId: string, role: SoundRole): void {
    const track = this.tracks.get(soundId)
    if (!track) return
    this.applyTrackRole(track, role)
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
    this.syncAudioFocusElement()

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

  /**
   * Schedule the sleep fade on the audio rendering clock. Unlike page timers,
   * this automation continues while Android throttles or freezes JavaScript.
   */
  public scheduleSleepTimer(durationSeconds: number): void {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return

    const ctx = this.getAudioContext()
    if (!this.timerGain) return

    const now = ctx.currentTime
    const endTime = now + durationSeconds
    const restoreEndTime = Math.min(now + 0.1, endTime)
    const fadeDuration = Math.min(30, durationSeconds / 2)
    const fadeStartTime = Math.max(restoreEndTime, endTime - fadeDuration)
    const gain = this.timerGain.gain

    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(1, restoreEndTime)
    gain.setValueAtTime(1, fadeStartTime)
    gain.linearRampToValueAtTime(0, endTime)
  }

  public cancelSleepTimer(): void {
    if (!this.ctx || !this.timerGain) return

    const now = this.ctx.currentTime
    const gain = this.timerGain.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.setTargetAtTime(1, now, 0.03)
  }

  public async pauseAll(): Promise<void> {
    this.audioFocusElement?.pause()
    if (this.ctx && this.ctx.state === 'running') {
      await this.ctx.suspend()
    }
  }

  public async resumeAll(): Promise<void> {
    this.syncAudioFocusElement()
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
  }

  public stopAll(): void {
    for (const soundId of this.tracks.keys()) {
      this.stopTrack(soundId)
    }
  }

  public dispose(): void {
    this.stopAll()
    this.stopAudioFocusElement()
    this.audioFocusSource?.disconnect()
    this.audioFocusGain?.disconnect()
    this.audioFocusElement?.removeAttribute('src')
    this.audioFocusElement?.load()
    this.audioFocusElement = null
    this.audioFocusSource = null
    this.audioFocusGain = null
    this.audioFocusPlayPending = false

    for (const track of this.tracks.values()) {
      track.gainNode.disconnect()
      track.filterNode.disconnect()
      track.dryGainNode.disconnect()
      track.convolverNode.disconnect()
      track.reverbGainNode.disconnect()
    }

    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
      this.masterGain = null
      this.timerGain = null
      this.reverbImpulse = null
    }
    this.tracks.clear()
  }
}

// Global singleton instance for the app
export const soundEngine = new SoundEngine()
