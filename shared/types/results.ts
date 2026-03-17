export interface ReplicationResult {
  replicationIndex: number
  seed: number
  conventional: {
    totalPatients: number
    duration: number
    winnerArmIndex: number
    correctDecision: boolean
    effectEstimate: number
  }
  adaptive: {
    totalPatients: number
    duration: number
    winnerArmIndex: number
    correctDecision: boolean
    effectEstimate: number
    earlyStopReason: 'efficacy' | 'futility' | 'none'
    interimsUsed: number
    armsDropped: number
  }
}

export interface MonteCarloSummary {
  nReplications: number
  masterSeed: number
  conventional: {
    power: number
    meanSampleSize: number
    medianSampleSize: number
    sampleSizeDistribution: number[]
    meanDuration: number
    medianDuration: number
    durationDistribution: number[]
    fwer: number       // family-wise error rate (computed under null)
    powerMcse: number  // Monte Carlo SE of power
  }
  adaptive: {
    power: number
    meanSampleSize: number
    medianSampleSize: number
    sampleSizeDistribution: number[]
    meanDuration: number
    medianDuration: number
    durationDistribution: number[]
    fwer: number
    earlyStopRate: number
    meanArmsDropped: number
    powerMcse: number
  }
  /** Patients saved (median) */
  medianPatientsSaved: number
  /** Months saved (median) */
  medianTimeSaved: number
}

/** Message protocol for main thread <-> Web Worker */
export type WorkerCommand =
  | { type: 'start'; scenarioId: string; nReplications: number; seed: number; nullMode: boolean }
  | { type: 'cancel' }

export type WorkerMessage =
  | { type: 'batch'; results: ReplicationResult[]; completed: number; total: number }
  | { type: 'complete'; summary: MonteCarloSummary }
  | { type: 'error'; message: string }
