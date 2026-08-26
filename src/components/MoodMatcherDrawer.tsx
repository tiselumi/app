import { useCallback, useEffect, useState } from 'react'

import {
  LOCAL_STORAGE_KEY_MOOD_HISTORY,
  LOCAL_STORAGE_KEY_MOOD_SEEN,
  MOOD_DEFINITIONS,
  blendMoodTracks,
  loadMoodHistory,
  saveMoodHistoryItem,
  type MoodHistoryItem,
} from '@/audio/moods'
import { useI18n } from '@/i18n/useI18n'

interface MoodMatcherDrawerProps {
  onApplyTracks: (tracks: Record<string, number>) => Promise<void>
  onStopAll: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MoodMatcherDrawer({
  onApplyTracks,
  onStopAll,
  isOpen: propIsOpen,
  onOpenChange,
}: MoodMatcherDrawerProps) {
  const { t } = useI18n()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(isOpen) : next
    if (onOpenChange) {
      onOpenChange(resolved)
    } else {
      setInternalIsOpen(resolved)
    }
  }
  const [selectedMoodIds, setSelectedMoodIds] = useState<string[]>([])
  const [history, setHistory] = useState<MoodHistoryItem[]>(() => loadMoodHistory())
  const [showTooltip, setShowTooltip] = useState(false)

  // Auto-reveal tooltip on first visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem(LOCAL_STORAGE_KEY_MOOD_SEEN)
      if (!seen) {
        setShowTooltip(true)
        localStorage.setItem(LOCAL_STORAGE_KEY_MOOD_SEEN, 'true')
      }
    } catch {
      // Ignore
    }
  }, [])

  const handleToggleMood = useCallback(
    async (moodId: string) => {
      let nextSelected: string[]
      if (selectedMoodIds.includes(moodId)) {
        nextSelected = selectedMoodIds.filter((id) => id !== moodId)
      } else {
        if (selectedMoodIds.length >= 3) {
          // Replace the oldest selected mood to maintain at most 3
          nextSelected = [...selectedMoodIds.slice(1), moodId]
        } else {
          nextSelected = [...selectedMoodIds, moodId]
        }
      }

      setSelectedMoodIds(nextSelected)

      if (nextSelected.length > 0) {
        const blended = blendMoodTracks(nextSelected)
        await onApplyTracks(blended)
        const updatedHistory = saveMoodHistoryItem(nextSelected, blended)
        setHistory(updatedHistory)
      } else {
        onStopAll()
      }
    },
    [selectedMoodIds, onApplyTracks, onStopAll],
  )

  const handleApplyHistory = useCallback(
    async (item: MoodHistoryItem) => {
      setSelectedMoodIds(item.moodIds)
      await onApplyTracks(item.tracks)
    },
    [onApplyTracks],
  )

  const handleClearHistory = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_MOOD_HISTORY)
    } catch {
      // Ignore
    }
    setHistory([])
  }, [])

  const handleReset = useCallback(() => {
    setSelectedMoodIds([])
    onStopAll()
  }, [onStopAll])

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed right-5 bottom-24 z-40 sm:right-8 sm:bottom-28">
        {showTooltip && !isOpen && (
          <div
            role="status"
            className="animate-in fade-in slide-in-from-bottom-2 absolute right-0 bottom-full mb-3 w-64 rounded-2xl border border-[#10231d]/15 bg-white p-3.5 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-[#10231d]">{t.moodMatcher.tooltipText}</p>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                aria-label={t.moodMatcher.dismissTooltip}
                className="text-xs text-[#5f746d] hover:text-[#10231d]"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setShowTooltip(false)
          }}
          aria-expanded={isOpen}
          aria-controls="mood-matcher-panel"
          aria-label={t.moodMatcher.triggerLabel}
          className="group flex items-center gap-2.5 rounded-full border border-[#10231d]/15 bg-[#10231d] px-4 py-3 text-sm font-medium text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#1a382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d] focus-visible:ring-offset-2"
        >
          <span className="text-base transition-transform duration-300 group-hover:rotate-12">
            ✨
          </span>
          <span className="font-sans font-medium tracking-tight">{t.moodMatcher.triggerLabel}</span>
          {selectedMoodIds.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dfe9df] text-xs font-bold text-[#10231d]">
              {selectedMoodIds.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating Mood Matcher Panel */}
      {isOpen && (
        <div
          id="mood-matcher-panel"
          role="region"
          aria-label={t.moodMatcher.title}
          className="animate-in fade-in slide-in-from-bottom-3 fixed right-4 bottom-24 z-50 w-[calc(100%-2rem)] max-w-md rounded-3xl border border-[#10231d]/15 bg-[#faf8f5]/95 p-5 shadow-2xl backdrop-blur-2xl sm:right-8 sm:bottom-28"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#10231d]/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h2 className="font-serif text-lg font-semibold text-[#10231d]">
                  {t.moodMatcher.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.moodMatcher.closePanel}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-[#5f746d] transition-colors hover:bg-[#10231d]/10 hover:text-[#10231d]"
            >
              ✕
            </button>
          </div>

          {/* Tags Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {MOOD_DEFINITIONS.map((mood) => {
              const isSelected = selectedMoodIds.includes(mood.id)
              const localized = t.moodMatcher.tags[mood.id]
              const label = localized?.label ?? mood.id

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => void handleToggleMood(mood.id)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col items-center rounded-2xl p-4 text-center transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#10231d] bg-[#10231d] text-white shadow-md'
                      : 'border border-[#10231d]/10 bg-white/80 text-[#10231d] hover:-translate-y-0.5 hover:border-[#10231d]/25 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#10231d]">
                      ✓
                    </span>
                  )}
                  <span className="text-2xl">{mood.icon}</span>
                  <span className="mt-2 text-[13px] leading-tight font-semibold">{label}</span>
                </button>
              )
            })}
          </div>

          {/* Selection Actions & Status */}
          {selectedMoodIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-[#10231d]/10 pt-3">
              <span className="text-[11px] font-medium text-[#5f746d]">
                {t.moodMatcher.maxSelectedHint} ({selectedMoodIds.length}/3)
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-[#8c3a3a] hover:underline"
              >
                {t.moodMatcher.clearSelection}
              </button>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-4 border-t border-[#10231d]/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-[#5f746d] uppercase">
                  {t.moodMatcher.historyTitle}
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-[#5f746d] hover:text-[#10231d]"
                >
                  {t.moodMatcher.clearHistory}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {history.map((item) => {
                  const icons = item.moodIds
                    .map((id) => MOOD_DEFINITIONS.find((m) => m.id === id)?.icon ?? '')
                    .join(' ')
                  const labels = item.moodIds
                    .map((id) => t.moodMatcher.tags[id]?.label ?? id)
                    .join(', ')

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleApplyHistory(item)}
                      title={labels}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#10231d]/10 bg-white/90 px-3 py-1 text-xs text-[#10231d] shadow-xs transition-colors hover:border-[#10231d]/30 hover:bg-white"
                    >
                      <span>{icons}</span>
                      <span className="max-w-[120px] truncate text-[11px] font-medium">
                        {labels}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
