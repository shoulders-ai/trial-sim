// ─── Standard Normal CDF and Inverse CDF ────────────────────────────────────

/**
 * Standard normal cumulative distribution function.
 * Uses Abramowitz & Stegun rational approximation (formula 26.2.17).
 * Accurate to approximately 7.5e-8.
 */
export function normalCdf(x: number): number {
  if (x === 0) return 0.5
  if (x === Infinity) return 1
  if (x === -Infinity) return 0

  const negative = x < 0
  if (negative) x = -x

  const p = 0.2316419
  const b1 = 0.319381530
  const b2 = -0.356563782
  const b3 = 1.781477937
  const b4 = -1.821255978
  const b5 = 1.330274429

  const t = 1.0 / (1.0 + p * x)
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t

  const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2.0 * Math.PI)
  const cdf = 1.0 - pdf * (b1 * t + b2 * t2 + b3 * t3 + b4 * t4 + b5 * t5)

  return negative ? 1.0 - cdf : cdf
}

/**
 * Inverse of the standard normal CDF (quantile function).
 * Uses the Beasley-Springer-Moro algorithm.
 * Given p in (0,1), returns z such that Phi(z) = p.
 */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  if (p === 0.5) return 0

  // Beasley-Springer-Moro coefficients
  const a = [
    -3.969683028665376e1,
     2.209460984245205e2,
    -2.759285104469687e2,
     1.383577518672690e2,
    -3.066479806614716e1,
     2.506628277459239e0,
  ]
  const b = [
    -5.447609879822406e1,
     1.615858368580409e2,
    -1.556989798598866e2,
     6.680131188771972e1,
    -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
     4.374664141464968e0,
     2.938163982698783e0,
  ]
  const d = [
     7.784695709041462e-3,
     3.224671290700398e-1,
     2.445134137142996e0,
     3.754408661907416e0,
  ]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q: number
  let r: number

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5
    r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
}
