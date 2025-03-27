import React, { useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { DebounceInput } from 'react-debounce-input'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Loader from '../../components/Loader'
import { checkAdminOrCopilot, checkManager } from '../../util/tc'
import { PrimaryButton } from '../../components/Buttons'
import Select from '../../components/Select'
import ProjectCard from '../../components/ProjectCard'
import InfiniteLoadTrigger from '../../components/InfiniteLoadTrigger'
import { loadProjects, loadMoreProjects, unloadProjects } from '../../actions/projects'
import { PROJECT_STATUSES } from '../../config/constants'

import styles from './styles.module.scss'

const Projects = ({ projects, auth, isLoading, projectsCount, loadProjects, loadMoreProjects, unloadProjects }) => {
  const [search, setSearch] = useState()
  const [projectStatus, setProjectStatus] = useState('')
  const [showOnlyMyProjects, setOnlyMyProjects] = useState(true)
  const selectedStatus = useMemo(() => PROJECT_STATUSES.find(s => s.value === projectStatus))

  const isProjectManager = checkManager(auth.token)
  useEffect(() => {
    const params = {}
    if (projectStatus) {
      params.status = projectStatus
    }

    if (isProjectManager) {
      params.memberOnly = showOnlyMyProjects
    }
    loadProjects(search, params)
  }, [search, projectStatus, showOnlyMyProjects, isProjectManager])

  // unload projects on dismount
  useEffect(() => () => unloadProjects, [])

  if (isLoading && projects.length === 0) {
    return (
      <div className={styles.container}>
        <Loader />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerLine}>
        <h2>Projects</h2>
        {checkAdminOrCopilot(auth.token) && (
          <Link className={styles.buttonNewProject} to={`/projects/new`}>
            <PrimaryButton text={'New Project'} type={'info'} />
          </Link>
        )}
      </div>
      <div className={styles.searchWrapper}>
        <div className={styles['col-4']}>
          <div className={cn(styles.field, styles.input1)}>
            <label>Search :</label>
          </div>
          <div className={styles.searchInputWrapper}>
            <DebounceInput
              className={styles.searchInput}
              minLength={2}
              debounceTimeout={300}
              placeholder='Keyword'
              onChange={e => setSearch(e.target.value)}
              value={search}
            />
          </div>
        </div>
        <div className={styles['col-4']}>
          <div className={cn(styles.field, styles.input1)}>
            <label>Project Status:</label>
          </div>
          <div className={styles.searchInputWrapper}>
            <Select
              name='projectStatus'
              options={PROJECT_STATUSES}
              placeholder='All'
              value={selectedStatus}
              onChange={e => setProjectStatus(e ? e.value : '')}
              isClearable
            />
          </div>
        </div>
        <div className={styles['col-4']}>
          {
            checkManager(auth.token) && (
              <div className={styles.tcCheckbox}>
                <input
                  name='isOpenAdvanceSettings'
                  type='checkbox'
                  id='isOpenAdvanceSettings'
                  checked={showOnlyMyProjects}
                  onChange={() => setOnlyMyProjects(!showOnlyMyProjects)}
                />
                <label htmlFor='isOpenAdvanceSettings'>
                  <div>Only My Projects</div>
                  <input type='hidden' />
                </label>
              </div>
            )
          }
        </div>
      </div>
      {projects.length > 0 ? (
        <>
          <ul>
            {projects.map(p => (
              <li key={p.id}>
                <ProjectCard
                  projectStatus={p.status}
                  projectName={p.name}
                  projectId={p.id}
                />
              </li>
            ))}
          </ul>
          {projects && projects.length < projectsCount - 1 && (
            // fix
            <InfiniteLoadTrigger onLoadMore={loadMoreProjects} />
          )}
        </>
      ) : (
        <span>No projects available yet</span>
      )}
    </div>
  )
}

Projects.propTypes = {
  projectsCount: PropTypes.number.isRequired,
  projects: PropTypes.array,
  auth: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  unloadProjects: PropTypes.func.isRequired,
  loadProjects: PropTypes.func.isRequired,
  loadMoreProjects: PropTypes.func.isRequired
}

const mapStateToProps = ({ projects, auth }) => {
  return {
    projectsCount: projects.projectsCount,
    projects: projects.projects,
    isLoading: projects.isLoading,
    auth
  }
}

const mapDispatchToProps = {
  unloadProjects: unloadProjects,
  loadProjects: loadProjects,
  loadMoreProjects: loadMoreProjects
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Projects)
)
