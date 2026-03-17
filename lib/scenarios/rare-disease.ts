// ─── Rare Disease Scenario ────────────────────────────────────────────────────
// 2 arms (treatment + control), continuous endpoint, small sample, large effect.

import type { ScenarioPreset } from '../../shared/types'

const rareDisease: ScenarioPreset = {
  id: 'rare-disease',
  name: 'Rare Disease (Small N, Large Effect)',
  narrative:
    'A rare disease trial with only 52 patients total. The treatment has a large effect size ' +
    '(0.8 SD), typical of orphan drug development where unmet need is high. With such small ' +
    'numbers, every patient matters — can the adaptive design detect the effect at the halfway point?',
  teachingMoment:
    'In rare disease trials, adaptive designs are especially valuable because the patient ' +
    'pool is small. An aggressive futility boundary ensures that if the drug does not work, ' +
    'the trial stops quickly, sparing precious patients for other studies. When the drug does ' +
    'work with a large effect, the interim can provide early evidence of benefit.',
  config: {
    scenarioName: 'Rare Disease (Small N, Large Effect)',
    endpointType: 'continuous',
    arms: [
      { name: 'Control', isControl: true, trueEffect: 0 },
      { name: 'Treatment', isControl: false, trueEffect: 0.8 },  // 0.8 SD effect
    ],
    enrollmentRate: 1,    // patients per month (very slow)
    outcomeDelay: 6,      // months
    outcomeSd: 1.0,
    conventional: {
      type: 'conventional',
      maxSampleSize: 52,
      allocationRatios: [0.5, 0.5],
      interimFractions: [],
      futilityBoundary: 0,
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
    adaptive: {
      type: 'adaptive',
      maxSampleSize: 52,
      allocationRatios: [0.5, 0.5],
      interimFractions: [0.5],
      futilityBoundary: 1.0,  // aggressive futility boundary
      alphaSpending: 'obrien-fleming',
      alpha: 0.025,
    },
  },
}

export default rareDisease
