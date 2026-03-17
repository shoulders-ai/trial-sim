// ─── Vaccine Efficacy Scenario ────────────────────────────────────────────────
// 2 arms (vaccine + placebo), time-to-event endpoint.

import type { ScenarioPreset } from '../../shared/types'

const vaccineEfficacy: ScenarioPreset = {
  id: 'vaccine-efficacy',
  name: 'Vaccine Efficacy (Time-to-Event)',
  narrative:
    'A large vaccine trial with a placebo control. The endpoint is time to infection. ' +
    'The vaccine halves the hazard rate (50% efficacy). With 600 participants and event-driven ' +
    'analysis, the adaptive design can stop early when overwhelming efficacy is demonstrated.',
  teachingMoment:
    'Time-to-event trials use event counts rather than sample size to drive analysis timing. ' +
    'Adaptive designs with event-driven interims can declare efficacy as soon as sufficient ' +
    'evidence accumulates, potentially saving months of follow-up.',
  config: {
    scenarioName: 'Vaccine Efficacy (Time-to-Event)',
    endpointType: 'time-to-event',
    arms: [
      { name: 'Placebo', isControl: true, trueEffect: 0.01 },    // hazard: 0.01 events/patient-month
      { name: 'Vaccine', isControl: false, trueEffect: 0.005 },   // hazard: 0.005 (50% efficacy)
    ],
    enrollmentRate: 50,   // patients per month
    outcomeDelay: 0,       // continuous observation
    controlHazard: 0.01,
    requiredEvents: 150,
    conventional: {
      type: 'conventional',
      maxSampleSize: 600,
      allocationRatios: [0.5, 0.5],
      interimFractions: [],
      futilityBoundary: 0,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
    adaptive: {
      type: 'adaptive',
      maxSampleSize: 600,
      allocationRatios: [0.5, 0.5],
      interimFractions: [0.33, 0.5, 0.67],
      futilityBoundary: 0.5,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
  },
}

export default vaccineEfficacy
