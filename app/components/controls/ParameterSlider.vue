<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min: number
  max: number
  step: number
  label: string
  formatFn?: (n: number) => string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed(() => {
  if (props.formatFn) return props.formatFn(props.modelValue)
  return String(props.modelValue)
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between mb-2">
      <span class="text-sm text-stone-600">{{ label }}</span>
      <span class="text-sm font-medium text-stone-900 tabular-nums">{{ displayValue }}</span>
    </div>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      class="w-full h-1 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1c1917;
  cursor: pointer;
}
input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1c1917;
  border: none;
  cursor: pointer;
}
</style>
