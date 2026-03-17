// ─── Accumulated OCTAVE State ────────────────────────────────────────────────
// Tracks user choices as they progress through the OCTAVE framework sections.
// Each section builds on previous choices. By the finale, we have a complete
// simulation specification.

import type { TrialConfig, EndpointType } from '@shared/types/trial'
import type { ScenarioPreset } from '@shared/types/scenario'
import { scenarios, getScenario } from '@lib/scenarios'

export interface OctaveChoices {
  // O — Objective
  objectiveId: string | null          // which CTS objective
  varies: { design: boolean; factors: boolean; analysis: boolean }

  // C — Characteristics
  effectSize: number                  // relative to baseline (0-1 for binary, SD units for continuous)
  variability: number                 // SD multiplier (0.5 = low, 1 = default, 2 = high)
  accrualMultiplier: number           // 0.5 = slow, 1 = default, 2 = fast
  dropoutRate: number                 // 0 to 0.3

  // T — Trial design
  scenarioId: string                  // base scenario preset
  nArms: number
  useAdaptive: boolean
  nInterims: number                   // 0 = conventional only
  maxSampleSize: number

  // A — Analysis
  analysisMethod: 'z-test' | 'covariate-adjusted'

  // V — Valuation (display only, computed from above)

  // E — Evidence
  nReplications: number
}

const DEFAULT_CHOICES: OctaveChoices = {
  objectiveId: null,
  varies: { design: false, factors: false, analysis: false },
  effectSize: 0.35,
  variability: 1.0,
  accrualMultiplier: 1.0,
  dropoutRate: 0,
  scenarioId: 'oncology-multiarm',
  nArms: 4,
  useAdaptive: true,
  nInterims: 2,
  maxSampleSize: 360,
  analysisMethod: 'z-test',
  nReplications: 1000,
}

export function useOctaveState() {
  const choices = ref<OctaveChoices>({ ...DEFAULT_CHOICES })
  const activeSection = ref(0) // index of the currently visible section

  // Derive a TrialConfig from the accumulated choices
  const derivedConfig = computed<TrialConfig | null>(() => {
    const scenario = getScenario(choices.value.scenarioId)
    if (!scenario) return null

    const base = structuredClone(scenario.config)

    // Apply C — Characteristics overrides
    for (const arm of base.arms) {
      if (!arm.isControl) {
        // Scale effect size: for binary, it's the absolute response rate
        // We adjust relative to control
        const controlEffect = base.arms.find(a => a.isControl)?.trueEffect ?? 0
        const originalDelta = arm.trueEffect - controlEffect
        arm.trueEffect = controlEffect + originalDelta * (choices.value.effectSize / 0.35)
        // Clamp binary between 0 and 1
        if (base.endpointType === 'binary') {
          arm.trueEffect = Math.max(0, Math.min(1, arm.trueEffect))
        }
      }
    }

    base.enrollmentRate = Math.max(1, Math.round(base.enrollmentRate * choices.value.accrualMultiplier))

    if (base.outcomeSd) {
      base.outcomeSd = base.outcomeSd * choices.value.variability
    }

    // Apply T — Trial design overrides
    base.conventional.maxSampleSize = choices.value.maxSampleSize
    base.adaptive.maxSampleSize = choices.value.maxSampleSize

    // Adjust interims
    if (choices.value.nInterims === 0) {
      base.adaptive.interimFractions = []
    } else if (choices.value.nInterims === 1) {
      base.adaptive.interimFractions = [0.5]
    } else if (choices.value.nInterims === 2) {
      base.adaptive.interimFractions = [0.33, 0.67]
    } else if (choices.value.nInterims >= 3) {
      base.adaptive.interimFractions = [0.25, 0.5, 0.75]
    }

    return base
  })

  const currentScenario = computed<ScenarioPreset | null>(() => {
    try {
      return getScenario(choices.value.scenarioId)
    } catch {
      return null
    }
  })

  function resetChoices() {
    choices.value = { ...DEFAULT_CHOICES }
  }

  function scrollToSection(index: number) {
    activeSection.value = index
  }

  return {
    choices,
    activeSection,
    derivedConfig,
    currentScenario,
    allScenarios: scenarios,
    resetChoices,
    scrollToSection,
  }
}
