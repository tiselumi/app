export type Locale = 'en' | 'ru'

export interface TranslationSchema {
  header: {
    badge: string
    title: string
    quickMixes: string
    loginButton: string
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
    pauseAll: string
    resumeAll: string
    pausedStatus: string
    stopAll: string
    masterVolumeAria: string
    manageActive: string
    activeTracksTitle: string
    immersiveButton: string
  }
  immersive: {
    title: string
    close: string
    exitHint: string
  }
  sleepTimer: {
    buttonLabel: string
    heading: string
    turnOff: string
    minutesOption: string
    customDuration: string
    hours: string
    minutes: string
    seconds: string
    start: string
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
  moodMatcher: {
    triggerLabel: string
    tooltipText: string
    dismissTooltip: string
    title: string
    closePanel: string
    maxSelectedHint: string
    playMix: string
    stopMix: string
    clearSelection: string
    historyTitle: string
    historyEmpty: string
    clearHistory: string
    tags: Record<
      string,
      {
        label: string
      }
    >
  }
  saveModal: {
    saveMixButton: string
    title: string
    subtitle: string
    close: string
    featureSync: string
    featureTracksSingle: string
    featureTracksPlural: string
    featureHistory: string
    createAccount: string
    login: string
    continueGuest: string
    guestNotice: string
    comingSoonNotice: string
  }
  welcomeModal: {
    badge: string
    title: string
    subtitle: string
    tryButton: string
    loginButton: string
    guestNote: string
    close: string
  }
  language: {
    switchAria: string
    en: string
    ru: string
  }
}
