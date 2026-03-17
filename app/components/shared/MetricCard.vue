<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  sublabel?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <p class="text-xs font-semibold text-cadet-500 uppercase tracking-[0.15em]">{{ label }}</p>
    <p class="text-2xl font-serif font-semibold tracking-tight text-stone-900">{{ value }}</p>
    <p v-if="sublabel" class="text-xs text-stone-400">{{ sublabel }}</p>
  </div>
</template>
