import _ from 'lodash'
import { CHALLENGE_PRIZE_TYPE, PRIZE_SETS_TYPE } from '../config/constants'

/**
 * Get prize type (USD or POINT) from prize sets.
 * It prioritizes PLACEMENT prize set, then COPILOT_PAYMENT.
 * If no specific prize type is found, it defaults to USD.
 *
 * @param {Array} prizeSets prize sets
 * @returns {String} prize type (USD or POINT)
 */
export function getPrizeType (prizeSets) {
  if (!prizeSets || !prizeSets.length) {
    return CHALLENGE_PRIZE_TYPE.USD
  }

  // Prioritize PLACEMENT prize set for overall challenge currency type
  const placementPrizeSet = prizeSets.find(p => p.type === PRIZE_SETS_TYPE.CHALLENGE_PRIZES)
  if (placementPrizeSet && placementPrizeSet.prizes && placementPrizeSet.prizes.length) {
    // Ensure the type is USD or POINT, not CHECKPOINT
    const type = placementPrizeSet.prizes[0].type
    if (type === CHALLENGE_PRIZE_TYPE.USD || type === CHALLENGE_PRIZE_TYPE.POINT) {
      return type
    }
  }

  // Fallback to COPILOT_PAYMENT if no PLACEMENT or invalid type
  const copilotPrizeSet = prizeSets.find(p => p.type === PRIZE_SETS_TYPE.COPILOT_PAYMENT)
  if (copilotPrizeSet && copilotPrizeSet.prizes && copilotPrizeSet.prizes.length) {
    const type = copilotPrizeSet.prizes[0].type
    if (type === CHALLENGE_PRIZE_TYPE.USD || type === CHALLENGE_PRIZE_TYPE.POINT) {
      return type
    }
  }

  // If no PLACEMENT or COPILOT_PAYMENT, check other prize sets, but still only return USD/POINT
  for (const prizeSet of prizeSets) {
    if (prizeSet.prizes && prizeSet.prizes.length) {
      const type = prizeSet.prizes[0].type
      if (type === CHALLENGE_PRIZE_TYPE.USD || type === CHALLENGE_PRIZE_TYPE.POINT) {
        return type
      }
    } else if (prizeSet.type === CHALLENGE_PRIZE_TYPE.USD || prizeSet.type === CHALLENGE_PRIZE_TYPE.POINT) {
      // Handle cases where prizeSet itself is a simple prize object (less common for top-level prizeSets)
      return prizeSet.type
    }
  }

  return CHALLENGE_PRIZE_TYPE.USD
}

/**
 * Apply prize type (USD or POINT) to all prizes in prize sets.
 *
 * @param {Array} prizeSets prize sets
 * @param {String} prizeType prize type (USD or POINT)
 * @returns {Array} updated prize sets
 */
export function applyPrizeTypeToPrizeSets (prizeSets, prizeType) {
  return _.map(prizeSets, (prizeSet) => {
    // Only update PLACEMENT and COPILOT_PAYMENT prize types
    if (prizeSet.type === PRIZE_SETS_TYPE.CHALLENGE_PRIZES || prizeSet.type === PRIZE_SETS_TYPE.COPILOT_PAYMENT) {
      return {
        ...prizeSet,
        prizes: _.map(prizeSet.prizes, (prize) => ({
          ...prize,
          type: prizeType
        }))
      }
    }
    // For CHECKPOINT_PRIZES, the internal prize type should remain CHALLENGE_PRIZE_TYPE.CHECKPOINT
    // We assume the value is already in the correct currency based on the main challenge prize type.
    return prizeSet
  })
}
