<script setup lang="ts">
import { COLORS, ARM_COLORS } from '~/utils/colors'
import { createPRNG, hashSeed } from '@shared/utils/prng'
import { runAdaptiveTrial } from '@lib/engine/adaptive-design'
import { getScenario } from '@lib/scenarios'
import { whySimulate } from '@lib/paper/excerpts'

const scenario = getScenario('oncology-multiarm')

// ─── Single-run interactive canvas state ────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasWidth = ref(800)
const canvasHeight = 300

const runCount = ref(0)
const isAnimating = ref(false)
const lastResult = ref<{ winner: string; correct: boolean } | null>(null)
const showReflection = ref(false)

// ─── Batch run state ────────────────────────────────────────────────────────
const batchRun = ref(false)
const batchCorrect = ref(0)

// ─── Canvas animation internals ─────────────────────────────────────────────
interface AnimDot {
  armIndex: number
  enrollTime: number
  outcomeTime: number
  outcome: number
  outcomeObserved: boolean
  x: number
  y: number
  targetX: number
  color: string
  finalColor: string
  arrived: boolean
}

let animDots: AnimDot[] = []
let droppedArms = new Set<number>()
let interimTimes: number[] = []
let maxTime = 1
let animId: number | null = null
let animStartTs: number | null = null
const animDurationMs = 8000

const armNames = scenario.config.arms.map(a => a.name)
const armCount = scenario.config.arms.length

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
  if (ctx) ctx.scale(dpr, dpr)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function getLaneLayout() {
  const w = canvasWidth.value
  const paddingX = 40
  const usable = w - paddingX * 2
  const colW = usable / armCount
  return {
    getColumnX(armIndex: number): number {
      return paddingX + colW * armIndex + colW / 2
    },
    colW,
    paddingX,
  }
}

function runOnce() {
  if (isAnimating.value) return

  runCount.value++
  isAnimating.value = true
  lastResult.value = null

  const seed = Date.now() + runCount.value
  const prng = createPRNG(seed)
  const result = runAdaptiveTrial(scenario.config, prng)

  maxTime = result.duration || 1

  // Collect interim times and dropped arms
  droppedArms = new Set<number>()
  interimTimes = []
  const droppedArmTimes: Map<number, number> = new Map()

  for (const evt of result.eventLog) {
    if (evt.type === 'interim-start') {
      interimTimes.push(evt.time)
    }
    if (evt.type === 'arm-dropped') {
      droppedArms.add(evt.armIndex)
      droppedArmTimes.set(evt.armIndex, evt.time)
    }
  }

  // Build animated dots
  const layout = getLaneLayout()
  const centerX = canvasWidth.value / 2

  animDots = result.patients.map(p => {
    const targetX = layout.getColumnX(p.armIndex)
    const baseColor = ARM_COLORS[p.armIndex] || COLORS.textMuted
    return {
      armIndex: p.armIndex,
      enrollTime: p.enrollmentTime,
      outcomeTime: p.outcomeTime,
      outcome: p.outcome,
      outcomeObserved: false,
      x: centerX,
      y: 0,
      targetX,
      color: baseColor,
      finalColor: baseColor,
      arrived: false,
    }
  })

  // Set result info
  const winnerIdx = result.winnerArmIndex
  const winnerName = winnerIdx >= 0 ? (armNames[winnerIdx] ?? 'Unknown') : 'None'
  lastResult.value = {
    winner: winnerName,
    correct: result.correctDecision,
  }

  // Start animation
  startAnimation()
}

function startAnimation() {
  stopAnimation()
  animStartTs = null
  animId = requestAnimationFrame(animateFrame)
}

function stopAnimation() {
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }
}

function animateFrame(ts: number) {
  if (animStartTs === null) animStartTs = ts
  const elapsed = ts - animStartTs
  const progress = Math.min(1, elapsed / animDurationMs)
  const currentTime = progress * maxTime

  drawFrame(currentTime, progress)

  if (progress < 1) {
    animId = requestAnimationFrame(animateFrame)
  } else {
    animId = null
    isAnimating.value = false
    if (runCount.value >= 2) {
      showReflection.value = true
    }
  }
}

