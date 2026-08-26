import { describe, expect, it } from 'vitest'

import { resolveImmersiveScene } from './immersiveScenes'

describe('resolveImmersiveScene', () => {
  it('falls back to the calm night scene when nothing plays', () => {
    expect(resolveImmersiveScene([]).id).toBe('night')
  })

  it('picks the water scene for nature sounds', () => {
    expect(resolveImmersiveScene(['rain-on-window']).id).toBe('nature')
    expect(resolveImmersiveScene(['ocean-waves-gentle']).id).toBe('nature')
  })

  it('picks the warm scene for cozy sounds', () => {
    expect(resolveImmersiveScene(['coffee-shop-ambience']).id).toBe('comfort')
    expect(resolveImmersiveScene(['train-cabin-interior']).id).toBe('comfort')
  })

  it('picks the minimalist scene for focus noise', () => {
    const scene = resolveImmersiveScene(['brown-noise'])
    expect(scene.id).toBe('noise')
    // Focus mode is intentionally free of particles
    expect(scene.showParticles).toBe(false)
  })

  it('picks the starry scene for asmr sounds', () => {
    expect(resolveImmersiveScene(['book-pages-turning']).id).toBe('asmr')
  })

  it('follows the dominant category in a mixed set', () => {
    const scene = resolveImmersiveScene([
      'rain-on-window',
      'ocean-waves-foam',
      'brown-noise',
      'book-pages-turning',
    ])
    expect(scene.id).toBe('nature')
  })

  it('ignores unknown sound ids and still falls back to night', () => {
    expect(resolveImmersiveScene(['does-not-exist']).id).toBe('night')
  })
})
