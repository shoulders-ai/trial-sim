<script setup lang="ts">
import type { Patient, TrialConfig } from '@shared/types/trial'
import type { OctaveChoices } from '~/composables/useOctaveState'
import { seeItTogether, octaveComponents } from '@lib/paper/excerpts'
import { formatNumber, formatPercent, formatDuration } from '~/utils/format'

const props = defineProps<{
  choices: OctaveChoices
  derivedConfig: TrialConfig | null
}>()

// ─── Simulation orchestrator ────────────────────────────────────────────────
const {
  phase,
  conventionalResult,
  adaptiveResult,
  seed,
  monteCarloSummary,
  monteCarloResults,
  monteCarloProgress,
  monteCarloRunning,
  monteCarloError,
  beginSingleTrial,
  onAnimationComplete,
  beginMonteCarlo,
  cancelMonteCarlo,
  reset,
} = useSimulation()

// ─── Animation state ────────────────────────────────────────────────────────
const isAnimating = ref(false)
const animationProgress = ref(0)
const playbackSpeed = ref(1)
const speedOptions = [1, 2, 5]

// ─── Tooltip state ──────────────────────────────────────────────────────────
const tooltipPatient = ref<Patient | null>(null)
const tooltipArmName = ref('')
const tooltipDesignType = ref('')
const tooltipPosition = ref({ x: 0, y: 0 })

// ─── Step visibility ────────────────────────────────────────────────────────
const hasStarted = ref(false)

const showSimulation = computed(() =>
  hasStarted.value && phase.value !== 'idle',
)
const showScoreboard = computed(() =>
  phase.value === 'complete' ||
  phase.value === 'running-monte-carlo' ||
  phase.value === 'monte-carlo-complete',
)
const showMonteCarlo = computed(() =>
  phase.value === 'running-monte-carlo' ||
  phase.value === 'monte-carlo-complete',
)

// ─── Timeline state ─────────────────────────────────────────────────────────
const maxTrialTime = computed(() => {
  let max = 1
  if (conventionalResult.value) max = Math.max(max, conventionalResult.value.duration)
  if (adaptiveResult.value) max = Math.max(max, adaptiveResult.value.duration)
  return max
})

const currentTrialMonth = computed(() =>
  animationProgress.value * maxTrialTime.value,
)

const interimTimes = computed(() => {
  if (!adaptiveResult.value) return []
  return adaptiveResult.value.eventLog
    .filter(e => e.type === 'interim-start')
    .map(e => e.time)
})

// ─── Monte Carlo derived data ───────────────────────────────────────────────
const conventionalSizes = computed(() =>
  monteCarloResults.value.map(r => r.conventional.totalPatients),
)
const adaptiveSizes = computed(() =>
  monteCarloResults.value.map(r => r.adaptive.totalPatients),
)
const monteCarloCompleted = computed(() =>
  monteCarloResults.value.length,
)

// ─── Choice summary rows ────────────────────────────────────────────────────
const objectiveLabel = computed(() => {
  const obj = octaveComponents.O.objectives.find(o => o.id === props.choices.objectiveId)
  return obj?.label ?? 'Not selected'
})

const scenarioLabel = computed(() => {
  if (!props.derivedConfig) return 'Not configured'
  return props.derivedConfig.scenarioName
})

const designLabel = computed(() =>
  props.choices.useAdaptive ? 'Adaptive' : 'Conventional',
)

const interimLabel = computed(() => {
  if (props.choices.nInterims === 0) return 'None'
  return `${props.choices.nInterims} interim${props.choices.nInterims > 1 ? 's' : ''}`
})

const summaryRows = computed(() => [
  { label: 'Objective', value: objectiveLabel.value },
  { label: 'Scenario', value: `${scenarioLabel.value} with ${props.choices.nArms} arms` },
  { label: 'Effect size', value: props.choices.effectSize.toFixed(2) },
  { label: 'Enrollment', value: props.derivedConfig ? `${props.derivedConfig.enrollmentRate} pts/month` : '--' },
  { label: 'Design', value: `${designLabel.value} with ${interimLabel.value}` },
  { label: 'Max sample size', value: formatNumber(props.choices.maxSampleSize) },
])

// ─── Watchers ───────────────────────────────────────────────────────────────
watch(phase, (newPhase) => {
  if (newPhase === 'animating') {
    animationProgress.value = 0
    nextTick(() => {
      isAnimating.value = true
    })
  }
})

