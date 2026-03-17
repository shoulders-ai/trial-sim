// ─── Patient Outcome Generation ──────────────────────────────────────────────
// Generates individual patient outcomes based on endpoint type and arm configuration.

import type { PRNG } from '../../shared/utils/prng'
import type { ArmConfig, EndpointType } from '../../shared/types'
import { sampleBernoulli, sampleNormal, sampleExponential } from '../../shared/utils/distributions'

/**
 * Generate a single patient's outcome value based on the endpoint type.
 *
 * @param prng - Deterministic PRNG
 * @param armConfig - The arm this patient is assigned to
 * @param endpointType - Type of endpoint
 * @param sd - Standard deviation for continuous endpoints
 * @param controlHazard - Not used directly; armConfig.trueEffect already contains the hazard rate
 * @returns The outcome value:
 *   - binary: 0 or 1 (Bernoulli with p = trueEffect = response rate)
 *   - continuous: real number (Normal with mean = trueEffect, sd from config)
 *   - time-to-event: positive real number (Exponential with rate = trueEffect = hazard rate)
 */
export function generateOutcome(
  prng: PRNG,
  armConfig: ArmConfig,
  endpointType: EndpointType,
  sd?: number,
  controlHazard?: number
): number {
  switch (endpointType) {
    case 'binary':
      // trueEffect is the response rate (probability of success)
      return sampleBernoulli(prng, armConfig.trueEffect)

    case 'continuous':
      // trueEffect is the mean outcome; sd is from config
      return sampleNormal(prng, armConfig.trueEffect, sd ?? 1.0)

    case 'time-to-event':
      // trueEffect is the hazard rate (events per patient-month)
      // Lower hazard = better (fewer events)
      return sampleExponential(prng, armConfig.trueEffect)

    default:
      throw new Error(`Unknown endpoint type: ${endpointType}`)
  }
}
