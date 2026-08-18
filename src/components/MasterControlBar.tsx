import { useState } from 'react'

import { SOUND_CATALOG } from '@/audio/catalog'
import { useI18n } from '@/i18n/useI18n'
import { SleepTimerControl } from './SleepTimerControl'

interface MasterControlBarProps {
  playingSounds: Set<string>
  trackVolumes: Record<string, number>
  masterVolume: number
  timerMinutesLeft: number | null
  isTimerActive: boolean
  onMasterVolumeChange: (vol: number) => void
  onTrackVolumeChange: (soundId: string, vol: number) => void
  onToggleSound: (soundId: string) => void
  onStopAll: () => void
  onStartTimer: (minutes: number) => void
  onCancelTimer: () => void
}

export function MasterControlBar({
  playingSounds,
  trackVolumes,
  masterVolume,
  timerMinutesLeft,
  isTimerActive,
  onMasterVolumeChange,
  onTrackVolumeChange,
  onToggleSound,
  onStopAll,
  onStartTimer,
  onCancelTimer,
}: MasterControlBarProps) {
  const { t } = useI18n()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const activeCount = playingSounds.size
  if (activeCount === 0) {
    return null
  }

  const activeTracks = SOUND_CATALOG.filter((s) => playingSounds.has(s.id))

  return (
    <aside
      aria-label={t.masterBar.masterControl}
      className="fixed bottom-5 left-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 transition-all duration-300"
    >
      {/* Expandable Active Mix Drawer */}
      {isDrawerOpen && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mb-3 max-h-72 overflow-y-auto rounded-3xl border border-[#10231d]/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#10231d]/5 pb-3">
            <span className="text-xs font-semibold text-[#10231d]">
              {t.masterBar.activeTracksTitle} ({activeCount})
            </span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 text-xs text-[#5f746d] hover:text-[#10231d]"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {activeTracks.map((track) => {
              const localizedSound = t.sounds[track.id]
              const title = localizedSound?.title ?? track.title
              const vol = trackVolumes[track.id] ?? 0.5

              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f0e8]/70 p-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="shrink-0 text-xl">{track.icon}</span>
                    <span className="truncate text-xs font-medium text-[#10231d]">{title}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={vol}
                      onChange={(e) => onTrackVolumeChange(track.id, parseFloat(e.target.value))}
                      aria-label={`${title} volume`}
                      className="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-[#dedad0] accent-[#10231d] sm:w-32"
                    />
                    <span className="w-8 text-right font-mono text-[11px] text-[#5f746d]">
                      {Math.round(vol * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSound(track.id)}
                      aria-label={`Stop ${title}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10231d]/10 text-xs text-[#10231d] transition-colors hover:bg-[#10231d] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Bottom Control Bar */}
      <div className="rounded-3xl border border-[#10231d]/10 bg-white/95 px-5 py-3.5 shadow-[0_20px_50px_rgba(16,35,29,0.18)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Active sounds badge & stop button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onStopAll}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10231d] text-white shadow-sm transition-all hover:scale-105 hover:bg-[#25453a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
              aria-label={t.masterBar.stopAll}
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>

            <div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className="group flex items-center gap-1.5 text-left focus:outline-none"
              >
                <span className="text-xs font-semibold text-[#10231d] group-hover:underline">
                  {activeCount}{' '}
                  {activeCount === 1
                    ? t.masterBar.soundPlayingSingle
                    : t.masterBar.soundPlayingPlural}
                </span>
                <span className="text-[10px] text-[#5f746d]">{isDrawerOpen ? '▲' : '▼'}</span>
              </button>
              <div className="text-[10px] text-[#5f746d]">{t.masterBar.masterControl}</div>
            </div>
          </div>

          {/* Center: Master Volume */}
          <div className="hidden max-w-[150px] flex-1 items-center gap-2.5 sm:flex">
            <svg
              className="h-4 w-4 shrink-0 text-[#5f746d]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              aria-label={t.masterBar.masterVolumeAria}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#e2ded5] accent-[#10231d]"
            />
          </div>

          {/* Right: Sleep Timer */}
          <SleepTimerControl
            minutesLeft={timerMinutesLeft}
            isActive={isTimerActive}
            onStartTimer={onStartTimer}
            onCancelTimer={onCancelTimer}
          />
        </div>
      </div>
    </aside>
  )
}
