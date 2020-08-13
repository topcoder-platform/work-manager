import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import ReactSVG from 'react-svg'
import styles from './Track.module.scss'

const assets = require.context('../../assets/images/tracks', false, /svg/)

const Track = ({ type, isActive, onUpdateOthers, disabled }) => {
  const icon = `./${type.abbreviation.toLowerCase()}.svg`

  return (
    <div className={cn(styles.container, { [styles.active]: isActive, [styles.disabled]: disabled })} onClick={() => onUpdateOthers({ field: 'trackId', value: type.id })}>
      <div className={styles.icon}>
        { assets && assets.keys().includes(icon) ? <ReactSVG path={assets(`${icon}`)} /> : '' }
      </div>
      <span className={styles.name}>{type.name}</span>
    </div>
  )
}

Track.defaultProps = {
  isActive: false,
  disabled: false
}

Track.propTypes = {
  type: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onUpdateOthers: PropTypes.func.isRequired
}

export default Track
