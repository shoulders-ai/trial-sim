// ─── Core simulation types ────────────────────────────────────────────────────

export type EndpointType = 'binary' | 'continuous' | 'time-to-event'
export type DesignType = 'conventional' | 'adaptive'
export type ArmStatus = 'active' | 'dropped-futility' | 'stopped-efficacy' | 'completed'
export type TrialPhase = 'enrolling' | 'interim' | 'completed'

export interface ArmConfig {
  name: string
  isControl: boolean
  /** True effect parameter: response rate (binary), mean change (continuous), or hazard rate (time-to-event) */
  trueEffect: number
}

export interface DesignConfig {
  type: DesignType
  /** Total maximum sample size across all arms */
  maxSampleSize: number
  /** Allocation ratios per arm (must sum to 1). Updated when arms drop. */
  allocationRatios: number[]
  /** Information fractions at which interim analyses occur (adaptive only). E.g. [0.33, 0.67] */
  interimFractions: number[]
  /** Futility boundary Z-score threshold (adaptive only) */
  futilityBoundary: number
  /** Alpha spending function type */
  alphaSpending: 'obrien-fleming' | 'pocock'
  /** One-sided significance level */
  alpha: number
}

export interface TrialConfig {
  /** Human-readable scenario name */
  scenarioName: string
  endpointType: EndpointType
  arms: ArmConfig[]
  conventional: DesignConfig
  adaptive: DesignConfig
  /** Patients per month */
  enrollmentRate: number
  /** Months from enrollment to outcome observation */
  outcomeDelay: number
  /** Standard deviation for continuous endpoints */
  outcomeSd?: number
  /** Control arm event rate for time-to-event endpoints (events per patient-month) */
  controlHazard?: number
  /** Total events required for time-to-event analysis */
  requiredEvents?: number
}

// ─── Patient and arm state during a trial run ─────────────────────────────────

export interface Patient {
  id: number
  armIndex: number
  enrollmentTime: number
  outcomeTime: number
  outcome: number         // 0/1 for binary, continuous value, or time-to-event
  outcomeObserved: boolean
}

export interface ArmState {
  index: number
  config: ArmConfig
  status: ArmStatus
  patients: Patient[]
  allocationRatio: number
  /** Running Z-statistic at most recent analysis */
  currentZ: number
}

export interface InterimResult {
  /** Which interim analysis (1-indexed) */
  analysisNumber: number
  /** Calendar time of the interim */
  calendarTime: number
  /** Information fraction achieved */
  informationFraction: number
  /** Z-statistics for each arm vs control */
  zStatistics: number[]
  /** Efficacy boundary at this look */
  efficacyBoundary: number
  /** Futility boundary at this look */
  futilityBoundary: number
  /** Arms dropped at this interim */
  armsDropped: number[]
  /** Arms stopped for efficacy at this interim */
  armsStopped: number[]
}

// ─── Trial run result ─────────────────────────────────────────────────────────

export interface TrialResult {
  designType: DesignType
  /** Total patients enrolled */
  totalPatients: number
  /** Trial duration in months */
  duration: number
  /** Final arm states */
  arms: ArmState[]
  /** Interim analysis results (empty for conventional) */
  interims: InterimResult[]
  /** Index of the arm declared winner, or -1 if none */
  winnerArmIndex: number
  /** Whether the correct arm was identified (for power calculation) */
  correctDecision: boolean
  /** The complete patient list for animation */
  patients: Patient[]
  /** Event log for animation playback */
  eventLog: TrialEvent[]
}

// ─── Events for animation playback ───────────────────────────────────────────

export type TrialEvent =
  | { type: 'patient-enrolled'; time: number; patient: Patient }
  | { type: 'outcome-observed'; time: number; patientId: number; outcome: number }
  | { type: 'interim-start'; time: number; analysisNumber: number }
  | { type: 'interim-result'; time: number; result: InterimResult }
  | { type: 'arm-dropped'; time: number; armIndex: number; reason: 'futility' }
  | { type: 'arm-stopped'; time: number; armIndex: number; reason: 'efficacy' }
  | { type: 'trial-end'; time: number; reason: 'max-sample' | 'efficacy-stop' | 'all-arms-dropped' }

// ─── Paired result (both designs on same scenario) ────────────────────────────

export interface PairedTrialResult {
  conventional: TrialResult
  adaptive: TrialResult
  /** Patients saved by adaptive design */
  patientsSaved: number
  /** Months saved by adaptive design */
  timeSaved: number
  seed: number
}
