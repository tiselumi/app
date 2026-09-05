import { useEffect, useState } from 'react'

import { useI18n } from '@/i18n/useI18n'

interface SaveMixModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => boolean
  activeTracksCount: number
  onOpenLogin: () => void
}

export function SaveMixModal({
  isOpen,
  onClose,
  activeTracksCount,
  onSave,
  onOpenLogin,
}: SaveMixModalProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [showNotice, setShowNotice] = useState(false)

  // Reset notice and handle ESC key
  useEffect(() => {
    if (!isOpen) {
      setShowNotice(false)
      setName('')
      setError(false)
      return
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const trackFeatureText =
    activeTracksCount === 1
      ? t.saveModal.featureTracksSingle
      : t.saveModal.featureTracksPlural.replace('{count}', String(activeTracksCount))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 [padding-bottom:calc(1rem+env(safe-area-inset-bottom))]"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#10231d]/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="animate-in fade-in zoom-in-95 relative max-h-[calc(100dvh-2rem-env(safe-area-inset-bottom))] w-full max-w-md overflow-y-auto rounded-3xl border border-[#10231d]/15 bg-[#faf8f5] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dfe9df] text-2xl">
            ✨
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.saveModal.close}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f746d] transition-colors hover:bg-[#10231d]/10 hover:text-[#10231d]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <h3 id="save-modal-title" className="font-serif text-2xl font-normal text-[#10231d]">
            {t.saveModal.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5f746d]">{t.saveModal.subtitle}</p>
        </div>

        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (onSave(name)) onClose()
            else setError(true)
          }}
        >
          <p id="local-save-notice" className="text-sm text-[#5f746d]">
            {t.saveModal.localNotice}
          </p>
          <label className="block text-sm" htmlFor="mix-name">
            {t.saveModal.nameLabel}
          </label>
          <input
            id="mix-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            aria-describedby="local-save-notice"
            className="w-full rounded-xl border border-[#10231d]/20 bg-white p-3 focus-visible:outline-2"
          />
          {activeTracksCount === 0 ? (
            <p className="text-sm">{t.saveModal.emptyMix}</p>
          ) : (
            <p className="text-sm">{trackFeatureText}</p>
          )}
          {error && (
            <p role="alert" className="text-sm">
              {t.saveModal.storageError}
            </p>
          )}
          <button
            type="submit"
            disabled={!name.trim() || activeTracksCount === 0}
            className="w-full rounded-full bg-[#10231d] py-3 text-sm text-white focus-visible:outline-2 disabled:opacity-40"
          >
            {t.saveModal.saveLocal}
          </button>
        </form>

        {showNotice && (
          <div
            role="status"
            className="mt-4 rounded-xl bg-[#dfe9df] p-3 text-center text-xs font-medium text-[#10231d]"
          >
            {t.saveModal.comingSoonNotice}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setShowNotice(true)}
            className="flex w-full items-center justify-center rounded-full bg-[#10231d] py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#1a382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
          >
            {t.saveModal.createAccount}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenLogin()
            }}
            className="flex w-full items-center justify-center rounded-full border border-[#10231d]/20 bg-white/80 py-2.5 text-sm font-medium text-[#10231d] transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
          >
            {t.saveModal.login}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-center text-xs text-[#5f746d] underline-offset-4 hover:text-[#10231d] hover:underline"
          >
            {t.saveModal.continueGuest}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#5f746d]/80">{t.saveModal.guestNotice}</p>
      </div>
    </div>
  )
}