// ─── Actions ────────────────────────────────────────────────────────────────
function handleRunSimulation() {
  if (!props.derivedConfig) return
  hasStarted.value = true
  beginSingleTrial(props.derivedConfig)
}

function handleAnimationComplete() {
  isAnimating.value = false
  onAnimationComplete()
}

function handleProgress(progress: number) {
  animationProgress.value = progress
}

function handleStartMonteCarlo() {
  beginMonteCarlo(props.choices.scenarioId, props.choices.nReplications)
}

function handleCancelMonteCarlo() {
  cancelMonteCarlo()
}

function handleReset() {
  isAnimating.value = false
  animationProgress.value = 0
  hasStarted.value = false
  reset()
}

function handlePatientHover(patientId: number, designType: string, x: number, y: number) {
  const result = designType === 'conventional' ? conventionalResult.value : adaptiveResult.value
  if (!result) return

  const patient = result.patients.find(p => p.id === patientId)
  if (!patient) return

  const arm = result.arms[patient.armIndex]
  tooltipPatient.value = patient
  tooltipArmName.value = arm?.config.name ?? `Arm ${patient.armIndex}`
  tooltipDesignType.value = designType
  tooltipPosition.value = { x, y }
}

function handlePatientLeave() {
  tooltipPatient.value = null
}

// ─── Narrative summary ──────────────────────────────────────────────────────
const narrativeSummary = computed(() => {
  const s = monteCarloSummary.value
  if (!s) return ''

  const parts: string[] = []

  if (s.medianPatientsSaved > 0) {
    parts.push(`a median of ${formatNumber(s.medianPatientsSaved)} patients`)
  }
  if (s.medianTimeSaved > 0.5) {
    parts.push(`${s.medianTimeSaved.toFixed(1)} months of trial duration`)
  }

  const powerLine = `Power was ${formatPercent(s.adaptive.power, 1)} for the adaptive design and ${formatPercent(s.conventional.power, 1)} for the conventional design.`
  const fwerLine = `The type I error rate remained controlled at ${formatPercent(s.adaptive.fwer, 2)}.`

  if (parts.length === 0) {
    return `Across ${formatNumber(s.nReplications)} replications, both designs performed similarly. ${powerLine} ${fwerLine}`
  }

  return `The adaptive design saved ${parts.join(' and ')} across ${formatNumber(s.nReplications)} replications. ${powerLine} ${fwerLine}`
})

const progressionExcerpt = seeItTogether.excerpts.find(e => e.id === 'stakeholder-progression')
const stepsExcerpt = seeItTogether.excerpts.find(e => e.id === 'stakeholder-steps')
</script>

