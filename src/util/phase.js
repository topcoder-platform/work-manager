export const canChangeDuration = phase => {
  if (!phase) {
    return false
  }

  if (phase.isOpen) {
    return true
  }

  return !phase.actualEndDate
}

export const getCurrentPhase = (challenge) => {
  return (challenge ? challenge.phases : []).filter((p) => p.isOpen).map((p) => p.name).join(' / ') || '-'
}
