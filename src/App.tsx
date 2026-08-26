import { useEffect, useMemo, useState } from 'react'

import type { SoundFilterCategory } from '@/audio/types'
import { CategoryFilterBar } from '@/components/CategoryFilterBar'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ImmersiveOverlay } from '@/components/ImmersiveOverlay'
import { MasterControlBar } from '@/components/MasterControlBar'
import { MoodMatcherDrawer } from '@/components/MoodMatcherDrawer'
import { PresetsBar } from '@/components/PresetsBar'
import { SaveMixModal } from '@/components/SaveMixModal'
import { SoundCard } from '@/components/SoundCard'
import { WelcomeModal } from '@/components/WelcomeModal'
import { useSoundMixer } from '@/hooks/useSoundMixer'
import { I18nProvider } from '@/i18n/context'
import { useI18n } from '@/i18n/useI18n'

export const LOCAL_STORAGE_KEY_ONBOARDING_SEEN = 'tiselumi:onboarding_seen_v1'

function AppContent() {
  const { t } = useI18n()
  const {
    catalog,
    playingSounds,
    trackVolumes,
    masterVolume,
    isPaused,
    timerMinutesLeft,
    isTimerActive,
    presets,
    toggleSound,
    togglePlayPause,
    setVolume,
    setMasterVolume,
    stopAll,
    applyPreset,
    applyTracks,
    startSleepTimer,
    cancelSleepTimer,
  } = useSoundMixer()

  const [activeCategory, setActiveCategory] = useState<SoundFilterCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isMoodMatcherOpen, setIsMoodMatcherOpen] = useState(false)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false)

  // Leave immersive mode automatically when playback stops
  useEffect(() => {
    if (isImmersiveOpen && playingSounds.size === 0) {
      setIsImmersiveOpen(false)
    }
  }, [isImmersiveOpen, playingSounds.size])

  // Trigger welcome modal only on first visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem(LOCAL_STORAGE_KEY_ONBOARDING_SEEN)
      if (!seen) {
        setIsWelcomeOpen(true)
      }
    } catch {
      // Ignore
    }
  }, [])

  const handleDismissWelcome = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ONBOARDING_SEEN, 'true')
    } catch {
      // Ignore
    }
    setIsWelcomeOpen(false)
  }

  const handleWelcomeTry = () => {
    handleDismissWelcome()
    setIsMoodMatcherOpen(true)
  }

  const handleWelcomeLogin = () => {
    handleDismissWelcome()
    setIsSaveModalOpen(true)
  }

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<SoundFilterCategory, number> = {
      all: catalog.length,
      nature: 0,
      comfort: 0,
      noise: 0,
      asmr: 0,
    }
    for (const item of catalog) {
      if (item.category in counts) {
        counts[item.category]++
      }
    }
    return counts
  }, [catalog])

  // Filter catalog by active category and search query
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return catalog.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false
      }

      // Search query filter
      if (!query) return true

      const localized = t.sounds[item.id]
      const titleMatch =
        item.title.toLowerCase().includes(query) ||
        (localized && localized.title.toLowerCase().includes(query))
      const subtitleMatch =
        item.subtitle.toLowerCase().includes(query) ||
        (localized && localized.subtitle.toLowerCase().includes(query))
      const descMatch =
        item.description.toLowerCase().includes(query) ||
        (localized && localized.description.toLowerCase().includes(query))

      return Boolean(titleMatch || subtitleMatch || descMatch)
    })
  }, [catalog, activeCategory, searchQuery, t.sounds])

  return (
    <div className="min-h-screen bg-[#f4f0e8] pb-32 text-[#10231d] selection:bg-[#dfe9df] selection:text-[#10231d]">
      {/* Background soft ambient glowing spheres */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-45 blur-3xl"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/4 h-[450px] w-[450px] rounded-full bg-[#dfe9df]" />
        <div className="absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full bg-[#e8e2d4]" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-[#e0eae0]" />
      </div>

      {/* Main Header */}
      <header className="relative z-10 mx-auto max-w-6xl px-5 pt-10 pb-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10231d] font-serif text-xl text-white shadow-sm"
              aria-hidden="true"
            >
              T
            </span>
            <div>
              <span className="font-serif text-2xl tracking-tight text-[#10231d] sm:text-3xl">
                Tiselumi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#dfe9df] px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#10231d] uppercase sm:inline-flex">
              {t.header.badge}
            </span>
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="rounded-full border border-[#10231d]/15 bg-white/70 px-3.5 py-1 text-xs font-medium text-[#10231d] shadow-xs backdrop-blur-xs transition-colors hover:border-[#10231d]/30 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10231d]"
            >
              {t.header.loginButton}
            </button>
            <LanguageSwitch />
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-8 sm:mt-10">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#10231d] sm:text-4xl lg:text-5xl">
            {t.header.title}
          </h1>
        </div>

        {/* Curated Presets Bar */}
        <div className="mt-7">
          <PresetsBar presets={presets} onSelectPreset={applyPreset} />
        </div>
      </header>

      {/* Sounds Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {/* Category filters & Instant search */}
        <section aria-labelledby="sound-library-heading" className="space-y-6">
          <div className="flex flex-col justify-between gap-4 pb-2 sm:flex-row sm:items-center">
            <div>
              <h2
                id="sound-library-heading"
                className="font-serif text-2xl font-normal text-[#10231d]"
              >
                {t.soundSection.title}
              </h2>
              {(activeCategory !== 'all' || searchQuery.trim() !== '') && (
                <p className="text-xs text-[#5f746d]">
                  {filteredCatalog.length} {t.soundSection.soundsCount}
                </p>
              )}
            </div>
          </div>

          <CategoryFilterBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            categoryCounts={categoryCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Sound Cards Grid */}
          {filteredCatalog.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCatalog.map((sound) => {
                const isPlaying = playingSounds.has(sound.id)
                const volume = trackVolumes[sound.id] ?? 0.5
                return (
                  <SoundCard
                    key={sound.id}
                    item={sound}
                    isPlaying={isPlaying}
                    volume={volume}
                    onToggle={() => void toggleSound(sound.id)}
                    onVolumeChange={(vol) => setVolume(sound.id, vol)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#10231d]/10 bg-white/50 p-12 text-center backdrop-blur">
              <span className="text-4xl" role="img" aria-label="Search icon">
                🔍
              </span>
              <h3 className="mt-3 font-serif text-lg font-medium text-[#10231d]">
                {t.soundSection.noSoundsFound}
              </h3>
              <p className="mt-1 text-xs text-[#5f746d]">{t.soundSection.noSoundsFoundHint}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('all')
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#10231d] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#25453a]"
              >
                {t.soundSection.clearSearch}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Floating Master Control Bar with active mix drawer */}
      <MasterControlBar
        playingSounds={playingSounds}
        trackVolumes={trackVolumes}
        masterVolume={masterVolume}
        isPaused={isPaused}
        timerMinutesLeft={timerMinutesLeft}
        isTimerActive={isTimerActive}
        onTogglePlayPause={togglePlayPause}
        onMasterVolumeChange={setMasterVolume}
        onTrackVolumeChange={setVolume}
        onToggleSound={toggleSound}
        onStopAll={stopAll}
        onStartTimer={startSleepTimer}
        onCancelTimer={cancelSleepTimer}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenImmersive={playingSounds.size > 0 ? () => setIsImmersiveOpen(true) : undefined}
      />

      {/* Floating Mood Matcher Drawer */}
      <MoodMatcherDrawer
        onApplyTracks={applyTracks}
        onStopAll={stopAll}
        isOpen={isMoodMatcherOpen}
        onOpenChange={setIsMoodMatcherOpen}
      />

      {/* Immersive fullscreen mode */}
      <ImmersiveOverlay
        isOpen={isImmersiveOpen}
        onClose={() => setIsImmersiveOpen(false)}
        soundIds={[...playingSounds]}
      />

      {/* Save Mix Freemium Modal */}
      <SaveMixModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        activeTracksCount={playingSounds.size}
      />

      {/* First-time Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onTry={handleWelcomeTry}
        onLogin={handleWelcomeLogin}
        onClose={handleDismissWelcome}
      />
    </div>
  )
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
