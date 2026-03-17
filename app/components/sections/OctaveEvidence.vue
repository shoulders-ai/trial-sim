<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.E

// Monte Carlo SE calculation
const assumedPower = 0.85

const mcse = computed(() => {
  const p = assumedPower
  const r = props.choices.nReplications
  return Math.sqrt((p * (1 - p)) / r)
})

const mcsePercent = computed(() => {
  return (mcse.value * 100).toFixed(1)
})

const confidenceInterval = computed(() => {
  const low = Math.max(0, (assumedPower - 1.96 * mcse.value) * 100).toFixed(1)
  const high = Math.min(100, (assumedPower + 1.96 * mcse.value) * 100).toFixed(1)
  return { low, high }
})

function setReplications(n: number) {
  emit('update:choices', { nReplications: n })
}

// Replication milestones for context
const milestones = computed(() => [
  { n: 100, se: Math.sqrt((assumedPower * (1 - assumedPower)) / 100) * 100 },
  { n: 500, se: Math.sqrt((assumedPower * (1 - assumedPower)) / 500) * 100 },
  { n: 1000, se: Math.sqrt((assumedPower * (1 - assumedPower)) / 1000) * 100 },
  { n: 5000, se: Math.sqrt((assumedPower * (1 - assumedPower)) / 5000) * 100 },
])
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      E &mdash; Evidence
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6 mb-8">
      Every simulation estimate carries uncertainty. With a finite number of replications, the estimated power is itself a random variable. The Monte Carlo standard error quantifies this simulation-level uncertainty, separate from the statistical uncertainty within each simulated trial.
    </p>

    <!-- Replications demo -->
    <div class="max-w-2xl">
      <p class="text-sm font-semibold text-stone-900 mb-4">How many replications are enough?</p>

      <div class="flex items-baseline justify-between mb-1">
        <label class="text-sm text-stone-600">Number of replications</label>
        <span class="text-sm font-medium text-stone-700 tabular-nums">{{ choices.nReplications.toLocaleString() }}</span>
      </div>
      <input
        type="range"
        :min="50"
        :max="5000"
        :step="50"
        :value="choices.nReplications"
        class="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-stone-900"
        @input="setReplications(parseInt(($event.target as HTMLInputElement).value))"
      >
      <div class="flex justify-between text-xs text-stone-400 mt-1">
        <span>50</span>
        <span>1,000</span>
        <span>2,500</span>
        <span>5,000</span>
      </div>

      <!-- Result display -->
      <div class="border border-stone-100 rounded px-5 py-5 mt-6">
        <div class="mb-4">
          <p class="text-xs text-stone-400 mb-1">Power estimate</p>
          <p class="text-lg font-serif font-semibold text-stone-900">
            {{ (assumedPower * 100).toFixed(0) }}%
            <span class="text-sm font-sans font-medium text-stone-500">
              &plusmn; {{ mcsePercent }}%
            </span>
          </p>
        </div>

        <div class="mb-4">
          <p class="text-xs text-stone-400 mb-1">95% simulation interval</p>
          <p class="text-sm text-stone-700 tabular-nums">
            {{ confidenceInterval.low }}% to {{ confidenceInterval.high }}%
          </p>
        </div>

        <div>
          <p class="text-xs text-stone-400 mb-1">Monte Carlo SE</p>
          <p class="text-sm text-stone-700 tabular-nums">{{ mcsePercent }}%</p>
        </div>
      </div>

      <!-- Formula -->
      <div class="mt-4 px-4 py-3 bg-stone-50 rounded border border-stone-100">
        <p class="text-xs text-stone-500 font-mono leading-relaxed">
          MCSE = &radic;( p(1 &minus; p) / r ) = &radic;( {{ assumedPower }} &times; {{ (1 - assumedPower).toFixed(2) }} / {{ choices.nReplications }} )
          = {{ mcse.toFixed(4) }}
        </p>
      </div>

      <!-- Milestones table -->
      <div class="mt-6">
        <p class="text-xs text-stone-400 mb-2">Reference: MCSE at different replication counts (for power = 85%)</p>
        <div class="flex gap-4">
          <div
            v-for="m in milestones"
            :key="m.n"
            class="text-center"
            :class="choices.nReplications === m.n ? 'opacity-100' : 'opacity-60'"
          >
            <p class="text-xs font-medium text-stone-700 tabular-nums">&plusmn;{{ m.se.toFixed(1) }}%</p>
            <p class="text-xs text-stone-400 tabular-nums">{{ m.n.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Validation practices -->
    <div class="mt-10 max-w-3xl">
      <p class="text-sm font-semibold text-stone-900 mb-3">Validation practices</p>

      <ul class="space-y-2">
        <li class="flex items-start gap-2 text-sm text-stone-500 leading-relaxed">
          <span class="w-1 h-1 rounded-full bg-stone-300 mt-2 shrink-0" />
          <span>Unit testing individual components of the simulation code to verify each piece behaves as expected in isolation</span>
        </li>
        <li class="flex items-start gap-2 text-sm text-stone-500 leading-relaxed">
          <span class="w-1 h-1 rounded-full bg-stone-300 mt-2 shrink-0" />
          <span>Testing against external or analytical results where closed-form solutions are available, to confirm the simulation reproduces known answers</span>
        </li>
        <li class="flex items-start gap-2 text-sm text-stone-500 leading-relaxed">
          <span class="w-1 h-1 rounded-full bg-stone-300 mt-2 shrink-0" />
          <span>Checking reproducibility with fixed random seeds to ensure identical inputs always produce identical outputs</span>
        </li>
      </ul>

      <p class="text-base text-stone-600 leading-relaxed mt-6">
        The simulation you have been configuring throughout this page uses a deterministic random number generator. The same seed always produces the same trial.
      </p>
    </div>
  </div>
</template>
