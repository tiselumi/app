import { useEffect } from 'react'

import { useI18n } from '@/i18n/useI18n'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#10231d]/40 backdrop-blur-sm transition-opacity"
      />

      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-3xl border border-[#10231d]/15 bg-[#faf8f5] p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfe9df] text-2xl">
            ◌
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.loginModal.close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f746d] transition-colors hover:bg-[#10231d]/10 hover:text-[#10231d]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <h3 id="login-modal-title" className="font-serif text-2xl font-normal text-[#10231d]">
            {t.loginModal.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5f746d]">{t.loginModal.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#10231d] py-3 text-sm font-medium text-white transition-all hover:bg-[#1a382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
        >
          {t.loginModal.continueGuest}
        </button>
      </div>
    </div>
  )
}
