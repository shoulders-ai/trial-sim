<script setup lang="ts">
import { octaveIntro } from '@lib/paper/excerpts'
import type { OctaveChoices } from '~/composables/useOctaveState'

const props = defineProps<{
  choices: OctaveChoices
}>()

const emit = defineEmits<{
  'update:choices': [choices: Partial<OctaveChoices>]
}>()

const octaveLetters = [
  { letter: 'O', name: 'Objective' },
  { letter: 'C', name: 'Characteristics' },
  { letter: 'T', name: 'Trial Design' },
  { letter: 'A', name: 'Analysis' },
  { letter: 'V', name: 'Valuation' },
  { letter: 'E', name: 'Evidence' },
]

// Track which sections have been interacted with
const completedSections = computed(() => {
  const done = new Set<string>()
  if (props.choices.objectiveId) done.add('O')
  if (props.choices.effectSize !== 0.35 || props.choices.variability !== 1.0 || props.choices.accrualMultiplier !== 1.0 || props.choices.dropoutRate !== 0) done.add('C')
  if (props.choices.scenarioId) done.add('T')
  if (props.choices.analysisMethod) done.add('A')
  // V is display-only, always "complete"
  done.add('V')
  if (props.choices.nReplications !== 1000) done.add('E')
  return done
})

function handleUpdate(partial: Partial<OctaveChoices>) {
  emit('update:choices', partial)
}

const introExcerpt = octaveIntro.excerpts[0]
</script>

<template>
  <section id="octave" class="py-20 md:py-28">
    <div class="max-w-5xl mx-auto px-6">
      <LayoutSectionLabel :text="octaveIntro.label" />

      <h2 class="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
        {{ octaveIntro.heading }}
      </h2>

      <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-6">
        {{ octaveIntro.lead }}
      </p>

      <SharedPaperQuote
        v-if="introExcerpt"
        :text="introExcerpt.text"
        :section="introExcerpt.section"
      />

      <!-- OCTAVE letter progress bar -->
      <div class="flex items-center justify-center gap-0 my-12">
        <template v-for="(item, i) in octaveLetters" :key="item.letter">
          <div class="flex flex-col items-center">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
              :class="completedSections.has(item.letter)
                ? 'text-stone-900 border border-stone-900'
                : 'text-stone-300 border border-stone-200'"
            >
              {{ item.letter }}
            </div>
            <span
              class="text-xs mt-1.5 transition-colors"
              :class="completedSections.has(item.letter) ? 'text-stone-600' : 'text-stone-300'"
            >
              {{ item.name }}
            </span>
          </div>
          <div
            v-if="i < octaveLetters.length - 1"
            class="w-8 md:w-12 h-px bg-stone-200 mb-5"
          />
        </template>
      </div>

      <!-- Subsections -->
      <SectionsOctaveObjective
        :choices="choices"
        @update:choices="handleUpdate"
      />

      <SectionsOctaveCharacteristics
        :choices="choices"
        @update:choices="handleUpdate"
      />

      <SectionsOctaveTrial
        :choices="choices"
        @update:choices="handleUpdate"
      />

      <SectionsOctaveAnalysis
        :choices="choices"
        @update:choices="handleUpdate"
      />

      <SectionsOctaveValuation
        :choices="choices"
        @update:choices="handleUpdate"
      />

      <SectionsOctaveEvidence
        :choices="choices"
        @update:choices="handleUpdate"
      />
    </div>
  </section>
</template>
