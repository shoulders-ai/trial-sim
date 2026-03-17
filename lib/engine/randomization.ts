// ─── Block Randomization ─────────────────────────────────────────────────────
// Implements permuted block randomization with random block sizes.

import type { PRNG } from '../../shared/utils/prng'

/**
 * Single call block randomization (stateless convenience function).
 * For most uses, prefer BlockRandomizer class which maintains state.
 */
export function blockRandomize(
  prng: PRNG,
  nArms: number,
  allocationRatios: number[],
  blockSize: number
): number {
  // Create a block with the specified size respecting allocation ratios
  const block: number[] = []
  const totalRatio = allocationRatios.reduce((s, r) => s + r, 0)

  for (let arm = 0; arm < nArms; arm++) {
    const count = Math.round((allocationRatios[arm] / totalRatio) * blockSize)
    for (let j = 0; j < count; j++) {
      block.push(arm)
    }
  }

  // Fisher-Yates shuffle
  for (let i = block.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1))
    const tmp = block[i]
    block[i] = block[j]
    block[j] = tmp
  }

  // Return first element
  return block[0]
}

/**
 * Block randomizer that maintains state across calls.
 * Uses random block sizes from {4, 6, 8} multiplied by the number of active arms.
 */
export class BlockRandomizer {
  private prng: PRNG
  private currentBlock: number[] = []
  private blockIndex: number = 0
  private nArms: number
  private allocationRatios: number[]

  constructor(prng: PRNG, nArms: number, allocationRatios: number[]) {
    this.prng = prng
    this.nArms = nArms
    this.allocationRatios = [...allocationRatios]
  }

  /**
   * Update allocation ratios (e.g., when an arm is dropped).
   * This causes the current block to be discarded and a new one generated on next call.
   */
  updateAllocation(allocationRatios: number[]): void {
    this.allocationRatios = [...allocationRatios]
    // Discard the remainder of the current block since ratios changed
    this.currentBlock = []
    this.blockIndex = 0
  }

  /**
   * Get the next arm assignment.
   */
  next(): number {
    if (this.blockIndex >= this.currentBlock.length) {
      this.generateNewBlock()
    }
    return this.currentBlock[this.blockIndex++]
  }

  private generateNewBlock(): void {
    // Choose a random block size multiplier from {4, 6, 8}
    const multipliers = [4, 6, 8]
    const multiplier = multipliers[Math.floor(this.prng() * multipliers.length)]

    // Count active arms (those with nonzero allocation)
    const activeArms = this.allocationRatios.filter(r => r > 0).length
    const blockSize = multiplier * activeArms

    // Build block respecting allocation ratios
    const block: number[] = []
    const totalRatio = this.allocationRatios.reduce((s, r) => s + r, 0)

    if (totalRatio === 0) {
      this.currentBlock = []
      this.blockIndex = 0
      return
    }

    // Calculate count per arm, ensuring the total matches blockSize
    const counts: number[] = []
    let assigned = 0
    for (let arm = 0; arm < this.nArms; arm++) {
      const count = Math.round((this.allocationRatios[arm] / totalRatio) * blockSize)
      counts.push(count)
      assigned += count
    }

    // Adjust for rounding errors — add/remove from the largest allocation arm
    let diff = blockSize - assigned
    if (diff !== 0) {
      // Find arm with the largest allocation ratio
      let maxArm = 0
      for (let i = 1; i < this.nArms; i++) {
        if (this.allocationRatios[i] > this.allocationRatios[maxArm]) maxArm = i
      }
      counts[maxArm] += diff
      if (counts[maxArm] < 0) counts[maxArm] = 0
    }

    for (let arm = 0; arm < this.nArms; arm++) {
      for (let j = 0; j < counts[arm]; j++) {
        block.push(arm)
      }
    }

    // Fisher-Yates shuffle for random permutation
    for (let i = block.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng() * (i + 1))
      const tmp = block[i]
      block[i] = block[j]
      block[j] = tmp
    }

    this.currentBlock = block
    this.blockIndex = 0
  }
}
