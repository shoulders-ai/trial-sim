<script setup lang="ts">
import type { MonteCarloSummary } from '@shared/types/results'
import { formatNumber, formatPercent, formatDuration, formatSigned } from '~/utils/format'

const props = defineProps<{
  summary: MonteCarloSummary
}>()

interface TableRow {
  label: string
  conventional: string
  adaptive: string
  difference: string
}

const rows = computed<TableRow[]>(() => {
  const s = props.summary
  return [
    {
      label: 'Power',
      conventional: `${formatPercent(s.conventional.power, 1)} (${formatPercent(s.conventional.powerMcse, 2)} SE)`,
      adaptive: `${formatPercent(s.adaptive.power, 1)} (${formatPercent(s.adaptive.powerMcse, 2)} SE)`,
      difference: formatSigned(Math.round((s.adaptive.power - s.conventional.power) * 1000) / 10) + 'pp',
    },
    {
      label: 'Mean sample size',
      conventional: formatNumber(s.conventional.meanSampleSize),
      adaptive: formatNumber(s.adaptive.meanSampleSize),
      difference: formatSigned(Math.round(s.adaptive.meanSampleSize - s.conventional.meanSampleSize)),
    },
    {
      label: 'Median sample size',
      conventional: formatNumber(s.conventional.medianSampleSize),
      adaptive: formatNumber(s.adaptive.medianSampleSize),
      difference: formatSigned(Math.round(s.adaptive.medianSampleSize - s.conventional.medianSampleSize)),
    },
    {
      label: 'Mean duration',
      conventional: formatDuration(s.conventional.meanDuration),
      adaptive: formatDuration(s.adaptive.meanDuration),
      difference: formatSigned(Math.round((s.adaptive.meanDuration - s.conventional.meanDuration) * 10) / 10) + 'm',
    },
    {
      label: 'Early stop rate',
      conventional: '--',
      adaptive: formatPercent(s.adaptive.earlyStopRate, 1),
      difference: '',
    },
    {
      label: 'FWER',
      conventional: formatPercent(s.conventional.fwer, 2),
      adaptive: formatPercent(s.adaptive.fwer, 2),
      difference: '',
    },
  ]
})
</script>

<template>
  <div>
    <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-4">
      Operating Characteristics
    </h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b-2 border-stone-900">
          <th class="text-left py-2 text-sm font-semibold text-stone-900">Metric</th>
          <th class="text-right py-2 text-sm font-semibold text-stone-900">Conventional</th>
          <th class="text-right py-2 text-sm font-semibold text-stone-900">Adaptive</th>
          <th class="text-right py-2 text-sm font-semibold text-stone-900">Diff</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.label"
          class="border-b border-stone-200"
        >
          <td class="py-2 text-sm text-stone-600">{{ row.label }}</td>
          <td class="py-2 text-sm text-stone-900 text-right tabular-nums">{{ row.conventional }}</td>
          <td class="py-2 text-sm text-stone-900 text-right tabular-nums font-medium">{{ row.adaptive }}</td>
          <td class="py-2 text-sm text-stone-400 text-right tabular-nums">{{ row.difference }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
