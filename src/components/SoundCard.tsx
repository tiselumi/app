import type { SoundItem } from '@/audio/types'
import { useI18n } from '@/i18n/useI18n'

interface SoundCardProps {
  item: SoundItem
  isPlaying: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

export function SoundCard({ item, isPlaying, volume, onToggle, onVolumeChange }: SoundCardProps) {
  const { t } = useI18n()

  const localizedSound = t.sounds[item.id]
  const title = localizedSound?.title ?? item.title
  const subtitle = localizedSound?.subtitle ?? item.subtitle
  const description = localizedSound?.description ?? item.description

  const categoryName =
    item.category === 'nature'
      ? t.categories.nature
      : item.category === 'comfort'
        ? t.categories.comfort
        : item.category === 'noise'
          ? t.categories.noise
          : t.categories.asmr

  const isMuted = volume === 0

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(0.5)
    } else {
      onVolumeChange(0)
    }
  }

  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
        isPlaying
          ? 'border-[#10231d]/20 bg-white/95 shadow-[0_14px_36px_rgba(16,35,29,0.08)] ring-1 ring-[#10231d]/10'
          : 'border-[#10231d]/5 bg-white/60 hover:border-[#10231d]/15 hover:bg-white/85'
      }`}
    >
      <div className="min-w-0">
        {/* Top bar with icon, flexible title, and play button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${
                isPlaying
                  ? 'scale-105 bg-[#dfe9df] text-[#10231d] shadow-sm'
                  : 'bg-[#f4f0e8] text-[#40544d] group-hover:scale-105'
              }`}
              aria-hidden="true"
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                title={title}
                className="line-clamp-2 font-serif text-base leading-snug font-medium text-[#10231d]"
              >
                {title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-[#5f746d]">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-label={
              isPlaying ? `${t.soundCard.stopLabel} ${title}` : `${t.soundCard.playLabel} ${title}`
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] ${
              isPlaying
                ? 'scale-105 bg-[#10231d] text-white shadow-md hover:bg-[#1f3d33]'
                : 'bg-[#e7e3da] text-[#10231d] hover:bg-[#dedad0]'
            }`}
          >
            {isPlaying ? (
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
              </svg>
            )}
          </button>
        </div>

        {/* Status / Equalizer bar with fixed height to prevent card height jumping */}
        <div className="mt-2.5 flex h-5 items-center">
          {isPlaying ? (
            <div className="flex items-center gap-1 text-[#10231d]" aria-hidden="true">
              <span
                className="h-2 w-1 animate-pulse rounded-full bg-[#10231d]"
                style={{ animationDuration: '0.6s' }}
              />
              <span
                className="h-3.5 w-1 animate-pulse rounded-full bg-[#10231d]"
                style={{ animationDuration: '0.9s' }}
              />
              <span
                className="h-2 w-1 animate-pulse rounded-full bg-[#10231d]"
                style={{ animationDuration: '0.7s' }}
              />
              <span
                className="h-4 w-1 animate-pulse rounded-full bg-[#10231d]"
                style={{ animationDuration: '1.1s' }}
              />
              <span
                className="h-2.5 w-1 animate-pulse rounded-full bg-[#10231d]"
                style={{ animationDuration: '0.8s' }}
              />
              <span className="ml-2 text-[10px] font-semibold tracking-wider text-[#10231d] uppercase">
                Playing
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-transparent select-none">Idle</span>
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5f746d]">{description}</p>
      </div>

      {/* Footer bar with category tag & volume */}
      <div className="mt-4 border-t border-[#10231d]/5 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-md bg-[#10231d]/5 px-2 py-0.5 text-[10px] font-medium text-[#5f746d]">
            {categoryName}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMuteToggle}
              aria-label={isMuted ? t.soundCard.unmuteTrack : t.soundCard.muteTrack}
              className="p-0.5 text-[#5f746d] transition-colors hover:text-[#10231d]"
            >
              {isMuted ? (
                <svg
                  className="h-3.5 w-3.5 fill-none stroke-current"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5 fill-none stroke-current"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            <span className="font-mono text-[11px] text-[#5f746d]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label={`${title} ${t.soundCard.volumeAria}`}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#e2ded5] accent-[#10231d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
        />
      </div>
    </div>
  )
}
