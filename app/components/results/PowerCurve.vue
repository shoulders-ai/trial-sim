<script setup lang="ts">
import { COLORS } from '~/utils/colors'
import { formatPercent } from '~/utils/format'

const props = defineProps<{
  conventionalPower: number
  adaptivePower: number
  designEffectSize: number
}>()

const svgWidth = 320
const svgHeight = 140
const margin = { top: 24, right: 20, bottom: 24, left: 80 }
const plotW = svgWidth - margin.left - margin.right
const plotH = svgHeight - margin.top - margin.bottom

const barHeight = 20
const barGap = 16

function xScale(val: number): number {
  return margin.left + val * plotW
}
</script>

<template>
  <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-auto">
    <!-- Title -->
    <text
      :x="margin.left"
      :y="margin.top - 8"
      fill="#1c1917"
      font-family="'Crimson Text', Georgia, serif"
      font-size="14"
      font-weight="600"
    >Power</text>

    <!-- Background grid lines -->
    <line
      v-for="tick in [0, 0.25, 0.5, 0.75, 1.0]"
      :key="tick"
      :x1="xScale(tick)"
      :y1="margin.top"
      :x2="xScale(tick)"
      :y2="margin.top + plotH"
      stroke="#f5f5f4"
      stroke-width="1"
    />

    <!-- Conventional bar -->
    <text
      :x="margin.left - 8"
      :y="margin.top + barHeight / 2 + 4"
      text-anchor="end"
      fill="#57534e"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="11"
    >Conventional</text>
    <rect
      :x="xScale(0)"
      :y="margin.top"
      :width="Math.max(0, conventionalPower * plotW)"
      :height="barHeight"
      :fill="COLORS.textMuted"
      opacity="0.7"
      rx="1"
    />
    <text
      :x="xScale(conventionalPower) + 6"
      :y="margin.top + barHeight / 2 + 4"
      fill="#1c1917"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="11"
      font-weight="500"
    >{{ formatPercent(conventionalPower, 1) }}</text>

    <!-- Adaptive bar -->
    <text
      :x="margin.left - 8"
      :y="margin.top + barHeight + barGap + barHeight / 2 + 4"
      text-anchor="end"
      fill="#57534e"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="11"
    >Adaptive</text>
    <rect
      :x="xScale(0)"
      :y="margin.top + barHeight + barGap"
      :width="Math.max(0, adaptivePower * plotW)"
      :height="barHeight"
      :fill="COLORS.cadet"
      opacity="0.7"
      rx="1"
    />
    <text
      :x="xScale(adaptivePower) + 6"
      :y="margin.top + barHeight + barGap + barHeight / 2 + 4"
      fill="#1c1917"
      font-family="'Open Sans', system-ui, sans-serif"
      font-size="11"
      font-weight="500"
    >{{ formatPercent(adaptivePower, 1) }}</text>

    <!-- X axis ticks -->
    <g v-for="tick in [0, 0.25, 0.5, 0.75, 1.0]" :key="'xt-' + tick">
      <text
        :x="xScale(tick)"
        :y="svgHeight - 4"
        text-anchor="middle"
        fill="#a8a29e"
        font-family="'Open Sans', system-ui, sans-serif"
        font-size="10"
      >{{ formatPercent(tick, 0) }}</text>
    </g>
  </svg>
</template>
