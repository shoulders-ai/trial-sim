<script setup lang="ts">
import { COLORS } from '~/utils/colors'

interface StageNode {
  id: string
  label: string
  y: number
}

interface DecisionGate {
  id: string
  afterStage: string
  label: string
  y: number
  options: GateOption[]
}

interface GateOption {
  id: string
  label: string
  description: string
  direction: 'left' | 'center' | 'right'
}

const stages: StageNode[] = [
  { id: 'stage1', label: 'Enroll patients', y: 24 },
  { id: 'stage2', label: 'Continue enrollment', y: 136 },
  { id: 'stage3', label: 'Final analysis', y: 248 },
]

const gates: DecisionGate[] = [
  {
    id: 'gate1',
    afterStage: 'stage1',
    label: 'Interim 1',
    y: 72,
    options: [
      { id: 'g1-futility', label: 'Stop for futility', description: 'An arm showing little promise is dropped. Remaining patients are reallocated to the more promising arms.', direction: 'left' },
      { id: 'g1-continue', label: 'Continue', description: 'All arms show sufficient promise to warrant further enrollment. The trial proceeds to the next stage.', direction: 'center' },
      { id: 'g1-efficacy', label: 'Stop for efficacy', description: 'An arm shows overwhelming benefit. The trial may stop early to give patients access to the effective treatment.', direction: 'right' },
    ],
  },
  {
    id: 'gate2',
    afterStage: 'stage2',
    label: 'Interim 2',
    y: 184,
    options: [
      { id: 'g2-futility', label: 'Stop for futility', description: 'Additional underperforming arms are dropped based on accumulated evidence. Resources concentrate on the leading contender.', direction: 'left' },
      { id: 'g2-continue', label: 'Continue', description: 'The remaining arms proceed to the final planned analysis with the full sample size.', direction: 'center' },
      { id: 'g2-efficacy', label: 'Stop for efficacy', description: 'Strong evidence of efficacy emerges, allowing the trial to conclude early and report results.', direction: 'right' },
    ],
  },
]

const selectedOption = ref<string | null>(null)

const selectedDescription = computed(() => {
  if (!selectedOption.value) return ''
  for (const gate of gates) {
    for (const opt of gate.options) {
      if (opt.id === selectedOption.value) return opt.description
    }
  }
  return ''
})

function selectOption(optId: string) {
  selectedOption.value = selectedOption.value === optId ? null : optId
}

function isSelected(optId: string): boolean {
  return selectedOption.value === optId
}

function getOptionColor(opt: GateOption): string {
  if (opt.direction === 'left') return '#dc2626' // red for futility
  if (opt.direction === 'right') return COLORS.efficacy
  return COLORS.textBody
}
</script>

<template>
  <div>
    <!-- Timeline diagram -->
    <div class="relative" style="height: 300px">
      <!-- Central vertical line -->
      <div class="absolute left-1/2 top-4 bottom-4 w-px bg-stone-200" />

      <!-- Stage nodes -->
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
        :style="{ top: stage.y + 'px' }"
      >
        <div class="bg-white border border-stone-200 rounded px-3 py-1.5 text-xs font-medium text-stone-700 whitespace-nowrap">
          {{ stage.label }}
        </div>
      </div>

      <!-- Decision gates -->
      <div
        v-for="gate in gates"
        :key="gate.id"
        class="absolute left-0 right-0"
        :style="{ top: gate.y + 'px' }"
      >
        <!-- Gate label -->
        <div class="absolute left-1/2 -translate-x-1/2 -top-1">
          <span class="text-[10px] font-semibold text-cadet-500 uppercase tracking-[0.1em]">
            {{ gate.label }}
          </span>
        </div>

        <!-- Dashed horizontal line through the gate -->
        <div class="absolute left-4 right-4 top-3 border-t border-dashed border-stone-200" />

        <!-- Options row -->
        <div class="flex justify-between items-start px-1 pt-5 gap-1">
          <button
            v-for="opt in gate.options"
            :key="opt.id"
            class="flex-1 text-center px-1 py-1 rounded transition-all text-[10px] leading-tight cursor-pointer"
            :class="isSelected(opt.id)
              ? 'bg-stone-50 ring-1 ring-stone-300'
              : 'hover:bg-stone-50'"
            :style="{
              color: isSelected(opt.id) ? getOptionColor(opt) : COLORS.textMuted,
              fontWeight: isSelected(opt.id) ? 600 : 500,
            }"
            @click="selectOption(opt.id)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Description text -->
    <div class="min-h-[3rem]">
      <p
        v-if="selectedDescription"
        class="text-xs text-stone-500 leading-relaxed transition-opacity duration-200"
      >
        {{ selectedDescription }}
      </p>
      <p
        v-else
        class="text-xs text-stone-400 italic"
      >
        Click a decision path to learn more.
      </p>
    </div>
  </div>
</template>
