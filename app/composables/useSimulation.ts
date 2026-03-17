import type { Ref } from 'vue'
import type { TrialConfig, TrialResult } from '@shared/types/trial'
import type { ReplicationResult, MonteCarloSummary } from '@shared/types/results'
import { runConventionalTrial } from '@lib/engine/conventional-design'
import { runAdaptiveTrial } from '@lib/engine/adaptive-design'
import { createPRNG, hashSeed } from '@shared/utils/prng'

export type SimPhase =
  | 'idle'
  | 'running-single'
  | 'animating'
  | 'complete'
  | 'running-monte-carlo'
  | 'monte-carlo-complete'

export function useSimulation() {
  const phase = ref<SimPhase>('idle')
  const conventionalResult = ref<TrialResult | null>(null)
  const adaptiveResult = ref<TrialResult | null>(null)
  const seed = ref(Date.now())

  // Monte Carlo state (delegated to worker composable)
  const monteCarloWorker = useMonteCarloWorker()

  function beginSingleTrial(config: TrialConfig) {
    phase.value = 'running-single'
    seed.value = Date.now()

    // Run both trials synchronously (fast, < 50ms)
    const convPrng = createPRNG(hashSeed(seed.value, 0))
    const adapPrng = createPRNG(hashSeed(seed.value, 1))

    conventionalResult.value = runConventionalTrial(config, convPrng)
    adaptiveResult.value = runAdaptiveTrial(config, adapPrng)

    phase.value = 'animating'
  }

  function onAnimationComplete() {
    phase.value = 'complete'
  }

  function beginMonteCarlo(scenarioId: string, n: number = 1000) {
    phase.value = 'running-monte-carlo'
    monteCarloWorker.start(scenarioId, n, seed.value, false)
  }

  function cancelMonteCarlo() {
    monteCarloWorker.cancel()
    phase.value = 'complete'
  }

  // Watch for Monte Carlo completion
  watch(
    () => monteCarloWorker.summary.value,
    (newSummary) => {
      if (newSummary) {
        phase.value = 'monte-carlo-complete'
      }
    },
  )

  function reset() {
    monteCarloWorker.cancel()
    phase.value = 'idle'
    conventionalResult.value = null
    adaptiveResult.value = null
  }

  return {
    phase: readonly(phase),
    conventionalResult: conventionalResult as Readonly<Ref<TrialResult | null>>,
    adaptiveResult: adaptiveResult as Readonly<Ref<TrialResult | null>>,
    seed: readonly(seed),
    // Monte Carlo proxied state
    monteCarloSummary: monteCarloWorker.summary as Readonly<Ref<MonteCarloSummary | null>>,
    monteCarloResults: monteCarloWorker.results as Readonly<Ref<ReplicationResult[]>>,
    monteCarloProgress: monteCarloWorker.progress,
    monteCarloRunning: monteCarloWorker.isRunning,
    monteCarloError: monteCarloWorker.error,
    // Actions
    beginSingleTrial,
    onAnimationComplete,
    beginMonteCarlo,
    cancelMonteCarlo,
    reset,
  }
}
