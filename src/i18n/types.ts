export type Locale = 'en' | 'ru'

export interface TranslationSchema {
  header: {
    badge: string
    title: string
    subtitle: string
    quickMixes: string
  }
  soundSection: {
    title: string
    soundsCount: string
    searchPlaceholder: string
    clearSearch: string
    noSoundsFound: string
    noSoundsFoundHint: string
  }
  categories: {
    all: string
    nature: string
    comfort: string
    noise: string
    asmr: string
  }
  soundCard: {
    playLabel: string
    stopLabel: string
    volumeLabel: string
    volumeAria: string
    muteTrack: string
    unmuteTrack: string
  }
  masterBar: {
    soundPlayingSingle: string
    soundPlayingPlural: string
    masterControl: string
    stopAll: string
    masterVolumeAria: string
    manageActive: string
    activeTracksTitle: string
  }
  sleepTimer: {
    buttonLabel: string
    minLeft: string
    heading: string
    turnOff: string
    minutesOption: string
  }
  sounds: Record<
    string,
    {
      title: string
      subtitle: string
      description: string
    }
  >
  presets: Record<
    string,
    {
      name: string
      description: string
    }
  >
  language: {
    switchAria: string
    en: string
    ru: string
  }
}
