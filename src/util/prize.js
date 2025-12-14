import { CHALLENGE_PRIZE_TYPE, PRIZE_SETS_TYPE } from '../config/constants'

const PRIZE_SETS_WITH_TYPE = [
  PRIZE_SETS_TYPE.CHALLENGE_PRIZES,
  PRIZE_SETS_TYPE.REVIEWER_PAYMENT,
  PRIZE_SETS_TYPE.CHECKPOINT_PRIZES
]

export const getPrizeType = (prizeSets = []) => {
  const placementSet = (prizeSets || []).find(p => p.type === PRIZE_SETS_TYPE.CHALLENGE_PRIZES)
  const prizeType = placementSet && placementSet.prizes && placementSet.prizes[0] && placementSet.prizes[0].type
  return prizeType || CHALLENGE_PRIZE_TYPE.USD
}

export const mapPrizesWithType = (prizes = [], prizeType = CHALLENGE_PRIZE_TYPE.USD) => {
  return (prizes || []).map(prize => ({ ...prize, type: prizeType }))
}

export const applyPrizeTypeToPrizeSets = (prizeSets = [], prizeType = CHALLENGE_PRIZE_TYPE.USD) => {
  return (prizeSets || []).map(set => {
    if (PRIZE_SETS_WITH_TYPE.includes(set.type)) {
      return {
        ...set,
        prizes: mapPrizesWithType(set.prizes, prizeType)
      }
    }
    return set
  })
}
