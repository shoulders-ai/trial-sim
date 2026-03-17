<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.C

function update(key: keyof OctaveChoices, value: number) {
  emit('update:choices', { [key]: value })
}

// Derived display values
const controlRate = 0.20

const treatmentRate = computed(() => {
  // Effect size is the treatment arm response rate delta above control
  return Math.min(1, controlRate + props.choices.effectSize)
})

const baseEnrollmentRate = 8 // default for oncology scenario
const effectiveEnrollmentRate = computed(() => {
  return Math.max(1, Math.round(baseEnrollmentRate * props.choices.accrualMultiplier))
})

const expectedDuration = computed(() => {
  const totalPatients = props.choices.maxSampleSize || 360
  const enrollMonths = totalPatients / effectiveEnrollmentRate.value
  const followUp = 3 // outcome delay
  return Math.round(enrollMonths + followUp)
})

// Format helpers
function formatRate(v: number): string {
  return (v * 100).toFixed(0) + '%'
}

function formatMultiplier(v: number): string {
  return v.toFixed(1) + 'x'
}

const sliders = computed(() => [
  {
    key: 'effectSize' as const,
    label: 'Treatment effect',
    description: comp.factors.find(f => f.id === 'effect-size')?.description ?? '',
    min: 0.05,
    max: 0.60,
    step: 0.05,
    value: props.choices.effectSize,
    display: formatRate(props.choices.effectSize),
  },
  {
    key: 'variability' as const,
    label: 'Response variability',
    description: comp.factors.find(f => f.id === 'variability')?.description ?? '',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    value: props.choices.variability,
    display: formatMultiplier(props.choices.variability),
  },
  {
    key: 'accrualMultiplier' as const,
    label: 'Accrual rate',
    description: comp.factors.find(f => f.id === 'accrual-rate')?.description ?? '',
    min: 0.25,
    max: 3.0,
    step: 0.25,
    value: props.choices.accrualMultiplier,
    display: formatMultiplier(props.choices.accrualMultiplier),
  },
  {
    key: 'dropoutRate' as const,
    label: 'Dropout rate',
    description: comp.factors.find(f => f.id === 'dropout')?.description ?? '',
    min: 0,
    max: 0.30,
    step: 0.01,
    value: props.choices.dropoutRate,
    display: formatRate(props.choices.dropoutRate),
  },
])
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      C &mdash; Characteristics
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6 mb-8">
      The underlying factors listed below shape the data-generating process. Investigators cannot control these in the real world, but in simulation we can set them to explore different scenarios.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Sliders -->
      <div class="lg:col-span-2 space-y-6">
        <div
          v-for="s in sliders"
          :key="s.key"
          class="group"
        >
          <div class="flex items-baseline justify-between mb-1">
            <label class="text-sm font-semibold text-stone-900">{{ s.label }}</label>
            <span class="text-sm font-medium text-stone-700 tabular-nums">{{ s.display }}</span>
          </div>
          <p class="text-xs text-stone-400 mb-2">{{ s.description }}</p>
          <input
            type="range"
            :min="s.min"
            :max="s.max"
            :step="s.step"
            :value="s.value"
            class="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-stone-900"
            @input="update(s.key, parseFloat(($event.target as HTMLInputElement).value))"
          >
        </div>
      </div>

      <!-- Live summary -->
      <div class="lg:col-span-1">
        <div class="border border-stone-100 rounded px-5 py-5">
          <p class="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-4">
            What these assumptions imply
          </p>

          <div class="space-y-3">
            <div>
              <p class="text-xs text-stone-400">Assumed response rates</p>
              <p class="text-sm text-stone-700">
                Control <span class="font-medium">{{ formatRate(controlRate) }}</span>,
                Treatment <span class="font-medium">{{ formatRate(treatmentRate) }}</span>
              </p>
            </div>

            <div>
              <p class="text-xs text-stone-400">Enrollment pace</p>
              <p class="text-sm text-stone-700">
                ~<span class="font-medium">{{ effectiveEnrollmentRate }}</span> patients/month
              </p>
            </div>

            <div>
              <p class="text-xs text-stone-400">Expected duration</p>
              <p class="text-sm text-stone-700">
                ~<span class="font-medium">{{ expectedDuration }}</span> months
              </p>
            </div>

            <div v-if="choices.dropoutRate > 0">
              <p class="text-xs text-stone-400">Expected dropouts</p>
              <p class="text-sm text-stone-700">
                ~<span class="font-medium">{{ Math.round((choices.maxSampleSize || 360) * choices.dropoutRate) }}</span> patients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
