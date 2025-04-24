import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import { find } from 'lodash'

import { PROJECT_STATUSES } from '../../config/constants'

import styles from './ProjectCard.module.scss'

const ProjectCard = ({ projectName, projectStatus, projectId, selected, isInvited }) => {
  console.log(find(PROJECT_STATUSES, { value: projectStatus }), projectStatus, projectName, projectId)
  return (
    <div className={styles.container}>
      <Link
        to={`/projects/${projectId}/${isInvited ? 'invitation' : 'challenges'}`}
        className={cn(styles.projectName, { [styles.selected]: selected })}
      >
        <div className={styles.name}>
          <span>{projectName}</span>
          <span className={styles.status}>{find(PROJECT_STATUSES, { value: projectStatus }).label}</span>
        </div>
      </Link>
    </div>
  )
}

ProjectCard.propTypes = {
  projectStatus: PT.string.isRequired,
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  isInvited: PT.bool.isRequired,
  selected: PT.bool
}

export default ProjectCard
