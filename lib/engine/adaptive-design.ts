// ─── Adaptive Design Wrapper ─────────────────────────────────────────────────
// Runs a trial with interim analyses, arm dropping, and reallocation.

import type { PRNG } from '../../shared/utils/prng'
import type { TrialConfig, TrialResult } from '../../shared/types'
import { runTrial } from './trial-runner'

/**
 * Run an adaptive trial.
 * Uses the adaptive DesignConfig from the TrialConfig.
 * Interim analyses are performed at the specified information fractions.
 * Arms may be dropped for futility or stopped for efficacy.
 * When arms are dropped, allocation ratios are renormalized in the trial runner.
 */
export function runAdaptiveTrial(
  config: TrialConfig,
  prng: PRNG
): TrialResult {
  return runTrial(config.adaptive, config, prng)
}
