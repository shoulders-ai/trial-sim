<script setup lang="ts">
const props = defineProps<{
  currentTime: number
  maxTime: number
  isPlaying: boolean
  interimTimes?: number[]
}>()

const progress = computed(() => {
  if (props.maxTime <= 0) return 0
  return Math.min(1, props.currentTime / props.maxTime)
})

const monthMarkers = computed(() => {
  const max = props.maxTime
  if (max <= 0) return []

  const step = max <= 12 ? 3 : max <= 36 ? 6 : 12
  const markers: { month: number; fraction: number }[] = []
  for (let m = 0; m <= max; m += step) {
    markers.push({ month: m, fraction: m / max })
  }
  // Always include the end
  if (markers[markers.length - 1]?.month !== Math.round(max)) {
    markers.push({ month: Math.round(max), fraction: 1 })
  }
  return markers
})

const interimMarkers = computed(() => {
  if (!props.interimTimes || props.maxTime <= 0) return []
  return props.interimTimes.map(t => ({
    time: t,
    fraction: t / props.maxTime,
  }))
})
</script>

<template>
  <div class="w-full px-4 py-4">
    <div class="relative h-8">
      <!-- Base line -->
      <div class="absolute top-3 left-0 right-0 h-px bg-stone-200" />

      <!-- Progress line -->
      <div
        class="absolute top-3 left-0 h-px bg-stone-900 transition-all duration-100 ease-linear"
        :style="{ width: `${progress * 100}%` }"
      />

      <!-- Current time dot -->
      <div
        class="absolute top-1.5 w-2 h-2 rounded-full bg-stone-900 transition-all duration-100 ease-linear -translate-x-1"
        :style="{ left: `${progress * 100}%` }"
      />

      <!-- Interim markers -->
      <div
        v-for="(marker, i) in interimMarkers"
        :key="'interim-' + i"
        class="absolute top-1 w-px h-4 bg-cadet-500"
        :style="{ left: `${marker.fraction * 100}%` }"
      />

      <!-- Month labels -->
      <div
        v-for="marker in monthMarkers"
        :key="marker.month"
        class="absolute top-5 -translate-x-1/2 text-xs text-stone-400 tabular-nums"
        :style="{ left: `${marker.fraction * 100}%` }"
      >
        {{ marker.month }}m
      </div>
    </div>
  </div>
</template>
