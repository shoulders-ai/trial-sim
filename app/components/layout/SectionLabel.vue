<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <p class="text-xs font-semibold text-cadet-500 uppercase tracking-[0.15em] mb-4">{{ text }}</p>
</template>
