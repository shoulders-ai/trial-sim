# SimTrial

An interactive exploration of the [OCTAVE framework](https://doi.org/10.1002/sim.70449) for clinical trial simulation.

The app walks through the key concepts of the paper — randomization, error rates, sample size, decision rules — with interactive demonstrations, then guides users through each component of the OCTAVE framework (Objective, Characteristics, Trial design, Analysis, Valuation, Evidence). Choices accumulate as you scroll. At the end, a full Monte Carlo simulation runs in the browser using the configuration you built.

**Live demo:** [shoulders-ai.github.io/trial-sim](https://shoulders-ai.github.io/trial-sim/)

## What this is

A companion to:

> Lee KM, Choodari-Oskooei B, Grayling MJ, et al. *Clinical Trial Simulation: Planning With the OCTAVE Framework, Implementation and Validation Principles.* Statistics in Medicine. 2026;45:e70449.

Everything runs client-side. The simulation engine, Monte Carlo replications, and all visualizations execute in the browser — no server required. A Web Worker handles the heavy computation off the main thread.

## Technical overview

- **Framework:** Nuxt 4 (Vue 3, Vite)
- **Styling:** Tailwind CSS with a custom design system (Crimson Text + Open Sans, stone palette)
- **Simulation engine:** ~600 lines of TypeScript implementing an event-driven trial runner with seeded PRNG (sfc32), distribution samplers, alpha-spending functions, and interim analysis logic
- **Scenarios:** Four presets (oncology multi-arm, vaccine efficacy, dose-finding, rare disease)
- **Visualization:** HTML5 Canvas for patient flow animation, hand-rolled SVG for charts

## Development

```
npm install
npm run dev
```

## Deploy

The `gh-pages` branch contains the pre-built static site. To rebuild and redeploy:

```
NUXT_APP_BASE_URL=/trial-sim/ npx nuxt generate
```

Then update the `gh-pages` branch with the contents of `.output/public/`.

## License

The paper content and excerpts are used under the terms of the [Creative Commons Attribution License](https://creativecommons.org/licenses/by/4.0/) as published by the original authors.
