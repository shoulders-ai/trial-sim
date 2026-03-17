<script setup lang="ts">
import { COLORS, ARM_COLORS } from '~/utils/colors'
import { createPRNG } from '@shared/utils/prng'

type Mode = 'simple' | 'block' | 'adaptive'

const mode = ref<Mode>('simple')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasWidth = ref(400)
const canvasHeight = 200

const numPatients = 24
const numArms = 4
const armNames: string[] = ['Control', 'Arm A', 'Arm B', 'Arm C']

// Allocation counts per arm
const counts = ref<number[]>([0, 0, 0, 0])

// Simulated response rates for adaptive mode
const trueEffects: number[] = [0.20, 0.20, 0.35, 0.25]

interface AnimDot {
  armIndex: number
  x: number
  y: number
  targetX: number
  targetY: number
  color: string
  progress: number
}

let dots: AnimDot[] = []
let animId: number | null = null

function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const dpr = getDevicePixelRatio()
  const rect = container.getBoundingClientRect()
  canvasWidth.value = rect.width

  canvas.width = rect.width * dpr
  canvas.height = canvasHeight * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${canvasHeight}px`

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

function allocateSimple(prng: () => number): number[] {
  const allocs: number[] = []
  for (let i = 0; i < numPatients; i++) {
    allocs.push(Math.floor(prng() * numArms))
  }
  return allocs
}

function allocateBlock(prng: () => number): number[] {
  const allocs: number[] = []
  const blockSize = numArms
  const numBlocks = Math.ceil(numPatients / blockSize)
  for (let b = 0; b < numBlocks; b++) {
    const block: number[] = Array.from({ length: blockSize }, (_, i) => i)
    // Fisher-Yates shuffle
    for (let i = block.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1))
      const tmp = block[i] as number
      block[i] = block[j] as number
      block[j] = tmp
    }
    for (let k = 0; k < block.length; k++) {
      if (allocs.length < numPatients) allocs.push(block[k] as number)
    }
  }
  return allocs
}

function allocateAdaptive(prng: () => number): number[] {
  const allocs: number[] = []
  const armSuccesses: number[] = [0, 0, 0, 0]
  const armTrials: number[] = [0, 0, 0, 0]

  for (let i = 0; i < numPatients; i++) {
    let probs: number[]
    if (i < numArms * 2) {
      probs = [0.25, 0.25, 0.25, 0.25]
    } else {
      const rates: number[] = []
      for (let idx = 0; idx < numArms; idx++) {
        const n = armTrials[idx] ?? 0
        const s = armSuccesses[idx] ?? 0
        rates.push(n > 0 ? (s + 1) / (n + 2) : 0.5)
      }
      const total = rates.reduce((sum, r) => sum + r, 0)
      probs = rates.map(r => r / total)
    }

    const u = prng()
    let cumSum = 0
    let arm = 0
    for (let a = 0; a < numArms; a++) {
      cumSum += probs[a] ?? 0
      if (u < cumSum) {
        arm = a
        break
      }
    }

    allocs.push(arm)
    armTrials[arm] = (armTrials[arm] ?? 0) + 1
    const effect = trueEffects[arm] ?? 0.2
    if (prng() < effect) {
      armSuccesses[arm] = (armSuccesses[arm] ?? 0) + 1
    }
  }
  return allocs
}

function runAllocation() {
  const seed = Date.now()
  const prng = createPRNG(seed)

  let allocs: number[]
  switch (mode.value) {
    case 'simple':
      allocs = allocateSimple(prng)
      break
    case 'block':
      allocs = allocateBlock(prng)
      break
    case 'adaptive':
      allocs = allocateAdaptive(prng)
      break
  }

  // Count per arm
  const c = [0, 0, 0, 0]
  for (const a of allocs) c[a] = (c[a] ?? 0) + 1
  counts.value = c

  // Create animated dots
  const w = canvasWidth.value
  const headerH = 36
  const gridPaddingX = 40
  const usableW = w - gridPaddingX * 2
  const colW = usableW / numArms

  dots = allocs.map((armIndex, i) => {
    const armCount = allocs.slice(0, i + 1).filter(a => a === armIndex).length
    const posInArm = armCount - 1
    const gridCols = 3
    const gridRow = Math.floor(posInArm / gridCols)
    const gridCol = posInArm % gridCols
    const dotSpacing = 14

    const targetX = gridPaddingX + armIndex * colW + colW / 2 + (gridCol - 1) * dotSpacing
    const targetY = headerH + 24 + gridRow * dotSpacing

    return {
      armIndex,
      x: w / 2,
      y: -10,
      targetX,
      targetY,
      color: ARM_COLORS[armIndex] ?? COLORS.textMuted,
      progress: 0,
    }
  })

  animateAllocation()
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function animateAllocation() {
  if (animId !== null) cancelAnimationFrame(animId)

  const startTime = performance.now()
  const stagger = 40 // ms per patient

  function frame(now: number) {
    const elapsed = now - startTime
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = COLORS.canvasBg
    ctx.fillRect(0, 0, w, h)

    // Draw arm labels
    const gridPaddingX = 40
    const usableW = w - gridPaddingX * 2
    const colW = usableW / numArms

    ctx.font = '500 11px "Open Sans", system-ui, sans-serif'
    ctx.textAlign = 'center'
    for (let a = 0; a < numArms; a++) {
      ctx.fillStyle = ARM_COLORS[a] ?? COLORS.textMuted
      const label = armNames[a] ?? `Arm ${a}`
      ctx.fillText(label, gridPaddingX + a * colW + colW / 2, 20)
    }

    // Draw thin divider lines between columns
    ctx.strokeStyle = COLORS.borderMedium
    ctx.lineWidth = 0.5
    for (let a = 1; a < numArms; a++) {
      const x = gridPaddingX + a * colW
      ctx.beginPath()
      ctx.moveTo(x, 28)
      ctx.lineTo(x, h - 10)
      ctx.stroke()
    }

    // Update and draw dots
    let allDone = true
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i]
      if (!d) continue
      const patientStart = i * stagger
      const t = Math.max(0, Math.min(1, (elapsed - patientStart) / 400))
      d.progress = easeOutCubic(t)

      if (t < 1) allDone = false

      d.x = w / 2 + (d.targetX - w / 2) * d.progress
      d.y = -10 + (d.targetY - (-10)) * d.progress

      if (d.progress > 0) {
        ctx.beginPath()
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.globalAlpha = Math.min(1, d.progress * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    if (!allDone) {
      animId = requestAnimationFrame(frame)
    } else {
      animId = null
    }
  }

  animId = requestAnimationFrame(frame)
}

function drawStatic() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvasWidth.value
  const h = canvasHeight

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = COLORS.canvasBg
  ctx.fillRect(0, 0, w, h)

  const gridPaddingX = 40
  const usableW = w - gridPaddingX * 2
  const colW = usableW / numArms

  ctx.font = '500 11px "Open Sans", system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (let a = 0; a < numArms; a++) {
    ctx.fillStyle = ARM_COLORS[a] ?? COLORS.textMuted
    const label = armNames[a] ?? `Arm ${a}`
    ctx.fillText(label, gridPaddingX + a * colW + colW / 2, 20)
  }

  ctx.strokeStyle = COLORS.borderMedium
  ctx.lineWidth = 0.5
  for (let a = 1; a < numArms; a++) {
    const x = gridPaddingX + a * colW
    ctx.beginPath()
    ctx.moveTo(x, 28)
    ctx.lineTo(x, h - 10)
    ctx.stroke()
  }

  for (const d of dots) {
    ctx.beginPath()
    ctx.arc(d.targetX, d.targetY, 4, 0, Math.PI * 2)
    ctx.fillStyle = d.color
    ctx.fill()
  }
}

watch(mode, () => {
  runAllocation()
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    if (dots.length > 0) drawStatic()
  })
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
  runAllocation()
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
  <div>
    <div ref="containerRef" class="w-full border border-stone-100 rounded">
      <canvas
        ref="canvasRef"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        class="block"
      />
    </div>

    <div class="flex items-center gap-2 mt-3">
      <button
        v-for="m in (['simple', 'block', 'adaptive'] as Mode[])"
        :key="m"
        class="px-3 py-1.5 text-xs font-medium rounded tracking-wide transition-colors"
        :class="mode === m
          ? 'bg-stone-900 text-white'
          : 'text-stone-600 hover:text-stone-900 bg-stone-50'"
        @click="mode = m"
      >
        {{ m === 'simple' ? 'Simple' : m === 'block' ? 'Block' : 'Adaptive' }}
      </button>
    </div>

    <div class="flex gap-4 mt-3 text-xs text-stone-500">
      <span v-for="(c, i) in counts" :key="i" class="flex items-center gap-1.5">
        <span
          class="inline-block w-2 h-2 rounded-full"
          :style="{ backgroundColor: ARM_COLORS[i] }"
        />
        {{ armNames[i] }}: {{ c }}
      </span>
    </div>
  </div>
</template>
