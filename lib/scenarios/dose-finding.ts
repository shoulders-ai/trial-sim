// ─── Dose-Finding Scenario ────────────────────────────────────────────────────
// 5 arms (placebo + 4 doses), continuous endpoint with dose-response plateau.

import type { ScenarioPreset } from '../../shared/types'

const doseFinding: ScenarioPreset = {
  id: 'dose-finding',
  name: 'Dose-Finding (Continuous)',
  narrative:
    'A dose-finding trial with placebo and four ascending doses. The response is continuous ' +
    '(e.g., change in biomarker). The dose-response curve plateaus at dose 3, meaning dose 4 ' +
    'offers no additional benefit. Adaptive analysis can identify the plateau and drop the ' +
    'sub-therapeutic low dose early.',
  teachingMoment:
    'Dose-finding trials benefit enormously from adaptive designs. By dropping clearly ' +
    'ineffective doses early, patients are spared sub-therapeutic exposure and the trial ' +
    'focuses resources on the clinically relevant dose range.',
  config: {
    scenarioName: 'Dose-Finding (Continuous)',
    endpointType: 'continuous',
    arms: [
      { name: 'Placebo', isControl: true, trueEffect: 0 },
      { name: 'Dose 1', isControl: false, trueEffect: 0.1 },   // minimal
      { name: 'Dose 2', isControl: false, trueEffect: 0.3 },   // moderate
      { name: 'Dose 3', isControl: false, trueEffect: 0.5 },   // strong
      { name: 'Dose 4', isControl: false, trueEffect: 0.5 },   // plateau (same as dose 3)
    ],
    enrollmentRate: 6,    // patients per month
    outcomeDelay: 2,      // months
    outcomeSd: 1.0,
    conventional: {
      type: 'conventional',
      maxSampleSize: 250,
      allocationRatios: [0.2, 0.2, 0.2, 0.2, 0.2],
      interimFractions: [],
      futilityBoundary: 0,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
    adaptive: {
      type: 'adaptive',
      maxSampleSize: 250,
      allocationRatios: [0.2, 0.2, 0.2, 0.2, 0.2],
      interimFractions: [0.4, 0.7],
      futilityBoundary: 0.3,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
  },
}

export default doseFinding
