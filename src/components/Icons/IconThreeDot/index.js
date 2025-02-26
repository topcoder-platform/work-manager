/* Component to render three dot icon */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles.module.scss'
import cn from 'classnames'

const IconThreeDot = ({ classsName }) => {
  return (
    <div className={cn(styles.container, classsName)}>
      <i />
      <i />
      <i />
    </div>
  )
}

IconThreeDot.defaultProps = {}

IconThreeDot.propTypes = {
  classsName: PropTypes.string
}

export default IconThreeDot
