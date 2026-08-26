import type { Locale, TranslationSchema } from './types'

export const translations: Record<Locale, TranslationSchema> = {
  en: {
    header: {
      badge: 'Sleep Assistant & Mixer',
      title: 'Quiet your mind. Ease into sleep.',
      quickMixes: 'Curated Soundscapes:',
      loginButton: 'Log In',
    },
    soundSection: {
      title: 'Sound Library',
      soundsCount: 'sounds available',
      searchPlaceholder: 'Search sounds by name or mood...',
      clearSearch: 'Clear search',
      noSoundsFound: 'No sounds found',
      noSoundsFoundHint: 'Try a different search query or select another category.',
    },
    categories: {
      all: 'All Sounds',
      nature: 'Nature & Water',
      comfort: 'Cozy & Places',
      noise: 'Focus Noise',
      asmr: 'ASMR & Touch',
    },
    soundCard: {
      playLabel: 'Play',
      stopLabel: 'Stop',
      volumeLabel: 'Volume',
      volumeAria: 'volume',
      muteTrack: 'Mute track',
      unmuteTrack: 'Unmute track',
    },
    masterBar: {
      soundPlayingSingle: 'sound playing',
      soundPlayingPlural: 'sounds playing',
      masterControl: 'Master control',
      pauseAll: 'Pause mix',
      resumeAll: 'Resume mix',
      pausedStatus: 'paused',
      stopAll: 'Clear mix',
      masterVolumeAria: 'Master volume',
      manageActive: 'Active mix',
      activeTracksTitle: 'Current active mix',
      immersiveButton: 'Focus mode',
    },
    immersive: {
      title: 'Immersion',
      close: 'Exit focus mode',
      exitHint: 'Tap anywhere to come back',
    },
    sleepTimer: {
      buttonLabel: 'Timer',
      minLeft: 'min left',
      heading: 'Sleep Timer',
      turnOff: 'Turn off',
      minutesOption: 'min',
    },
    sounds: {
      'rain-on-window': {
        title: 'Rain on Window',
        subtitle: 'Steady glass trickling',
        description:
          'Calming raindrops against glass, providing comforting rhythm for deep relaxation.',
      },
      'rain-soft-thunder': {
        title: 'Rain & Distant Thunder',
        subtitle: 'Soft rumble & gentle storm',
        description: 'Muffled, soothing rolling thunder and atmospheric rain in the distance.',
      },
      'rain-under-umbrella': {
        title: 'Rain Under Umbrella',
        subtitle: 'Close canopy resonance',
        description:
          'Intimate, sheltered feeling of walking safely under a large umbrella in the rain.',
      },
      'rain-on-umbrella-soft': {
        title: 'Gentle Canopy Rain',
        subtitle: 'Light rhythmic drops',
        description: 'Delicate, light rain drumming softly against a waterproof awning.',
      },
      'ocean-waves-gentle': {
        title: 'Gentle Ocean Waves',
        subtitle: 'Deep rolling surf',
        description: 'Slow, hypnotic rhythm of sea waves breaking gently upon a sandy shore.',
      },
      'ocean-waves-foam': {
        title: 'Ocean Foam & Bubbles',
        subtitle: 'Crisp fizzing surf',
        description: 'Texture of bubbly seafoam gently washing over pebbles and sand.',
      },
      'ocean-waves-birds': {
        title: 'Coastal Surf & Birds',
        subtitle: 'Morning sea breeze',
        description: 'Peaceful combination of gentle morning tide and subtle distant seabirds.',
      },
      'forest-brook-gentle': {
        title: 'Gentle Forest Brook',
        subtitle: 'Crystal babbling water',
        description: 'Pristine mountain stream water gently cascading over smooth river stones.',
      },
      'forest-brook-summer': {
        title: 'Summer Woodland Stream',
        subtitle: 'Deep murmuring flow',
        description: 'Rich, immersive sounds of a woodland creek winding through summer trees.',
      },
      'night-crickets-calm': {
        title: 'Distant Night Crickets',
        subtitle: 'Quiet evening serenity',
        description: 'Gentle, sleepy nighttime cricket songs echoing in the quiet night air.',
      },
      'night-crickets-buzz': {
        title: 'Night Meadow Crickets',
        subtitle: 'Hypnotic meadow buzz',
        description:
          'Steady, rhythmic summer night meadow insects providing constant comforting ambience.',
      },
      'night-countryside-pasture': {
        title: 'Night Countryside',
        subtitle: 'Peaceful pastoral evening',
        description:
          'Distant rustic night atmosphere with subtle breeze and quiet countryside calmness.',
      },
      'train-cabin-interior': {
        title: 'Night Train Cabin',
        subtitle: 'Gentle rolling car sway',
        description: 'Muffled, rhythmic swaying inside a long-distance sleeper train compartment.',
      },
      'train-rail-clatter': {
        title: 'Rhythmic Rail Clatter',
        subtitle: 'Hypnotic track cadence',
        description: 'Soothing, steady click-clack of train wheels gliding over steel tracks.',
      },
      'coffee-shop-ambience': {
        title: 'Cozy Coffee Shop',
        subtitle: 'Warm background chatter',
        description:
          'Warm, low-level murmur of a friendly neighborhood cafe, removing lonely silence.',
      },
      'coffee-shop-barista': {
        title: 'Quiet Cafe & Barista',
        subtitle: 'Gentle cup clinks & warmth',
        description:
          'Soft ceramic cup sounds and delicate espresso bar ambience in the background.',
      },
      'brown-noise': {
        title: 'Brown Noise',
        subtitle: 'Deep focus & anxiety relief',
        description:
          'A deep, heavy rumble that gently masks racing thoughts and inner restlessness.',
      },
      'pink-noise': {
        title: 'Pink Noise',
        subtitle: 'Balanced gentle spectrum',
        description:
          'Deeper than white noise, resembling steady wind through pine trees or distant rainfall.',
      },
      'white-noise': {
        title: 'White Noise',
        subtitle: 'Static sound mask',
        description:
          'Equal energy across audible frequencies, blocking sudden sharp external noises.',
      },
      'book-pages-turning': {
        title: 'Book Pages Turning',
        subtitle: 'Slow rhythmic paper ASMR',
        description: 'Gentle, slow friction of paper pages turning in a quiet sanctuary.',
      },
      'reading-pages-soft': {
        title: 'Quiet Reading Room',
        subtitle: 'Delicate library rustles',
        description: 'Subtle, relaxing sounds of studying and turning pages in a cozy book nook.',
      },
      'plastic-crinkle-asmr': {
        title: 'Soft ASMR Crinkle',
        subtitle: 'Delicate soothing triggers',
        description:
          'Ultra-soft, slow micro-crinkles for tingling relaxation and bedtime ASMR calm.',
      },
    },
    presets: {
      'deep-calm': {
        name: 'Deep Calm',
        description: 'Warm Brown Noise and soft rain for grounding anxiety',
      },
      'night-sleeper-train': {
        name: 'Night Sleeper Train',
        description: 'Cozy train cabin sway with rhythmic tracks and rain',
      },
      'ocean-sanctuary': {
        name: 'Ocean Sanctuary',
        description: 'Rolling ocean waves and morning coastal breeze',
      },
      'forest-haven': {
        name: 'Forest Haven',
        description: 'Babbling woodland brook with night meadow crickets',
      },
      'midnight-coffee': {
        name: 'Midnight Coffee',
        description: 'Warm cafe atmosphere sheltered from rain',
      },
      'bedtime-reading': {
        name: 'Bedtime Reading',
        description: 'Gentle page turns with soothing brown noise',
      },
    },
    moodMatcher: {
      triggerLabel: 'Mood Matcher',
      tooltipText: 'Pick your mood to generate an instant sound mix',
      dismissTooltip: 'Dismiss tooltip',
      title: 'Match Your Mood',
      closePanel: 'Close panel',
      maxSelectedHint: 'Up to 3 moods combined',
      playMix: 'Play Mix',
      stopMix: 'Stop',
      clearSelection: 'Reset',
      historyTitle: 'Recent Combinations',
      historyEmpty: 'Your mood selections will appear here',
      clearHistory: 'Clear history',
      tags: {
        insomnia: {
          label: 'Insomnia',
        },
        anxiety: {
          label: 'Anxiety Relief',
        },
        exhaustion: {
          label: 'Exhaustion',
        },
        focus: {
          label: 'Calm Focus',
        },
        'deep-calm': {
          label: 'Deep Calm',
        },
        'night-journey': {
          label: 'Night Train',
        },
      },
    },
    saveModal: {
      saveMixButton: 'Save mix',
      title: 'Save Custom Soundscapes',
      subtitle:
        'In guest mode, you can freely listen and adjust any sounds. Create an account to save your favorite mixes and access them across all your devices.',
      close: 'Close',
      featureSync: 'Sync custom presets across all your devices',
      featureTracksSingle: 'Save your active mix of 1 track',
      featureTracksPlural: 'Save your active mix of {count} tracks',
      featureHistory: 'Mood matcher history and personalized combinations',
      createAccount: 'Create Free Account',
      login: 'Log In',
      continueGuest: 'Continue as Guest',
      guestNotice: 'Guest mode is unlimited for listening and mixing.',
      comingSoonNotice:
        'Cloud accounts will be available in the upcoming update. You can continue listening for free with zero limits!',
    },
    welcomeModal: {
      badge: 'Welcome to Tiselumi',
      title: 'Quiet your mind. Ease into sleep.',
      subtitle: 'A calm sound mixer to wind down and craft your personal bedtime atmosphere.',
      tryButton: 'Try as Guest',
      loginButton: 'Log In to Account',
      guestNote: 'Free and unlimited. No registration required to mix sounds.',
      close: 'Close',
    },
    language: {
      switchAria: 'Select language',
      en: 'English',
      ru: 'Русский',
    },
  },
  ru: {
    header: {
      badge: 'Помощник для сна и микшер',
      title: 'Успокойте мысли. Погрузитесь в сон.',
      quickMixes: 'Готовые саундскейпы:',
      loginButton: 'Войти',
    },
    soundSection: {
      title: 'Библиотека звуков',
      soundsCount: 'звуков доступно',
      searchPlaceholder: 'Поиск по названию или настроению...',
      clearSearch: 'Очистить поиск',
      noSoundsFound: 'Ничего не найдено',
      noSoundsFoundHint: 'Попробуйте изменить запрос или переключить категорию.',
    },
    categories: {
      all: 'Все звуки',
      nature: 'Природа и вода',
      comfort: 'Уют и дом',
      noise: 'Шумы и фокус',
      asmr: 'ASMR и тактильность',
    },
    soundCard: {
      playLabel: 'Включить',
      stopLabel: 'Остановить',
      volumeLabel: 'Громкость',
      volumeAria: 'громкость',
      muteTrack: 'Заглушить звук',
      unmuteTrack: 'Включить звук',
    },
    masterBar: {
      soundPlayingSingle: 'звук играет',
      soundPlayingPlural: 'звука(ов) играют',
      masterControl: 'Главный пульт',
      pauseAll: 'Пауза',
      resumeAll: 'Продолжить',
      pausedStatus: 'на паузе',
      stopAll: 'Сбросить микс',
      masterVolumeAria: 'Общая громкость',
      manageActive: 'Активный микс',
      activeTracksTitle: 'Текущий активный микс',
      immersiveButton: 'Режим погружения',
    },
    immersive: {
      title: 'Погружение',
      close: 'Выйти из режима погружения',
      exitHint: 'Нажмите в любом месте, чтобы вернуться',
    },
    sleepTimer: {
      buttonLabel: 'Таймер',
      minLeft: 'мин осталось',
      heading: 'Таймер сна',
      turnOff: 'Выключить',
      minutesOption: 'мин',
    },
    sounds: {
      'rain-on-window': {
        title: 'Дождь за окном',
        subtitle: 'Размеренный стук по стеклу',
        description:
          'Уютный размеренный стук капель дождя, создающий ощущение защищённости и покоя.',
      },
      'rain-soft-thunder': {
        title: 'Дождь и далёкий гром',
        subtitle: 'Мягкий гром и уютный ливень',
        description: 'Глухой, успокаивающий рокот далёкой грозы и шум теплого ночного дождя.',
      },
      'rain-under-umbrella': {
        title: 'Дождь под зонтом',
        subtitle: 'Близкий звук по куполу',
        description: 'Уютное ощущение защищенности под большим зонтом во время затяжного дождя.',
      },
      'rain-on-umbrella-soft': {
        title: 'Мягкий дождь по навесу',
        subtitle: 'Лёгкая барабанная дробь',
        description: 'Тонкий, умиротворяющий шелест капель по плотной ткани тента.',
      },
      'ocean-waves-gentle': {
        title: 'Мягкие океанские волны',
        subtitle: 'Глубокий размеренный прикат',
        description: 'Медленные накатывающие морские волны, уносящие тревогу и дневную суету.',
      },
      'ocean-waves-foam': {
        title: 'Шелест морской пены',
        subtitle: 'Шипящие пузырьки прибоя',
        description: 'Текстурный звук шуршания пены и мелких камешков у самой кромки воды.',
      },
      'ocean-waves-birds': {
        title: 'Морской прибой и птицы',
        subtitle: 'Утренний берег моря',
        description: 'Спокойное море и далёкие крики чаек в утреннем прохладном бризе.',
      },
      'forest-brook-gentle': {
        title: 'Лесной ручей',
        subtitle: 'Журчание среди мха и камней',
        description: 'Чистый горный ручей, плавно переливающийся по гладким круглым камням.',
      },
      'forest-brook-summer': {
        title: 'Летний ручей в чаще',
        subtitle: 'Шум лесного течения',
        description: 'Плотный, глубокий шелест лесной речушки в тени вековых деревьев.',
      },
      'night-crickets-calm': {
        title: 'Далёкие сверчки',
        subtitle: 'Спокойная тихая ночь',
        description: 'Ненавязчивый, убаюкивающий хор сверчков в тёплую безветренную ночь.',
      },
      'night-crickets-buzz': {
        title: 'Ночные цикады',
        subtitle: 'Мерный стрекот в траве',
        description: 'Гипнотический, непрерывный ночной стрекот летнего луга под звёздным небом.',
      },
      'night-countryside-pasture': {
        title: 'Ночная деревня',
        subtitle: 'Тихий сельский вечер',
        description: 'Далёкие звуки деревенской ночи, тихий ветерок и абсолютное умиротворение.',
      },
      'train-cabin-interior': {
        title: 'Купе ночного поезда',
        subtitle: 'Мягкое покачивание вагона',
        description: 'Приглушённый монотонный гул спального вагона, идущего сквозь ночь.',
      },
      'train-rail-clatter': {
        title: 'Стук колес поезда',
        subtitle: 'Убаюкивающий ритм рельсов',
        description: 'Знакомый с детства размеренный ритмичный стук вагонных колес по рельсам.',
      },
      'coffee-shop-ambience': {
        title: 'Уютная кофейня',
        subtitle: 'Приглушённый гул и тепло',
        description: 'Мягкий фоновый шум любимого кафе, спасающий от давящей ночной тишины.',
      },
      'coffee-shop-barista': {
        title: 'Тихое кафе и бариста',
        subtitle: 'Шорохи чашек и уют',
        description: 'Негромкие звуки кофейных чашек, кофемашины и уютной атмосферы за столиком.',
      },
      'brown-noise': {
        title: 'Коричневый шум',
        subtitle: 'Глубокое расслабление и фокус',
        description:
          'Глубокий низкий гул, мягко заглушающий навязчивые мысли и внутреннее беспокойство.',
      },
      'pink-noise': {
        title: 'Розовый шум',
        subtitle: 'Сбалансированный мягкий спектр',
        description: 'Более мягкий и глубокий, чем белый шум. Напоминает шелест соснового леса.',
      },
      'white-noise': {
        title: 'Белый шум',
        subtitle: 'Статический звук и маскировка',
        description:
          'Равномерный спектр частот, скрывающий резкие посторонние звуки с улицы или дома.',
      },
      'book-pages-turning': {
        title: 'Перелистывание книги',
        subtitle: 'Медленный шорох страниц',
        description: 'Деликатный шелест плотной бумаги старой книги в тишине комнаты.',
      },
      'reading-pages-soft': {
        title: 'Тихий читальный зал',
        subtitle: 'Атмосфера библиотеки',
        description: 'Мягкие звуки чтения, переворачивания страниц и сосредоточенного покоя.',
      },
      'plastic-crinkle-asmr': {
        title: 'Мягкий шорох ASMR',
        subtitle: 'Тонкие тактильные триггеры',
        description:
          'Очень нежные, медленные тактильные звуки для приятных мурашек и расслабления.',
      },
    },
    presets: {
      'deep-calm': {
        name: 'Глубокий покой',
        description: 'Тёплый коричневый шум и мягкий дождь для снятия тревоги',
      },
      'night-sleeper-train': {
        name: 'Ночной поезд',
        description: 'Покачивание вагона, стук колес и дождь за окном',
      },
      'ocean-sanctuary': {
        name: 'Морское святилище',
        description: 'Морские волны, прибрежная пена и лёгкий бриз',
      },
      'forest-haven': {
        name: 'Лесная гавань',
        description: 'Журчание лесного ручья и ночные сверчки в траве',
      },
      'midnight-coffee': {
        name: 'Ночное кафе',
        description: 'Уютная атмосфера кофейни под звуки дождя за витриной',
      },
      'bedtime-reading': {
        name: 'Чтение на ночь',
        description: 'Шорох страниц книги в сочетании с коричневым шумом',
      },
    },
    moodMatcher: {
      triggerLabel: 'Подбор под настроение',
      tooltipText: 'Выберите ваше состояние для мгновенного подбора звуков',
      dismissTooltip: 'Скрыть подсказку',
      title: 'Подбор под настроение',
      closePanel: 'Закрыть панель',
      maxSelectedHint: 'Объединено до 3 настроений',
      playMix: 'Слушать микс',
      stopMix: 'Остановить',
      clearSelection: 'Сбросить',
      historyTitle: 'Недавние подборы',
      historyEmpty: 'Здесь появится история ваших подборов',
      clearHistory: 'Очистить',
      tags: {
        insomnia: {
          label: 'Бессонница',
        },
        anxiety: {
          label: 'Тревожность',
        },
        exhaustion: {
          label: 'Усталость',
        },
        focus: {
          label: 'Спокойный фокус',
        },
        'deep-calm': {
          label: 'Глубокий покой',
        },
        'night-journey': {
          label: 'Ночной поезд',
        },
      },
    },
    saveModal: {
      saveMixButton: 'Сохранить микс',
      title: 'Сохранение персональных миксов',
      subtitle:
        'В гостевом режиме вы можете свободно слушать и настраивать любые звуки. Создайте аккаунт, чтобы сохранять любимые миксы и возвращаться к ним на любых устройствах.',
      close: 'Закрыть',
      featureSync: 'Синхронизация пресетов между всеми устройствами',
      featureTracksSingle: 'Сохранение текущего микса из 1 дорожки',
      featureTracksPlural: 'Сохранение текущего микса из {count} дорожек',
      featureHistory: 'История подбора настроений и персональные комбинации',
      createAccount: 'Создать аккаунт',
      login: 'Войти',
      continueGuest: 'Продолжить как гость',
      guestNotice: 'Гостевой режим не ограничен по времени прослушивания.',
      comingSoonNotice:
        'Облачные аккаунты появятся в следующем обновлении. Вы можете продолжать слушать бесплатно без ограничений!',
    },
    welcomeModal: {
      badge: 'Добро пожаловать в Tiselumi',
      title: 'Успокойте мысли. Погрузитесь в сон.',
      subtitle: 'Ваше спокойное пространство для отдыха, сна и снятия тревожности.',
      tryButton: 'Попробовать без регистрации',
      loginButton: 'Войти в аккаунт',
      guestNote: 'Бесплатно и без ограничений по времени прослушивания.',
      close: 'Закрыть',
    },
    language: {
      switchAria: 'Выбор языка',
      en: 'English',
      ru: 'Русский',
    },
  },
}
