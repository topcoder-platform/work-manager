import React from 'react'
import PropTypes from 'prop-types'
import styles from './Phases.module.scss'
import moment from 'moment'
import cn from 'classnames'
import { PHASE_STATUS } from '../../../../config/constants'
import { getRoundFormattedDuration } from '../../../../util/date'

const Phases = ({ phases }) => {
  const isStatusGreen = (status) => [PHASE_STATUS.OPEN, PHASE_STATUS.CLOSED].includes(status)
  const circle = (status) => <div className={cn(styles.circle, { [styles.green]: isStatusGreen(status) })} />
  const isOpen = (status) => status === PHASE_STATUS.OPEN

  const phaseComponents = phases
    .map(
      p => {
        const startTime = moment(p.actualStartTime || p.scheduledStartTime)
        const day = startTime.format('MMM DD')
        const time = startTime.format('HH:mma')
        const duration = getRoundFormattedDuration(p.duration)
        return (
          <div className={cn(styles.phase, { [styles.open]: isOpen(p.status) })} key={p.phaseId}>
            <div className={cn(styles.type, { [styles.open]: isOpen(p.status) })}>
              {circle(p.status)}
              <span>{p.type}</span>
            </div>
            <div className={styles.date}><span className='bold' >{day}</span>, {time}</div>
            <div className={styles.duration} >{duration}</div>
          </div>
        )
      }
    )

  return (
    <div className={styles.container}>
      {phaseComponents}
    </div>
  )
}

Phases.propTypes = {
  phases: PropTypes.arrayOf(PropTypes.object)
}

Phases.defaultProps = {
  challenge: {}
}

export default Phases
