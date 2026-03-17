<script setup lang="ts">
import { octaveComponents } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

defineProps<{
  choices: OctaveChoices
}>()

defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const comp = octaveComponents.V

const comparisonRows = [
  { metric: 'Statistical power', conventional: '~80%', adaptive: '~85%', advantage: 'adaptive' },
  { metric: 'Expected sample size', conventional: '360', adaptive: '~260', advantage: 'adaptive' },
  { metric: 'Expected duration', conventional: '48 months', adaptive: '~34 months', advantage: 'adaptive' },
  { metric: 'Staff hours per participant', conventional: '4', adaptive: '6', advantage: 'conventional' },
  { metric: 'Interim analysis preparation', conventional: 'None', adaptive: '~2 weeks per interim', advantage: 'conventional' },
  { metric: 'Regulatory complexity', conventional: 'Standard', adaptive: 'Requires pre-specification', advantage: 'conventional' },
  { metric: 'Team training', conventional: 'None additional', adaptive: '2\u20133 sessions needed', advantage: 'conventional' },
] as const
</script>

<template>
  <div class="border-t border-stone-100 pt-12 mt-12">
    <h3 class="text-xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
      V &mdash; Valuation
    </h3>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-2">
      {{ comp.description }}
    </p>

    <SharedPaperQuote
      :text="comp.excerpt.text"
      :section="comp.excerpt.section"
    />

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-6 mb-8">
      Statistical performance is only one dimension of a design's value. The comparison below illustrates that adaptive designs can win on operating characteristics while costing more in operational effort.
    </p>

    <!-- Comparison table -->
    <div class="overflow-x-auto">
      <table class="w-full max-w-3xl text-sm">
        <thead>
          <tr class="border-b border-stone-900">
            <th class="text-left py-2 pr-6 font-semibold text-stone-900">Measure</th>
            <th class="text-left py-2 pr-6 font-semibold text-stone-900">Conventional</th>
            <th class="text-left py-2 font-semibold text-stone-900">Adaptive</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in comparisonRows"
            :key="row.metric"
            class="border-b border-stone-100"
          >
            <td class="py-2.5 pr-6 text-stone-600">{{ row.metric }}</td>
            <td
              class="py-2.5 pr-6 tabular-nums"
              :class="row.advantage === 'conventional' ? 'text-stone-900 font-medium' : 'text-stone-500'"
            >
              {{ row.conventional }}
            </td>
            <td
              class="py-2.5 tabular-nums"
              :class="row.advantage === 'adaptive' ? 'text-stone-900 font-medium' : 'text-stone-500'"
            >
              {{ row.adaptive }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-base text-stone-600 leading-relaxed max-w-3xl mt-8 mb-6">
      The decision to use a complex design should weigh both statistical gains and operational costs. A design that saves patients but cannot be reliably executed offers no benefit.
    </p>

    <!-- Non-statistical measures -->
    <div class="max-w-3xl">
      <p class="text-sm font-semibold text-stone-900 mb-3">
        Non-statistical measures from the paper
      </p>
      <ul class="space-y-2">
        <li
          v-for="measure in comp.nonStatisticalMeasures"
          :key="measure"
          class="flex items-start gap-2 text-sm text-stone-500 leading-relaxed"
        >
          <span class="w-1 h-1 rounded-full bg-stone-300 mt-2 shrink-0" />
          <span>{{ measure }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
