import { useEffect, useMemo } from 'react'

import { resolveImmersiveScene } from '@/audio/immersiveScenes'
import { useI18n } from '@/i18n/useI18n'

interface ImmersiveOverlayProps {
  isOpen: boolean
  onClose: () => void
  /** Ids of the sounds currently in the mix; drives the scene choice. */
  soundIds: string[]
}

interface ParticleSpec {
  left: string
  top: string
  duration: string
  delay: string
}

/** Deterministic spread so particles do not jump between re-renders. */
function buildParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, (_, i) => ({
    left: `${(i * 61 + 7) % 96}%`,
    top: `${(i * 37 + 11) % 88}%`,
    duration: `${13 + (i % 6) * 2}s`,
    delay: `${(i % 8) * 1.3}s`,
  }))
}

export function ImmersiveOverlay({ isOpen, onClose, soundIds }: ImmersiveOverlayProps) {
  const { t } = useI18n()
  const scene = useMemo(() => resolveImmersiveScene(soundIds), [soundIds])
  const particles = useMemo(
    () => (scene.showParticles ? buildParticles(scene.particleCount) : []),
    [scene],
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.immersive.title}
      onClick={onClose}
      className={`animate-in fade-in fixed inset-0 z-[60] flex cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-b ${scene.backgroundClass}`}
    >
      {/* Breathing rings */}
      <div className="relative flex h-full w-full items-center justify-center" aria-hidden="true">
        <div
          className={`immersive-breathe absolute h-56 w-56 rounded-full blur-xl sm:h-80 sm:w-80 ${scene.coreGlowClass}`}
        />
        <div
          className={`immersive-breathe absolute h-80 w-80 rounded-full border sm:h-[28rem] sm:w-[28rem] ${scene.ringClass} [animation-delay:1.5s]`}
        />
        <div
          className={`immersive-breathe absolute h-[28rem] w-[28rem] rounded-full border opacity-60 sm:h-[40rem] sm:w-[40rem] ${scene.ringClass} [animation-delay:3s]`}
        />
        <div
          className={`immersive-breathe absolute h-24 w-24 rounded-full blur-md sm:h-32 sm:w-32 ${scene.coreGlowClass} [animation-delay:0.75s]`}
        />

        {/* Ambient particles */}
        {particles.map((particle, index) => (
          <span
            key={index}
            style={{
              left: particle.left,
              top: particle.top,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            }}
            className={`immersive-particle absolute ${scene.particleShapeClass} ${scene.particleColorClass} ${scene.particleMotionClass}`}
          />
        ))}
      </div>

      {/* Explicit exit button (always reachable) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label={t.immersive.close}
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="h-5 w-5 fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Self-fading hint */}
      <p className="immersive-hint absolute bottom-10 px-6 text-center text-xs tracking-wide text-white/60">
        {t.immersive.exitHint}
      </p>
    </div>
  )
}
