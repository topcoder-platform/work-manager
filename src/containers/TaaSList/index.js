import React, { useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TaaSProjectCard from '../../components/TaaSProjectCard'
import Loader from '../../components/Loader'
import cn from 'classnames'
import { checkAdmin, checkCopilot } from '../../util/tc'
import { PrimaryButton } from '../../components/Buttons'
import InfiniteLoadTrigger from '../../components/InfiniteLoadTrigger'
import { loadProjects as _loadProjects, loadMoreProjects, unloadProjects as _unloadProjects } from '../../actions/projects'
import { PROJECT_TYPE_TAAS } from '../../config/constants'

import styles from './styles.module.scss'

const TaaSList = ({ projects, auth, isLoading, projectsCount, loadProjects, loadMore, unloadProjects }) => {
  const isCopilot = checkCopilot(auth.token)
  const isAdmin = checkAdmin(auth.token)
  const canEdit = isCopilot || isAdmin

  useEffect(() => {
    loadProjects('', { type: PROJECT_TYPE_TAAS })
  }, [])

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
      <div className={styles.searchHeader}>
        <h2>Projects</h2>
        {(isCopilot || isAdmin) && (
          <Link className={styles.buttonCreateNewTaaS} to='/taas/new'>
            <PrimaryButton
              text='Create TaaS Project'
              type='info'
              submit
            />
          </Link>
        )}
      </div>
      {projects.length > 0 ? (
        <>
          <ul>
            {projects.map(p => (
              <li key={p.id} className={cn({ [styles.canEdit]: canEdit })}>
                <TaaSProjectCard
                  projectName={p.name}
                  projectId={p.id}
                  canEdit={canEdit}
                />
              </li>
            ))}
          </ul>
          {projects && projects.length < projectsCount - 1 && (
            // fix
            <InfiniteLoadTrigger onLoadMore={loadMore} />
          )}
        </>
      ) : (
        <span>No TaaS projects available yet</span>
      )}
    </div>
  )
}

TaaSList.propTypes = {
  projectsCount: PropTypes.number.isRequired,
  projects: PropTypes.array,
  auth: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadProjects: PropTypes.func.isRequired,
  unloadProjects: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired
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
  loadProjects: _loadProjects,
  unloadProjects: _unloadProjects,
  loadMore: loadMoreProjects
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TaaSList)
)
