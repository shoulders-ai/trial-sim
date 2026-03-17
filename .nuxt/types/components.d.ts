
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  ControlsParameterSlider: typeof import("../../app/components/controls/ParameterSlider.vue")['default']
  ControlsReplicationControls: typeof import("../../app/components/controls/ReplicationControls.vue")['default']
  ControlsScenarioSelector: typeof import("../../app/components/controls/ScenarioSelector.vue")['default']
  InteractiveDecisionRulesDemo: typeof import("../../app/components/interactive/DecisionRulesDemo.vue")['default']
  InteractiveErrorRateDemo: typeof import("../../app/components/interactive/ErrorRateDemo.vue")['default']
  InteractiveRandomizationDemo: typeof import("../../app/components/interactive/RandomizationDemo.vue")['default']
  InteractiveSampleSizeDemo: typeof import("../../app/components/interactive/SampleSizeDemo.vue")['default']
  LayoutSectionLabel: typeof import("../../app/components/layout/SectionLabel.vue")['default']
  LayoutSiteFooter: typeof import("../../app/components/layout/SiteFooter.vue")['default']
  LayoutSiteHeader: typeof import("../../app/components/layout/SiteHeader.vue")['default']
  ResultsMonteCarloProgress: typeof import("../../app/components/results/MonteCarloProgress.vue")['default']
  ResultsOperatingCharsTable: typeof import("../../app/components/results/OperatingCharsTable.vue")['default']
  ResultsPowerCurve: typeof import("../../app/components/results/PowerCurve.vue")['default']
  ResultsSampleSizeHistogram: typeof import("../../app/components/results/SampleSizeHistogram.vue")['default']
  ResultsScoreboard: typeof import("../../app/components/results/Scoreboard.vue")['default']
  ResultsSparklineGrid: typeof import("../../app/components/results/SparklineGrid.vue")['default']
  SectionsConclusionSection: typeof import("../../app/components/sections/ConclusionSection.vue")['default']
  SectionsOctaveAnalysis: typeof import("../../app/components/sections/OctaveAnalysis.vue")['default']
  SectionsOctaveCharacteristics: typeof import("../../app/components/sections/OctaveCharacteristics.vue")['default']
  SectionsOctaveEvidence: typeof import("../../app/components/sections/OctaveEvidence.vue")['default']
  SectionsOctaveObjective: typeof import("../../app/components/sections/OctaveObjective.vue")['default']
  SectionsOctaveSection: typeof import("../../app/components/sections/OctaveSection.vue")['default']
  SectionsOctaveTrial: typeof import("../../app/components/sections/OctaveTrial.vue")['default']
  SectionsOctaveValuation: typeof import("../../app/components/sections/OctaveValuation.vue")['default']
  SectionsSeeItTogetherSection: typeof import("../../app/components/sections/SeeItTogetherSection.vue")['default']
  SectionsStatisticalFoundationSection: typeof import("../../app/components/sections/StatisticalFoundationSection.vue")['default']
  SectionsWhySimulateSection: typeof import("../../app/components/sections/WhySimulateSection.vue")['default']
  SharedMetricCard: typeof import("../../app/components/shared/MetricCard.vue")['default']
  SharedPaperQuote: typeof import("../../app/components/shared/PaperQuote.vue")['default']
  SharedProse: typeof import("../../app/components/shared/Prose.vue")['default']
  SimulationDualTrialCanvas: typeof import("../../app/components/simulation/DualTrialCanvas.vue")['default']
  SimulationPatientTooltip: typeof import("../../app/components/simulation/PatientTooltip.vue")['default']
  SimulationTrialTimeline: typeof import("../../app/components/simulation/TrialTimeline.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyControlsParameterSlider: LazyComponent<typeof import("../../app/components/controls/ParameterSlider.vue")['default']>
  LazyControlsReplicationControls: LazyComponent<typeof import("../../app/components/controls/ReplicationControls.vue")['default']>
  LazyControlsScenarioSelector: LazyComponent<typeof import("../../app/components/controls/ScenarioSelector.vue")['default']>
  LazyInteractiveDecisionRulesDemo: LazyComponent<typeof import("../../app/components/interactive/DecisionRulesDemo.vue")['default']>
  LazyInteractiveErrorRateDemo: LazyComponent<typeof import("../../app/components/interactive/ErrorRateDemo.vue")['default']>
  LazyInteractiveRandomizationDemo: LazyComponent<typeof import("../../app/components/interactive/RandomizationDemo.vue")['default']>
  LazyInteractiveSampleSizeDemo: LazyComponent<typeof import("../../app/components/interactive/SampleSizeDemo.vue")['default']>
  LazyLayoutSectionLabel: LazyComponent<typeof import("../../app/components/layout/SectionLabel.vue")['default']>
  LazyLayoutSiteFooter: LazyComponent<typeof import("../../app/components/layout/SiteFooter.vue")['default']>
  LazyLayoutSiteHeader: LazyComponent<typeof import("../../app/components/layout/SiteHeader.vue")['default']>
  LazyResultsMonteCarloProgress: LazyComponent<typeof import("../../app/components/results/MonteCarloProgress.vue")['default']>
  LazyResultsOperatingCharsTable: LazyComponent<typeof import("../../app/components/results/OperatingCharsTable.vue")['default']>
  LazyResultsPowerCurve: LazyComponent<typeof import("../../app/components/results/PowerCurve.vue")['default']>
  LazyResultsSampleSizeHistogram: LazyComponent<typeof import("../../app/components/results/SampleSizeHistogram.vue")['default']>
  LazyResultsScoreboard: LazyComponent<typeof import("../../app/components/results/Scoreboard.vue")['default']>
  LazyResultsSparklineGrid: LazyComponent<typeof import("../../app/components/results/SparklineGrid.vue")['default']>
  LazySectionsConclusionSection: LazyComponent<typeof import("../../app/components/sections/ConclusionSection.vue")['default']>
  LazySectionsOctaveAnalysis: LazyComponent<typeof import("../../app/components/sections/OctaveAnalysis.vue")['default']>
  LazySectionsOctaveCharacteristics: LazyComponent<typeof import("../../app/components/sections/OctaveCharacteristics.vue")['default']>
  LazySectionsOctaveEvidence: LazyComponent<typeof import("../../app/components/sections/OctaveEvidence.vue")['default']>
  LazySectionsOctaveObjective: LazyComponent<typeof import("../../app/components/sections/OctaveObjective.vue")['default']>
  LazySectionsOctaveSection: LazyComponent<typeof import("../../app/components/sections/OctaveSection.vue")['default']>
  LazySectionsOctaveTrial: LazyComponent<typeof import("../../app/components/sections/OctaveTrial.vue")['default']>
  LazySectionsOctaveValuation: LazyComponent<typeof import("../../app/components/sections/OctaveValuation.vue")['default']>
  LazySectionsSeeItTogetherSection: LazyComponent<typeof import("../../app/components/sections/SeeItTogetherSection.vue")['default']>
  LazySectionsStatisticalFoundationSection: LazyComponent<typeof import("../../app/components/sections/StatisticalFoundationSection.vue")['default']>
  LazySectionsWhySimulateSection: LazyComponent<typeof import("../../app/components/sections/WhySimulateSection.vue")['default']>
  LazySharedMetricCard: LazyComponent<typeof import("../../app/components/shared/MetricCard.vue")['default']>
  LazySharedPaperQuote: LazyComponent<typeof import("../../app/components/shared/PaperQuote.vue")['default']>
  LazySharedProse: LazyComponent<typeof import("../../app/components/shared/Prose.vue")['default']>
  LazySimulationDualTrialCanvas: LazyComponent<typeof import("../../app/components/simulation/DualTrialCanvas.vue")['default']>
  LazySimulationPatientTooltip: LazyComponent<typeof import("../../app/components/simulation/PatientTooltip.vue")['default']>
  LazySimulationTrialTimeline: LazyComponent<typeof import("../../app/components/simulation/TrialTimeline.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
