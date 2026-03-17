<script setup lang="ts">
import type { ScenarioPreset } from '@shared/types/scenario'

const props = defineProps<{
  modelValue: string
  scenarios: ScenarioPreset[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedScenario = computed(() =>
  props.scenarios.find(s => s.id === props.modelValue)
)
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <button
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="text-left border rounded px-4 py-3 transition-colors cursor-pointer"
        :class="
          modelValue === scenario.id
            ? 'border-stone-900 bg-stone-50'
            : 'border-stone-200 hover:border-stone-400'
        "
        @click="emit('update:modelValue', scenario.id)"
      >
        <p class="text-sm font-semibold text-stone-900 mb-1">{{ scenario.name }}</p>
        <p class="text-xs text-stone-400 leading-relaxed">{{ scenario.narrative.split('.')[0] }}.</p>
      </button>
    </div>

    <div
      v-if="selectedScenario"
      class="mt-6 border-l-2 border-cadet-500 pl-4"
    >
      <p class="text-sm text-stone-600 leading-relaxed">{{ selectedScenario.teachingMoment }}</p>
    </div>
  </div>
</template>
