<script setup lang="ts">
import { formatNumber } from '~/utils/format'

const props = defineProps<{
  isRunning: boolean
  progress: number
}>()

const emit = defineEmits<{
  start: []
  cancel: []
}>()

const total = 1000

const completedCount = computed(() => Math.round(props.progress * total))
</script>

<template>
  <div>
    <div v-if="!isRunning">
      <button
        class="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium tracking-wide cursor-pointer"
        @click="emit('start')"
      >
        Run {{ formatNumber(total) }} replications
      </button>
    </div>

    <div v-else class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-stone-400 tabular-nums">
          {{ formatNumber(completedCount) }} / {{ formatNumber(total) }}
        </span>
        <button
          class="text-sm text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
      <div class="w-full h-0.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-stone-900 transition-all duration-200 ease-out"
          :style="{ width: `${progress * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>
