import type { TrialConfig } from '@shared/types/trial'
import type { ScenarioPreset } from '@shared/types/scenario'
import { scenarios, getScenario } from '@lib/scenarios'

function mergeConfig(
  base: TrialConfig | undefined,
  overrides: Partial<TrialConfig>,
): TrialConfig | undefined {
  if (!base) return undefined
  return {
    ...base,
    ...overrides,
    // Deep merge design configs to preserve nested structure
    conventional: {
      ...base.conventional,
      ...(overrides.conventional || {}),
      maxSampleSize: overrides.conventional?.maxSampleSize ?? base.conventional.maxSampleSize,
    },
    adaptive: {
      ...base.adaptive,
      ...(overrides.adaptive || {}),
      maxSampleSize: overrides.adaptive?.maxSampleSize ?? base.adaptive.maxSampleSize,
    },
    arms: overrides.arms ?? base.arms,
    enrollmentRate: overrides.enrollmentRate ?? base.enrollmentRate,
    outcomeDelay: overrides.outcomeDelay ?? base.outcomeDelay,
  }
}

export function useScenario() {
  const selectedId = ref('oncology-multiarm')
  const allScenarios = computed<ScenarioPreset[]>(() => scenarios)

  const current = computed<ScenarioPreset | undefined>(() => {
    try {
      return getScenario(selectedId.value)
    } catch {
      return undefined
    }
  })

  const overrides = ref<Partial<TrialConfig>>({})

  const effectiveConfig = computed<TrialConfig | undefined>(() =>
    mergeConfig(current.value?.config, overrides.value),
  )

  // Reset overrides when scenario changes
  watch(selectedId, () => {
    overrides.value = {}
  })

  return {
    selectedId,
    allScenarios,
    current,
    overrides,
    effectiveConfig,
  }
}
