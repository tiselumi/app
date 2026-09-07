import { useEffect, useRef, useState } from 'react'

import { useAuth } from '@/auth/useAuth'
import { useI18n } from '@/i18n/useI18n'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  isPresetSyncing: boolean
  hasPresetSyncError: boolean
}

export function LoginModal({
  isOpen,
  onClose,
  isPresetSyncing,
  hasPresetSyncError,
}: LoginModalProps) {
  const { t } = useI18n()
  const { isConfigured, isLoading, signInWithGoogle, signOut, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialogPanelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

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

      <div
        ref={dialogPanelRef}
        className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-3xl border border-[#10231d]/15 bg-[#faf8f5] p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfe9df] text-2xl">
            ◌
          </div>
          <button
            ref={closeButtonRef}
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
            {user ? t.loginModal.accountTitle : t.loginModal.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5f746d]">
            {user
              ? t.loginModal.signedInAs.replace('{email}', user.email ?? t.loginModal.account)
              : t.loginModal.subtitle}
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {user ? (
          <>
            <p className="mt-5 rounded-xl bg-[#dfe9df] p-3 text-sm text-[#10231d]">
              {hasPresetSyncError
                ? t.loginModal.syncError
                : isPresetSyncing
                  ? t.loginModal.syncing
                  : t.loginModal.syncNotice}
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsSubmitting(true)
                void signOut().then((message) => {
                  setIsSubmitting(false)
                  if (message) setError(message)
                  else onClose()
                })
              }}
              className="mt-5 w-full rounded-full border border-[#10231d]/20 bg-white py-3 text-sm font-medium text-[#10231d] focus-visible:outline-2 disabled:opacity-50"
            >
              {t.loginModal.signOut}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={!isConfigured || isLoading || isSubmitting}
              onClick={() => {
                setIsSubmitting(true)
                setError(null)
                void signInWithGoogle().then((message) => {
                  setIsSubmitting(false)
                  if (message) setError(message)
                })
              }}
              className="mt-6 w-full rounded-full bg-[#10231d] py-3 text-sm font-medium text-white transition-all hover:bg-[#1a382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t.loginModal.connecting : t.loginModal.continueGoogle}
            </button>
            {!isConfigured && (
              <p role="status" className="mt-3 text-center text-xs text-[#5f746d]">
                {t.loginModal.notConfigured}
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2 text-sm text-[#5f746d] underline-offset-4 hover:underline focus-visible:outline-2"
            >
              {t.loginModal.continueGuest}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
