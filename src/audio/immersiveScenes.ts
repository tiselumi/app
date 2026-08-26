import { SOUND_CATALOG } from './catalog'

export type ImmersiveSceneId = 'night' | 'nature' | 'comfort' | 'noise' | 'asmr'

export interface ImmersiveScene {
  id: ImmersiveSceneId
  /** Container background gradient classes. */
  backgroundClass: string
  /** Central blurred glow blob classes. */
  coreGlowClass: string
  /** Border/tint classes shared by the breathing rings. */
  ringClass: string
  /** Whether ambient particles are shown. */
  showParticles: boolean
  /** Particle count when shown. */
  particleCount: number
  /** Shape classes for one particle (size kept dynamic per index). */
  particleShapeClass: string
  /** Color class for particles. */
  particleColorClass: string
  /** CSS animation class driving the particle motion. */
  particleMotionClass: string
}

const SCENES: Record<ImmersiveSceneId, ImmersiveScene> = {
  // Fallback: calm sage night with drifting fireflies.
  night: {
    id: 'night',
    backgroundClass: 'from-[#0c1814] via-[#10231d] to-[#16281f]',
    coreGlowClass: 'bg-[#dfe9df]/25',
    ringClass: 'border-[#dfe9df]/20',
    showParticles: true,
    particleCount: 8,
    particleShapeClass: 'h-1.5 w-1.5 rounded-full',
    particleColorClass: 'bg-[#e8e2d4]/70',
    particleMotionClass: 'immersive-drift',
  },
  // Water & rain: cool blue-green depths with slowly falling drops.
  nature: {
    id: 'nature',
    backgroundClass: 'from-[#081217] via-[#0d2129] to-[#11282e]',
    coreGlowClass: 'bg-[#8fd3d0]/20',
    ringClass: 'border-[#8fd3d0]/25',
    showParticles: true,
    particleCount: 16,
    particleShapeClass: 'h-3 w-px rounded-full',
    particleColorClass: 'bg-[#9fd8d4]/60',
    particleMotionClass: 'immersive-fall',
  },
  // Cozy places: warm amber light with sparks rising like from a fireplace.
  comfort: {
    id: 'comfort',
    backgroundClass: 'from-[#170f08] via-[#231510] to-[#2c1c11]',
    coreGlowClass: 'bg-[#f5d9a8]/20',
    ringClass: 'border-[#f0cf96]/25',
    showParticles: true,
    particleCount: 12,
    particleShapeClass: 'h-1 w-1 rounded-full',
    particleColorClass: 'bg-[#f2c078]/70',
    particleMotionClass: 'immersive-rise',
  },
  // Focus noise: pure minimalist breathing circles, nothing else.
  noise: {
    id: 'noise',
    backgroundClass: 'from-[#0f1512] via-[#131d17] to-[#172420]',
    coreGlowClass: 'bg-[#cfe0d4]/20',
    ringClass: 'border-[#cfe0d4]/25',
    showParticles: false,
    particleCount: 0,
    particleShapeClass: '',
    particleColorClass: '',
    particleMotionClass: '',
  },
  // ASMR: a quiet night sky of softly twinkling stars.
  asmr: {
    id: 'asmr',
    backgroundClass: 'from-[#110f19] via-[#171426] to-[#1e1930]',
    coreGlowClass: 'bg-[#cabfe8]/20',
    ringClass: 'border-[#cabfe8]/20',
    showParticles: true,
    particleCount: 18,
    particleShapeClass: 'h-1 w-1 rounded-full',
    particleColorClass: 'bg-[#ddd4f5]/80',
    particleMotionClass: 'immersive-twinkle',
  },
}

/**
 * Pick the immersive scene that matches the currently playing mix.
 * The scene follows the dominant sound category; with nothing
 * recognizable playing it falls back to the calm sage night.
 */
export function resolveImmersiveScene(soundIds: Iterable<string>): ImmersiveScene {
  const counts = new Map<ImmersiveSceneId, number>()
  for (const soundId of soundIds) {
    const item = SOUND_CATALOG.find((s) => s.id === soundId)
    if (!item) continue
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
  }

  let best: ImmersiveSceneId | null = null
  let bestCount = 0
  for (const [sceneId, count] of counts) {
    if (count > bestCount) {
      best = sceneId
      bestCount = count
    }
  }

  return SCENES[best ?? 'night']
}
