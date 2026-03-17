<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import { scenarios } from '@lib/scenarios'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.T

// Scenario selection
const currentScenario = computed(() =>
  scenarios.find(s => s.id === props.choices.scenarioId)
)

function selectScenario(id: string) {
  const sc = scenarios.find(s => s.id === id)
  if (!sc) return
  emit('update:choices', {
    scenarioId: id,
    nArms: sc.config.arms.length,
    maxSampleSize: sc.config.conventional.maxSampleSize,
  })
}

function setAdaptive(val: boolean) {
  emit('update:choices', {
    useAdaptive: val,
    nInterims: val ? 2 : 0,
  })
}

function setInterims(n: number) {
  emit('update:choices', { nInterims: n })
}

function setSampleSize(n: number) {
  emit('update:choices', { maxSampleSize: n })
}

// Sample size range depends on scenario
const sampleSizeRange = computed(() => {
  const base = currentScenario.value?.config.conventional.maxSampleSize ?? 360
  return {
    min: Math.max(20, Math.round(base * 0.3)),
    max: Math.round(base * 2),
    step: base <= 100 ? 2 : 10,
  }
})

// Timeline diagram data
const timelineStages = computed(() => {
  if (!props.choices.useAdaptive || props.choices.nInterims === 0) {
    return [{ label: 'Enroll', type: 'enroll' as const }, { label: 'Final Analysis', type: 'analysis' as const }]
  }

  const stages: Array<{ label: string; type: 'enroll' | 'interim' | 'analysis' }> = []
  stages.push({ label: 'Enroll', type: 'enroll' })

  for (let i = 1; i <= props.choices.nInterims; i++) {
    stages.push({ label: `Interim ${i}`, type: 'interim' })
    if (i < props.choices.nInterims) {
      stages.push({ label: 'Continue', type: 'enroll' })
    }
  }

  stages.push({ label: 'Final', type: 'analysis' })
  return stages
})

