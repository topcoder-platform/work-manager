import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import { CHALLENGE_TRACKS } from '../../config/constants'
import styles from './Track.module.scss'

const assets = require.context('../../assets/images/tracks', false, /svg/)

const Track = ({ type, isActive, onUpdateOthers }) => {
  const icon = `./${type.toLowerCase()}.svg`
  const getName = (type) => {
    switch (type.toUpperCase()) {
      case CHALLENGE_TRACKS.DEVELOP:
        return 'Development'
      case CHALLENGE_TRACKS.DESIGN:
        return 'Design'
      case CHALLENGE_TRACKS.DATA_SCIENCE:
        return 'Data Science'
      case CHALLENGE_TRACKS.QA:
        return CHALLENGE_TRACKS.QA
      default:
        return ''
    }
  }

  return (
    <div className={cn(styles.container, { [styles.active]: isActive })} onClick={() => onUpdateOthers({ field: 'track', value: type })}>
      <div className={styles.icon}>
        { assets && assets.keys().includes(icon) ? <ReactSVG path={assets(`${icon}`)} /> : '' }
      </div>
      <span className={styles.name}>{getName(type)}</span>
    </div>
  )
}

Track.defaultProps = {
  isActive: false
}

Track.propTypes = {
  type: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onUpdateOthers: PropTypes.func.isRequired
}

export default Track
