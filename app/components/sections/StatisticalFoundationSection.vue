<script setup lang="ts">
import {
  statisticalFoundation,
  randomizationExcerpts,
  errorRateExcerpts,
  sampleSizeExcerpts,
  decisionRuleExcerpts,
} from '@lib/paper/excerpts'

// Extract the first excerpt from each array with safe access
const randQuote = randomizationExcerpts[0]!
const errorQuote = errorRateExcerpts[0]!
const sampleQuote = sampleSizeExcerpts[0]!
const decisionQuote = decisionRuleExcerpts[0]!
</script>

<template>
  <section id="statistical-foundation" class="py-20 md:py-28">
    <div class="max-w-5xl mx-auto px-6">
      <LayoutSectionLabel :text="statisticalFoundation.label" />

      <h2 class="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
        {{ statisticalFoundation.heading }}
      </h2>

      <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-10">
        {{ statisticalFoundation.lead }}
      </p>

      <!-- 2x2 Grid of panels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">

        <!-- Panel 1: Randomization -->
        <div>
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Randomization
          </h3>
          <SharedPaperQuote
            :text="randQuote.text"
            :section="randQuote.section"
          />
          <InteractiveRandomizationDemo />
        </div>

        <!-- Panel 2: Error Rates -->
        <div>
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Error Rates
          </h3>
          <SharedPaperQuote
            :text="errorQuote.text"
            :section="errorQuote.section"
          />
          <InteractiveErrorRateDemo />
        </div>

        <!-- Panel 3: Sample Size -->
        <div>
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Sample Size
          </h3>
          <SharedPaperQuote
            :text="sampleQuote.text"
            :section="sampleQuote.section"
          />
          <InteractiveSampleSizeDemo />
        </div>

        <!-- Panel 4: Decision Rules -->
        <div>
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Decision Rules
          </h3>
          <SharedPaperQuote
            :text="decisionQuote.text"
            :section="decisionQuote.section"
          />
          <InteractiveDecisionRulesDemo />
        </div>
      </div>
    </div>
  </section>
</template>
