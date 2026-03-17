// ─── Scenario Registry ───────────────────────────────────────────────────────
// Exports all scenario presets and a lookup function.

import type { ScenarioPreset } from '../../shared/types'
import oncologyMultiArm from './oncology-multiarm'
import vaccineEfficacy from './vaccine-efficacy'
import doseFinding from './dose-finding'
import rareDisease from './rare-disease'

/**
 * All available scenario presets.
 */
export const scenarios: ScenarioPreset[] = [
  oncologyMultiArm,
  vaccineEfficacy,
  doseFinding,
  rareDisease,
]

/**
 * Look up a scenario by its ID.
 * Throws if the ID is not found.
 */
export function getScenario(id: string): ScenarioPreset {
  const scenario = scenarios.find(s => s.id === id)
  if (!scenario) {
    throw new Error(`Unknown scenario ID: "${id}". Available: ${scenarios.map(s => s.id).join(', ')}`)
  }
  return scenario
}
