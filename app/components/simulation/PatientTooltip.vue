<script setup lang="ts">
import type { Patient } from '@shared/types/trial'

const props = defineProps<{
  patient: Patient | null
  armName: string
  designType: string
  position: { x: number; y: number }
}>()

const tooltipStyle = computed(() => {
  if (!props.patient) return { display: 'none' }
  return {
    position: 'fixed' as const,
    left: `${props.position.x + 12}px`,
    top: `${props.position.y - 8}px`,
    zIndex: 50,
  }
})
</script>

<template>
  <div
    v-if="patient"
    class="bg-white border border-stone-200 rounded px-3 py-2 shadow-sm pointer-events-none"
    :style="tooltipStyle"
  >
    <p class="text-xs font-semibold text-stone-900 mb-1">
      Patient {{ patient.id + 1 }}
    </p>
    <div class="space-y-0.5 text-xs text-stone-500">
      <p><span class="text-stone-400">Design:</span> {{ designType }}</p>
      <p><span class="text-stone-400">Arm:</span> {{ armName }}</p>
      <p><span class="text-stone-400">Enrolled:</span> {{ patient.enrollmentTime.toFixed(1) }} months</p>
      <p v-if="patient.outcomeObserved">
        <span class="text-stone-400">Outcome:</span>
        <span :class="patient.outcome >= 0.5 ? 'text-stone-900 font-medium' : 'text-stone-400'">
          {{ patient.outcome >= 0.5 ? 'Response' : 'No response' }}
        </span>
      </p>
      <p v-if="patient.outcomeObserved">
        <span class="text-stone-400">Observed at:</span> {{ patient.outcomeTime.toFixed(1) }} months
      </p>
    </div>
  </div>
</template>
