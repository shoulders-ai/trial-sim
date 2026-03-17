<script setup lang="ts">
import { COLORS } from '~/utils/colors'
import { createPRNG, hashSeed } from '@shared/utils/prng'
import { runAdaptiveTrial } from '@lib/engine/adaptive-design'
import { getScenario } from '@lib/scenarios'

type Hypothesis = 'null' | 'alternative'

const hypothesis = ref<Hypothesis>('null')
const results = ref<boolean[]>([]) // true = rejected null hypothesis
const hasRun = ref(false)
const isRunning = ref(false)

const nTrials = 100
const gridCols = 10

// Build scenario configs
const baseScenario = getScenario('oncology-multiarm')

// Null scenario: all arms same as control
const nullConfig = {
  ...baseScenario.config,
  arms: baseScenario.config.arms.map(arm => ({
    ...arm,
    trueEffect: 0.20, // all same as control
  })),
}

// Alternative scenario: use the real scenario (Arm B is truly better)
const altConfig = baseScenario.config

function runSimulations() {
  isRunning.value = true
  hasRun.value = true

  const config = hypothesis.value === 'null' ? nullConfig : altConfig
  const masterSeed = Date.now()
  const outcomes: boolean[] = []

  for (let i = 0; i < nTrials; i++) {
    const seed = hashSeed(masterSeed, i)
    const prng = createPRNG(seed)
    const result = runAdaptiveTrial(config, prng)

    if (hypothesis.value === 'null') {
      // Under null: any rejection is a Type I error
      outcomes.push(result.winnerArmIndex >= 0)
    } else {
      // Under alternative: correctly detecting arm B (index 2) is power
      outcomes.push(result.correctDecision)
    }
  }

  results.value = outcomes
  isRunning.value = false
}

const rejectCount = computed(() => results.value.filter(r => r).length)

const summaryText = computed(() => {
  if (!hasRun.value) return ''
  const count = rejectCount.value
  const rate = ((count / nTrials) * 100).toFixed(0)

  if (hypothesis.value === 'null') {
    return `${count} out of ${nTrials} rejected (Type I error rate: ${rate}%)`
  } else {
    return `${count} out of ${nTrials} detected the effect (Power: ${rate}%)`
  }
})

watch(hypothesis, () => {
  runSimulations()
})

onMounted(() => {
  runSimulations()
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-4">
      <button
        v-for="h in (['null', 'alternative'] as Hypothesis[])"
        :key="h"
        class="px-3 py-1.5 text-xs font-medium rounded tracking-wide transition-colors"
        :class="hypothesis === h
          ? 'bg-stone-900 text-white'
          : 'text-stone-600 hover:text-stone-900 bg-stone-50'"
        @click="hypothesis = h"
      >
        {{ h === 'null' ? 'Under Null' : 'Under Alternative' }}
      </button>
    </div>

    <!-- Grid of 100 squares -->
    <div
      class="grid gap-1"
      :style="{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }"
    >
      <div
        v-for="(rejected, i) in results"
        :key="i"
        class="aspect-square rounded-sm transition-colors duration-300"
        :style="{
          backgroundColor: !hasRun
            ? COLORS.borderMedium
            : hypothesis === 'null'
              ? (rejected ? '#dc2626' : COLORS.borderMedium)
              : (rejected ? COLORS.efficacy : COLORS.borderMedium),
        }"
      />
    </div>

    <!-- Placeholder grid when no results yet -->
    <div
      v-if="!hasRun"
      class="grid gap-1 mt-0"
      :style="{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }"
    >
      <div
        v-for="i in nTrials"
        :key="i"
        class="aspect-square rounded-sm"
        :style="{ backgroundColor: COLORS.borderMedium }"
      />
    </div>

    <p v-if="hasRun" class="mt-3 text-xs text-stone-500 leading-relaxed">
      {{ summaryText }}
    </p>
  </div>
</template>
