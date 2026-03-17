<script setup lang="ts">
import type { TrialResult, TrialEvent, Patient } from '@shared/types/trial'
import { COLORS, ARM_COLORS } from '~/utils/colors'

const props = defineProps<{
  conventionalResult: TrialResult | null
  adaptiveResult: TrialResult | null
  playbackSpeed: number
  isPlaying: boolean
}>()

const emit = defineEmits<{
  complete: []
  progress: [value: number]
  'patient-hover': [patientId: number, designType: string, x: number, y: number]
  'patient-leave': []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasWidth = ref(800)
const canvasHeight = 500

// Animation state
let animationId: number | null = null
let startTime: number | null = null
let durationMs = 12000 // 12 seconds base duration
let maxTrialTime = 1 // months

// Patient animation state
interface AnimatedPatient {
  id: number
  armIndex: number
  enrollmentTime: number
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

let conventionalPatients: AnimatedPatient[] = []
let adaptivePatients: AnimatedPatient[] = []
let droppedArmsAdaptive: Set<number> = new Set()
let interimTimesAdaptive: number[] = []

// Hover tracking
let hoveredPatient: { patient: AnimatedPatient; designType: string } | null = null

function getDevicePixelRatio(): number {
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

function getArmNames(result: TrialResult): string[] {
  return result.arms.map(a => a.config.name)
}

function getLaneLayout(laneX: number, laneWidth: number, armCount: number) {
  const padding = 30
  const usableWidth = laneWidth - padding * 2
  const colWidth = usableWidth / armCount
  return {
    getColumnX(armIndex: number): number {
      return laneX + padding + colWidth * armIndex + colWidth / 2
    },
    colWidth,
    padding,
  }
}

function initPatients(result: TrialResult, laneX: number, laneWidth: number): AnimatedPatient[] {
  const layout = getLaneLayout(laneX, laneWidth, result.arms.length)
  const patients: AnimatedPatient[] = []
  const startX = laneX + laneWidth / 2

  for (const p of result.patients) {
    const targetX = layout.getColumnX(p.armIndex)
    const baseColor = ARM_COLORS[p.armIndex] || COLORS.textMuted
    patients.push({
      id: p.id,
      armIndex: p.armIndex,
      enrollmentTime: p.enrollmentTime,
      outcomeTime: p.outcomeTime,
      outcome: p.outcome,
      outcomeObserved: false,
      x: startX,
      y: 0,
      targetX,
      color: baseColor,
      finalColor: baseColor,
      arrived: false,
    })
  }

  return patients
}

function computeMaxTrialTime(): number {
  let max = 1
  if (props.conventionalResult) {
    max = Math.max(max, props.conventionalResult.duration)
  }
  if (props.adaptiveResult) {
    max = Math.max(max, props.adaptiveResult.duration)
  }
  return max
}

function initAnimation() {
  if (!props.conventionalResult || !props.adaptiveResult) return

  const w = canvasWidth.value
  const halfW = w / 2

  maxTrialTime = computeMaxTrialTime()
  durationMs = 12000 / props.playbackSpeed

  conventionalPatients = initPatients(props.conventionalResult, 0, halfW)
  adaptivePatients = initPatients(props.adaptiveResult, halfW, halfW)
  droppedArmsAdaptive = new Set()
  interimTimesAdaptive = []

  // Collect interim times
  if (props.adaptiveResult) {
    for (const evt of props.adaptiveResult.eventLog) {
      if (evt.type === 'interim-start') {
        interimTimesAdaptive.push(evt.time)
      }
      if (evt.type === 'arm-dropped') {
        // We'll add these during animation instead
      }
    }
  }
}

function updatePatients(
  patients: AnimatedPatient[],
  currentTrialTime: number,
  result: TrialResult,
  laneX: number,
  laneWidth: number,
) {
  const headerHeight = 60
  const bottomPadding = 40
  const drawableHeight = canvasHeight - headerHeight - bottomPadding
  const laneCenterX = laneX + laneWidth / 2

  for (const p of patients) {
    if (currentTrialTime < p.enrollmentTime) {
      p.arrived = false
      continue
    }

    p.arrived = true

    // Horizontal arrival: smooth lerp from lane center to arm column
    const arrivalDuration = Math.max(0.1, maxTrialTime * 0.03)
    const arrivalProgress = Math.min(1, (currentTrialTime - p.enrollmentTime) / arrivalDuration)
    const easedArrival = easeOutCubic(arrivalProgress)
    p.x = laneCenterX + (p.targetX - laneCenterX) * easedArrival

    // Vertical descent: based on follow-up time elapsed
    const followUpFraction = Math.min(1, (currentTrialTime - p.enrollmentTime) / maxTrialTime)
    p.y = headerHeight + followUpFraction * drawableHeight

    // Outcome observation
    if (currentTrialTime >= p.outcomeTime && !p.outcomeObserved) {
      p.outcomeObserved = true
      // For binary: outcome 1 = response (dark), 0 = no response (stays base)
      if (p.outcome >= 0.5) {
        p.finalColor = COLORS.outcome
      }
    }

    // Color transition
    if (p.outcomeObserved) {
      p.color = p.finalColor
    }
  }
}

function updateDroppedArms(currentTrialTime: number) {
  if (!props.adaptiveResult) return

  for (const evt of props.adaptiveResult.eventLog) {
    if (evt.type === 'arm-dropped' && currentTrialTime >= evt.time) {
      droppedArmsAdaptive.add(evt.armIndex)
    }
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function drawFrame(progress: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvasWidth.value
  const h = canvasHeight
  const halfW = w / 2
  const currentTrialTime = progress * maxTrialTime

  // Clear
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = COLORS.canvasBg
  ctx.fillRect(0, 0, w, h)

  // Divider
  ctx.strokeStyle = COLORS.canvasDivider
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(halfW, 0)
  ctx.lineTo(halfW, h)
  ctx.stroke()

  // Draw lane labels
  ctx.font = '600 15px "Crimson Text", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.textPrimary
  ctx.fillText('Conventional', halfW / 2, 24)
  ctx.fillText('Adaptive', halfW + halfW / 2, 24)

  // Draw arm column headers
  if (props.conventionalResult) {
    drawColumnHeaders(ctx, props.conventionalResult, 0, halfW, new Set())
  }
  if (props.adaptiveResult) {
    drawColumnHeaders(ctx, props.adaptiveResult, halfW, halfW, droppedArmsAdaptive)
  }

  // Update and draw patients
  if (props.conventionalResult) {
    updatePatients(conventionalPatients, currentTrialTime, props.conventionalResult, 0, halfW)
  }
  if (props.adaptiveResult) {
    updatePatients(adaptivePatients, currentTrialTime, props.adaptiveResult, halfW, halfW)
    updateDroppedArms(currentTrialTime)
  }

  // Draw interim analysis lines on adaptive side
  for (const iTime of interimTimesAdaptive) {
    if (currentTrialTime >= iTime) {
      const headerHeight = 60
      const bottomPadding = 40
      const drawableHeight = h - headerHeight - bottomPadding
      const fraction = iTime / maxTrialTime
      const yPos = headerHeight + fraction * drawableHeight

      ctx.strokeStyle = COLORS.cadet
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(halfW + 8, yPos)
      ctx.lineTo(w - 8, yPos)
      ctx.stroke()
      ctx.setLineDash([])

      // Small label
      ctx.font = '500 10px "Open Sans", system-ui, sans-serif'
      ctx.fillStyle = COLORS.cadet
      ctx.textAlign = 'right'
      ctx.fillText(`Interim`, w - 12, yPos - 4)
    }
  }

  // Draw patient dots
  drawPatientDots(ctx, conventionalPatients)
  drawPatientDots(ctx, adaptivePatients)
}

function drawColumnHeaders(
  ctx: CanvasRenderingContext2D,
  result: TrialResult,
  laneX: number,
  laneWidth: number,
  droppedArms: Set<number>,
) {
  const layout = getLaneLayout(laneX, laneWidth, result.arms.length)
  const names = getArmNames(result)

  ctx.font = '500 11px "Open Sans", system-ui, sans-serif'
  ctx.textAlign = 'center'

  for (let i = 0; i < names.length; i++) {
    const name = names[i] ?? `Arm ${i}`
    const x = layout.getColumnX(i)
    const isDropped = droppedArms.has(i)

    if (isDropped) {
      ctx.fillStyle = COLORS.dropped
    } else {
      ctx.fillStyle = ARM_COLORS[i] || COLORS.textMuted
    }

    ctx.fillText(name, x, 46)

    // Strikethrough for dropped arms
    if (isDropped) {
      const textWidth = ctx.measureText(name).width
      ctx.strokeStyle = COLORS.dropped
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x - textWidth / 2 - 2, 43)
      ctx.lineTo(x + textWidth / 2 + 2, 43)
      ctx.stroke()
    }
  }
}

function drawPatientDots(ctx: CanvasRenderingContext2D, patients: AnimatedPatient[]) {
  for (const p of patients) {
    if (!p.arrived) continue

    ctx.beginPath()
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()
  }
}

function animate(timestamp: number) {
  if (!props.isPlaying) return

  if (startTime === null) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const progress = Math.min(1, elapsed / durationMs)

  drawFrame(progress)
  emit('progress', progress)

  if (progress < 1) {
    animationId = requestAnimationFrame(animate)
  } else {
    animationId = null
    emit('complete')
  }
}

function startAnimation() {
  stopAnimation()
  initAnimation()
  startTime = null
  animationId = requestAnimationFrame(animate)
}

function stopAnimation() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  startTime = null
}

// Mouse handling for tooltips
function onMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const hitRadius = 8

  let found: { patient: AnimatedPatient; designType: string } | null = null

  // Check adaptive first (drawn on top)
  for (const p of adaptivePatients) {
    if (!p.arrived) continue
    const dx = mx - p.x
    const dy = my - p.y
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      found = { patient: p, designType: 'adaptive' }
      break
    }
  }

  if (!found) {
    for (const p of conventionalPatients) {
      if (!p.arrived) continue
      const dx = mx - p.x
      const dy = my - p.y
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        found = { patient: p, designType: 'conventional' }
        break
      }
    }
  }

  if (found) {
    hoveredPatient = found
    emit('patient-hover', found.patient.id, found.designType, e.clientX, e.clientY)
  } else if (hoveredPatient) {
    hoveredPatient = null
    emit('patient-leave')
  }
}

function onMouseLeave() {
  if (hoveredPatient) {
    hoveredPatient = null
    emit('patient-leave')
  }
}

// Watch for play/pause
watch(() => props.isPlaying, (playing) => {
  if (playing) {
    startAnimation()
  } else {
    stopAnimation()
  }
})

// Watch for speed changes
watch(() => props.playbackSpeed, () => {
  if (props.isPlaying) {
    // Restart with new speed
    startAnimation()
  }
})

// Watch for new results
watch(
  [() => props.conventionalResult, () => props.adaptiveResult],
  () => {
    if (props.conventionalResult && props.adaptiveResult && props.isPlaying) {
      startAnimation()
    }
  },
)

// Resize handling
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  resizeCanvas()
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    if (!props.isPlaying && props.conventionalResult && props.adaptiveResult) {
      // Redraw static frame
      initAnimation()
      drawFrame(1)
    }
  })
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  stopAnimation()
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<template>
  <div ref="containerRef" class="w-full">
    <canvas
      ref="canvasRef"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      class="block"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    />
  </div>
</template>
