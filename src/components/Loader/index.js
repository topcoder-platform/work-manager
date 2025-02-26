/**
 * Component to render as a loading indication
 */
import React from 'react'
import cn from 'classnames'
import PropTypes from 'prop-types'
import styles from './Loader.module.scss'

function Loader ({ classsName }) {
  return (
    <div className={cn(styles.loader, classsName)}>
      <svg
        className={styles.container}
        viewBox='0 0 64 64'
      >
        <circle
          className={styles.circle1}
          cx='32'
          cy='32'
          r='6'
          id='loading-indicator-circle1'
        />
        <circle
          className={styles.circle2}
          cx='32'
          cy='32'
          r='6'
          id='loading-indicator-circle2'
        />
      </svg>
    </div>
  )
}

Loader.propTypes = {
  classsName: PropTypes.string
}

export default Loader
