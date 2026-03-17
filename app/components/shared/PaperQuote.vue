<script setup lang="ts">
defineProps<{
  text: string
  section?: string
}>()
</script>

<template>
  <blockquote class="border-l-2 border-stone-200 pl-4 my-6">
    <p class="text-base italic text-stone-500 leading-relaxed">{{ text }}</p>
    <cite v-if="section" class="block mt-1 text-xs text-stone-400 not-italic">&mdash; {{ section }}</cite>
  </blockquote>
</template>
