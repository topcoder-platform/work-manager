/**
 * Component to render sidebar of app
 */
import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import cn from 'classnames'
import _ from 'lodash'
import ProjectCard from '../ProjectCard'
import Loader from '../Loader'
import TopcoderLogo from '../../assets/images/topcoder-logo.png'
import styles from './Sidebar.module.scss'

const Sidebar = ({
  projects, isLoading, setActiveProject,
  projectId, resetSidebarActiveParams
}) => {
  const projectComponents = projects.map(p => (
    <li key={p.id}>
      <ProjectCard
        projectName={p.name}
        projectId={p.id}
        selected={projectId === `${p.id}`}
        setActiveProject={setActiveProject}
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
      <Link to='/'>
        <div className={cn(styles.homeLink, { [styles.active]: !projectId })} onClick={resetSidebarActiveParams}>
          Active challenges
        </div>
      </Link>
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
  setActiveProject: PropTypes.func,
  projectId: PropTypes.string,
  resetSidebarActiveParams: PropTypes.func
}

export default Sidebar
