export const isAIReviewer = (reviewer) => {
  return reviewer && (
    (reviewer.aiWorkflowId && reviewer.aiWorkflowId.trim() !== '') ||
    (reviewer.isMemberReview === false)
  )
}