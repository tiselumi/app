/**
 * Generates an AudioBuffer containing stereo procedural noise.
 * Duration is typically 5-10 seconds, which seamlessly loops without repetitive artifacts.
 */
export function createNoiseBuffer(
  ctx: AudioContext,
  type: 'white' | 'pink' | 'brown',
  durationSeconds = 6,
): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const frameCount = Math.floor(sampleRate * durationSeconds)
  const buffer = ctx.createBuffer(2, frameCount, sampleRate)

  const leftChannel = buffer.getChannelData(0)
  const rightChannel = buffer.getChannelData(1)

  switch (type) {
    case 'white':
      fillWhiteNoise(leftChannel)
      fillWhiteNoise(rightChannel)
      break
    case 'pink':
      fillPinkNoise(leftChannel)
      fillPinkNoise(rightChannel)
      break
    case 'brown':
      fillBrownNoise(leftChannel)
      fillBrownNoise(rightChannel)
      break
  }

  // Crossfade boundary samples (first & last 50ms) to ensure zero pop/click during continuous looping
  applyLoopCrossfade(leftChannel, sampleRate)
  applyLoopCrossfade(rightChannel, sampleRate)

  return buffer
}

function fillWhiteNoise(channel: Float32Array): void {
  for (let i = 0; i < channel.length; i++) {
    channel[i] = (Math.random() * 2 - 1) * 0.5
  }
}

/**
 * Paul Kellet's refined filter method for Pink Noise (1/f)
 */
function fillPinkNoise(channel: Float32Array): void {
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0

  for (let i = 0; i < channel.length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    b6 = white * 0.115926
    // Scaled for comfortable listening level
    channel[i] = pink * 0.08
  }
}

/**
 * Leaky integrator for Brown (Brownian / 1/f^2) deep rumbling noise
 */
function fillBrownNoise(channel: Float32Array): void {
  let lastOut = 0.0

  for (let i = 0; i < channel.length; i++) {
    const white = Math.random() * 2 - 1
    // Leaky integrator prevents DC drift
    lastOut = (lastOut + 0.02 * white) / 1.02
    // Scale for warm and deep presence
    channel[i] = lastOut * 1.8
  }
}

/**
 * Smoothly blends the end of the buffer into the start to guarantee click-free loop points
 */
function applyLoopCrossfade(channel: Float32Array, sampleRate: number): void {
  const fadeSamples = Math.min(Math.floor(sampleRate * 0.08), Math.floor(channel.length / 4))
  for (let i = 0; i < fadeSamples; i++) {
    const progress = i / fadeSamples
    // Cosine smoothing curve
    const fadeOut = Math.cos((progress * Math.PI) / 2)
    const fadeIn = Math.sin((progress * Math.PI) / 2)

    const endIdx = channel.length - fadeSamples + i
    const startVal = channel[i] ?? 0
    const endVal = channel[endIdx] ?? 0

    // Blend
    const blended = startVal * fadeIn + endVal * fadeOut
    channel[i] = blended
    channel[endIdx] = blended
  }
}
