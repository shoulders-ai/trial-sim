import type {
  ReplicationResult,
  MonteCarloSummary,
  WorkerCommand,
  WorkerMessage,
} from '@shared/types/results'

function createWorker(): Worker {
  return new Worker(
    new URL('../../workers/monte-carlo.worker.ts', import.meta.url),
    { type: 'module' },
  )
}

export function useMonteCarloWorker() {
  const results = ref<ReplicationResult[]>([])
  const progress = ref(0)
  const isRunning = ref(false)
  const summary = ref<MonteCarloSummary | null>(null)
  const error = ref<string | null>(null)

  let worker: Worker | null = null
  let totalReplications = 0

  function onMessage(event: MessageEvent<WorkerMessage>) {
    const msg = event.data

    switch (msg.type) {
      case 'batch': {
        results.value = [...results.value, ...msg.results]
        progress.value = msg.total > 0 ? msg.completed / msg.total : 0
        break
      }
      case 'complete': {
        summary.value = msg.summary
        isRunning.value = false
        progress.value = 1
        cleanupWorker()
        break
      }
      case 'error': {
        error.value = msg.message
        isRunning.value = false
        cleanupWorker()
        break
      }
    }
  }

  function onError(e: ErrorEvent) {
    error.value = e.message || 'Worker error'
    isRunning.value = false
    cleanupWorker()
  }

  function cleanupWorker() {
    if (worker) {
      worker.removeEventListener('message', onMessage as EventListener)
      worker.removeEventListener('error', onError as EventListener)
      worker.terminate()
      worker = null
    }
  }

  function start(scenarioId: string, nReplications: number, seed: number, nullMode: boolean) {
    // Clean up any existing worker
    cleanupWorker()

    // Reset state
    results.value = []
    progress.value = 0
    summary.value = null
    error.value = null
    isRunning.value = true
    totalReplications = nReplications

    // Create and configure worker
    worker = createWorker()
    worker.addEventListener('message', onMessage as EventListener)
    worker.addEventListener('error', onError as EventListener)

    // Post start command
    const command: WorkerCommand = {
      type: 'start',
      scenarioId,
      nReplications,
      seed,
      nullMode,
    }
    worker.postMessage(command)
  }

  function cancel() {
    if (worker && isRunning.value) {
      const command: WorkerCommand = { type: 'cancel' }
      worker.postMessage(command)
      isRunning.value = false
      cleanupWorker()
    }
  }

  onUnmounted(() => {
    cleanupWorker()
  })

  return {
    results: readonly(results),
    progress: readonly(progress),
    isRunning: readonly(isRunning),
    summary: readonly(summary),
    error: readonly(error),
    start,
    cancel,
  }
}
