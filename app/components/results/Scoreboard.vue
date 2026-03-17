<script setup lang="ts">
import type { TrialResult } from '@shared/types/trial'
import { formatNumber, formatDuration } from '~/utils/format'

const props = defineProps<{
  conventional: TrialResult
  adaptive: TrialResult
}>()

const visible = ref(false)

onMounted(() => {
  // Trigger fade-in
  requestAnimationFrame(() => {
    visible.value = true
  })
})

const patientsSaved = computed(() =>
  props.conventional.totalPatients - props.adaptive.totalPatients
)

const timeSaved = computed(() =>
  props.conventional.duration - props.adaptive.duration
)

const conventionalArmsEvaluated = computed(() =>
  props.conventional.arms.filter(a => !a.config.isControl).length
)

const adaptiveArmsEvaluated = computed(() =>
  props.adaptive.arms.filter(a => !a.config.isControl && a.status !== 'dropped-futility').length
)

interface MetricRow {
  label: string
  conventional: string
  adaptive: string
  highlight?: boolean
}

const metrics = computed<MetricRow[]>(() => [
  {
    label: 'Total patients',
    conventional: formatNumber(props.conventional.totalPatients),
    adaptive: formatNumber(props.adaptive.totalPatients),
  },
  {
    label: 'Trial duration',
    conventional: formatDuration(props.conventional.duration),
    adaptive: formatDuration(props.adaptive.duration),
  },
  {
    label: 'Arms evaluated',
    conventional: String(conventionalArmsEvaluated.value),
    adaptive: String(adaptiveArmsEvaluated.value),
  },
  {
    label: 'Correct decision',
    conventional: props.conventional.correctDecision ? 'Yes' : 'No',
    adaptive: props.adaptive.correctDecision ? 'Yes' : 'No',
  },
])

const summaryLine = computed(() => {
  const parts: string[] = []
  if (patientsSaved.value > 0) {
    parts.push(`${formatNumber(patientsSaved.value)} fewer patients`)
  }
  if (timeSaved.value > 0.5) {
    parts.push(`${timeSaved.value.toFixed(1)} months faster`)
  }
  if (parts.length === 0) {
    return 'Both designs performed similarly on this trial.'
  }
  return parts.join(', ')
})
</script>

<template>
  <div
    class="transition-opacity duration-700 ease-out"
    :class="visible ? 'opacity-100' : 'opacity-0'"
  >
    <table class="w-full max-w-2xl">
      <thead>
        <tr class="border-b border-stone-900">
          <th class="text-left py-2 text-sm font-semibold text-stone-900 font-serif">Metric</th>
          <th class="text-right py-2 text-sm font-semibold text-stone-900 font-serif">Conventional</th>
          <th class="text-right py-2 text-sm font-semibold text-stone-900 font-serif">Adaptive</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in metrics"
          :key="row.label"
          class="border-b border-stone-100"
        >
          <td class="py-2.5 text-sm text-stone-600">{{ row.label }}</td>
          <td class="py-2.5 text-sm text-stone-900 text-right tabular-nums">{{ row.conventional }}</td>
          <td class="py-2.5 text-sm text-stone-900 text-right tabular-nums font-medium">{{ row.adaptive }}</td>
        </tr>
      </tbody>
    </table>

    <p class="mt-6 text-lg font-serif font-semibold text-stone-900">
      {{ summaryLine }}
    </p>
  </div>
</template>
