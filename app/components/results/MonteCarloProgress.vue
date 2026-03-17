<script setup lang="ts">
import { formatNumber } from '~/utils/format'

defineProps<{
  completed: number
  total: number
  isRunning: boolean
}>()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm text-stone-400 tabular-nums">
        {{ formatNumber(completed) }} / {{ formatNumber(total) }} replications
      </span>
      <span v-if="isRunning" class="text-xs text-stone-400">Running...</span>
      <span v-else-if="completed >= total" class="text-xs text-stone-400">Complete</span>
    </div>
    <div class="w-full h-0.5 bg-stone-100 rounded-full overflow-hidden">
      <div
        class="h-full bg-stone-900 transition-all duration-200 ease-out"
        :style="{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }"
      />
    </div>
  </div>
</template>
