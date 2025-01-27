import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'

import styles from './styles.module.scss'

const TaaSProjectCard = ({ projectName, projectId, canEdit }) => {
  return (
    <div className={styles.container}>
      {canEdit ? (
        <Link to={`/taas/${projectId}/edit`} className={cn(styles.projectName)}>
          <div className={styles.name}>{projectName}</div>
        </Link>
      ) : (
        <div className={cn(styles.projectName)}>
          <div className={styles.name}>{projectName}</div>
        </div>
      )}
    </div>
  )
}

TaaSProjectCard.propTypes = {
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  canEdit: PT.bool
}

export default TaaSProjectCard
