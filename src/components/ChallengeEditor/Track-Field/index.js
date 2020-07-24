import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Track-Field.module.scss'

import { CHALLENGE_TRACKS } from '../../../config/constants'
import Track from '../../Track'

const TrackField = ({ challenge, onUpdateOthers, disabled }) => {
  const renderTracks = (track, currentTrack) => {
    return (
      <Track disabled={disabled} type={track} isActive={track === currentTrack} key={track} onUpdateOthers={onUpdateOthers} />
    )
  }

  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='track'>Work Type <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          {
            _.map(CHALLENGE_TRACKS, track => renderTracks(track, challenge.track))
          }
        </div>
      </div>
      { challenge.submitTriggered && !challenge.track && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Work Type is required field
        </div>
      </div> }
    </>
  )
}

TrackField.defaultProps = {
  disabled: false
}

TrackField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default TrackField
