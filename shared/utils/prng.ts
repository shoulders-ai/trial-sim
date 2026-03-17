// ─── SFC32: Small Fast Counter 32-bit PRNG ──────────────────────────────────
// Deterministic pseudo-random number generator. Same seed always yields same sequence.

export type PRNG = () => number

/**
 * Create a PRNG using the sfc32 algorithm.
 * Returns a function that produces values in [0, 1) on each call.
 */
export function createPRNG(seed: number): PRNG {
  // Initialize internal state from seed using a simple mixing function
  let a = seed | 0
  let b = (seed * 1597334677) | 0
  let c = (seed * 2869860233) | 0
  let counter = 1

  // Warm up the generator with several rounds to ensure good state mixing
  for (let i = 0; i < 15; i++) {
    const t = (a + b + counter) | 0
    counter = (counter + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
  }

  return function sfc32(): number {
    const t = (a + b + counter) | 0
    counter = (counter + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296 // Convert to [0, 1)
  }
}

/**
 * Deterministically combine a master seed with an index to produce a derived seed.
 * Uses a simple hash mixing function to avoid correlation between derived PRNGs.
 */
export function hashSeed(master: number, index: number): number {
  let h = (master ^ (index * 2654435761)) | 0
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b)
  h = h ^ (h >>> 16)
  return h >>> 0 // Ensure positive 32-bit integer
}
