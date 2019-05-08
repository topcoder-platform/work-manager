/**
 * Component to render sidebar of app
 */
import React from 'react'
import PropTypes from 'prop-types'
import ProjectCard from '../ProjectCard'
import TopcoderLogo from '../../assets/images/topcoder-logo.png'
import styles from './Sidebar.module.scss'

const Sidebar = ({ projects, isLoading, activeProject, activeMenu, setActiveProject, setActiveMenu }) => {
  const projectComponents = projects.map(p => (
    <li key={p.id}>
      <ProjectCard
        projectName={p.name}
        projectId={p.id}
        selected={activeProject === p.id}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        setActiveProject={setActiveProject}
      />
    </li>
  ))

  return (
    <div className={styles.sidebar}>
      <img src={TopcoderLogo} className={styles.logo} />
      <div className={styles.title}>My Challenges</div>
      {
        !isLoading && (
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
  setActiveMenu: PropTypes.func
}

export default Sidebar
