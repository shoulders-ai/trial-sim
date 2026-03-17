// ─── Operating Characteristics Computation ───────────────────────────────────
// Aggregates replication results into a MonteCarloSummary.

import type { ReplicationResult, MonteCarloSummary } from '../../shared/types'
import { mean, median, variance, quantile } from '../../shared/utils/statistics'

/**
 * Compute the full operating characteristics summary from replication results.
 *
 * @param results - Array of paired replication results
 * @param masterSeed - The master seed used to generate these results
 * @returns MonteCarloSummary with all computed metrics
 */
export function computeSummary(
  results: ReplicationResult[],
  masterSeed: number = 0
): MonteCarloSummary {
  const n = results.length
  if (n === 0) {
    return emptyMonteCarloSummary(masterSeed)
  }

  // ─── Conventional arm metrics ──────────────────────────────────────────
  const convPatients = results.map(r => r.conventional.totalPatients)
  const convDurations = results.map(r => r.conventional.duration)
  const convCorrect = results.map(r => r.conventional.correctDecision)
  const convWinners = results.map(r => r.conventional.winnerArmIndex)

  const convPower = convCorrect.filter(c => c).length / n
  const convFwer = convWinners.filter(w => w >= 0).length / n // Under null, any rejection is a false positive

  // ─── Adaptive arm metrics ──────────────────────────────────────────────
  const adaptPatients = results.map(r => r.adaptive.totalPatients)
  const adaptDurations = results.map(r => r.adaptive.duration)
  const adaptCorrect = results.map(r => r.adaptive.correctDecision)
  const adaptWinners = results.map(r => r.adaptive.winnerArmIndex)
  const adaptEarlyStop = results.map(r => r.adaptive.earlyStopReason)
  const adaptArmsDropped = results.map(r => r.adaptive.armsDropped)

  const adaptPower = adaptCorrect.filter(c => c).length / n
  const adaptFwer = adaptWinners.filter(w => w >= 0).length / n
  const earlyStopRate = adaptEarlyStop.filter(r => r !== 'none').length / n

  // ─── Patients and time saved ───────────────────────────────────────────
  const patientsSaved = results.map(r => r.conventional.totalPatients - r.adaptive.totalPatients)
  const timeSaved = results.map(r => r.conventional.duration - r.adaptive.duration)

  // ─── Monte Carlo Standard Error (MCSE) ─────────────────────────────────
  // For a proportion p estimated from n trials: MCSE = sqrt(p*(1-p)/n)
  const convPowerMcse = Math.sqrt(convPower * (1 - convPower) / n)
  const adaptPowerMcse = Math.sqrt(adaptPower * (1 - adaptPower) / n)

  // ─── Distribution percentiles for histograms ──────────────────────────
  const convSsDist = buildDistribution(convPatients)
  const convDurDist = buildDistribution(convDurations)
  const adaptSsDist = buildDistribution(adaptPatients)
  const adaptDurDist = buildDistribution(adaptDurations)

  return {
    nReplications: n,
    masterSeed,
    conventional: {
      power: convPower,
      meanSampleSize: mean(convPatients),
      medianSampleSize: median(convPatients),
      sampleSizeDistribution: convSsDist,
      meanDuration: mean(convDurations),
      medianDuration: median(convDurations),
      durationDistribution: convDurDist,
      fwer: convFwer,
      powerMcse: convPowerMcse,
    },
    adaptive: {
      power: adaptPower,
      meanSampleSize: mean(adaptPatients),
      medianSampleSize: median(adaptPatients),
      sampleSizeDistribution: adaptSsDist,
      meanDuration: mean(adaptDurations),
      medianDuration: median(adaptDurations),
      durationDistribution: adaptDurDist,
      fwer: adaptFwer,
      earlyStopRate,
      meanArmsDropped: mean(adaptArmsDropped),
      powerMcse: adaptPowerMcse,
    },
    medianPatientsSaved: median(patientsSaved),
    medianTimeSaved: median(timeSaved),
  }
}

/**
 * Build a distribution summary: [p5, p10, p25, p50, p75, p90, p95]
 */
function buildDistribution(values: number[]): number[] {
  return [
    quantile(values, 0.05),
    quantile(values, 0.10),
    quantile(values, 0.25),
    quantile(values, 0.50),
    quantile(values, 0.75),
    quantile(values, 0.90),
    quantile(values, 0.95),
  ]
}

function emptyMonteCarloSummary(masterSeed: number): MonteCarloSummary {
  const emptyDist = [0, 0, 0, 0, 0, 0, 0]
  return {
    nReplications: 0,
    masterSeed,
    conventional: {
      power: 0,
      meanSampleSize: 0,
      medianSampleSize: 0,
      sampleSizeDistribution: emptyDist,
      meanDuration: 0,
      medianDuration: 0,
      durationDistribution: emptyDist,
      fwer: 0,
      powerMcse: 0,
    },
    adaptive: {
      power: 0,
      meanSampleSize: 0,
      medianSampleSize: 0,
      sampleSizeDistribution: emptyDist,
      meanDuration: 0,
      medianDuration: 0,
      durationDistribution: emptyDist,
      fwer: 0,
      earlyStopRate: 0,
      meanArmsDropped: 0,
      powerMcse: 0,
    },
    medianPatientsSaved: 0,
    medianTimeSaved: 0,
  }
}
