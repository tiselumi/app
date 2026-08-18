import type { SoundFilterCategory } from '@/audio/types'
import { useI18n } from '@/i18n/useI18n'

interface CategoryFilterBarProps {
  activeCategory: SoundFilterCategory
  onSelectCategory: (category: SoundFilterCategory) => void
  categoryCounts: Record<SoundFilterCategory, number>
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CategoryFilterBar({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  searchQuery,
  onSearchChange,
}: CategoryFilterBarProps) {
  const { t } = useI18n()

  const categories: { id: SoundFilterCategory; label: string; icon: string }[] = [
    { id: 'all', label: t.categories.all, icon: '✨' },
    { id: 'nature', label: t.categories.nature, icon: '🌧️' },
    { id: 'comfort', label: t.categories.comfort, icon: '☕' },
    { id: 'noise', label: t.categories.noise, icon: '🧘' },
    { id: 'asmr', label: t.categories.asmr, icon: '📖' },
  ]

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f746d]">
          <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.soundSection.searchPlaceholder}
          aria-label={t.soundSection.searchPlaceholder}
          className="w-full rounded-2xl border border-[#10231d]/10 bg-white/80 py-3 pr-10 pl-11 text-sm text-[#10231d] shadow-sm backdrop-blur transition-all placeholder:text-[#5f746d]/60 focus:border-[#10231d]/30 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
        />
        {searchQuery.trim() !== '' && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label={t.soundSection.clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5f746d] hover:text-[#10231d]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10231d]/10 text-xs font-bold">
              ✕
            </span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div
        role="tablist"
        aria-label="Sound category filter"
        className="flex flex-wrap items-center gap-2"
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id
          const count = categoryCounts[cat.id] ?? 0

          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] ${
                isSelected
                  ? 'scale-[1.02] bg-[#10231d] text-white shadow-sm'
                  : 'border border-[#10231d]/10 bg-white/70 text-[#40544d] hover:border-[#10231d]/20 hover:bg-white hover:text-[#10231d]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#10231d]/10 text-[#5f746d]'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
