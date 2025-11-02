import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './Track-Field.module.scss'
import Track from '../../Track'

const TrackField = ({ challenge, tracks, onUpdateOthers, disabled }) => {
  const renderTracks = (track, currentTrack) => {
    return (
      <Track disabled={disabled} type={track} isActive={track.id === currentTrack} key={track.id} onUpdateOthers={onUpdateOthers} />
    )
  }

  return (
    <>
      <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)}>
          <label htmlFor='track'>Challenge Track <span>*</span> :</label>
        </div>
        <div className={cn(styles.field, styles.col2)}>
          {
            _.map(tracks, track => renderTracks(track, challenge.trackId))
          }
        </div>
      </div>
      { challenge.submitTriggered && !challenge.trackId && <div className={styles.row}>
        <div className={cn(styles.field, styles.col1)} />
        <div className={cn(styles.field, styles.col2, styles.error)}>
          Challenge Track is a required field
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
  disabled: PropTypes.bool,
  tracks: PropTypes.arrayOf(PropTypes.shape()).isRequired
}

export default TrackField
