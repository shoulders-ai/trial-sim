// ─── Core Trial Runner ───────────────────────────────────────────────────────
// Event-driven simulation loop. Processes events in calendar-time order,
// generating a complete event log for UI animation playback.

import type { PRNG } from '../../shared/utils/prng'
import type {
  DesignConfig,
  TrialConfig,
  TrialResult,
  TrialEvent,
  Patient,
  ArmState,
  InterimResult,
  EndpointType,
} from '../../shared/types'
import { generateEnrollmentTimes } from './enrollment'
import { BlockRandomizer } from './randomization'
import { generateOutcome } from './outcome-generator'
import { performInterimAnalysis } from './interim-analysis'
import { obrienFlemingSpend, pocockSpend } from './alpha-spending'
import { normalQuantile } from '../../shared/utils/normal-cdf'
import { zTest, proportionTest, logRankZ } from '../../shared/utils/statistics'

// ─── Internal event types for the priority queue ────────────────────────────

interface SimEvent {
  time: number
  type: 'enroll' | 'observe-outcome'
  patientId?: number
}

/**
 * Run a single simulated trial.
 *
 * @param designConfig - Conventional or adaptive design configuration
 * @param trialConfig - Scenario-level trial configuration
 * @param prng - Deterministic PRNG for reproducibility
 * @returns Complete TrialResult with event log for animation
 */
