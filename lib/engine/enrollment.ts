// ─── Enrollment Time Generation ──────────────────────────────────────────────
// Generates calendar times of patient arrivals using a Poisson process.

import type { PRNG } from '../../shared/utils/prng'

/**
 * Generate enrollment times from a homogeneous Poisson process.
 * @param prng - Deterministic PRNG
 * @param rate - Patients per unit time (month)
 * @param maxPatients - Total patients to enroll
 * @returns Array of calendar times at which each patient enrolls
 */
export function generateEnrollmentTimes(
  prng: PRNG,
  rate: number,
  maxPatients: number
): number[] {
  const times: number[] = []
  let currentTime = 0

  for (let i = 0; i < maxPatients; i++) {
    // Inter-arrival time is exponential with rate = enrollmentRate
    let u = prng()
    while (u === 0) u = prng()
    const interArrival = -Math.log(u) / rate
    currentTime += interArrival
    times.push(currentTime)
  }

  return times
}
