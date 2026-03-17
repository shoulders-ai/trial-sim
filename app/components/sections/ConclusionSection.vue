<script setup lang="ts">
import { conclusion } from '@lib/paper/excerpts'

const cautionExcerpt = conclusion.excerpts.find(e => e.id === 'conclusion-caution')
const conditionalExcerpt = conclusion.excerpts.find(e => e.id === 'conclusion-conditional')
</script>

<template>
  <section id="conclusion" class="py-24 md:py-32 border-t border-stone-100">
    <div class="max-w-5xl mx-auto px-6">
      <LayoutSectionLabel :text="conclusion.label" />

      <h2 class="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-stone-900 mb-6">
        {{ conclusion.heading }}
      </h2>

      <SharedPaperQuote
        v-if="cautionExcerpt"
        :text="cautionExcerpt.text"
        :section="cautionExcerpt.section"
      />

      <SharedPaperQuote
        v-if="conditionalExcerpt"
        :text="conditionalExcerpt.text"
        :section="conditionalExcerpt.section"
      />

      <p class="mt-8 text-base text-stone-600 leading-relaxed max-w-3xl">
        This interactive exploration demonstrates the OCTAVE framework for planning clinical
        trial simulations. For the complete methodology, including detailed case studies and
        supplementary materials, see the full paper.
      </p>

      <div class="mt-8 border-t border-stone-100 pt-8">
        <p class="text-sm text-stone-500 leading-relaxed max-w-3xl">
          Lee KM, Choodari-Oskooei B, Grayling MJ, et al. Clinical Trial Simulation: Planning
          With the OCTAVE Framework, Implementation and Validation Principles.
          <span class="italic">Statistics in Medicine.</span> 2026;45:e70449.
        </p>
        <a
          href="https://doi.org/10.1002/sim.70449"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block mt-3 text-sm text-stone-600 underline underline-offset-2 hover:text-stone-900 transition-colors"
        >
          doi.org/10.1002/sim.70449
        </a>
      </div>
    </div>
  </section>
</template>
