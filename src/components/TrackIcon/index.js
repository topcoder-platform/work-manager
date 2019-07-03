/**
 * Component to render an icon for a track, subTrack pair
 * Uses './Abbreviation.js' for choosing an abbreviation for a subTrack
 */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import Abbreviation from './Abbreviation'
import cn from 'classnames'
import styles from './TrackIcon.module.scss'
import { MARATHON_MATCH_SUBTRACKS, COMPETITION_TRACKS } from '../../config/constants'

/**
 * Get abbreviation value
 * @param track
 * @param subTrack
 * @returns {*}
 */
function getAbbreviation (track, subTrack) {
  const subTrackList = Abbreviation[track.toUpperCase()]
  return _.find(Object.values(subTrackList), item => item === subTrack)
}

const TrackIcon = ({ track, subTrack, className }) => {
  let newTrack = ''
  let newSubTrack = ''

  if (_.isEmpty(track)) {
    // gracefully handle error
    newTrack = ''
  } else {
    const value = _.find(Object.values(COMPETITION_TRACKS), item => item === track.toLowerCase())
    if (!_.isEmpty(value)) {
      newTrack = track.toLowerCase()
    } else {
      // gracefully handle error
      newTrack = ''
    }
  }
  if (_.isEmpty(subTrack)) {
    // gracefully handle error
    newSubTrack = ''
  } else {
    const result = getAbbreviation(track.toLowerCase(), subTrack)
    newSubTrack = _.isEmpty(result) ? '' : subTrack.toLowerCase()
  }

  let styleTrack = newTrack.toLowerCase()
  if (MARATHON_MATCH_SUBTRACKS.includes(newSubTrack)) {
    styleTrack = COMPETITION_TRACKS.DATA_SCIENCE
  }
  // gracefully handle error, set default style if track is undefined
  if (_.isEmpty(styleTrack)) styleTrack = COMPETITION_TRACKS.DEVELOP

  let abbrValue
  if (_.isEmpty(newTrack) && _.isEmpty(newSubTrack)) {
    abbrValue = undefined
  } else {
    abbrValue = getAbbreviation(track.toLowerCase(), newSubTrack)
  }
  return (
    <span className={cn(styles.icon, className)}>
      <div className={`${styleTrack}`}>
        { abbrValue || 'NA'}
      </div>
    </span>
  )
}

TrackIcon.propTypes = {
  track: PropTypes.string,
  subTrack: PropTypes.string,
  className: PropTypes.string
}

export default TrackIcon
