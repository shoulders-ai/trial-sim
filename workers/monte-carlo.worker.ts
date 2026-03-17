// ─── Monte Carlo Web Worker ──────────────────────────────────────────────────
// Runs replication loops off the main thread, posting batch results back.

import type { WorkerCommand, WorkerMessage, ReplicationResult } from '../shared/types'
import { runReplications } from '../lib/monte-carlo/replication-loop'
import { computeSummary } from '../lib/monte-carlo/operating-chars'

let cancelled = false

/**
 * Handle incoming messages from the main thread.
 */
self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const command = event.data

  switch (command.type) {
    case 'start': {
      cancelled = false

      try {
        const allResults: ReplicationResult[] = []

        const results = runReplications(
          command.scenarioId,
          command.nReplications,
          command.seed,
          command.nullMode,
          (batch, completed, total) => {
            if (cancelled) return false // Signal cancellation

            allResults.push(...batch)

            const msg: WorkerMessage = {
              type: 'batch',
              results: batch,
              completed,
              total,
            }
            self.postMessage(msg)

            return !cancelled
          }
        )

        if (!cancelled) {
          const summary = computeSummary(allResults, command.seed)
          const completeMsg: WorkerMessage = {
            type: 'complete',
            summary,
          }
          self.postMessage(completeMsg)
        }
      } catch (err) {
        const errorMsg: WorkerMessage = {
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        }
        self.postMessage(errorMsg)
      }
      break
    }

    case 'cancel': {
      cancelled = true
      break
    }
  }
}
