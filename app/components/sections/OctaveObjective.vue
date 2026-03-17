<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.O

function selectObjective(obj: typeof comp.objectives[number]) {
  emit('update:choices', {
    objectiveId: obj.id,
    varies: { ...obj.varies },
  })
}

const selectedExplanation = computed(() => {
  if (!props.choices.objectiveId) return null
  const obj = comp.objectives.find(o => o.id === props.choices.objectiveId)
  if (!obj) return null

  const parts: string[] = []
  if (obj.varies.design && obj.varies.factors && obj.varies.analysis) {
    return 'You have chosen a full exploration. The simulation will vary design configurations, underlying assumptions, and analysis methods simultaneously to map the entire operating landscape.'
  }
  if (!obj.varies.design && !obj.varies.factors && !obj.varies.analysis) {
    return 'You have chosen to examine design properties. The simulation will hold everything fixed and evaluate the operating characteristics under one specific scenario.'
  }

  const varying: string[] = []
  const fixed: string[] = []
  if (obj.varies.design) varying.push('design configurations')
  else fixed.push('design')
  if (obj.varies.factors) varying.push('underlying assumptions')
  else fixed.push('factors')
  if (obj.varies.analysis) varying.push('analysis methods')
  else fixed.push('analysis')

  return `You have chosen to ${obj.label.toLowerCase()}. The simulation will vary the ${varying.join(' and ')} while keeping the ${fixed.join(' and ')} fixed.`
})

const dimensionLabels = {
  design: 'Design',
  factors: 'Factors',
  analysis: 'Analysis',
} as const
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      O &mdash; Objective
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <!-- Objective cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
      <button
        v-for="obj in comp.objectives"
        :key="obj.id"
        class="text-left border rounded px-4 py-4 transition-colors cursor-pointer"
        :class="choices.objectiveId === obj.id
          ? 'border-stone-900 bg-white text-stone-900'
          : 'border-stone-200 text-stone-500 hover:border-stone-400'"
        @click="selectObjective(obj)"
      >
        <p class="text-sm font-semibold mb-1" :class="choices.objectiveId === obj.id ? 'text-stone-900' : 'text-stone-700'">
          {{ obj.label }}
        </p>
        <p class="text-xs text-stone-500 leading-relaxed mb-3">
          {{ obj.description }}
        </p>

        <!-- Varies indicators -->
        <div class="flex items-center gap-3">
          <span
            v-for="(varies, key) in obj.varies"
            :key="key"
            class="inline-flex items-center gap-1 text-xs"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="varies
                ? 'bg-stone-900'
                : 'border border-stone-300 bg-white'"
            />
            <span :class="varies ? 'text-stone-700' : 'text-stone-400'">
              {{ dimensionLabels[key] }}
            </span>
          </span>
        </div>
      </button>
    </div>

    <p class="text-xs text-stone-400 mt-3">
      Filled dots indicate dimensions that vary. Outlined dots indicate dimensions held fixed.
    </p>

    <!-- Reactive explanation -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <p
        v-if="selectedExplanation"
        class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6"
      >
        {{ selectedExplanation }}
      </p>
    </Transition>
  </div>
</template>
