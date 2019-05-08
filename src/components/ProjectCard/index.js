import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { SIDEBAR_MENU } from '../../config/constants'

import styles from './ProjectCard.module.scss'

const ProjectCard = ({ projectName, projectId, activeMenu, selected, setActiveMenu, setActiveProject }) => {
  const isActive = (activeMenu, menu) => activeMenu === menu
  const showIcon = (selected) => {
    if (selected) return faAngleUp

    return faAngleDown
  }
  const changeProject = (projectId) => {
    setActiveProject(projectId)
    // history.push(`/projects/${projectId}/challenges/active`)
  }
  const changeMenu = (menu) => {
    setActiveMenu(menu)
  }
  // const renderRedirect = (projectId) => {
  //   return <Redirect to={`/projects/${projectId}/challenges/active`} />
  // }
  return (
    <div className={styles.container}>
      <div className={cn(styles.projectName, { [styles.selected]: selected })} onClick={() => changeProject(projectId)}>
        <div className={styles.name}>{projectName}</div>
        <FontAwesomeIcon className={styles.icon} icon={showIcon(selected)} />
      </div>
      <div className={cn({ [styles.hide]: !selected })}>
        <Link to={`/projects/${projectId}/challenges/active`}>
          <div className={cn(styles.item, { [styles.active]: isActive(activeMenu, SIDEBAR_MENU.ACTIVE_CHALLENGES) })} onClick={() => changeMenu(SIDEBAR_MENU.ACTIVE_CHALLENGES)}>Active Challenges</div>
        </Link>
        <Link to={`/projects/${projectId}/challenges/all`}>
          <div className={cn(styles.item, { [styles.active]: isActive(activeMenu, SIDEBAR_MENU.ALL_CHALLENGES) })} onClick={() => changeMenu(SIDEBAR_MENU.ALL_CHALLENGES)}>All Challenges</div>
        </Link>
        <Link to={`/projects/${projectId}/challenges/new`}>
          <div className={cn(styles.item, { [styles.active]: isActive(activeMenu, SIDEBAR_MENU.NEW_CHALLENGE) })} onClick={() => changeMenu(SIDEBAR_MENU.NEW_CHALLENGE)}>New Challenge</div>
        </Link>
      </div>
    </div>
  )
}

ProjectCard.propTypes = {
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  selected: PT.bool.isRequired,
  activeMenu: PT.string.isRequired,
  setActiveMenu: PT.func.isRequired,
  setActiveProject: PT.func.isRequired
}

export default ProjectCard