function drawFrame(currentTime: number, progress: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvasWidth.value
  const h = canvasHeight
  const headerH = 48
  const bottomPad = 24
  const drawableH = h - headerH - bottomPad
  const layout = getLaneLayout()
  const centerX = w / 2

  // Clear
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = COLORS.canvasBg
  ctx.fillRect(0, 0, w, h)

  // Draw arm column headers
  ctx.font = '500 11px "Open Sans", system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (let i = 0; i < armCount; i++) {
    const x = layout.getColumnX(i)
    const isDropped = droppedArms.has(i)
    ctx.fillStyle = isDropped ? COLORS.dropped : (ARM_COLORS[i] ?? COLORS.textMuted)
    const label = armNames[i] ?? `Arm ${i}`
    ctx.fillText(label, x, 28)

    if (isDropped) {
      const tw = ctx.measureText(label).width
      ctx.strokeStyle = COLORS.dropped
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x - tw / 2 - 2, 25)
      ctx.lineTo(x + tw / 2 + 2, 25)
      ctx.stroke()
    }
  }

  // Draw thin column dividers
  ctx.strokeStyle = COLORS.borderLight
  ctx.lineWidth = 0.5
  for (let i = 1; i < armCount; i++) {
    const x = layout.paddingX + layout.colW * i
    ctx.beginPath()
    ctx.moveTo(x, headerH)
    ctx.lineTo(x, h - bottomPad)
    ctx.stroke()
  }

  // Draw interim analysis lines
  for (const iTime of interimTimes) {
    if (currentTime >= iTime) {
      const frac = iTime / maxTime
      const yPos = headerH + frac * drawableH

      ctx.strokeStyle = COLORS.cadet
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(layout.paddingX, yPos)
      ctx.lineTo(w - layout.paddingX, yPos)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.font = '500 9px "Open Sans", system-ui, sans-serif'
      ctx.fillStyle = COLORS.cadet
      ctx.textAlign = 'right'
      ctx.fillText('Interim', w - layout.paddingX + 2, yPos - 3)
    }
  }

  // Update and draw dots
  for (const d of animDots) {
    if (currentTime < d.enrollTime) {
      d.arrived = false
      continue
    }

    d.arrived = true

    // Horizontal: lerp from center to target
    const arrivalDur = Math.max(0.1, maxTime * 0.03)
    const arrivalProg = Math.min(1, (currentTime - d.enrollTime) / arrivalDur)
    d.x = centerX + (d.targetX - centerX) * easeOutCubic(arrivalProg)

    // Vertical: based on time elapsed since enrollment
    const followUpFrac = Math.min(1, (currentTime - d.enrollTime) / maxTime)
    d.y = headerH + followUpFrac * drawableH

    // Outcome
    if (currentTime >= d.outcomeTime && !d.outcomeObserved) {
      d.outcomeObserved = true
      if (d.outcome >= 0.5) {
        d.finalColor = COLORS.outcome
      }
    }
    if (d.outcomeObserved) {
      d.color = d.finalColor
    }

    // Draw
    ctx.beginPath()
    ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = d.color
    ctx.fill()
  }
}

function drawStaticFrame() {
  if (animDots.length === 0) return
  drawFrame(maxTime, 1)
}

// ─── Batch run: 100 replications ────────────────────────────────────────────
function runBatch() {
  const masterSeed = Date.now()
  let correct = 0

  for (let i = 0; i < 100; i++) {
    const seed = hashSeed(masterSeed, i)
    const prng = createPRNG(seed)
    const result = runAdaptiveTrial(scenario.config, prng)
    if (result.correctDecision) correct++
  }

  batchCorrect.value = correct
  batchRun.value = true
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    if (!isAnimating.value && animDots.length > 0) {
      drawStaticFrame()
    }
  })
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  stopAnimation()
  if (resizeObserver) resizeObserver.disconnect()
})

// Paper excerpts
const ctsDefinition = whySimulate.excerpts.find(e => e.id === 'intro-cts-definition')
const singleRunQuote = whySimulate.excerpts.find(e => e.id === 'intro-single-run')
</script>

<template>
  <section id="why-simulate" class="py-20 md:py-28">
    <div class="max-w-5xl mx-auto px-6">
      <LayoutSectionLabel :text="whySimulate.label" />

      <h2 class="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-stone-900 mb-4">
        {{ whySimulate.heading }}
      </h2>

      <p class="text-base text-stone-600 leading-relaxed max-w-3xl mb-6">
        {{ whySimulate.lead }}
      </p>

      <!-- CTS Definition quote -->
      <SharedPaperQuote
        v-if="ctsDefinition"
        :text="ctsDefinition.text"
        :section="ctsDefinition.section"
      />

      <!-- Single trial canvas -->
      <div class="mt-10 mb-6">
        <div ref="containerRef" class="w-full border border-stone-100 rounded">
          <canvas
            ref="canvasRef"
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
            class="block"
          />
        </div>

        <div class="flex items-center gap-4 mt-4">
          <button
            class="px-5 py-2 text-sm font-medium rounded tracking-wide transition-colors"
            :class="isAnimating
              ? 'bg-stone-300 text-white cursor-not-allowed'
              : 'bg-stone-900 text-white hover:bg-stone-800'"
            :disabled="isAnimating"
            @click="runOnce"
          >
            Run once
          </button>

          <div v-if="lastResult && !isAnimating" class="text-sm text-stone-500">
            <span>Winner: <span class="font-medium text-stone-700">{{ lastResult.winner }}</span></span>
            <span class="mx-2 text-stone-300">|</span>
            <span :class="lastResult.correct ? 'text-sea-600' : 'text-stone-400'">
              {{ lastResult.correct ? 'Correct' : 'Incorrect' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Reflection text after 2+ runs -->
      <Transition
        enter-active-class="transition-all duration-700 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <p
          v-if="showReflection && !isAnimating"
          class="text-base text-stone-600 leading-relaxed max-w-3xl my-6"
        >
          Each run tells a different story. Some find the right answer quickly. Others take longer. Some get it wrong entirely. This is why we simulate.
        </p>
      </Transition>

      <!-- Single run quote -->
      <SharedPaperQuote
        v-if="singleRunQuote"
        :text="singleRunQuote.text"
        :section="singleRunQuote.section"
      />

      <!-- Batch run -->
      <div class="mt-10">
        <div class="flex items-center gap-4">
          <button
            class="px-5 py-2 text-sm font-medium rounded tracking-wide bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            @click="runBatch"
          >
            Run it 100 times
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p
            v-if="batchRun"
            class="text-base text-stone-600 leading-relaxed max-w-3xl mt-4"
          >
            <span class="font-serif font-semibold text-lg text-stone-900">{{ batchCorrect }}</span>
            out of 100 trials found the correct answer. That is the power of this design.
          </p>
        </Transition>
      </div>
    </div>
  </section>
</template>
