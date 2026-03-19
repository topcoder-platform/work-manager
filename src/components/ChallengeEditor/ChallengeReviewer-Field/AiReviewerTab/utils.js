export const isAIReviewer = (reviewer) => {
  return reviewer && (
    (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
    (reviewer.isMemberReview === false)
  )
}

export const hasAiReviewers = (reviewers) => {
  return Array.isArray(reviewers) && reviewers.some(isAIReviewer)
}
