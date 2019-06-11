/**
 * Component to render sidebar of app
 */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ProjectCard from '../ProjectCard'
import Loader from '../Loader'
import TopcoderLogo from '../../assets/images/topcoder-logo.png'
import styles from './Sidebar.module.scss'

const Sidebar = ({ projects, isLoading, activeProject, activeMenu, setActiveProject, setActiveMenu, projectId }) => {
  const projectComponents = projects.map(p => (
    <li key={p.id}>
      <ProjectCard
        projectName={p.name}
        projectId={p.id}
        selected={activeProject === p.id}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        setActiveProject={setActiveProject}
        activeProjectId={projectId}
      />
    </li>
  ))

  return (
    <div className={styles.sidebar}>
      <img src={TopcoderLogo} className={styles.logo} />
      <div className={styles.title}>Challenge Editor</div>
      {
        !isLoading && _.get(projectComponents, 'length', 0) === 0 && (
          <div className={styles.noProjects}>
            You don't have any active projects yet!
          </div>
        )
      }
      {
        isLoading ? <Loader /> : (
          <ul>
            {projectComponents}
          </ul>
        )
      }
    </div>
  )
}

Sidebar.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape()),
  isLoading: PropTypes.bool,
  activeProject: PropTypes.number,
  activeMenu: PropTypes.string,
  setActiveProject: PropTypes.func,
  setActiveMenu: PropTypes.func,
  projectId: PropTypes.string
}

export default Sidebar
