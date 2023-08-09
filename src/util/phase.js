import moment from 'moment'

export const canChangeDuration = phase => {
  if (!phase) {
    return false
  }
  return moment(phase.scheduledEndDate).isAfter()
}

export const getCurrentPhase = (challenge) => {
  return (challenge ? challenge.phases : []).filter((p) => p.isOpen).map((p) => p.name).join(' / ') || '-'
}
