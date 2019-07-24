import React, { Component } from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import cn from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { SIDEBAR_MENU } from '../../config/constants'
import xss from 'xss'

import styles from './ProjectCard.module.scss'

class ProjectCard extends Component {
  constructor (props) {
    super(props)

    this.isActive = this.isActive.bind(this)
    this.showIcon = this.showIcon.bind(this)
    this.changeProject = this.changeProject.bind(this)
    this.changeMenu = this.changeMenu.bind(this)
  }

  isActive (activeMenu, menu, projectId, activeProjectId) {
    return activeMenu === menu && (projectId === +activeProjectId)
  }

  showIcon (selected) {
    if (selected) return faAngleUp

    return faAngleDown
  }

  changeProject (projectId) {
    this.props.setSelectedProject(projectId)
  }

  changeMenu (menu, projectId) {
    this.props.setActiveMenu(menu)
    this.props.setActiveProject(projectId)
  }

  render () {
    const { projectName, projectId, activeMenu, activeProjectId, selected } = this.props

    return (
      <div className={styles.container}>
        <div className={cn(styles.projectName, { [styles.selected]: selected })} onClick={() => this.changeProject(projectId)}>
          <div className={styles.name} dangerouslySetInnerHTML={{ __html: xss(projectName) }} />
          <FontAwesomeIcon className={styles.icon} icon={this.showIcon(selected)} />
        </div>
        <div className={cn({ [styles.hide]: !selected })}>
          <Link to={`/projects/${projectId}/challenges/active`}>
            <div className={cn(styles.item, { [styles.active]: this.isActive(activeMenu, SIDEBAR_MENU.ACTIVE_CHALLENGES, projectId, activeProjectId) })} onClick={() => this.changeMenu(SIDEBAR_MENU.ACTIVE_CHALLENGES, projectId)}>Active Challenges</div>
          </Link>
          <Link to={`/projects/${projectId}/challenges/all`}>
            <div className={cn(styles.item, { [styles.active]: this.isActive(activeMenu, SIDEBAR_MENU.ALL_CHALLENGES, projectId, activeProjectId) })} onClick={() => this.changeMenu(SIDEBAR_MENU.ALL_CHALLENGES, projectId)}>All Challenges</div>
          </Link>
          <Link to={`/projects/${projectId}/challenges/new`}>
            <div className={cn(styles.item, { [styles.active]: this.isActive(activeMenu, SIDEBAR_MENU.NEW_CHALLENGE, projectId, activeProjectId) })} onClick={() => this.changeMenu(SIDEBAR_MENU.NEW_CHALLENGE, projectId)}>New Challenge</div>
          </Link>
        </div>
      </div>
    )
  }
}

ProjectCard.propTypes = {
  projectId: PT.number.isRequired,
  projectName: PT.string.isRequired,
  selected: PT.bool.isRequired,
  activeMenu: PT.string.isRequired,
  setActiveMenu: PT.func.isRequired,
  activeProjectId: PT.string,
  setActiveProject: PT.func.isRequired,
  setSelectedProject: PT.func.isRequired
}

export default ProjectCard
