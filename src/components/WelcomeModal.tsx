import { useEffect } from 'react'

import { useI18n } from '@/i18n/useI18n'

interface WelcomeModalProps {
  isOpen: boolean
  onTry: () => void
  onLogin: () => void
  onClose: () => void
}

export function WelcomeModal({ isOpen, onTry, onLogin, onClose }: WelcomeModalProps) {
  const { t } = useI18n()

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#10231d]/45 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg rounded-3xl border border-[#10231d]/15 bg-[#faf8f5] p-7 shadow-2xl sm:p-9">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10231d] font-serif text-2xl text-white shadow-sm"
              aria-hidden="true"
            >
              T
            </span>
            <span className="rounded-full bg-[#dfe9df] px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#10231d] uppercase">
              {t.welcomeModal.badge}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.welcomeModal.close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f746d] transition-colors hover:bg-[#10231d]/10 hover:text-[#10231d]"
          >
            ✕
          </button>
        </div>

        <div className="mt-6">
          <h2
            id="welcome-modal-title"
            className="font-serif text-3xl font-normal tracking-tight text-[#10231d] sm:text-4xl"
          >
            {t.welcomeModal.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#5f746d]">{t.welcomeModal.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onTry}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#10231d] py-3.5 text-base font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-[#1a382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
          >
            <span>✨</span>
            <span>{t.welcomeModal.tryButton}</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="flex w-full items-center justify-center rounded-full border border-[#10231d]/20 bg-white/80 py-3 text-sm font-medium text-[#10231d] transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
          >
            {t.welcomeModal.loginButton}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-[#5f746d]">{t.welcomeModal.guestNote}</p>
      </div>
    </div>
  )
}