// Arms display
const armNames = computed(() => {
  return currentScenario.value?.config.arms.map(a => a.name) ?? []
})
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      T &mdash; Trial Design
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6 mb-2">
      The paper identifies five design aspects investigators can specify:
    </p>

    <ul class="text-sm text-stone-500 leading-relaxed mb-8 space-y-1 pl-4">
      <li v-for="aspect in comp.designAspects" :key="aspect" class="flex items-start gap-2">
        <span class="w-1 h-1 rounded-full bg-stone-300 mt-2 shrink-0" />
        <span>{{ aspect }}</span>
      </li>
    </ul>

    <!-- Scenario selector -->
    <div class="mb-8">
      <p class="text-sm font-semibold text-stone-900 mb-3">Choose a scenario</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          v-for="sc in scenarios"
          :key="sc.id"
          class="text-left border rounded px-4 py-3 transition-colors cursor-pointer"
          :class="choices.scenarioId === sc.id
            ? 'border-stone-900 bg-white text-stone-900'
            : 'border-stone-200 text-stone-500 hover:border-stone-400'"
          @click="selectScenario(sc.id)"
        >
          <p class="text-sm font-semibold mb-1" :class="choices.scenarioId === sc.id ? 'text-stone-900' : 'text-stone-700'">
            {{ sc.name }}
          </p>
          <p class="text-xs text-stone-400 leading-relaxed">
            {{ sc.narrative.split('.')[0] }}.
          </p>
        </button>
      </div>
    </div>

    <!-- Adaptive toggle -->
    <div class="mb-6">
      <p class="text-sm font-semibold text-stone-900 mb-3">Include adaptive features?</p>
      <div class="flex items-center gap-1">
        <button
          class="px-4 py-1.5 text-sm font-medium rounded-l border transition-colors cursor-pointer"
          :class="!choices.useAdaptive
            ? 'border-stone-900 bg-white text-stone-900'
            : 'border-stone-200 text-stone-500 hover:text-stone-700'"
          @click="setAdaptive(false)"
        >
          Conventional
        </button>
        <button
          class="px-4 py-1.5 text-sm font-medium rounded-r border transition-colors cursor-pointer"
          :class="choices.useAdaptive
            ? 'border-stone-900 bg-white text-stone-900'
            : 'border-stone-200 text-stone-500 hover:text-stone-700'"
          @click="setAdaptive(true)"
        >
          Adaptive
        </button>
      </div>
    </div>

    <!-- Interim analyses slider (adaptive only) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="choices.useAdaptive" class="mb-6">
        <div class="flex items-baseline justify-between mb-1">
          <label class="text-sm font-semibold text-stone-900">Number of interim analyses</label>
          <span class="text-sm font-medium text-stone-700 tabular-nums">{{ choices.nInterims }}</span>
        </div>
        <input
          type="range"
          :min="1"
          :max="3"
          :step="1"
          :value="choices.nInterims"
          class="w-full max-w-xs h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-stone-900"
          @input="setInterims(parseInt(($event.target as HTMLInputElement).value))"
        >
        <div class="flex justify-between max-w-xs text-xs text-stone-400 mt-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </div>
      </div>
    </Transition>

    <!-- Sample size slider -->
    <div class="mb-10">
      <div class="flex items-baseline justify-between mb-1">
        <label class="text-sm font-semibold text-stone-900">Maximum sample size</label>
        <span class="text-sm font-medium text-stone-700 tabular-nums">{{ choices.maxSampleSize }}</span>
      </div>
      <p class="text-xs text-stone-400 mb-2">Total patients across all arms</p>
      <input
        type="range"
        :min="sampleSizeRange.min"
        :max="sampleSizeRange.max"
        :step="sampleSizeRange.step"
        :value="choices.maxSampleSize"
        class="w-full max-w-md h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-stone-900"
        @input="setSampleSize(parseInt(($event.target as HTMLInputElement).value))"
      >
    </div>

    <!-- Trial design diagram -->
    <div class="border border-stone-100 rounded px-6 py-5">
      <p class="text-xs font-semibold uppercase tracking-[0.1em] text-stone-400 mb-4">
        Design summary
      </p>

      <!-- Arms -->
      <div class="flex items-center gap-3 mb-5">
        <span class="text-xs text-stone-400">Arms:</span>
        <span
          v-for="name in armNames"
          :key="name"
          class="text-xs font-medium text-stone-600 border border-stone-200 rounded px-2 py-0.5"
        >
          {{ name }}
        </span>
      </div>

      <!-- Timeline diagram -->
      <div class="flex items-center gap-0 overflow-x-auto py-2">
        <template v-for="(stage, i) in timelineStages" :key="i">
          <!-- Connector line -->
          <div
            v-if="i > 0"
            class="w-6 md:w-10 h-px shrink-0"
            :class="stage.type === 'interim' ? 'bg-cadet-500' : 'bg-stone-200'"
          />

          <!-- Stage node -->
          <div
            class="flex flex-col items-center shrink-0"
          >
            <div
              class="w-3 h-3 rounded-full border-2 mb-1.5"
              :class="{
                'border-stone-900 bg-stone-900': stage.type === 'analysis',
                'border-cadet-500 bg-white': stage.type === 'interim',
                'border-stone-300 bg-white': stage.type === 'enroll',
              }"
            />
            <span
              class="text-xs whitespace-nowrap"
              :class="{
                'text-stone-900 font-medium': stage.type === 'analysis',
                'text-cadet-600 font-medium': stage.type === 'interim',
                'text-stone-400': stage.type === 'enroll',
              }"
            >
              {{ stage.label }}
            </span>
          </div>
        </template>
      </div>

      <!-- Detail text -->
      <p class="text-xs text-stone-400 mt-4">
        <template v-if="choices.useAdaptive">
          Adaptive design with {{ choices.nInterims }} interim
          {{ choices.nInterims === 1 ? 'analysis' : 'analyses' }}.
          At each interim, arms may be dropped for futility or stopped for efficacy.
        </template>
        <template v-else>
          Conventional design. All {{ choices.maxSampleSize }} patients are enrolled before a single final analysis.
        </template>
      </p>
    </div>
  </div>
</template>
