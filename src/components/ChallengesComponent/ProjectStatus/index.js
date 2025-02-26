import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { PROJECT_STATUSES } from '../../../config/constants'
import styles from './ProjectStatus.module.scss'

const ProjectStatus = ({ status }) => {
  return (
    <div className={cn(styles.container, styles[status])}>
      <div>{PROJECT_STATUSES.find(item => item.value === status).label}</div>
    </div>
  )
}

ProjectStatus.propTypes = {
  status: PropTypes.string
}

export default ProjectStatus
