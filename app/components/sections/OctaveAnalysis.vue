<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.A

const methods = [
  {
    id: 'z-test' as const,
    label: 'Standard Z-test',
    summary: 'Compares group proportions or means directly using a test statistic.',
    detail: 'The standard Z-test compares group means directly. It is the most common approach for two-group comparisons with binary or continuous endpoints. Straightforward to implement and well understood by regulators.',
  },
  {
    id: 'covariate-adjusted' as const,
    label: 'Covariate-adjusted analysis',
    summary: 'Accounts for baseline differences between groups to increase precision.',
    detail: 'Covariate adjustment accounts for baseline differences between treatment groups, potentially increasing statistical precision. When imbalances exist in prognostic factors, adjustment can recover power that would otherwise be lost.',
  },
]

function selectMethod(id: 'z-test' | 'covariate-adjusted') {
  emit('update:choices', { analysisMethod: id })
}

const selectedMethod = computed(() =>
  methods.find(m => m.id === props.choices.analysisMethod)
)
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      A &mdash; Analysis
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6 mb-8">
      The choice of analysis method can change the conclusion even when the underlying data are identical. The paper emphasizes deciding the analysis approach upfront, because retrospective method selection introduces bias.
    </p>

    <!-- Analysis method cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      <button
        v-for="m in methods"
        :key="m.id"
        class="text-left border rounded px-5 py-4 transition-colors cursor-pointer"
        :class="choices.analysisMethod === m.id
          ? 'border-stone-900 bg-white text-stone-900'
          : 'border-stone-200 text-stone-500 hover:border-stone-400'"
        @click="selectMethod(m.id)"
      >
        <p
          class="text-sm font-semibold mb-1"
          :class="choices.analysisMethod === m.id ? 'text-stone-900' : 'text-stone-700'"
        >
          {{ m.label }}
        </p>
        <p class="text-xs text-stone-500 leading-relaxed">
          {{ m.summary }}
        </p>
      </button>
    </div>

    <!-- Explanation of selected method -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="selectedMethod" class="mt-6 max-w-3xl">
        <p class="text-base text-stone-600 leading-relaxed">
          {{ selectedMethod.detail }}
        </p>
      </div>
    </Transition>

    <!-- Conceptual note -->
    <div class="mt-6 border border-stone-100 rounded px-5 py-4 max-w-3xl">
      <p class="text-xs text-stone-400 leading-relaxed">
        In a full simulation study, you would implement both methods and compare their operating characteristics on the same generated datasets. The interactive simulation on this page uses the Z-test for both options, but the principle remains: specify your analysis method before generating data.
      </p>
    </div>
  </div>
</template>
