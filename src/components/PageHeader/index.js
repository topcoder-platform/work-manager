/**
 * Component to render header of a page
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import styles from './PageHeader.module.scss'

const PageHeader = ({ title, className, tags }) => {
  return (
    <div className={cn(className, styles.container)}>
      <h1>{title}</h1>
      {tags && <div className={styles.tags}>{tags}</div>}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  tags: PropTypes.node
}

export default PageHeader
