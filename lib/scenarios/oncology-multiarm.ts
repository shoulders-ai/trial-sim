// ─── Oncology Multi-Arm Scenario ─────────────────────────────────────────────
// 4 arms (control + 3 experimental), binary endpoint (response rate).

import type { ScenarioPreset } from '../../shared/types'

const oncologyMultiArm: ScenarioPreset = {
  id: 'oncology-multiarm',
  name: 'Oncology Multi-Arm (Binary)',
  narrative:
    'A phase II oncology trial testing three experimental therapies against a control arm. ' +
    'The primary endpoint is tumor response rate. Arm A is truly no better than control, ' +
    'Arm B is the clear winner, and Arm C is marginal. Can the adaptive design drop the losers early?',
  teachingMoment:
    'Adaptive multi-arm designs can drop ineffective arms at interim analyses, ' +
    'reallocating patients to more promising treatments. This saves patients from receiving ' +
    'inferior therapies and concentrates power on the best arm.',
  config: {
    scenarioName: 'Oncology Multi-Arm (Binary)',
    endpointType: 'binary',
    arms: [
      { name: 'Control', isControl: true, trueEffect: 0.20 },
      { name: 'Arm A', isControl: false, trueEffect: 0.20 },  // null — same as control
      { name: 'Arm B', isControl: false, trueEffect: 0.35 },  // effective
      { name: 'Arm C', isControl: false, trueEffect: 0.25 },  // marginal
    ],
    enrollmentRate: 8, // patients per month
    outcomeDelay: 3,   // months
    conventional: {
      type: 'conventional',
      maxSampleSize: 360,
      allocationRatios: [0.25, 0.25, 0.25, 0.25],
      interimFractions: [],
      futilityBoundary: 0,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
    adaptive: {
      type: 'adaptive',
      maxSampleSize: 360,
      allocationRatios: [0.25, 0.25, 0.25, 0.25],
      interimFractions: [0.33, 0.67],
      futilityBoundary: 0.5,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
  },
}

export default oncologyMultiArm
