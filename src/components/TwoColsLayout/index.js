/**
 * Component to render two column layout
 * Provides a sidebar column and content column
 */
import React from 'react'
import PropTypes from 'prop-types'

import styles from './TwoColsLayout.module.scss'

const TwoColsLayout = ({
  children
}) => (
  <div className={styles.container}>
    {children}
  </div>
)

TwoColsLayout.Sidebar = ({ children }) => (
  <aside className={styles.sidebar} id='SidebarContainer'>{children}</aside>
)

TwoColsLayout.Sidebar.defaultProps = {
  children: null
}

TwoColsLayout.Sidebar.propTypes = {
  children: PropTypes.node
}

TwoColsLayout.Content = ({ children }) => (
  <div className={styles.content}>
    {children}
  </div>
)

TwoColsLayout.Content.defaultProps = {
  children: null
}

TwoColsLayout.Content.propTypes = {
  children: PropTypes.node
}

TwoColsLayout.defaultProps = {
  children: null
}

TwoColsLayout.propTypes = {
  children: PropTypes.node
}

export default TwoColsLayout
