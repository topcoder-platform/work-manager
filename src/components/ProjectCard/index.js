import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './ProjectCard.module.scss'

const ProjectCard = ({ projectName, projectId, selected, setActiveProject }) => {
  return (
    <div className={styles.container}>
      <Link
        to={`/projects/${projectId}/challenges`}
        className={cn(styles.projectName, { [styles.selected]: selected })}
        onClick={() => setActiveProject(parseInt(projectId))}
      >
        <div className={styles.name}>{projectName}</div>
      </Link>
    </div>
  )
}

ProjectCard.propTypes = {
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  selected: PT.bool.isRequired,
  setActiveProject: PT.func
}

export default ProjectCard
