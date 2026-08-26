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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      aria-pressed={isPlaying}
      aria-label={
        isPlaying ? `${t.soundCard.stopLabel} ${title}` : `${t.soundCard.playLabel} ${title}`
      }
      className={`group relative flex h-[106px] cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] sm:h-[110px] sm:p-4 ${
        isPlaying
          ? 'border-[#10231d] bg-[#10231d] text-white shadow-md'
          : 'border-[#10231d]/10 bg-white/80 text-[#10231d] hover:border-[#10231d]/25 hover:bg-white hover:shadow-xs'
      }`}
    >
      {/* Top Header: Icon + Title & Short Atmosphere Subtitle + Status (EQ / Play) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-200 ${
              isPlaying
                ? 'bg-white/15 text-white'
                : 'bg-[#f4f0e8] text-[#40544d] group-hover:scale-105'
            }`}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-sm font-medium">{title}</h3>
            {subtitle && (
              <p
                className={`truncate text-[11px] leading-tight ${
                  isPlaying ? 'text-white/70' : 'text-[#5f746d]'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {isPlaying ? (
          <div className="mt-1 flex shrink-0 items-center gap-0.5 text-white/90" aria-hidden="true">
            <span
              className="h-1.5 w-0.5 animate-pulse rounded-full bg-current"
              style={{ animationDuration: '0.6s' }}
            />
            <span
              className="h-2.5 w-0.5 animate-pulse rounded-full bg-current"
              style={{ animationDuration: '0.9s' }}
            />
            <span
              className="h-1.5 w-0.5 animate-pulse rounded-full bg-current"
              style={{ animationDuration: '0.7s' }}
            />
            <span
              className="h-3 w-0.5 animate-pulse rounded-full bg-current"
              style={{ animationDuration: '1.1s' }}
            />
          </div>
        ) : (
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10231d]/5 text-[10px] text-[#5f746d] transition-colors group-hover:bg-[#10231d]/10 group-hover:text-[#10231d]"
            aria-hidden="true"
          >
            ▶
          </span>
        )}
      </div>

      {/* Constant Volume Slider Row (Always visible and functional, 0px shift) */}
      <div
        className="flex h-5 items-center py-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label={`${title} ${t.soundCard.volumeAria}`}
          style={{
            background: isPlaying
              ? `linear-gradient(to right, #ffffff ${(volume * 100).toFixed(0)}%, rgba(255,255,255,0.2) ${(volume * 100).toFixed(0)}%)`
              : `linear-gradient(to right, #10231d ${(volume * 100).toFixed(0)}%, #e2ded5 ${(volume * 100).toFixed(0)}%)`,
          }}
          className={`h-1.5 w-full cursor-pointer appearance-none rounded-full focus:outline-none focus-visible:ring-2 ${
            isPlaying
              ? 'accent-white focus-visible:ring-white'
              : 'accent-[#10231d] focus-visible:ring-[#10231d]'
          }`}
        />
      </div>
    </div>
  )
}