<template>
  <section id="see-it-together" class="py-20 md:py-28 border-t border-stone-100">
    <div class="max-w-5xl mx-auto px-6">
      <!-- Header -->
      <LayoutSectionLabel :text="seeItTogether.label" />

      <h2 class="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
        {{ seeItTogether.heading }}
      </h2>

      <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-6">
        {{ seeItTogether.lead }}
      </p>

      <SharedPaperQuote
        v-if="progressionExcerpt"
        :text="progressionExcerpt.text"
        :section="progressionExcerpt.section"
      />

      <SharedPaperQuote
        v-if="stepsExcerpt"
        :text="stepsExcerpt.text"
        :section="stepsExcerpt.section"
      />

      <!-- Step 1: Summary of choices -->
      <div class="mt-12">
        <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-4">
          Your OCTAVE configuration
        </h3>

        <div class="border border-stone-200 rounded">
          <table class="w-full">
            <tbody>
              <tr
                v-for="(row, i) in summaryRows"
                :key="row.label"
                :class="i < summaryRows.length - 1 ? 'border-b border-stone-100' : ''"
              >
                <td class="px-4 py-2.5 text-sm text-stone-400 w-40">{{ row.label }}</td>
                <td class="px-4 py-2.5 text-sm text-stone-900">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center gap-4 mt-6">
          <button
            v-if="!hasStarted"
            :disabled="!derivedConfig"
            class="bg-stone-900 hover:bg-stone-800 text-white font-medium rounded px-6 py-2.5 tracking-wide transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            @click="handleRunSimulation"
          >
            Run Simulation
          </button>
          <button
            v-if="hasStarted"
            class="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium cursor-pointer"
            @click="handleReset"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Step 2: Single trial animation -->
      <Transition name="section-fade">
        <div v-if="showSimulation" class="mt-16">
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Step 1: Watch a single trial unfold
          </h3>
          <p class="text-sm text-stone-500 mb-6">
            Both designs run on the same simulated patient population. The adaptive trial can drop futile arms and stop early.
          </p>

          <SimulationDualTrialCanvas
            :conventional-result="conventionalResult"
            :adaptive-result="adaptiveResult"
            :playback-speed="playbackSpeed"
            :is-playing="isAnimating"
            @complete="handleAnimationComplete"
            @progress="handleProgress"
            @patient-hover="handlePatientHover"
            @patient-leave="handlePatientLeave"
          />

          <SimulationTrialTimeline
            :current-time="currentTrialMonth"
            :max-time="maxTrialTime"
            :is-playing="isAnimating"
            :interim-times="interimTimes"
          />

          <!-- Speed controls -->
          <div class="flex items-center gap-4 mt-4">
            <span class="text-xs text-stone-400 uppercase tracking-[0.1em]">Speed</span>
            <button
              v-for="speed in speedOptions"
              :key="speed"
              class="text-sm transition-colors cursor-pointer"
              :class="
                playbackSpeed === speed
                  ? 'text-stone-900 font-medium'
                  : 'text-stone-400 hover:text-stone-600'
              "
              @click="playbackSpeed = speed"
            >
              {{ speed }}x
            </button>
          </div>

          <!-- Patient tooltip -->
          <SimulationPatientTooltip
            :patient="tooltipPatient"
            :arm-name="tooltipArmName"
            :design-type="tooltipDesignType"
            :position="tooltipPosition"
          />
        </div>
      </Transition>

      <!-- Step 2b: Scoreboard (after animation completes) -->
      <Transition name="section-fade">
        <div v-if="showScoreboard && conventionalResult && adaptiveResult" class="mt-12">
          <ResultsScoreboard
            :conventional="conventionalResult"
            :adaptive="adaptiveResult"
          />
        </div>
      </Transition>

      <!-- Step 3: Many runs -->
      <Transition name="section-fade">
        <div v-if="showScoreboard" class="mt-16">
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Step 2: Run it a thousand times
          </h3>
          <p class="text-sm text-stone-500 mb-6">
            A single trial is one draw from a distribution. Run {{ formatNumber(props.choices.nReplications) }} replications to see the full picture.
          </p>

          <ControlsReplicationControls
            :is-running="monteCarloRunning"
            :progress="monteCarloProgress"
            @start="handleStartMonteCarlo"
            @cancel="handleCancelMonteCarlo"
          />
        </div>
      </Transition>

      <!-- Monte Carlo results -->
      <Transition name="section-fade">
        <div v-if="showMonteCarlo" class="mt-12">
          <ResultsMonteCarloProgress
            :completed="monteCarloCompleted"
            :total="props.choices.nReplications"
            :is-running="monteCarloRunning"
            class="mb-8"
          />

          <ResultsSparklineGrid
            :results="monteCarloResults"
            :max-to-show="200"
            class="mb-12"
          />

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ResultsSampleSizeHistogram
              :conventional-sizes="conventionalSizes"
              :adaptive-sizes="adaptiveSizes"
            />
            <div>
              <ResultsOperatingCharsTable
                v-if="monteCarloSummary"
                :summary="monteCarloSummary"
              />
              <ResultsPowerCurve
                v-if="monteCarloSummary"
                :conventional-power="monteCarloSummary.conventional.power"
                :adaptive-power="monteCarloSummary.adaptive.power"
                :design-effect-size="choices.effectSize"
                class="mt-8"
              />
            </div>
          </div>

          <!-- Error display -->
          <p
            v-if="monteCarloError"
            class="mt-6 text-sm text-red-600"
          >
            Error: {{ monteCarloError }}
          </p>
        </div>
      </Transition>

      <!-- Step 4: Narrative (after Monte Carlo completes) -->
      <Transition name="section-fade">
        <div v-if="monteCarloSummary" class="mt-16">
          <h3 class="text-lg font-serif font-semibold tracking-tight text-stone-900 mb-2">
            Step 3: What did we learn?
          </h3>

          <p class="mt-4 text-base text-stone-600 leading-relaxed max-w-3xl">
            {{ narrativeSummary }}
          </p>
        </div>
      </Transition>
    </div>
  </section>
</template>
