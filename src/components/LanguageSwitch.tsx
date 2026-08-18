import { useI18n } from '@/i18n/useI18n'
import type { Locale } from '@/i18n/types'

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n()

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
  ]

  return (
    <div
      role="group"
      aria-label={t.language.switchAria}
      className="inline-flex rounded-full border border-[#10231d]/10 bg-white/60 p-0.5 backdrop-blur-sm"
    >
      {languages.map((lang) => {
        const isSelected = locale === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLocale(lang.code)}
            aria-pressed={isSelected}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] ${
              isSelected
                ? 'bg-[#10231d] text-white shadow-xs'
                : 'text-[#5f746d] hover:text-[#10231d]'
            }`}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
