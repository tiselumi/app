import type { Preset } from '@/audio/types'
import { useI18n } from '@/i18n/useI18n'

interface PresetsBarProps {
  presets: Preset[]
  onSelectPreset: (preset: Preset) => void
}

export function PresetsBar({ presets, onSelectPreset }: PresetsBarProps) {
  const { t } = useI18n()

  if (presets.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-[#5f746d] uppercase">
          {t.header.quickMixes}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const localizedPreset = t.presets[preset.id]
          const name = localizedPreset?.name ?? preset.name
          const description = localizedPreset?.description ?? preset.description

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              title={description}
              className="group inline-flex items-center gap-2 rounded-full border border-[#10231d]/10 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-[#10231d] shadow-xs backdrop-blur-xs transition-all hover:border-[#10231d]/25 hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
            >
              <span className="transition-transform group-hover:scale-110">
                {preset.icon ?? '✨'}
              </span>
              <span>{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
