import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Track-Field.module.scss'

import { CHALLENGE_TRACKS } from '../../../config/constants'
import Track from '../../Track'

const TrackField = ({ challenge, onUpdateOthers }) => {
  const renderTracks = (track, currentTrack) => {
    return (
      <Track type={track} isActive={track === currentTrack} key={track} onUpdateOthers={onUpdateOthers} />
    )
  }

  return (
    <div className={styles.row}>
      <div className={cn(styles.field, styles.col1)}>
        <label htmlFor='track'>Track <span>*</span> :</label>
      </div>
      <div className={cn(styles.field, styles.col2)}>
        {
          _.map(CHALLENGE_TRACKS, track => renderTracks(track, challenge.track))
        }
      </div>
    </div>
  )
}

TrackField.propTypes = {
  challenge: PropTypes.shape().isRequired,
  onUpdateOthers: PropTypes.func.isRequired
}

export default TrackField
