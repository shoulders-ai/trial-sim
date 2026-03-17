// ─── Interim Analysis ────────────────────────────────────────────────────────
// Performs interim analyses: computes Z-statistics, applies boundaries, determines arm actions.

import type { ArmState, InterimResult, EndpointType } from '../../shared/types'
import { zTest, proportionTest, logRankZ } from '../../shared/utils/statistics'
import { getEfficacyBoundary, obrienFlemingSpend, pocockSpend } from './alpha-spending'

/**
 * Perform an interim analysis at the current state of the trial.
 *
 * @param arms - Current arm states with patient data
 * @param config - Design configuration (alpha, spending, futility boundary, etc.)
 * @param analysisNumber - 1-indexed analysis number
 * @param informationFraction - Current information fraction
 * @param endpointType - Type of endpoint being analyzed
 * @param calendarTime - Current calendar time
 * @param previousSpend - Cumulative alpha already spent at prior interims
 * @returns InterimResult with Z-statistics, boundaries, and arm decisions
 */
export function performInterimAnalysis(
  arms: ArmState[],
  config: {
    alpha: number
    alphaSpending: 'obrien-fleming' | 'pocock'
    futilityBoundary: number
  },
  analysisNumber: number,
  informationFraction: number,
  endpointType: EndpointType,
  calendarTime: number,
  previousSpend: number
): InterimResult {
  // Find control arm
  const controlArm = arms.find(a => a.config.isControl)!
  const controlPatients = controlArm.patients.filter(p => p.outcomeObserved)
  const controlOutcomes = controlPatients.map(p => p.outcome)

  // Compute Z-statistics for each arm vs control
  const zStatistics: number[] = new Array(arms.length).fill(0)
  const armsDropped: number[] = []
  const armsStopped: number[] = []

  // Compute the efficacy boundary at this look
  const efficacyBoundary = getEfficacyBoundary(
    config.alpha,
    config.alphaSpending,
    informationFraction,
    previousSpend
  )

  for (const arm of arms) {
    if (arm.config.isControl) continue
    if (arm.status !== 'active') continue

    const armPatients = arm.patients.filter(p => p.outcomeObserved)
    const armOutcomes = armPatients.map(p => p.outcome)

    if (armOutcomes.length < 2 || controlOutcomes.length < 2) {
      zStatistics[arm.index] = 0
      continue
    }

    let z = 0

    switch (endpointType) {
      case 'binary': {
        const successes1 = armOutcomes.reduce((s, v) => s + v, 0)
        const successes2 = controlOutcomes.reduce((s, v) => s + v, 0)
        const result = proportionTest(successes1, armOutcomes.length, successes2, controlOutcomes.length)
        z = result.z
        break
      }
      case 'continuous': {
        const result = zTest(armOutcomes, controlOutcomes)
        z = result.z
        break
      }
      case 'time-to-event': {
        // For time-to-event: count events (outcome <= some observation window)
        // In our model, outcome is the event time. An event is "observed" if it occurred.
        // We use a log-rank type statistic:
        // Under proportional hazards, events are allocated proportionally to hazard rates.
        // Total events across both arms, expected under null (equal hazards).
        const armEvents = armOutcomes.length
        const controlEvents = controlOutcomes.length
        const totalEvents = armEvents + controlEvents

        if (totalEvents === 0) {
          z = 0
          break
        }

        // Under null, expected events in experimental arm = total * (n_exp / (n_exp + n_ctrl))
        const totalArmPatients = arm.patients.length
        const totalControlPatients = controlArm.patients.length
        const totalPatientsInComparison = totalArmPatients + totalControlPatients

        if (totalPatientsInComparison === 0) {
          z = 0
          break
        }

        const expectedArmEvents = totalEvents * (totalArmPatients / totalPatientsInComparison)
        // Positive Z = fewer events than expected = treatment benefit (protective)
        z = logRankZ(armEvents, expectedArmEvents)
        break
      }
    }

    zStatistics[arm.index] = z
    arm.currentZ = z

    // Check efficacy: Z > efficacy boundary
    if (z >= efficacyBoundary) {
      armsStopped.push(arm.index)
    }
    // Check futility: Z < futility boundary (only for non-final analyses)
    else if (z < config.futilityBoundary) {
      armsDropped.push(arm.index)
    }
  }

  return {
    analysisNumber,
    calendarTime,
    informationFraction,
    zStatistics,
    efficacyBoundary,
    futilityBoundary: config.futilityBoundary,
    armsDropped,
    armsStopped,
  }
}
