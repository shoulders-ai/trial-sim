<script setup lang="ts">
import type { ReplicationResult } from '@shared/types/results'
import { COLORS } from '~/utils/colors'

const props = defineProps<{
  results: ReplicationResult[]
  maxToShow?: number
}>()

const limit = computed(() => props.maxToShow ?? 200)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const CELL_W = 60
const CELL_H = 20
const CELL_PAD = 2

function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

function draw() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const dpr = getDevicePixelRatio()
  const containerWidth = container.getBoundingClientRect().width
  const cols = Math.max(1, Math.floor(containerWidth / (CELL_W + CELL_PAD)))
  const visibleResults = props.results.slice(0, limit.value)
  const rows = Math.ceil(visibleResults.length / cols)
  const totalHeight = rows * (CELL_H + CELL_PAD)

  canvas.width = containerWidth * dpr
  canvas.height = totalHeight * dpr
  canvas.style.width = `${containerWidth}px`
  canvas.style.height = `${totalHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, containerWidth, totalHeight)

  // Find max sample size across all visible results for normalization
  let maxN = 1
  for (const r of visibleResults) {
    maxN = Math.max(maxN, r.conventional.totalPatients, r.adaptive.totalPatients)
  }

  for (let i = 0; i < visibleResults.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (CELL_W + CELL_PAD)
    const y = row * (CELL_H + CELL_PAD)

    const r = visibleResults[i]
    if (!r) continue

    // Conventional: light bar
    const convW = (r.conventional.totalPatients / maxN) * (CELL_W - 4)
    ctx.fillStyle = COLORS.textFaint
    ctx.fillRect(x + 2, y + 2, convW, (CELL_H - 4) / 2 - 1)

    // Adaptive: dark bar
    const adapW = (r.adaptive.totalPatients / maxN) * (CELL_W - 4)
    ctx.fillStyle = COLORS.textBody
    ctx.fillRect(x + 2, y + CELL_H / 2 + 1, adapW, (CELL_H - 4) / 2 - 1)
  }
}

let resizeObserver: ResizeObserver | null = null

watch(() => props.results.length, () => {
  draw()
})

onMounted(() => {
  draw()
  resizeObserver = new ResizeObserver(() => draw())
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div ref="containerRef" class="w-full">
    <canvas ref="canvasRef" class="block" />
  </div>
</template>
