import type { TrialEvent } from '@shared/types/trial'

export type AnimationState = 'idle' | 'playing' | 'paused' | 'complete'

export function useAnimation() {
  const currentTime = ref(0) // 0-1 progress
  const isPlaying = ref(false)
  const animationState = ref<AnimationState>('idle')

  let animationId: number | null = null
  let startTimestamp: number | null = null
  let pausedProgress = 0
  let totalDurationMs = 12000
  let renderCallback: ((progress: number) => void) | null = null

  function frame(timestamp: number) {
    if (animationState.value !== 'playing') return

    if (startTimestamp === null) {
      startTimestamp = timestamp
    }

    const elapsed = timestamp - startTimestamp
    const progress = Math.min(1, pausedProgress + elapsed / totalDurationMs)
    currentTime.value = progress

    if (renderCallback) {
      renderCallback(progress)
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(frame)
    } else {
      animationState.value = 'complete'
      isPlaying.value = false
      animationId = null
    }
  }

  function start(
    _conventionalEvents: TrialEvent[],
    _adaptiveEvents: TrialEvent[],
    durationMs: number,
    onRender?: (progress: number) => void,
  ) {
    stop()
    totalDurationMs = durationMs
    renderCallback = onRender || null
    pausedProgress = 0
    currentTime.value = 0
    startTimestamp = null
    animationState.value = 'playing'
    isPlaying.value = true
    animationId = requestAnimationFrame(frame)
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    startTimestamp = null
    pausedProgress = 0
    currentTime.value = 0
    isPlaying.value = false
    animationState.value = 'idle'
    renderCallback = null
  }

  function pause() {
    if (animationState.value !== 'playing') return
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    pausedProgress = currentTime.value
    startTimestamp = null
    animationState.value = 'paused'
    isPlaying.value = false
  }

  function resume() {
    if (animationState.value !== 'paused') return
    startTimestamp = null
    animationState.value = 'playing'
    isPlaying.value = true
    animationId = requestAnimationFrame(frame)
  }

  onUnmounted(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
  })

  return {
    currentTime: readonly(currentTime),
    isPlaying: readonly(isPlaying),
    animationState: readonly(animationState),
    start,
    stop,
    pause,
    resume,
  }
}
