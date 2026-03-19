import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Loader from '../../components/Loader'
import { loadOnlyProjectInfo } from '../../actions/projects'
import { checkIsUserInvitedToProject } from '../../util/tc'

/**
 * Resolves the correct project landing route for `/projects/:projectId`.
 *
 * It loads lightweight project details first so invited users can be sent to
 * the invitation modal before challenge-specific requests run.
 */
const ProjectEntry = ({
  hasProjectAccess,
  history,
  isProjectLoading,
  loadOnlyProjectInfo,
  match,
  projectDetail,
  token
}) => {
  const projectId = _.get(match, 'params.projectId')
  const [resolvedProjectId, setResolvedProjectId] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    let isActive = true

    if (!projectId) {
      history.replace('/projects')
      return undefined
    }

    setResolvedProjectId(null)
    setAccessDenied(false)
    loadOnlyProjectInfo(projectId)
      .then(() => {
        if (isActive) {
          setResolvedProjectId(projectId)
        }
      })
      .catch((error) => {
        if (isActive) {
          const status = _.get(error, 'payload.response.status', _.get(error, 'response.status'))
          if (status === 403) {
            setAccessDenied(true)
            setResolvedProjectId(projectId)
          } else {
            history.replace('/projects')
          }
        }
      })

    return () => {
      isActive = false
    }
  }, [history, loadOnlyProjectInfo, projectId])

  useEffect(() => {
    if (!resolvedProjectId || isProjectLoading) {
      return
    }

    // Handle 403 access denied - redirect to challenges page which will show the error
    if (accessDenied || !hasProjectAccess) {
      history.replace(`/projects/${resolvedProjectId}/challenges`)
      return
    }

    if (`${_.get(projectDetail, 'id', '')}` !== `${resolvedProjectId}`) {
      return
    }

    const destination = checkIsUserInvitedToProject(token, projectDetail)
      ? `/projects/${resolvedProjectId}/invitation`
      : `/projects/${resolvedProjectId}/challenges`

    history.replace(destination)
  }, [accessDenied, hasProjectAccess, history, isProjectLoading, projectDetail, resolvedProjectId, token])

  return <Loader />
}

ProjectEntry.propTypes = {
  hasProjectAccess: PropTypes.bool,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired
  }).isRequired,
  isProjectLoading: PropTypes.bool,
  loadOnlyProjectInfo: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectId: PropTypes.string
    })
  }).isRequired,
  projectDetail: PropTypes.object,
  token: PropTypes.string
}

const mapStateToProps = ({ auth, projects }) => ({
  hasProjectAccess: projects.hasProjectAccess,
  isProjectLoading: projects.isLoading,
  projectDetail: projects.projectDetail,
  token: auth.token
})

const mapDispatchToProps = {
  loadOnlyProjectInfo
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProjectEntry)
)
