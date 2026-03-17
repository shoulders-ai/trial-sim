// ─── Conventional (Fixed) Design Wrapper ─────────────────────────────────────
// Runs a trial with no interim analyses — enrolls to maxSampleSize and does one final analysis.

import type { PRNG } from '../../shared/utils/prng'
import type { TrialConfig, TrialResult } from '../../shared/types'
import { runTrial } from './trial-runner'

/**
 * Run a conventional (non-adaptive) trial.
 * Uses the conventional DesignConfig from the TrialConfig.
 * No interim analyses are performed; all patients are enrolled before final analysis.
 */
export function runConventionalTrial(
  config: TrialConfig,
  prng: PRNG
): TrialResult {
  return runTrial(config.conventional, config, prng)
}
