<script setup lang="ts">
import type { OctaveChoices } from '~/composables/useOctaveState'

const { choices, derivedConfig } = useOctaveState()

function handleChoicesUpdate(partial: Partial<OctaveChoices>) {
  choices.value = { ...choices.value, ...partial }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-24 md:py-32">
      <div class="max-w-5xl mx-auto px-6">
        <LayoutSectionLabel text="Clinical Trial Simulation" />
        <h1 class="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-stone-900 mt-2">
          An interactive exploration of the OCTAVE framework
        </h1>
        <p class="mt-5 text-lg text-stone-600 leading-relaxed max-w-3xl">
          This paper presents a systematic approach to planning clinical trial simulations
          for complex innovative designs. Scroll through the key concepts, make choices,
          and watch a simulation built from your decisions unfold.
        </p>
        <p class="mt-3 text-sm text-stone-400">
          Based on Lee et al., Statistics in Medicine, 2026
        </p>
      </div>
    </section>

    <!-- Section 1: Why Simulate -->
    <SectionsWhySimulateSection />

    <!-- Section 2: Statistical Foundation -->
    <SectionsStatisticalFoundationSection />

    <!-- Section 3: OCTAVE Framework -->
    <SectionsOctaveSection
      :choices="choices"
      @update:choices="handleChoicesUpdate"
    />

    <!-- Section 4: See It All Together -->
    <SectionsSeeItTogetherSection
      :choices="choices"
      :derived-config="derivedConfig"
    />

    <!-- Section 5: Conclusion -->
    <SectionsConclusionSection />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

.section-fade-enter-active {
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.section-fade-leave-active {
  transition: opacity 0.3s ease-in;
}
.section-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.section-fade-leave-to {
  opacity: 0;
}
</style>
