import { useState } from 'react'

import { useI18n } from '@/i18n/useI18n'

interface SleepTimerControlProps {
  minutesLeft: number | null
  isActive: boolean
  onStartTimer: (minutes: number) => void
  onCancelTimer: () => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 90]

export function SleepTimerControl({
  minutesLeft,
  isActive,
  onStartTimer,
  onCancelTimer,
}: SleepTimerControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] ${
          isActive
            ? 'bg-[#10231d] text-white shadow-sm'
            : 'bg-[#e7e3da] text-[#10231d] hover:bg-[#dedad0]'
        }`}
        aria-label={t.sleepTimer.heading}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {isActive && minutesLeft !== null
            ? `${minutesLeft} ${t.sleepTimer.minLeft}`
            : t.sleepTimer.buttonLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full z-30 mb-3 w-52 rounded-2xl border border-[#10231d]/10 bg-white p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#10231d]/5 pb-2">
            <span className="text-xs font-semibold text-[#10231d]">{t.sleepTimer.heading}</span>
            {isActive && (
              <button
                type="button"
                onClick={() => {
                  onCancelTimer()
                  setIsOpen(false)
                }}
                className="text-[11px] text-red-600 hover:underline"
              >
                {t.sleepTimer.turnOff}
              </button>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {TIMER_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  onStartTimer(mins)
                  setIsOpen(false)
                }}
                className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  isActive && minutesLeft === mins
                    ? 'bg-[#10231d] text-white'
                    : 'bg-[#f4f0e8] text-[#10231d] hover:bg-[#dfe9df]'
                }`}
              >
                {mins} {t.sleepTimer.minutesOption}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
