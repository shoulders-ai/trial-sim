// ─── Alpha Spending Functions & Efficacy Boundaries ──────────────────────────
// Implements Lan-DeMets spending functions for group sequential designs.

import { normalCdf, normalQuantile } from '../../shared/utils/normal-cdf'

/**
 * Lan-DeMets spending function approximating O'Brien-Fleming boundaries.
 * alpha*(t) = 2 - 2 * Phi(z_{alpha/2} / sqrt(t))
 *
 * @param alpha - Total one-sided significance level
 * @param t - Information fraction in (0, 1]
 * @returns Cumulative alpha spent up to information fraction t
 */
export function obrienFlemingSpend(alpha: number, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return alpha

  // For one-sided alpha, the critical value is z_{alpha}
  // The OBF spending formula: 2*(1 - Phi(z_{alpha/2} / sqrt(t)))
  // Since we're working with one-sided alpha, use z_{alpha} directly
  const zAlpha = normalQuantile(1 - alpha)
  const spent = 2 * (1 - normalCdf(zAlpha / Math.sqrt(t)))
  return Math.min(spent, alpha)
}

/**
 * Lan-DeMets spending function approximating Pocock boundaries.
 * alpha*(t) = alpha * ln(1 + (e - 1) * t)
 *
 * @param alpha - Total one-sided significance level
 * @param t - Information fraction in (0, 1]
 * @returns Cumulative alpha spent up to information fraction t
 */
export function pocockSpend(alpha: number, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return alpha

  const spent = alpha * Math.log(1 + (Math.E - 1) * t)
  return Math.min(spent, alpha)
}

/**
 * Compute the efficacy boundary (critical Z-value) at a given interim analysis.
 *
 * The boundary is determined by the incremental alpha available at this look:
 *   incrementalAlpha = alphaSpent(t) - previousSpend
 * Then the boundary z satisfies: P(Z > z) = incrementalAlpha
 *
 * @param alpha - Total one-sided significance level
 * @param spending - Which spending function to use
 * @param informationFraction - Current information fraction
 * @param previousSpend - Cumulative alpha already spent at previous looks
 * @returns The Z-value efficacy boundary at this look
 */
export function getEfficacyBoundary(
  alpha: number,
  spending: 'obrien-fleming' | 'pocock',
  informationFraction: number,
  previousSpend: number
): number {
  const spendFn = spending === 'obrien-fleming' ? obrienFlemingSpend : pocockSpend
  const cumulativeSpend = spendFn(alpha, informationFraction)
  const incrementalAlpha = Math.max(cumulativeSpend - previousSpend, 1e-15)

  // The boundary z: P(Z > z) = incrementalAlpha => z = Phi^{-1}(1 - incrementalAlpha)
  const boundary = normalQuantile(1 - incrementalAlpha)
  return boundary
}
