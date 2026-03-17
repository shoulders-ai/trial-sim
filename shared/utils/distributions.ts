// ─── Statistical Distribution Samplers ───────────────────────────────────────
// All functions take a PRNG as the first argument for deterministic sampling.

import type { PRNG } from './prng'

/**
 * Sample from a Normal distribution using Box-Muller transform.
 */
export function sampleNormal(prng: PRNG, mean: number = 0, sd: number = 1): number {
  // Box-Muller transform: generate two uniform random numbers, produce standard normal
  let u1 = prng()
  // Avoid log(0)
  while (u1 === 0) u1 = prng()
  const u2 = prng()

  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return mean + sd * z
}

/**
 * Sample from an Exponential distribution using inverse CDF.
 * Rate parameterization: E[X] = 1/rate.
 */
export function sampleExponential(prng: PRNG, rate: number): number {
  let u = prng()
  while (u === 0) u = prng()
  return -Math.log(u) / rate
}

/**
 * Sample a single Bernoulli trial.
 * Returns 1 with probability p, 0 otherwise.
 */
export function sampleBernoulli(prng: PRNG, p: number): number {
  return prng() < p ? 1 : 0
}

/**
 * Sample from a Binomial(n, p) distribution.
 * Uses direct Bernoulli sum for small n (<=50), normal approximation for large n.
 */
export function sampleBinomial(prng: PRNG, n: number, p: number): number {
  if (n <= 0) return 0
  if (p <= 0) return 0
  if (p >= 1) return n

  if (n <= 50) {
    // Direct sum of Bernoulli trials
    let successes = 0
    for (let i = 0; i < n; i++) {
      if (prng() < p) successes++
    }
    return successes
  }

  // Normal approximation for large n
  const mean = n * p
  const sd = Math.sqrt(n * p * (1 - p))
  const result = Math.round(sampleNormal(prng, mean, sd))
  return Math.max(0, Math.min(n, result))
}

/**
 * Sample from a Poisson(lambda) distribution.
 * Uses Knuth's algorithm for small lambda (<=30), normal approximation for large lambda.
 */
export function samplePoisson(prng: PRNG, lambda: number): number {
  if (lambda <= 0) return 0

  if (lambda > 30) {
    // Normal approximation
    const result = Math.round(sampleNormal(prng, lambda, Math.sqrt(lambda)))
    return Math.max(0, result)
  }

  // Knuth's algorithm
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1.0

  do {
    k++
    p *= prng()
  } while (p > L)

  return k - 1
}
