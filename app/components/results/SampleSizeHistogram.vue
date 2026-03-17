<script setup lang="ts">
import { COLORS } from '~/utils/colors'

const props = defineProps<{
  conventionalSizes: number[]
  adaptiveSizes: number[]
  maxBins?: number
}>()

const svgWidth = 480
const svgHeight = 240
const margin = { top: 20, right: 20, bottom: 36, left: 44 }
const plotW = svgWidth - margin.left - margin.right
const plotH = svgHeight - margin.top - margin.bottom

const numBins = computed(() => props.maxBins ?? 20)

interface Bin {
  x0: number
  x1: number
  conventional: number
  adaptive: number
}

const histogram = computed<{ bins: Bin[]; maxCount: number; minVal: number; maxVal: number }>(() => {
  const all = [...props.conventionalSizes, ...props.adaptiveSizes]
  if (all.length === 0) return { bins: [], maxCount: 0, minVal: 0, maxVal: 1 }

  const minVal = Math.min(...all)
  const maxVal = Math.max(...all)
  const range = maxVal - minVal || 1
  const n = numBins.value
  const binWidth = range / n

  const bins: Bin[] = []
  for (let i = 0; i < n; i++) {
    bins.push({
      x0: minVal + i * binWidth,
      x1: minVal + (i + 1) * binWidth,
      conventional: 0,
      adaptive: 0,
    })
  }

  for (const v of props.conventionalSizes) {
    const idx = Math.max(0, Math.min(Math.floor((v - minVal) / binWidth), n - 1))
    if (bins[idx]) bins[idx].conventional++
  }
  for (const v of props.adaptiveSizes) {
    const idx = Math.max(0, Math.min(Math.floor((v - minVal) / binWidth), n - 1))
    if (bins[idx]) bins[idx].adaptive++
  }

  let maxCount = 0
  for (const b of bins) {
    maxCount = Math.max(maxCount, b.conventional, b.adaptive)
  }

  return { bins, maxCount: maxCount || 1, minVal, maxVal }
})

function xScale(val: number): number {
  const { minVal, maxVal } = histogram.value
  const range = maxVal - minVal || 1
  return margin.left + ((val - minVal) / range) * plotW
}

function yScale(count: number): number {
  return margin.top + plotH - (count / histogram.value.maxCount) * plotH
}

const xTicks = computed(() => {
  const { minVal, maxVal } = histogram.value
  const range = maxVal - minVal || 1
  const step = Math.ceil(range / 5 / 10) * 10 || 1
  const ticks: number[] = []
  const start = Math.ceil(minVal / step) * step
  for (let v = start; v <= maxVal; v += step) {
    ticks.push(v)
  }
  return ticks
})

const yTicks = computed(() => {
  const max = histogram.value.maxCount
  const step = Math.ceil(max / 4) || 1
  const ticks: number[] = []
  for (let v = 0; v <= max; v += step) {
    ticks.push(v)
  }
  return ticks
})
</script>

<template>
  <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-auto">
    <!-- Y axis -->
    <line
      :x1="margin.left"
      :y1="margin.top"
      :x2="margin.left"
      :y2="margin.top + plotH"
      stroke="#e7e5e4"
      stroke-width="1"
    />

    <!-- X axis -->
    <line
      :x1="margin.left"
      :y1="margin.top + plotH"
      :x2="margin.left + plotW"
      :y2="margin.top + plotH"
      stroke="#e7e5e4"
      stroke-width="1"
    />

    <!-- Y ticks and labels -->
    <g v-for="t in yTicks" :key="'y-' + t">
      <line
        :x1="margin.left - 4"
        :y1="yScale(t)"
        :x2="margin.left"
        :y2="yScale(t)"
        stroke="#a8a29e"
        stroke-width="1"
      />
      <text
        :x="margin.left - 8"
        :y="yScale(t) + 3"
        text-anchor="end"
        class="text-xs"
        fill="#a8a29e"
        font-family="'Open Sans', system-ui, sans-serif"
        font-size="10"
      >{{ t }}</text>
    </g>

    <!-- X ticks and labels -->
    <g v-for="t in xTicks" :key="'x-' + t">
      <line
        :x1="xScale(t)"
        :y1="margin.top + plotH"
        :x2="xScale(t)"
        :y2="margin.top + plotH + 4"
        stroke="#a8a29e"
        stroke-width="1"
      />
      <text
        :x="xScale(t)"
        :y="margin.top + plotH + 18"
        text-anchor="middle"
        fill="#a8a29e"
        font-family="'Open Sans', system-ui, sans-serif"
        font-size="10"
      >{{ t }}</text>
    </g>

    <!-- Axis label -->
    <text
      :x="margin.left + plotW / 2"
      :y="svgHeight - 4"
      text-anchor="middle"
      fill="#a8a29e"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="10"
    >Sample size</text>

    <!-- Conventional histogram bars -->
    <rect
      v-for="(bin, i) in histogram.bins"
      :key="'conv-' + i"
      :x="xScale(bin.x0)"
      :y="yScale(bin.conventional)"
      :width="Math.max(0, xScale(bin.x1) - xScale(bin.x0) - 1)"
      :height="Math.max(0, margin.top + plotH - yScale(bin.conventional))"
      :fill="COLORS.textMuted"
      opacity="0.5"
    />

    <!-- Adaptive histogram bars -->
    <rect
      v-for="(bin, i) in histogram.bins"
      :key="'adapt-' + i"
      :x="xScale(bin.x0)"
      :y="yScale(bin.adaptive)"
      :width="Math.max(0, xScale(bin.x1) - xScale(bin.x0) - 1)"
      :height="Math.max(0, margin.top + plotH - yScale(bin.adaptive))"
      :fill="COLORS.cadet"
      opacity="0.5"
    />

    <!-- Legend -->
    <rect :x="margin.left + plotW - 130" :y="margin.top + 4" width="10" height="10" :fill="COLORS.textMuted" opacity="0.5" />
    <text
      :x="margin.left + plotW - 116"
      :y="margin.top + 13"
      fill="#57534e"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="10"
    >Conventional</text>
    <rect :x="margin.left + plotW - 130" :y="margin.top + 20" width="10" height="10" :fill="COLORS.cadet" opacity="0.5" />
    <text
      :x="margin.left + plotW - 116"
      :y="margin.top + 29"
      fill="#57534e"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="10"
    >Adaptive</text>
  </svg>
</template>
