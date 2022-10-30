/**
 * Component to render two column layout
 * Provides a sidebar column and content column
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

import styles from './TwoRowsLayout.module.scss'

const TwoRowsLayout = ({
  children,
  scrollIndependent
}) => (
  <div className={cn(styles.container, { [styles.scrollIndependent]: scrollIndependent })}>
    {children}
  </div>
)

TwoRowsLayout.Content = ({ children }) => (
  <div className={styles.content}>
    {children}
  </div>
)

TwoRowsLayout.Content.defaultProps = {
  children: null
}

TwoRowsLayout.Content.propTypes = {
  children: PropTypes.node
}

TwoRowsLayout.defaultProps = {
  children: null,
  scrollIndependent: false
}

TwoRowsLayout.propTypes = {
  children: PropTypes.node,
  scrollIndependent: PropTypes.bool
}

export default TwoRowsLayout
