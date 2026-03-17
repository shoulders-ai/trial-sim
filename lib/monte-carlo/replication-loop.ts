// ─── Monte Carlo Replication Loop ────────────────────────────────────────────
// Runs N replications of paired (conventional + adaptive) trials, batching results.

import type { TrialConfig, TrialResult, ReplicationResult } from '../../shared/types'
import { createPRNG, hashSeed } from '../../shared/utils/prng'
import { getScenario } from '../scenarios'
import { runConventionalTrial } from '../engine/conventional-design'
import { runAdaptiveTrial } from '../engine/adaptive-design'

const BATCH_SIZE = 50

/**
 * Run N replications of a scenario, calling onBatch every BATCH_SIZE replications.
 *
 * @param scenarioId - ID of the scenario preset to run
 * @param nReplications - Total number of replications
 * @param masterSeed - Master seed for reproducibility
 * @param nullMode - If true, set all arm trueEffects equal to control (for FWER verification)
 * @param onBatch - Callback with batch results; return false to cancel
 * @returns Array of all replication results
 */
export function runReplications(
  scenarioId: string,
  nReplications: number,
  masterSeed: number,
  nullMode: boolean,
  onBatch?: (batch: ReplicationResult[], completed: number, total: number) => boolean | void
): ReplicationResult[] {
  const scenario = getScenario(scenarioId)
  let config = structuredClone(scenario.config)

  // In null mode: set all arm trueEffects equal to control
  if (nullMode) {
    const controlArm = config.arms.find(a => a.isControl)
    if (controlArm) {
      const controlEffect = controlArm.trueEffect
      for (const arm of config.arms) {
        arm.trueEffect = controlEffect
      }
    }
  }

  const allResults: ReplicationResult[] = []
  let batch: ReplicationResult[] = []

  for (let i = 0; i < nReplications; i++) {
    // Derive independent seeds for conventional and adaptive runs
    const convSeed = hashSeed(masterSeed, i * 2)
    const adaptSeed = hashSeed(masterSeed, i * 2 + 1)

    const convPrng = createPRNG(convSeed)
    const adaptPrng = createPRNG(adaptSeed)

    // Clone config for each run to avoid mutation
    const convConfig = structuredClone(config)
    const adaptConfig = structuredClone(config)

    const convResult = runConventionalTrial(convConfig, convPrng)
    const adaptResult = runAdaptiveTrial(adaptConfig, adaptPrng)

    const replication: ReplicationResult = {
      replicationIndex: i,
      seed: hashSeed(masterSeed, i),
      conventional: {
        totalPatients: convResult.totalPatients,
        duration: convResult.duration,
        winnerArmIndex: convResult.winnerArmIndex,
        correctDecision: convResult.correctDecision,
        effectEstimate: estimateEffect(convResult, config),
      },
      adaptive: {
        totalPatients: adaptResult.totalPatients,
        duration: adaptResult.duration,
        winnerArmIndex: adaptResult.winnerArmIndex,
        correctDecision: adaptResult.correctDecision,
        effectEstimate: estimateEffect(adaptResult, config),
        earlyStopReason: getEarlyStopReason(adaptResult),
        interimsUsed: adaptResult.interims.length,
        armsDropped: countArmsDropped(adaptResult),
      },
    }

    allResults.push(replication)
    batch.push(replication)

    // Send batch if full
    if (batch.length >= BATCH_SIZE) {
      if (onBatch) {
        const cont = onBatch(batch, i + 1, nReplications)
        if (cont === false) break // Cancellation
      }
      batch = []
    }
  }

  // Send remaining batch
  if (batch.length > 0 && onBatch) {
    onBatch(batch, allResults.length, nReplications)
  }

  return allResults
}

// ─── Helper functions ────────────────────────────────────────────────────────

function estimateEffect(result: TrialResult, config: TrialConfig): number {
  if (result.winnerArmIndex < 0) return 0

  const winnerArm = result.arms[result.winnerArmIndex]
  const controlArm = result.arms.find(a => a.config.isControl)
  if (!winnerArm || !controlArm) return 0

  const winnerOutcomes = winnerArm.patients
    .filter(p => p.outcomeObserved)
    .map(p => p.outcome)
  const controlOutcomes = controlArm.patients
    .filter(p => p.outcomeObserved)
    .map(p => p.outcome)

  if (winnerOutcomes.length === 0 || controlOutcomes.length === 0) return 0

  switch (config.endpointType) {
    case 'binary': {
      const p1 = winnerOutcomes.reduce((s, v) => s + v, 0) / winnerOutcomes.length
      const p2 = controlOutcomes.reduce((s, v) => s + v, 0) / controlOutcomes.length
      return p1 - p2
    }
    case 'continuous': {
      const m1 = winnerOutcomes.reduce((s, v) => s + v, 0) / winnerOutcomes.length
      const m2 = controlOutcomes.reduce((s, v) => s + v, 0) / controlOutcomes.length
      return m1 - m2
    }
    case 'time-to-event': {
      // Hazard ratio estimate: simple ratio of event rates
      // Events per patient-month in each arm
      const winnerEvents = winnerOutcomes.length
      const controlEvents = controlOutcomes.length
      if (controlEvents === 0) return 0
      const winnerTotal = winnerArm.patients.length
      const controlTotal = controlArm.patients.length
      if (controlTotal === 0 || winnerTotal === 0) return 0
      return (winnerEvents / winnerTotal) / (controlEvents / controlTotal)
    }
    default:
      return 0
  }
}

function getEarlyStopReason(result: TrialResult): 'efficacy' | 'futility' | 'none' {
  const endEvent = result.eventLog.find(e => e.type === 'trial-end')
  if (!endEvent || endEvent.type !== 'trial-end') return 'none'
  if (endEvent.reason === 'efficacy-stop') return 'efficacy'
  if (endEvent.reason === 'all-arms-dropped') return 'futility'
  return 'none'
}

function countArmsDropped(result: TrialResult): number {
  return result.arms.filter(a => a.status === 'dropped-futility').length
}
