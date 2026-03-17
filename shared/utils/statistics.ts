// ─── Statistical Test Functions ──────────────────────────────────────────────

import { normalCdf } from './normal-cdf'

/**
 * Compute the mean of an array of numbers.
 */
export function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  let sum = 0
  for (let i = 0; i < arr.length; i++) sum += arr[i]
  return sum / arr.length
}

/**
 * Compute the sample variance (unbiased, using n-1 denominator).
 */
export function variance(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  let sumSq = 0
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - m
    sumSq += d * d
  }
  return sumSq / (arr.length - 1)
}

/**
 * Compute the median of an array of numbers.
 */
export function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Compute a quantile of an array using linear interpolation.
 * q should be in [0, 1].
 */
export function quantile(arr: number[], q: number): number {
  if (arr.length === 0) return 0
  if (arr.length === 1) return arr[0]
  const sorted = [...arr].sort((a, b) => a - b)
  const pos = q * (sorted.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sorted[lo]
  const frac = pos - lo
  return sorted[lo] * (1 - frac) + sorted[hi] * frac
}

/**
 * Two-sample Z-test for continuous data.
 * Returns the Z-statistic and two-sided p-value.
 * Positive Z means data1 has a higher mean than data2.
 */
export function zTest(
  data1: number[],
  data2: number[]
): { z: number; pValue: number } {
  const n1 = data1.length
  const n2 = data2.length
  if (n1 < 2 || n2 < 2) return { z: 0, pValue: 1 }

  const m1 = mean(data1)
  const m2 = mean(data2)
  const v1 = variance(data1)
  const v2 = variance(data2)

  const se = Math.sqrt(v1 / n1 + v2 / n2)
  if (se === 0) return { z: 0, pValue: 1 }

  const z = (m1 - m2) / se
  // One-sided p-value: P(Z > z) for testing superiority of data1 over data2
  const pValue = 1 - normalCdf(z)

  return { z, pValue }
}

/**
 * Z-test for two proportions.
 * Returns Z-statistic and one-sided p-value (testing p1 > p2).
 */
export function proportionTest(
  successes1: number,
  n1: number,
  successes2: number,
  n2: number
): { z: number; pValue: number } {
  if (n1 === 0 || n2 === 0) return { z: 0, pValue: 1 }

  const p1 = successes1 / n1
  const p2 = successes2 / n2

  // Pooled proportion under the null
  const pPooled = (successes1 + successes2) / (n1 + n2)

  if (pPooled === 0 || pPooled === 1) return { z: 0, pValue: 1 }

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2))
  if (se === 0) return { z: 0, pValue: 1 }

  const z = (p1 - p2) / se
  // One-sided p-value
  const pValue = 1 - normalCdf(z)

  return { z, pValue }
}

/**
 * Log-rank Z-statistic for time-to-event data.
 * Uses the observed vs expected events formulation.
 * Z = (O_1 - E_1) / sqrt(E_1 * (1 - E_1/N))
 * where O_1 = observed events in group 1, E_1 = expected events in group 1.
 *
 * A negative Z means fewer events than expected (i.e., the treatment is protective).
 * We return -Z so that positive values indicate treatment benefit.
 */
export function logRankZ(events: number, expected: number): number {
  if (expected <= 0) return 0
  // Variance of O - E under the null is approximately E * (1 - E/totalEvents)
  // But for a simpler formulation: Var ≈ E (when E is expected under null proportional allocation)
  // Standard log-rank: Z = (O - E) / sqrt(Var)
  // We negate so positive Z = fewer events = treatment benefit
  const z = -(events - expected) / Math.sqrt(expected)
  return z
}
