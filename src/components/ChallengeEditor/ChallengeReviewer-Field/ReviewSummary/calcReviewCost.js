// Utility to calculate estimated review cost for human reviewers
export function calculateReviewCost(humanReviewers = [], challenge = {}) {
  const total = humanReviewers
    .reduce((sum, r) => {
      const memberCount = parseInt(r.memberReviewerCount) || 1
      const baseAmount = parseFloat(r.fixedAmount) || 0
      const prizeSet = challenge.prizeSets && challenge.prizeSets[0]
      const prizeValue = prizeSet && prizeSet.prizes && prizeSet.prizes[0] && prizeSet.prizes[0].value
      const prizeAmount = prizeSet
        ? parseFloat(prizeValue) || 0
        : 0

      const estimatedSubmissions = 2
      const baseCoefficient = parseFloat(r.baseCoefficient) || 0.13
      const incrementalCoefficient = parseFloat(r.incrementalCoefficient) || 0.05

      const calculatedCost = memberCount * (
        baseAmount + (prizeAmount * baseCoefficient) +
        (prizeAmount * estimatedSubmissions * incrementalCoefficient)
      )

      return sum + calculatedCost
    }, 0)

  return total.toFixed(2)
}

export default calculateReviewCost
