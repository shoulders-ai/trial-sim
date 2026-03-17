import type { TrialConfig } from './trial'

export interface ScenarioPreset {
  id: string
  name: string
  /** Short narrative description for the UI */
  narrative: string
  /** What this scenario teaches the user */
  teachingMoment: string
  config: TrialConfig
}
