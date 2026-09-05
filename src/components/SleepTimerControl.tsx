import { useState } from 'react'

import { useI18n } from '@/i18n/useI18n'

interface SleepTimerControlProps {
  secondsLeft: number | null
  isActive: boolean
  onStartTimer: (durationSeconds: number) => void
  onCancelTimer: () => void
  onOpenChange?: (isOpen: boolean) => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 90]

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function parseDurationPart(value: string, maximum: number) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(maximum, parsed))
}

export function SleepTimerControl({
  secondsLeft,
  isActive,
  onStartTimer,
  onCancelTimer,
  onOpenChange,
}: SleepTimerControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('30')
  const [seconds, setSeconds] = useState('0')
  const { t } = useI18n()
  const durationSeconds =
    parseDurationPart(hours, 99) * 3600 +
    parseDurationPart(minutes, 59) * 60 +
    parseDurationPart(seconds, 59)

  const startCustomTimer = () => {
    if (durationSeconds === 0) return
    onStartTimer(durationSeconds)
    setIsOpen(false)
    onOpenChange?.(false)
  }

  const toggleMenu = () => {
    setIsOpen((previous) => {
      const next = !previous
      onOpenChange?.(next)
      return next
    })
  }

  const closeMenu = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        className={`flex touch-manipulation items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] ${
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
          {isActive && secondsLeft !== null
            ? formatDuration(secondsLeft)
            : t.sleepTimer.buttonLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full z-30 mb-3 w-72 rounded-2xl border border-[#10231d]/10 bg-white p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#10231d]/5 pb-2">
            <span className="text-xs font-semibold text-[#10231d]">{t.sleepTimer.heading}</span>
            {isActive && (
              <button
                type="button"
                onClick={() => {
                  onCancelTimer()
                  closeMenu()
                }}
                className="touch-manipulation text-[11px] text-red-600 hover:underline"
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
                  onStartTimer(mins * 60)
                  closeMenu()
                }}
                className={`touch-manipulation rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  isActive && secondsLeft === mins * 60
                    ? 'bg-[#10231d] text-white'
                    : 'bg-[#f4f0e8] text-[#10231d] hover:bg-[#dfe9df]'
                }`}
              >
                {mins} {t.sleepTimer.minutesOption}
              </button>
            ))}
          </div>

          <fieldset className="mt-3 border-t border-[#10231d]/5 pt-3">
            <legend className="text-[11px] font-medium text-[#5f746d]">
              {t.sleepTimer.customDuration}
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                {
                  label: t.sleepTimer.hours,
                  value: hours,
                  maximum: 99,
                  onChange: setHours,
                },
                {
                  label: t.sleepTimer.minutes,
                  value: minutes,
                  maximum: 59,
                  onChange: setMinutes,
                },
                {
                  label: t.sleepTimer.seconds,
                  value: seconds,
                  maximum: 59,
                  onChange: setSeconds,
                },
              ].map(({ label, value, maximum, onChange }) => (
                <label key={label} className="min-w-0 text-[10px] text-[#5f746d]">
                  {label}
                  <input
                    type="number"
                    min="0"
                    max={maximum}
                    inputMode="numeric"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) =>
                      onChange(String(parseDurationPart(event.target.value, maximum)))
                    }
                    className="mt-1 block w-full rounded-lg border border-[#10231d]/15 bg-[#f4f0e8] px-2 py-1.5 text-center text-base font-medium text-[#10231d] outline-none focus:border-[#10231d] focus:ring-1 focus:ring-[#10231d]"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={startCustomTimer}
              disabled={durationSeconds === 0}
              className="mt-3 w-full touch-manipulation rounded-lg bg-[#10231d] py-2 text-xs font-medium text-white transition-colors hover:bg-[#25453a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.sleepTimer.start}
            </button>
          </fieldset>
        </div>
      )}
    </div>
  )
}
