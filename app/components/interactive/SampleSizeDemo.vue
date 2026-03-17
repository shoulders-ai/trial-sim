<script setup lang="ts">
import { COLORS } from '~/utils/colors'
import { createPRNG, hashSeed } from '@shared/utils/prng'
import { runAdaptiveTrial } from '@lib/engine/adaptive-design'
import { getScenario } from '@lib/scenarios'

const baseScenario = getScenario('oncology-multiarm')
const replications = 200

// Sample sizes to test
const sampleSizes = [50, 100, 150, 200, 250, 300, 360, 420, 480, 540]

interface DataPoint {
  n: number
  power: number
}

const dataPoints = ref<DataPoint[]>([])
const isComputed = ref(false)
const hoveredIndex = ref<number | null>(null)
const sliderValue = ref(5) // index into sampleSizes

const svgWidth = 320
const svgHeight = 180
const padding = { top: 16, right: 16, bottom: 28, left: 40 }
const plotW = svgWidth - padding.left - padding.right
const plotH = svgHeight - padding.top - padding.bottom

function computePowerCurve() {
  const points: DataPoint[] = []
  const masterSeed = 42 // fixed for consistency

  for (const n of sampleSizes) {
    // Create a modified config with this sample size
    const config = {
      ...baseScenario.config,
      adaptive: {
        ...baseScenario.config.adaptive,
        maxSampleSize: n,
      },
    }

    let correct = 0
    for (let r = 0; r < replications; r++) {
      const seed = hashSeed(masterSeed, n * 1000 + r)
      const prng = createPRNG(seed)
      const result = runAdaptiveTrial(config, prng)
      if (result.correctDecision) correct++
    }

    points.push({ n, power: correct / replications })
  }

  dataPoints.value = points
  isComputed.value = true
}

// Scale functions
function xScale(n: number): number {
  const min = sampleSizes[0] ?? 50
  const max = sampleSizes[sampleSizes.length - 1] ?? 540
  return padding.left + ((n - min) / (max - min)) * plotW
}

function yScale(power: number): number {
  return padding.top + (1 - power) * plotH
}

// Build the SVG path
const linePath = computed(() => {
  if (dataPoints.value.length === 0) return ''
  return dataPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.n).toFixed(1)} ${yScale(p.power).toFixed(1)}`)
    .join(' ')
})

// Y-axis ticks
const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
// X-axis ticks
const xTicks = [50, 150, 250, 360, 540]

const currentPoint = computed(() => {
  if (!isComputed.value) return null
  return dataPoints.value[sliderValue.value] || null
})

onMounted(() => {
  computePowerCurve()
})
</script>

<template>
  <div>
    <svg
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      class="w-full"
      style="max-height: 200px"
    >
      <!-- Grid lines -->
      <line
        v-for="tick in yTicks"
        :key="'yg-' + tick"
        :x1="padding.left"
        :y1="yScale(tick)"
        :x2="padding.left + plotW"
        :y2="yScale(tick)"
        stroke="#f5f5f4"
        stroke-width="1"
      />

      <!-- 80% power reference line -->
      <line
        :x1="padding.left"
        :y1="yScale(0.8)"
        :x2="padding.left + plotW"
        :y2="yScale(0.8)"
        stroke="#a8a29e"
        stroke-width="1"
        stroke-dasharray="4 3"
      />
      <text
        :x="padding.left + plotW + 2"
        :y="yScale(0.8) + 3"
        fill="#a8a29e"
        font-size="8"
        font-family="Open Sans, system-ui, sans-serif"
      >80%</text>

      <!-- Y-axis labels -->
      <text
        v-for="tick in yTicks"
        :key="'yl-' + tick"
        :x="padding.left - 6"
        :y="yScale(tick) + 3"
        text-anchor="end"
        fill="#a8a29e"
        font-size="8"
        font-family="Open Sans, system-ui, sans-serif"
      >{{ (tick * 100).toFixed(0) }}%</text>

      <!-- X-axis labels -->
      <text
        v-for="tick in xTicks"
        :key="'xl-' + tick"
        :x="xScale(tick)"
        :y="svgHeight - 4"
        text-anchor="middle"
        fill="#a8a29e"
        font-size="8"
        font-family="Open Sans, system-ui, sans-serif"
      >{{ tick }}</text>

      <!-- Axis labels -->
      <text
        :x="padding.left + plotW / 2"
        :y="svgHeight"
        text-anchor="middle"
        fill="#78716c"
        font-size="8"
        font-family="Open Sans, system-ui, sans-serif"
      >Sample Size</text>

      <!-- Power curve -->
      <path
        v-if="isComputed"
        :d="linePath"
        fill="none"
        :stroke="COLORS.cadet"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      <circle
        v-for="(p, i) in dataPoints"
        :key="'dp-' + i"
        :cx="xScale(p.n)"
        :cy="yScale(p.power)"
        :r="sliderValue === i ? 5 : 3"
        :fill="sliderValue === i ? COLORS.cadet : 'white'"
        :stroke="COLORS.cadet"
        stroke-width="1.5"
        class="transition-all duration-150"
      />

      <!-- Hover indicator line -->
      <line
        v-if="currentPoint"
        :x1="xScale(currentPoint.n)"
        :y1="yScale(currentPoint.power)"
        :x2="xScale(currentPoint.n)"
        :y2="yScale(0)"
        :stroke="COLORS.cadet"
        stroke-width="1"
        stroke-dasharray="2 2"
        opacity="0.4"
      />
    </svg>

    <!-- Slider -->
    <div class="mt-3 px-1">
      <input
        v-model.number="sliderValue"
        type="range"
        :min="0"
        :max="sampleSizes.length - 1"
        :step="1"
        class="w-full accent-stone-900"
      />
    </div>

    <p v-if="currentPoint" class="mt-2 text-xs text-stone-500 leading-relaxed">
      At N = {{ currentPoint.n }}, power is {{ (currentPoint.power * 100).toFixed(0) }}%
    </p>
  </div>
</template>
