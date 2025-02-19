import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import { find } from 'lodash'

import { PROJECT_STATUS } from '../../config/constants'

import styles from './ProjectCard.module.scss'

const ProjectCard = ({ projectName, projectStatus, projectId, selected, setActiveProject }) => {
  return (
    <div className={styles.container}>
      <Link
        to={`/projects/${projectId}/challenges`}
        className={cn(styles.projectName, { [styles.selected]: selected })}
        onClick={() => setActiveProject(parseInt(projectId))}
      >
        <div className={styles.name}>
          <span>{projectName}</span>
          <span className={styles.status}>{find(PROJECT_STATUS, { value: projectStatus }).label}</span>
        </div>
      </Link>
    </div>
  )
}

ProjectCard.propTypes = {
  projectStatus: PT.string.isRequired,
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  selected: PT.bool.isRequired,
  setActiveProject: PT.func
}

export default ProjectCard