export function runTrial(
  designConfig: DesignConfig,
  trialConfig: TrialConfig,
  prng: PRNG
): TrialResult {
  const isAdaptive = designConfig.type === 'adaptive'
  const endpointType = trialConfig.endpointType
  const maxSampleSize = designConfig.maxSampleSize
  const requiredEvents = trialConfig.requiredEvents

  // ─── Initialize arm states ──────────────────────────────────────────────
  const arms: ArmState[] = trialConfig.arms.map((armConfig, index) => ({
    index,
    config: armConfig,
    status: 'active' as const,
    patients: [],
    allocationRatio: designConfig.allocationRatios[index],
    currentZ: 0,
  }))

  // ─── Initialize randomizer ─────────────────────────────────────────────
  const randomizer = new BlockRandomizer(
    prng,
    trialConfig.arms.length,
    designConfig.allocationRatios
  )

  // ─── Generate enrollment times ─────────────────────────────────────────
  const enrollmentTimes = generateEnrollmentTimes(prng, trialConfig.enrollmentRate, maxSampleSize)

  // ─── Simulation state ──────────────────────────────────────────────────
  const patients: Patient[] = []
  const eventLog: TrialEvent[] = []
  const interimResults: InterimResult[] = []
  let enrolled = 0
  let outcomesObserved = 0
  let totalEvents = 0 // For time-to-event: count of events observed
  let enrollmentStopped = false
  let trialEnded = false
  let stopReason: 'max-sample' | 'efficacy-stop' | 'all-arms-dropped' = 'max-sample'
  let winnerArmIndex = -1

  // Track which interim fractions have been triggered
  let nextInterimIndex = 0
  let cumulativeAlphaSpent = 0

  // Sorted queue of pending outcome observation events
  const pendingOutcomes: SimEvent[] = []

  // ─── Helper: get current information fraction ───────────────────────────
  function getInformationFraction(): number {
    if (endpointType === 'time-to-event' && requiredEvents) {
      return Math.min(totalEvents / requiredEvents, 1.0)
    }
    return Math.min(outcomesObserved / maxSampleSize, 1.0)
  }

  // ─── Helper: check if all experimental arms are inactive ────────────────
  function allExperimentalArmsInactive(): boolean {
    return arms
      .filter(a => !a.config.isControl)
      .every(a => a.status !== 'active')
  }

  // ─── Helper: compute Z boundary from alpha level ────────────────────────
  function computeZFromAlpha(alpha: number): number {
    return normalQuantile(1 - alpha)
  }

  // ─── Helper: perform final analysis ─────────────────────────────────────
  function performFinalAnalysis(calendarTime: number): void {
    const controlArm = arms.find(a => a.config.isControl)!
    const controlPatients = controlArm.patients.filter(p => p.outcomeObserved)
    const controlOutcomes = controlPatients.map(p => p.outcome)

    let bestZ = -Infinity
    let bestArmIndex = -1

    for (const arm of arms) {
      if (arm.config.isControl) continue
      if (arm.status === 'dropped-futility') continue

      const armPatients = arm.patients.filter(p => p.outcomeObserved)
      const armOutcomes = armPatients.map(p => p.outcome)

      if (armOutcomes.length < 2 || controlOutcomes.length < 2) {
        arm.status = 'completed'
        continue
      }

      let z = 0

      switch (endpointType) {
        case 'binary': {
          const s1 = armOutcomes.reduce((s, v) => s + v, 0)
          const s2 = controlOutcomes.reduce((s, v) => s + v, 0)
          const result = proportionTest(s1, armOutcomes.length, s2, controlOutcomes.length)
          z = result.z
          break
        }
        case 'continuous': {
          const result = zTest(armOutcomes, controlOutcomes)
          z = result.z
          break
        }
        case 'time-to-event': {
          const armEvents = armOutcomes.length
          const controlEvents = controlOutcomes.length
          const total = armEvents + controlEvents
          if (total === 0) break
          const totalArmPat = arm.patients.length
          const totalCtrlPat = controlArm.patients.length
          const totalPat = totalArmPat + totalCtrlPat
          if (totalPat === 0) break
          const expected = total * (totalArmPat / totalPat)
          z = logRankZ(armEvents, expected)
          break
        }
      }

      arm.currentZ = z
      arm.status = 'completed'

      if (z > bestZ) {
        bestZ = z
        bestArmIndex = arm.index
      }
    }

    // Compute the final boundary using remaining alpha budget
    const spendFn = designConfig.alphaSpending === 'obrien-fleming' ? obrienFlemingSpend : pocockSpend
    const totalAlpha = spendFn(designConfig.alpha, 1.0)
    const remainingAlpha = Math.max(totalAlpha - cumulativeAlphaSpent, 1e-15)
    const finalBoundary = computeZFromAlpha(remainingAlpha)

    if (bestArmIndex >= 0 && bestZ >= finalBoundary) {
      winnerArmIndex = bestArmIndex
    }

    controlArm.status = 'completed'
  }

  // ─── Helper: process an outcome observation and check for interims ──────
  function processOutcome(event: SimEvent): void {
    const patient = patients[event.patientId!]
    if (!patient || patient.outcomeObserved) return

    patient.outcomeObserved = true
    outcomesObserved++

    if (endpointType === 'time-to-event') {
      totalEvents++
    }

    eventLog.push({
      type: 'outcome-observed',
      time: event.time,
      patientId: patient.id,
      outcome: patient.outcome,
    })
  }

  // ─── Helper: check and perform interim if threshold reached ─────────────
  function checkInterim(calendarTime: number): void {
    if (!isAdaptive) return
    if (trialEnded) return
    if (nextInterimIndex >= designConfig.interimFractions.length) return

    const currentIF = getInformationFraction()
    const targetIF = designConfig.interimFractions[nextInterimIndex]

    if (currentIF < targetIF) return

    // Trigger interim analysis
    const analysisNum = nextInterimIndex + 1

    eventLog.push({
      type: 'interim-start',
      time: calendarTime,
      analysisNumber: analysisNum,
    })

    const interimResult = performInterimAnalysis(
      arms,
      {
        alpha: designConfig.alpha,
        alphaSpending: designConfig.alphaSpending,
        futilityBoundary: designConfig.futilityBoundary,
      },
      analysisNum,
      currentIF,
      endpointType,
      calendarTime,
      cumulativeAlphaSpent
    )

    interimResults.push(interimResult)

    eventLog.push({
      type: 'interim-result',
      time: calendarTime,
      result: interimResult,
    })

    // Update cumulative alpha spent
    const spendFn = designConfig.alphaSpending === 'obrien-fleming'
      ? obrienFlemingSpend
      : pocockSpend
    cumulativeAlphaSpent = spendFn(designConfig.alpha, currentIF)

    // Process arm drops
    for (const droppedIdx of interimResult.armsDropped) {
      arms[droppedIdx].status = 'dropped-futility'
      arms[droppedIdx].allocationRatio = 0

      eventLog.push({
        type: 'arm-dropped',
        time: calendarTime,
        armIndex: droppedIdx,
        reason: 'futility',
      })
    }

    // Process efficacy stops
    for (const stoppedIdx of interimResult.armsStopped) {
      arms[stoppedIdx].status = 'stopped-efficacy'

      eventLog.push({
        type: 'arm-stopped',
        time: calendarTime,
        armIndex: stoppedIdx,
        reason: 'efficacy',
      })
    }

    // If any arm stopped for efficacy, end the trial
    if (interimResult.armsStopped.length > 0) {
      let bestZ = -Infinity
      for (const idx of interimResult.armsStopped) {
        if (interimResult.zStatistics[idx] > bestZ) {
          bestZ = interimResult.zStatistics[idx]
          winnerArmIndex = idx
        }
      }
      trialEnded = true
      enrollmentStopped = true
      stopReason = 'efficacy-stop'
      for (const arm of arms) {
        if (arm.status === 'active') arm.status = 'completed'
      }
      eventLog.push({
        type: 'trial-end',
        time: calendarTime,
        reason: 'efficacy-stop',
      })
      return
    }

    // Renormalize allocation ratios for remaining active arms
    const activeRatios = arms.map(a =>
      a.status === 'active' ? a.allocationRatio : 0
    )
    const totalActive = activeRatios.reduce((s, r) => s + r, 0)
    if (totalActive > 0) {
      const normalized = activeRatios.map(r => r > 0 ? r / totalActive : 0)
      for (let i = 0; i < arms.length; i++) {
        arms[i].allocationRatio = normalized[i]
      }
      randomizer.updateAllocation(normalized)
    }

    // Check if all experimental arms are now inactive
    if (allExperimentalArmsInactive()) {
      trialEnded = true
      enrollmentStopped = true
      stopReason = 'all-arms-dropped'
      for (const arm of arms) {
        if (arm.status === 'active') arm.status = 'completed'
      }
      eventLog.push({
        type: 'trial-end',
        time: calendarTime,
        reason: 'all-arms-dropped',
      })
      return
    }

    nextInterimIndex++
  }

  // ─── Main simulation loop ──────────────────────────────────────────────
  // Merge enrollment events and pending outcome events, always processing the earliest.

  let enrollIdx = 0

  while (!trialEnded) {
    // Find next enrollment event (if enrollment is still open)
    const nextEnroll = (!enrollmentStopped && enrollIdx < enrollmentTimes.length)
      ? { time: enrollmentTimes[enrollIdx], type: 'enroll' as const }
      : null

    // Find next outcome event
    const nextOutcome = pendingOutcomes.length > 0 ? pendingOutcomes[0] : null

    // If no events remain, break
    if (!nextEnroll && !nextOutcome) break

    // Pick whichever event has the earliest time
    const processEnroll = nextEnroll && (!nextOutcome || nextEnroll.time <= nextOutcome.time)

    if (processEnroll) {
      const enrollTime = enrollmentTimes[enrollIdx]
      enrollIdx++

      // Check if enrollment should stop
      if (allExperimentalArmsInactive()) {
        enrollmentStopped = true
        trialEnded = true
        stopReason = 'all-arms-dropped'
        for (const arm of arms) {
          if (arm.status === 'active') arm.status = 'completed'
        }
        eventLog.push({
          type: 'trial-end',
          time: enrollTime,
          reason: 'all-arms-dropped',
        })
        break
      }

      // Randomize patient to an arm
      let armIndex = randomizer.next()

      // Safety: if assigned to inactive arm, try getting another assignment
      // This can happen in edge cases with block randomization
      let attempts = 0
      while (arms[armIndex].status !== 'active' && attempts < 20) {
        armIndex = randomizer.next()
        attempts++
      }
      if (arms[armIndex].status !== 'active') {
        // All arms inactive — stop
        enrollmentStopped = true
        continue
      }

      const arm = arms[armIndex]

      // Generate outcome
      const outcomeValue = generateOutcome(
        prng,
        arm.config,
        endpointType,
        trialConfig.outcomeSd,
        trialConfig.controlHazard
      )

      // Determine when outcome will be observed
      let outcomeTime: number
      if (endpointType === 'time-to-event') {
        // outcomeValue is the event time from enrollment
        outcomeTime = enrollTime + outcomeValue
      } else {
        // Binary/continuous: outcome observed after fixed delay
        outcomeTime = enrollTime + trialConfig.outcomeDelay
      }

      const patient: Patient = {
        id: enrolled,
        armIndex,
        enrollmentTime: enrollTime,
        outcomeTime,
        outcome: outcomeValue,
        outcomeObserved: false,
      }

      patients.push(patient)
      arm.patients.push(patient)
      enrolled++

      eventLog.push({
        type: 'patient-enrolled',
        time: enrollTime,
        patient: { ...patient },
      })

      // Schedule outcome observation
      insertSorted(pendingOutcomes, {
        time: outcomeTime,
        type: 'observe-outcome',
        patientId: patient.id,
      })

      // Check if we've reached maxSampleSize
      if (enrolled >= maxSampleSize) {
        enrollmentStopped = true
      }

    } else {
      // Process outcome observation
      const outcomeEvent = pendingOutcomes.shift()!
      processOutcome(outcomeEvent)

      // Check if interim should fire
      checkInterim(outcomeEvent.time)

      // For time-to-event: check if we've reached required events
      if (!trialEnded && endpointType === 'time-to-event' && requiredEvents && totalEvents >= requiredEvents) {
        // Run final analysis now
        performFinalAnalysis(outcomeEvent.time)
        trialEnded = true
        stopReason = winnerArmIndex >= 0 ? 'efficacy-stop' : 'max-sample'
        for (const arm of arms) {
          if (arm.status === 'active') arm.status = 'completed'
        }
        eventLog.push({
          type: 'trial-end',
          time: outcomeEvent.time,
          reason: stopReason,
        })
      }
    }
  }

  // ─── Drain remaining outcomes after enrollment stops ───────────────────
  // (for conventional design: must wait for all outcomes before final analysis)
  if (!trialEnded) {
    while (pendingOutcomes.length > 0) {
      const evt = pendingOutcomes.shift()!
      processOutcome(evt)

      // Check interim (for adaptive)
      checkInterim(evt.time)
      if (trialEnded) break

      // For time-to-event: check if reached required events
      if (endpointType === 'time-to-event' && requiredEvents && totalEvents >= requiredEvents) {
        performFinalAnalysis(evt.time)
        trialEnded = true
        stopReason = winnerArmIndex >= 0 ? 'efficacy-stop' : 'max-sample'
        for (const arm of arms) {
          if (arm.status === 'active') arm.status = 'completed'
        }
        eventLog.push({
          type: 'trial-end',
          time: evt.time,
          reason: stopReason,
        })
        break
      }
    }
  }

  // ─── Final analysis for non-TTE endpoints ──────────────────────────────
  // If we haven't ended the trial yet (all outcomes now observed), do final analysis
  if (!trialEnded) {
    const lastTime = eventLog.length > 0 ? eventLog[eventLog.length - 1].time : 0

    if (!allExperimentalArmsInactive()) {
      performFinalAnalysis(lastTime)
    }

    for (const arm of arms) {
      if (arm.status === 'active') arm.status = 'completed'
    }

    eventLog.push({
      type: 'trial-end',
      time: lastTime,
      reason: stopReason,
    })
    trialEnded = true
  }

  // ─── Compute duration and determine correctness ────────────────────────
  const trialEndEvent = eventLog.find(e => e.type === 'trial-end')
  const duration = trialEndEvent ? trialEndEvent.time : 0

  // Determine the "correct" arm: the experimental arm with the best true effect
  let bestTrueArmIndex = -1
  let bestTrueEffect = -Infinity
  let controlEffect = 0

  for (const arm of trialConfig.arms) {
    if (arm.isControl) {
      controlEffect = arm.trueEffect
    }
  }

  for (let i = 0; i < trialConfig.arms.length; i++) {
    const arm = trialConfig.arms[i]
    if (arm.isControl) continue

    let effectiveMetric: number
    if (endpointType === 'time-to-event') {
      // Lower hazard is better
      effectiveMetric = -arm.trueEffect
    } else {
      effectiveMetric = arm.trueEffect
    }

    if (effectiveMetric > bestTrueEffect) {
      bestTrueEffect = effectiveMetric
      bestTrueArmIndex = i
    }
  }

  // Check if there is a truly effective arm (different from control)
  let hasTrueEffect = false
  for (let i = 0; i < trialConfig.arms.length; i++) {
    const arm = trialConfig.arms[i]
    if (arm.isControl) continue
    if (endpointType === 'time-to-event') {
      if (arm.trueEffect < controlEffect) { hasTrueEffect = true; break }
    } else {
      if (arm.trueEffect > controlEffect) { hasTrueEffect = true; break }
    }
  }

  // correctDecision:
  // - If there IS a truly effective arm: did we select the best one?
  // - If there is NO truly effective arm: did we correctly NOT select anyone?
  const correctDecision = hasTrueEffect
    ? winnerArmIndex === bestTrueArmIndex
    : winnerArmIndex === -1

  return {
    designType: designConfig.type,
    totalPatients: enrolled,
    duration,
    arms,
    interims: interimResults,
    winnerArmIndex,
    correctDecision,
    patients,
    eventLog,
  }
}

// ─── Utility: insert event into sorted array by time ─────────────────────────

function insertSorted(arr: SimEvent[], event: SimEvent): void {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (arr[mid].time <= event.time) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  arr.splice(lo, 0, event)
}
